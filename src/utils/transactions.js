import {DirectSecp256k1HdWallet} from "@cosmjs/proto-signing";
import Long from "long";
import {Tendermint34Client} from "@cosmjs/tendermint-rpc";
import {createProtobufRpcClient} from "@cosmjs/stargate";
import TransportWebUSB from "@ledgerhq/hw-transport-webusb";
import {LedgerSigner} from "@cosmjs/ledger-amino";
import {fee} from "./aminoMsgHelper";
import * as Sentry from "@sentry/browser";
import {LOGIN_INFO} from "../constants/localStorage";
import {decodeTendermintClientStateAny, decodeTendermintConsensusStateAny, makeHdPath} from "./helper";
import {DefaultChainInfo, IBCConfiguration} from "../config";

const {SigningStargateClient, QueryClient, setupIbcExtension} = require("@cosmjs/stargate");
const tmRPC = require("@cosmjs/tendermint-rpc");
const {TransferMsg} = require("./protoMsgHelper");
const addressPrefix = DefaultChainInfo.prefix;
const configChainID = process.env.REACT_APP_CHAIN_ID;

const tendermintRPCURL = process.env.REACT_APP_TENDERMINT_RPC_ENDPOINT;

async function Transaction(wallet, signerAddress, msgs, fee, memo = "") {
    const cosmJS = await SigningStargateClient.connectWithSigner(
        tendermintRPCURL,
        wallet,
    );
    return await cosmJS.signAndBroadcast(signerAddress, msgs, fee, memo);
}

async function TransactionWithKeplr(msgs, fee, memo = "", chainID = configChainID) {
    console.log(msgs, "msgs");
    const [wallet, address] = await KeplrWallet(chainID);
    return Transaction(wallet, address, msgs, fee, memo);
}

async function KeplrWallet(chainID = configChainID) {
    await window.keplr.enable(chainID);
    const offlineSigner = window.getOfflineSignerOnlyAmino(chainID);
    const accounts = await offlineSigner.getAccounts();
    return [offlineSigner, accounts[0].address];
}

async function TransactionWithLedger(msgs, fee, memo = "", hdpath = makeHdPath(), prefix = addressPrefix) {
    const [wallet, address] = await LedgerWallet(hdpath, prefix);
    return Transaction(wallet, address, msgs, fee, memo);
}

async function LedgerWallet(hdpath, prefix) {
    const interactiveTimeout = 120_000;

    async function createTransport() {
        const ledgerTransport = await TransportWebUSB.create(interactiveTimeout, interactiveTimeout);
        return ledgerTransport;
    }

    const transport = await createTransport();
    const signer = new LedgerSigner(transport, {
        testModeAllowed: true,
        hdPaths: [hdpath],
        prefix: prefix,
        ledgerAppName:DefaultChainInfo.ledgerAppName
    });
    const [firstAccount] = await signer.getAccounts();
    return [signer, firstAccount.address];
}

async function TransactionWithMnemonic(msgs, fee, memo, mnemonic, hdpath = makeHdPath(), bip39Passphrase = "", loginAddress, prefix = addressPrefix) {
    const loginInfo = JSON.parse(localStorage.getItem(LOGIN_INFO));
    if (loginInfo && loginInfo.loginMode === "address") {
        const [wallet, address] = await MnemonicWalletWithPassphrase(mnemonic, hdpath, bip39Passphrase, prefix);
        if (address !== loginAddress) {
            throw new Error("Your sign in address and keystore file don’t match. Please try again or else sign in again.");
        }
        return Transaction(wallet, address, msgs, fee, memo);
    } else {
        const [wallet, address] = await LedgerWallet(hdpath, prefix);
        return Transaction(wallet, address, msgs, fee, memo);
    }
}

async function MnemonicWalletWithPassphrase(mnemonic, hdPath = makeHdPath(), password = "", prefix = addressPrefix) {
    const wallet = await DirectSecp256k1HdWallet.fromMnemonic(mnemonic, {
        prefix: prefix,
        bip39Password: password,
        hdPaths: [hdPath]
    });
    const [firstAccount] = await wallet.getAccounts();
    return [wallet, firstAccount.address];
}

async function MakeIBCTransferMsg(channel, fromAddress, toAddress, amount, timeoutHeight, timeoutTimestamp = IBCConfiguration.timeoutTimestamp, denom = DefaultChainInfo.currency.coinMinimalDenom, url, port = "transfer") {
    const tendermintClient = await tmRPC.Tendermint34Client.connect(tendermintRPCURL);
    const queryClient = new QueryClient(tendermintClient);

    const ibcExtension = setupIbcExtension(queryClient);

    const finalResponse = await ibcExtension.ibc.channel.clientState(port, channel).then(async (clientStateResponse) => {
        const clientStateResponseDecoded = decodeTendermintClientStateAny(clientStateResponse.identifiedClientState.clientState);
        timeoutHeight = {
            revisionHeight: clientStateResponseDecoded.latestHeight.revisionHeight.add(IBCConfiguration.ibcRevisionHeightIncrement),
            revisionNumber: clientStateResponseDecoded.latestHeight.revisionNumber
        };
        if (url === undefined) {
            const consensusStateResponse = await ibcExtension.ibc.channel.consensusState(port, channel,
                clientStateResponseDecoded.latestHeight.revisionNumber.toInt(), clientStateResponseDecoded.latestHeight.revisionHeight.toInt());
            const consensusStateResponseDecoded = decodeTendermintConsensusStateAny(consensusStateResponse.consensusState);
            const timeoutTime = Long.fromNumber(consensusStateResponseDecoded.timestamp.seconds.toNumber()).add(timeoutTimestamp).multiply(1000000000); //get time in nanoesconds
            return TransferMsg(channel, fromAddress, toAddress, amount, timeoutHeight, timeoutTime, denom, port);
        } else {
            const remoteTendermintClient = await tmRPC.Tendermint34Client.connect(url);
            const latestBlockHeight = (await remoteTendermintClient.status()).syncInfo.latestBlockHeight;
            timeoutHeight.revisionHeight = Long.fromNumber(latestBlockHeight).add(IBCConfiguration.ibcRemoteHeightIncrement);
            const timeoutTime = Long.fromNumber(0);
            return TransferMsg(channel, fromAddress, toAddress, amount, timeoutHeight, timeoutTime, denom, port);
        }
    }).catch(error => {
        Sentry.captureException(error.response
            ? error.response.data.message
            : error.message);
        throw error;
    });
    return finalResponse;
}

async function RpcClient() {
    const tendermintClient = await Tendermint34Client.connect(tendermintRPCURL);
    const queryClient = new QueryClient(tendermintClient);
    return createProtobufRpcClient(queryClient);
}


async function getTransactionResponse(address, data, feeAmount, gas, mnemonic = "", txName, accountNumber = 0, addressIndex = 0, bip39Passphrase = "") {
    switch (txName) {
    case "send":
        return TransactionWithMnemonic(data.message, fee(Math.trunc(feeAmount), gas), data.memo,
            mnemonic, makeHdPath(accountNumber, addressIndex), bip39Passphrase, address);
    case "delegate":
        return TransactionWithMnemonic(data.message, fee(Math.trunc(feeAmount), gas), data.memo,
            mnemonic, makeHdPath(accountNumber, addressIndex), bip39Passphrase, address);
    case "withdrawMultiple":
        return TransactionWithMnemonic(data.message, fee(Math.trunc(feeAmount), gas), data.memo,
            mnemonic, makeHdPath(accountNumber, addressIndex), bip39Passphrase, address);
    case "withdrawAddress":
        return TransactionWithMnemonic(data.message, fee(Math.trunc(feeAmount), gas), data.memo,
            mnemonic, makeHdPath(accountNumber, addressIndex), bip39Passphrase, address);
    case "reDelegate":
        return TransactionWithMnemonic(data.message, fee(Math.trunc(feeAmount), gas), data.memo,
            mnemonic, makeHdPath(accountNumber, addressIndex), bip39Passphrase, address);
    case  "unbond":
        return TransactionWithMnemonic(data.message, fee(Math.trunc(feeAmount), gas), data.memo,
            mnemonic, makeHdPath(accountNumber, addressIndex), bip39Passphrase, address);
    case "withdrawValidatorRewards":
        return TransactionWithMnemonic(data.message, fee(Math.trunc(feeAmount), gas), data.memo,
            mnemonic, makeHdPath(accountNumber, addressIndex), bip39Passphrase, address);
    case "ibc":
        return TransactionWithMnemonic(data.message,
            fee(Math.trunc(feeAmount), gas), data.memo, mnemonic,
            makeHdPath(accountNumber, addressIndex), bip39Passphrase, address);
    }
    
}


export default {
    TransactionWithKeplr,
    TransactionWithMnemonic,
    TransactionWithLedger,
    MakeIBCTransferMsg,
    RpcClient,
    getTransactionResponse,
    LedgerWallet,
    MnemonicWalletWithPassphrase,
};
