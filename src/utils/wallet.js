import transactions from "./transactions";
import {pathToString} from "@cosmjs/crypto";
import {makeHdPath} from "./helper";
import {DefaultChainInfo} from "../config";


const bip39 = require("bip39");
const prefix = DefaultChainInfo.prefix;

async function getWallet(mnemonic, walletPath = makeHdPath(), bip39Passphrase = "") {
    try {
        const [wallet, address] = await transactions.MnemonicWalletWithPassphrase(mnemonic, walletPath, bip39Passphrase, prefix);
        return {
            success: true,
            address: address,
            mnemonic: wallet.mnemonic,
            walletPath: pathToString(walletPath)
        };
    } catch (e) {
        return {
            success: false,
            error: e.message
        };
    }
}

async function createRandomWallet(walletPath = makeHdPath(), bip39Passphrase = "") {
    return await getWallet(bip39.generateMnemonic(256), walletPath, bip39Passphrase);
}

async function createWallet(mnemonic, walletPath = makeHdPath(), bip39Passphrase = "") {
    let mnemonicList = mnemonic.replace(/\s/g, " ").split(/\s/g);
    let mnemonicWords = [];
    for (let word of mnemonicList) {
        if (word === "") {
            console.log();
        } else {
            let trimmedWord = word.replace(/\s/g, "");
            mnemonicWords.push(trimmedWord);
        }
    }
    mnemonicWords = mnemonicWords.join(" ");
    let validateMnemonic = bip39.validateMnemonic(mnemonicWords);
    if (validateMnemonic) {
        return await getWallet(mnemonicWords, walletPath, bip39Passphrase);
    } else {
        return new Error('Invalid mnemonic.');
    }
}

export default {
    createWallet,
    createRandomWallet,
    prefix
};
