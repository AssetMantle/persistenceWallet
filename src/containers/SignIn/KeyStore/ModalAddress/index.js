import {Modal as ReactModal} from 'react-bootstrap';
import React, {  useEffect, useState } from 'react';
import {useDispatch, useSelector} from "react-redux";
import {hideKeyStoreResultModal, keyStoreLogin, showKeyStoreModal} from "../../../../store/actions/signIn/keyStore";
import Icon from "../../../../components/Icon";
import {useTranslation} from "react-i18next";
import {useHistory} from "react-router-dom";

const ModalAddress = () => {
    const {t} = useTranslation();
    const history = useHistory();

    const show = useSelector((state) => state.signInKeyStore.keyStoreResultModal);
    const response = useSelector((state) => state.signInKeyStore.response.value);
    const accountNumber = useSelector((state) => state.advanced.accountNumber);
    const accountIndex = useSelector((state) => state.advanced.accountIndex);
    const bip39PassPhrase = useSelector((state) => state.advanced.bip39PassPhrase);
    const dispatch = useDispatch();

    const handleClose = () => {
        dispatch(hideKeyStoreResultModal());
    };
    
    const CurrentKeyStore = {
        ...localStorage.encryptedMnemonic !== "[object File]" && localStorage.encryptedMnemonic !== undefined &&  JSON.parse(localStorage.encryptedMnemonic),
        address: response.address, 
        hdPath: response.walletPath,
        accountNumber: accountNumber,
        accountIndex: accountIndex,
        bip39PassPhrase: bip39PassPhrase
    };

    const RecentKeyStores = localStorage.recentKeyStores !== undefined ? JSON.parse(localStorage.recentKeyStores) : [];

    var KeyStores= [...RecentKeyStores];

    const [UniqKeyStores,setUniqKeyStores] = useState([]);

    useEffect(() => {
        if(KeyStores.find(ele=>ele.address === CurrentKeyStore.address)) {
            setUniqKeyStores([...KeyStores.filter(object => {
                return object !== undefined && object !== null && object !== "" && object.address !== CurrentKeyStore.address;
            })]);
        } else {
            setUniqKeyStores([...KeyStores]);
        }
    }, [CurrentKeyStore.address]);
    

    const NewRecentKeyStores = [
        CurrentKeyStore,
        UniqKeyStores[0] && UniqKeyStores[0],
        UniqKeyStores[1] && UniqKeyStores[1],
        UniqKeyStores[2] && UniqKeyStores[2],
    ].filter(object=>object !== null && object);

    const handleLogin = () => {
        dispatch(keyStoreLogin(history));
        localStorage.recentKeyStores= JSON.stringify(NewRecentKeyStores);
    };

    const keyStorePrevious = () => {
        dispatch(hideKeyStoreResultModal());
        dispatch(showKeyStoreModal());
    };

    return (
        <ReactModal
            animation={false}
            backdrop="static"
            className="modal-custom"
            centered={true}
            keyboard={false}
            show={show}
            onHide={handleClose}>
            <ReactModal.Header closeButton>
                <div className="previous-section">
                    <button className="button" onClick={() => keyStorePrevious("advancedForm")}>
                        <Icon
                            viewClass="arrow-right"
                            icon="left-arrow"/>
                    </button>
                </div>
                <h3 className="heading">{t("LOGIN_WITH_KEYSTORE")}</h3>
            </ReactModal.Header>

            <ReactModal.Body className="create-wallet-body import-wallet-body">
                <p className="mnemonic-result">
                    <b>{t("WALLET_PATH")}: </b>{response.walletPath}</p>
                <p className="mnemonic-result"><b>{t("ADDRESS")}: </b>{response.address}
                </p>
                <div className="buttons">
                    <button className="button button-primary" onClick={handleLogin}>{t("LOGIN")}</button>
                </div>
            </ReactModal.Body>
        </ReactModal>
    );
};


export default ModalAddress;
