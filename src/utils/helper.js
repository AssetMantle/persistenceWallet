import transactions from "./transactions";
import {COIN_ATOM, COIN_ATOM_DENOM, COIN_GRAVITY, COIN_GRAVITY_DENOM, COIN_PSTAKE} from "../constants/keyWords";
import {
    ADDRESS,
    ENCRYPTED_MNEMONIC,
    FEE,
    KEPLR_ADDRESS, LOGIN_INFO,
    LOGIN_MODE,
    LOGIN_TOKEN
} from "../constants/localStorage";
import {sha256, stringToPath} from "@cosmjs/crypto";
import {QueryClientImpl} from "cosmjs-types/cosmos/auth/v1beta1/query";
import {BaseAccount} from "cosmjs-types/cosmos/auth/v1beta1/auth";
import {
    ContinuousVestingAccount,
    DelayedVestingAccount,
    PeriodicVestingAccount
} from "cosmjs-types/cosmos/vesting/v1beta1/vesting";
import * as Sentry from "@sentry/browser";
import {mnemonicTrim} from "./scripts";
import {DefaultChainInfo, FeeInfo, MainNetFoundationNodes, PstakeInfo, TestNetFoundationNodes} from "../config";

const tendermint_1 = require("cosmjs-types/ibc/lightclients/tendermint/v1/tendermint");
const encoding = require("@cosmjs/encoding");
const crypto = require("crypto");
const passwordHashAlgorithm = "sha512";
const NODE_CONF = process.env.REACT_APP_IBC_CONFIG;
const valoperAddressPrefix = DefaultChainInfo.prefix;
const addressPrefix = DefaultChainInfo.prefix;
const configCoinType = DefaultChainInfo.coinType;

export const createKeyStore = (mnemonic, password) => {
    try {
        const key = crypto.randomBytes(32);
        const iv = crypto.randomBytes(16);
        let cipher = crypto.createCipheriv("aes-256-cbc", Buffer.from(key), iv);
        let encrypted = cipher.update(mnemonic);
        encrypted = Buffer.concat([encrypted, cipher.final()]);

        let obj = {
            "hashpwd": crypto.createHash(passwordHashAlgorithm).update(password).digest("hex"),
            "iv": iv.toString("hex"),
            "salt": key.toString("hex"),
            "crypted": encrypted.toString("hex")
        };
        return {
            Response: obj
        };
    } catch (exception) {
        return {
            success: false,
            error: exception.message
        };
    }
};

export const decryptKeyStore = (fileData, password) => {
    let hashpwd = fileData.hashpwd;
    let iv = fileData.iv;
    let salt = fileData.salt;
    let crypted = fileData.crypted;

    if (hashpwd === crypto.createHash(passwordHashAlgorithm).update(password).digest("hex")) {
        let ivText = Buffer.from(iv, "hex");
        let encryptedText = Buffer.from(crypted, "hex");

        let decipher = crypto.createDecipheriv(
            "aes-256-cbc",
            Buffer.from(salt, "hex"),
            ivText
        );
        let decrypted = decipher.update(encryptedText);
        decrypted = Buffer.concat([decrypted, decipher.final()]);
        return {
            mnemonic: decrypted.toString(),
        };
    } else {
        return {
            error: "Incorrect password."
        };
    }
};

function isActive(item) {
    return item.jailed === false && item.status === 3;
}

function checkLastPage(pageNumber, limit, totalTransactions) {
    return totalTransactions / limit <= pageNumber;
}

function accountChangeCheck(errorMessage) {
    if (errorMessage === 'Unsupported type: \'/cosmos.vesting.v1beta1.ContinuousVestingAccount\'' ||
        errorMessage === 'Unsupported type: \'/cosmos.vesting.v1beta1.DelayedVestingAccount\'' ||
        errorMessage === 'Unsupported type: \'/cosmos.vesting.v1beta1.PeriodicVestingAccount\'' ||
        errorMessage.startsWith("pubKey does not match signer address")) {
        alert("Account address changed please login again");
        localStorage.setItem(LOGIN_TOKEN, '');
        localStorage.setItem(ADDRESS, '');
        localStorage.setItem(LOGIN_MODE, '');
        localStorage.setItem(FEE, '');
        localStorage.setItem(KEPLR_ADDRESS, '');
        window.location.reload();
    }
}

function denomChange(denom) {
    switch (denom) {
    case DefaultChainInfo.currency.coinMinimalDenom:
        return DefaultChainInfo.currency.coinDenom;
    case COIN_ATOM_DENOM:
        return COIN_ATOM;
    case PstakeInfo.baseDenom:
        return COIN_PSTAKE;
    case COIN_GRAVITY_DENOM:
        return COIN_GRAVITY;
    default:
        return null;
    }
}


function denomModify(amount) {
    if (Array.isArray(amount)) {
        if (amount.length) {
            if (amount[0].denom === DefaultChainInfo.currency.coinMinimalDenom) {
                return [tokenValueConversion(amount[0].amount), DefaultChainInfo.currency.coinDenom];
            } else {
                return [amount[0].amount, amount[0].denom];
            }
        } else {
            return '';
        }
    } else {
        if (amount.denom === DefaultChainInfo.currency.coinMinimalDenom) {
            return [tokenValueConversion(amount.amount), DefaultChainInfo.currency.coinDenom];
        } else {
            return [amount.amount, amount.denom];
        }
    }
}

function getTransactionAmount(data) {
    if (data.amount !== undefined || data.token !== undefined || data.value !== undefined) {
        if (data.amount !== undefined) {
            return denomModify(data.amount);
        } else if (data.token !== undefined) {
            return denomModify(data.token);
        } else {
            return denomModify(data.value);
        }
    }
}


function foundationNodeCheck(validatorAddress) {
    if (NODE_CONF === "ibcStaging.json") {
        if (TestNetFoundationNodes.includes(validatorAddress)) {
            return true;
        } else {
            return false;
        }
    } else {
        if (MainNetFoundationNodes.includes(validatorAddress)) {
            return true;
        } else {
            return false;
        }
    }
}

function getAccountNumber(value) {
    return value === '' ? '0' : value;
}

export const addrToValoper = (address) => {
    let data = encoding.Bech32.decode(address).data;
    return encoding.Bech32.encode(valoperAddressPrefix, data);
};

export const valoperToAddr = (valoperAddr) => {
    let data = encoding.Bech32.decode(valoperAddr).data;
    return encoding.Bech32.encode(addressPrefix, data);
};

export const checkValidatorAccountAddress = (validatorAddress, address) => {
    let validatorAccountAddress = valoperToAddr(validatorAddress);
    return validatorAccountAddress === address;
};

/**
 * @return {boolean}
 */
export const vestingAccountCheck = async (type) =>{
    return type === "/cosmos.vesting.v1beta1.PeriodicVestingAccount" ||
        type === "/cosmos.vesting.v1beta1.DelayedVestingAccount" ||
        type === "/cosmos.vesting.v1beta1.ContinuousVestingAccount";
};

export const generateHash = (txBytes) =>{
    return encoding.toHex(sha256(txBytes)).toUpperCase();
};

export async function getAccount(address) {
    try {
        const rpcClient = await transactions.RpcClient();
        const authAccountService = new QueryClientImpl(rpcClient);
        const accountResponse = await authAccountService.Account({
            address: address,
        });
        if (accountResponse.account.typeUrl === "/cosmos.auth.v1beta1.BaseAccount") {
            let baseAccountResponse = BaseAccount.decode(accountResponse.account.value);
            return {"typeUrl": accountResponse.account.typeUrl, "accountData": baseAccountResponse};
        } else if (accountResponse.account.typeUrl === "/cosmos.vesting.v1beta1.PeriodicVestingAccount") {
            let periodicVestingAccountResponse = PeriodicVestingAccount.decode(accountResponse.account.value);
            return {"typeUrl": accountResponse.account.typeUrl, "accountData": periodicVestingAccountResponse};
        } else if (accountResponse.account.typeUrl === "/cosmos.vesting.v1beta1.DelayedVestingAccount") {
            let delayedVestingAccountResponse = DelayedVestingAccount.decode(accountResponse.account.value);
            return {"typeUrl": accountResponse.account.typeUrl, "accountData": delayedVestingAccountResponse};
        } else if (accountResponse.account.typeUrl === "/cosmos.vesting.v1beta1.ContinuousVestingAccount") {
            let continuousVestingAccountResponse = ContinuousVestingAccount.decode(accountResponse.account.value);
            return {"typeUrl": accountResponse.account.typeUrl, "accountData": continuousVestingAccountResponse};
        }
    }catch (error) {
        Sentry.captureException(error.response
            ? error.response.data.message
            : error.message);
        console.log(error.message);
    }
}

export const updateFee = (address) => {
    const loginInfo = JSON.parse(localStorage.getItem(LOGIN_INFO)) || {};
    if (loginInfo && (loginInfo.loginMode === 'address' || loginInfo.loginMode === 'keystore')) {
        getAccount(address)
            .then(async res => {
                const accountType = await vestingAccountCheck(res.typeUrl);
                if (accountType) {
                    loginInfo.fee = FeeInfo.vestingAccountFee;
                    loginInfo.account = "vesting";
                } else {
                    loginInfo.fee = FeeInfo.defaultFee;
                    loginInfo.account = "non-vesting";
                }
            })
            .catch(error => {
                Sentry.captureException(error.response
                    ? error.response.data.message
                    : error.message);
                console.log(error.message);
                loginInfo.fee = FeeInfo.defaultFee;
                loginInfo.account = "non-vesting";
            });
        localStorage.setItem(LOGIN_INFO, JSON.stringify(loginInfo));
    } else {
        loginInfo.fee = FeeInfo.vestingAccountFee;
        localStorage.setItem(LOGIN_INFO, JSON.stringify(loginInfo));
    }
};

export const tokenValueConversion = (data) => {
    return data / DefaultChainInfo.uTokenValue;
};

export const privateKeyReader = (file, password, loginAddress, accountNumber = "0", addressIndex = "0",) => {
    return new Promise(function (resolve, reject) {
        const fileReader = new FileReader();
        fileReader.readAsText(file, "UTF-8");
        fileReader.onload = async event => {
            if (event.target.result !== '') {
                const res = JSON.parse(event.target.result);
                const decryptedData = decryptKeyStore(res, password);
                if (decryptedData.error != null) {
                    reject(new Error(decryptedData.error));
                } else {
                    let mnemonic = mnemonicTrim(decryptedData.mnemonic);
                    const accountData = await transactions.MnemonicWalletWithPassphrase(mnemonic, makeHdPath(accountNumber, addressIndex));
                    const address = accountData[1];
                    if (address === loginAddress) {
                        resolve(mnemonic);
                        localStorage.setItem(ENCRYPTED_MNEMONIC, event.target.result);
                    } else {
                        reject(new Error("Your sign in address and keystore file don’t match. Please try again or else sign in again."));
                    }
                }
            } else {
                reject(new Error("Invalid File data"));
            }
        };
    });
};

export const makeHdPath = (accountNumber = "0", addressIndex = "0", coinType = configCoinType) => {
    return stringToPath("m/44'/" + coinType + "'/" + accountNumber + "'/0/" + addressIndex);
};

export const getAccountNumberAndSequence = (authResponse) => {
    if (authResponse.account["@type"] === "/cosmos.vesting.v1beta1.PeriodicVestingAccount") {
        return [authResponse.account.base_vesting_account.base_account.account_number, authResponse.account.base_vesting_account.base_account.sequence];
    } else if (authResponse.account["@type"] === "/cosmos.vesting.v1beta1.DelayedVestingAccount") {
        return [authResponse.account.base_vesting_account.base_account.account_number, authResponse.account.base_vesting_account.base_account.sequence];
    } else if (authResponse.account["@type"] === "/cosmos.vesting.v1beta1.ContinuousVestingAccount") {
        return [authResponse.account.base_vesting_account.base_account.account_number, authResponse.account.base_vesting_account.base_account.sequence];
    } else if (authResponse.account["@type"] === "/cosmos.auth.v1beta1.BaseAccount") {
        return [authResponse.account.account_number, authResponse.account.sequence];
    } else {
        return [-1, -1];
    }
};

// copied from node_modules/@cosmjs/stargate/build/queries/ibc.js
export const decodeTendermintClientStateAny = (clientState) => {
    if ((clientState === null || clientState === void 0 ? void 0 : clientState.typeUrl) !== "/ibc.lightclients.tendermint.v1.ClientState") {
        throw new Error(`Unexpected client state type: ${clientState === null || clientState === void 0 ? void 0 : clientState.typeUrl}`);
    }
    return tendermint_1.ClientState.decode(clientState.value);
};

// copied from node_modules/@cosmjs/stargate/build/queries/ibc.js
export const decodeTendermintConsensusStateAny = (consensusState) => {
    if ((consensusState === null || consensusState === void 0 ? void 0 : consensusState.typeUrl) !== "/ibc.lightclients.tendermint.v1.ConsensusState") {
        throw new Error(`Unexpected client state type: ${consensusState === null || consensusState === void 0 ? void 0 : consensusState.typeUrl}`);
    }
    return tendermint_1.ConsensusState.decode(consensusState.value);
};


export default {
    isActive,
    checkLastPage,
    accountChangeCheck,
    denomChange,
    getTransactionAmount,
    foundationNodeCheck,
    getAccountNumber,
};
