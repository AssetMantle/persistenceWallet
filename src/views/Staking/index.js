import React, { useEffect, useState } from "react";
import { useHistory, useParams } from "react-router-dom";
import LoadingComponent from "../../components/LoadingComponent";
import { LOGIN_INFO } from "../../constants/localStorage";
import ChangeKeyStorePassword from "../../containers/ChangeKeyStorePassword";
import DashboardHeader from "../../containers/Common/DashboardHeader";
import GenerateKeyStore from "../../containers/GenerateKeyStore";
import Staking from "../../containers/Staking";

const DashboardStaking = () => {

    const {selectedLoginMode} = useParams();
    const [loading, setLoading] = useState(true);
    const history = useHistory();





    useEffect(() => {
        console.log("inside useEffect of DashboardWallet");
        const loginInfo = JSON.parse(localStorage.getItem(LOGIN_INFO)) || {};

        if((selectedLoginMode == null || selectedLoginMode == undefined) && (loginInfo.address == null || loginInfo.address == undefined)) {
            setLoading(false);
            history.push('/');
            return;
        }
    }, [selectedLoginMode]);

    if(loading) {
        return <LoadingComponent />;
    }

    return (
        <div className="main-section">
            <DashboardHeader/>
            <GenerateKeyStore/>
            <ChangeKeyStorePassword/>
            <div className="content-section container">
                <Staking/>
            </div>
        </div>
    );
};
export default DashboardStaking;