import React, { useEffect, useState } from "react";
import Wallet from "../../containers/Wallet";
import DashboardHeader from "../../containers/Common/DashboardHeader";
import GenerateKeyStore from "../../containers/GenerateKeyStore";
import ChangeKeyStorePassword from "../../containers/ChangeKeyStorePassword";
import {useDispatch} from "react-redux";
import { useHistory, useParams } from "react-router-dom";
import { LOGIN_INFO} from "../../constants/localStorage";
import {fetchDelegationsCount} from "../../store/actions/delegations";
import {fetchBalance, fetchTransferableVestingAmount} from "../../store/actions/balance";
import {fetchRewards, fetchTotalRewards} from "../../store/actions/rewards";
import {fetchUnbondDelegations} from "../../store/actions/unbond";
import {fetchTokenPrice} from "../../store/actions/tokenPrice";
import {fetchValidators} from "../../store/actions/validators";
import {updateFee} from "../../utils/helper";
import {ledgerDisconnect} from "../../utils/ledger";
import LoadingComponent from "../../components/LoadingComponent";
import RouteNotFound from "../../components/RouteNotFound";
import { validateAddress } from "../../utils/validations";
import { isBech32Address } from "../../utils/scripts";
import { DefaultChainInfo } from "../../config";

const DashboardWallet = (props) => {
    console.log("inside DashboardWallet");

    const dispatch = useDispatch();
    const history = useHistory();
    const [loading, setLoading] = useState(false);
    const [invalidRoute, setInvalidRoute] = useState(false);
    const {paramValue} = useParams();
    const [accessAddress, setAccessAddress] = useState("");

    const loginModesArray = ["keplr", "ledger", "keystore"];
    console.log("history: ", history.location);


    const fetchApi = async (address, loginMode) => {
        console.log("inside fetchApi, address: ", address, " loginMode: ", loginMode);
        if (address !== null && address !== undefined) {
            await Promise.all([
                dispatch(fetchDelegationsCount(address)),
                dispatch(fetchBalance(address)),
                dispatch(fetchRewards(address)),
                dispatch(fetchTotalRewards(address)),
                dispatch(fetchUnbondDelegations(address)),
                dispatch(fetchTokenPrice()),
                dispatch(fetchTransferableVestingAmount(address)),
                dispatch(fetchValidators(address)),
                updateFee(address),
                setInterval(() => dispatch(fetchTotalRewards(address)), 10000),
            ]);
            if(loginMode === "ledger"){
                ledgerDisconnect(dispatch, history);
            }
        }
        setLoading(false);
    };

    useEffect(() => {
        const {isLoggedMode = true} = props || true;
        console.log("inside useEffect of DashboardWallet");
        let address;
        let loginModeLocal;
        const loginInfo = JSON.parse(localStorage.getItem(LOGIN_INFO)) || {};

        // the param value will point to login mode (keplr, ledger, etc.)
        console.log("paramValue: ", paramValue);
        console.log("isLoggedMode: ", isLoggedMode);

        if(isLoggedMode) {
            if(!loginInfo || loginInfo.address == null || loginInfo.address == undefined || loginInfo.loginMode == null || loginInfo.loginMode == undefined) {
                history.push('/');
                return;
            }
            
            address = loginInfo && loginInfo.address;
            loginModeLocal = loginInfo && loginInfo.loginMode;
            console.log("address: ", address, " loginMode: ", paramValue, " loginModeLocal: ", loginModeLocal);
    
            // if the dynamic uri path is missing or doesnt match the current logged in mode, then redirect to correct one
            if(!paramValue || loginModesArray.indexOf(paramValue) == -1 || paramValue !== loginModeLocal) {
                history.push(`/dashboard/${loginModeLocal}`);
                return;
            } else {
                setLoading(true);
                setAccessAddress(address);
    
                // retrieve wallet related details
                fetchApi(address, loginModeLocal);
            }
        } else {
            // the param value will point to address for Address View
            console.log("paramValue: ", paramValue);
            if(!paramValue) {
                history.push(`/dashboard`);
            } else {
                if (validateAddress(paramValue) && isBech32Address(paramValue, DefaultChainInfo.prefix)) {
                    setLoading(true);
                    setAccessAddress(paramValue);
    
                    // retrieve wallet related details
                    fetchApi(paramValue, loginModeLocal); 
                } else {
                    setInvalidRoute(true);
                }
            }
        }
    }, [paramValue]);
    
    if(loading) {
        return <LoadingComponent />;
    }

    if(invalidRoute) {
        return <RouteNotFound />;
    }

    return (
        <div className="main-section">
            <DashboardHeader/>
            <GenerateKeyStore/>
            <ChangeKeyStorePassword/>
            <div className="content-section container">
                <Wallet address={accessAddress}/>
            </div>
        </div>
    );
};

export default DashboardWallet;
