import {LOGIN_INFO} from "../constants/localStorage";
import {mnemonicTrim, stringToNumber} from "./scripts";
import {tokenValueConversion} from "./helper";
import {DefaultChainInfo, GasInfo} from "../config";

const bip39 = require("bip39");
const loginInfo = JSON.parse(localStorage.getItem(LOGIN_INFO));

export const ValidateSendAmount = (amount, value) => {
    if (stringToNumber(amount ) < value) {
        return new Error('Insufficient wallet balance');
    }
    return new Error('');
};

export const ValidateFee = (transferableAmount, feeValue, type, amount, tokenDenom = DefaultChainInfo.currency.coinMinimalDenom) => {
    const amountTxns = (
        type === "withdrawMultiple" || type === "withdrawAddress" || type === "withdrawValidatorRewards" || type === "redelegate" || type === "unbond"
    );

    const vestingDelegationCheck = (
        loginInfo && loginInfo.account === "vesting" && type === "delegate"
    );

    if (amountTxns || vestingDelegationCheck) {
        if (transferableAmount < tokenValueConversion(feeValue)) {
            return new Error('Insufficient wallet balance to process the transaction.');
        }
        return new Error('');
    } else {
        if(tokenDenom !== DefaultChainInfo.currency.coinMinimalDenom) {
            if (transferableAmount < tokenValueConversion(feeValue)) {
                return new Error('Insufficient wallet balance to process the transaction.');
            }
            return new Error('');
        }else {
            if ((transferableAmount - (stringToNumber(amount))).toFixed(6) < tokenValueConversion(feeValue)) {
                return new Error('Insufficient wallet balance to process the transaction.11');
            }
            return new Error('');
        }
    }
};

export const ValidateGas = (value) => {
    if (stringToNumber(value) < GasInfo.minGas || (stringToNumber(value)) > GasInfo.maxGas) {
        return new Error('Enter Gas between 80000 to 2000000');
    }
    return new Error('');
};

export const PasswordValidation = (data) => {
    const regex = /^\S{3}\S+$/;
    if (/\s/g.test(data)) {
        return new Error('Spaces not allowed');
    } else if (!regex.test(data)) {
        return new Error('Password must be greater than 3 letters');
    }
    return new Error('');
};

export const ValidateAlphaNumeric = e => {
    const regEx = /^[a-z0-9A-Z]+$/;
    if (!regEx.test(e.key)) {
        e.preventDefault();
    }
};

export const ValidateString = e => {
    const regEx = /^[a-z]+$/;
    if (!regEx.test(e.key)) {
        e.preventDefault();
    }
};


export const ValidateSpecialCharacters = e => {
    const key = e.key.toLowerCase();
    if (key === "e" || key === "-" || key === "+") {
        e.preventDefault();
    }
};
export const ValidateAccountIndex = (value) => {
    if (parseInt(value) > 2147483647 || parseInt(value) < 0) {
        return new Error('Limit exceeded');
    }
    return new Error('');
};

export const ValidateBip39PassPhrase = (value) => {
    if (value.length > 50) {
        return new Error('Length should be below 50 characters');
    }
    return new Error('');
};

export const ValidationFileTypeCheck = (filePath) => {
    let allowedExtensions =
        /(\.json)$/i;
    if (!allowedExtensions.exec(filePath)) {
        return new Error("File type not supported");
    }
    return new Error('');
};

export const ValidateSpace = (e) => {
    if (e.key === " ") {
        e.preventDefault();
    }
};

export const ValidateMultipleValidatorsClaim = (evt) => {
    if (evt.length > 3) {
        return new Error("Warning:  Recommend 3 or fewer validators to avoid potential issues.");
    }
    return new Error('');
};

export const ValidateReDelegateAmount = (delegationAmount, amount) => {
    if (stringToNumber(delegationAmount) < amount) {
        return new Error('Insufficient Delegated Amount');
    }
    return new Error('');
};

export const ValidateMnemonic = (mnemonic) => {
    const mnemonicWords = mnemonicTrim(mnemonic);
    let validateMnemonic = bip39.validateMnemonic(mnemonicWords);
    if (!validateMnemonic) {
        return new Error('Invalid mnemonic.');
    }
    return new Error('');
};

export const ValidateMemo = (value) => {
    let mnemonicWords = mnemonicTrim(value);
    let validateMnemonic = bip39.validateMnemonic(mnemonicWords);
    if (validateMnemonic) {
        return new Error('Entered secret passphrase(mnemonic) in memo field.');
    }
    return new Error('');
};

export const ValidateAlphaNumericSpaces = e => {
    const regEx = /^[a-z0-9A-Z ]+$/;
    if (!regEx.test(e.key)) {
        e.preventDefault();
    }
};

export const ValidateStringSpaces = e => {
    const regEx = /^[a-z ]+$/;
    if (!regEx.test(e.key)) {
        e.preventDefault();
    }
};

export const validateAddress = (address, prefix = "mantle") => {
    if (prefix === "cosmos") {
        if (!address.startsWith(prefix) || address.length !== 45) {
            return new Error('Invalid Recipient Address');
        }
    } else if (prefix === "osmo") {
        if (!address.startsWith(prefix) || address.length !== 43) {
            return new Error('Invalid Recipient Address');
        }
    } else if (prefix === "gravity") {
        if (!address.startsWith("gravity") || address.length !== 46) {
            return new Error('Invalid Recipient Address');
        }
    } else if (prefix === "cre") {
        if (!address.startsWith("cre") || address.length !== 42) {
            return new Error('Invalid Recipient Address');
        }
    } else if (prefix === "juno") {
        if (!address.startsWith("juno") || address.length !== 43) {
            return new Error('Invalid Recipient Address');
        }
    } else if (prefix === "persistence") {
        if (!address.startsWith("persistence") || address.length !== 50) {
            return new Error('Invalid Recipient Address');
        }
    } else {
        if (!address.startsWith(prefix) || address.length !== 45) {
            return new Error('Invalid Recipient Address');
        }
    }
    return new Error('');
};

export const sortTokensByDenom = (list, denom) =>{
    let tokenRewards;
    if(list.reward.length) {
        for (const token of list.reward) {
            if (token && token.denom === denom) {
                tokenRewards = token;
            }
        }
    }
    return tokenRewards;
};