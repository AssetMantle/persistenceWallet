import {SET_KEPLR_INFO, SIGN_IN_KEPLR_MODAL_HIDE, SIGN_IN_KEPLR_MODAL_SHOW} from "../../../constants/signIn/keplr";
import KeplrWallet from "../../../utils/keplr";
import {getAccount} from "../../../utils/helper";
import {setLoginInfo} from "../transactions/common";
import * as Sentry from "@sentry/browser";
import helper, {vestingAccountCheck} from "../../../utils/helper";
import {
    KEPLR_ADDRESS,
    LOGIN_INFO,
} from "../../../constants/localStorage";
import {FeeInfo} from "../../../config";
import packageJson from "../../../../package.json";

export const hideKeplrModal = (data) => {
    return {
        type: SIGN_IN_KEPLR_MODAL_HIDE,
        data,
    };
};

export const showKeplrModal = (data) => {
    return {
        type: SIGN_IN_KEPLR_MODAL_SHOW,
        data,
    };
};

export const setKeplrInfo = (data) => {
    return {
        type: SET_KEPLR_INFO,
        data,
    };
};

export const fetchKeplrAddress = () => {
    return async (dispatch) => {
        const keplr = KeplrWallet();
        keplr.then(function () {
            const address = localStorage.getItem(KEPLR_ADDRESS);
            dispatch(setKeplrInfo({
                value: address,
                error: {
                    message: '',
                },
            }));
        }).catch(error => {
            Sentry.captureException(error.response
                ? error.response.data.message
                : error.message);
            dispatch(setKeplrInfo({
                value: '',
                error: {
                    message: error.message,
                },
            }));
        });
    };
};


export const keplrLogin = (history) => {
    return async (dispatch, getState) => {
        const address = getState().signInKeplr.keplrInfo.value;
        const loginInfo = {
            fee: '',
            account: '',
            loginToken: '',
            address: '',
            loginMode: '',
            version: '',
            accountNumber: '',
            accountIndex: ''
        };
        const accountNumber = helper.getAccountNumber(getState().advanced.accountNumber.value);
        const accountIndex = helper.getAccountNumber(getState().advanced.accountIndex.value);
        const res = await getAccount(address).catch(error => {
            Sentry.captureException(error.response
                ? error.response.data.message
                : error.message);
            console.log(error.message);
            loginInfo.fee = FeeInfo.defaultFee;
            loginInfo.account = "non-vesting";
        });
        const accountType = await vestingAccountCheck(res && res.typeUrl);
        if (accountType) {
            loginInfo.fee = FeeInfo.vestingAccountFee;
            loginInfo.account = "vesting";
        } else {
            loginInfo.fee = FeeInfo.defaultFee;
            loginInfo.account = "non-vesting";
        }
        loginInfo.loginToken = "loggedIn";
        loginInfo.address = address;
        loginInfo.loginMode = 'keplr';
        loginInfo.version = packageJson.version;
        loginInfo.accountNumber = accountNumber;
        loginInfo.accountIndex = accountIndex;
        localStorage.setItem(LOGIN_INFO, JSON.stringify(loginInfo));
        dispatch(setLoginInfo({
            encryptedSeed: false,
            error: {
                message: ''
            }
        }));
        history.push(`/dashboard/${loginInfo.loginMode}`);
        window.location.reload();
    };
};