import helper, {vestingAccountCheck} from "../../../utils/helper";
import {getAccount} from "../../../utils/helper";
import {setLoginInfo} from "../transactions/common";
import * as Sentry from "@sentry/browser";
import {LOGIN_INFO} from "../../../constants/localStorage";
import {isBech32Address} from "../../../utils/scripts";
import {validateAddress} from "../../../utils/validations";
import {DefaultChainInfo, FeeInfo} from "../../../config";
import packageJson from "../../../../package.json";


export const addressDetails = (address) => {
    return async (dispatch, getState) => {
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
        if (validateAddress(address) && isBech32Address(address, DefaultChainInfo.prefix)) {
            const res = getAccount(address).catch(error => {
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
            loginInfo.loginMode = "address";
            loginInfo.version = packageJson.version;
            loginInfo.accountNumber = accountNumber;
            loginInfo.accountIndex = accountIndex;
            dispatch(setLoginInfo({
                encryptedSeed: false,
                error: {
                    message: ''
                }
            }));
            localStorage.setItem(LOGIN_INFO, JSON.stringify(loginInfo));
        } else {
            dispatch(setLoginInfo(
                {
                    encryptedSeed: false,
                    error: {
                        message: 'Enter Valid Address'
                    }
                }));
        }
    };
};