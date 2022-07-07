import {Modal as ReactModal} from 'react-bootstrap';
import React, { useState } from 'react';
import {useDispatch, useSelector} from "react-redux";
import {hideKeyStoreModal} from "../../../../store/actions/signIn/keyStore";
import FileInput from "./FileInput";
import Password from "./Password";
import Submit from "./Submit";
import Icon from "../../../../components/Icon";
import Advanced from "../../../Common/Advanced";
import {useTranslation} from "react-i18next";
import {hideSignInModal, showSignInModal} from "../../../../store/actions/signIn/modal";
import RecentKeyStores from './RecentKeyStores';

const ModalForm = () => {
    const {t} = useTranslation();
    const show = useSelector((state) => state.signInKeyStore.keyStoreModal);
    const response = useSelector((state) => state.signInKeyStore.response);

    const dispatch = useDispatch();

    const [RecentSelected, setRecentSelected] = useState(false);

    const handleClose = () => {
        dispatch(hideSignInModal());
        dispatch(hideKeyStoreModal());
    };

    const keyStorePrevious = () => {
        dispatch(hideKeyStoreModal());
        dispatch(showSignInModal());
        setRecentSelected(false);
    };

    return (
        <ReactModal
            animation={false}
            backdrop="static"
            className="create-wallet-modal seed modal"
            centered={true}
            keyboard={false}
            show={show}
            onHide={handleClose}>
            <ReactModal.Header closeButton={true}>
                <div className="previous-section txn-header">
                    <button className="button" onClick={() => keyStorePrevious()}>
                        <Icon
                            viewClass="arrow-right"
                            icon="left-arrow"/>
                    </button>
                </div>
                <p>{t("LOGIN_WITH_KEYSTORE")}</p>
            </ReactModal.Header>
            <ReactModal.Body className="create-wallet-body import-wallet-body">
                <RecentKeyStores setSelected={setRecentSelected}/>
                <FileInput disableState={RecentSelected}/>
                <Password/>
                <Advanced disableState={RecentSelected}/>
                <Submit statement={RecentSelected}/>
                {response.error.message !== "" ?
                    <div className="login-error"><p className="error-response">{response.error.message}</p></div>
                    : ""
                }
                <div className="note-section">
                    <div className="exclamation"><Icon
                        viewClass="arrow-right"
                        icon="exclamation"/></div>
                    <p>{t("PRIVATE_KEY_WARNING")}</p>
                </div>
            </ReactModal.Body>
        </ReactModal>
    );
};


export default ModalForm;
