import React from "react";
import ToAddress from "./ToAddress";
import Tokens from "./Tokens";
import Amount from "./Amount";
import SendButton from "./Send";
import {Modal} from "react-bootstrap";
import ModalViewTxnResponse from "../../Common/ModalViewTxnResponse";
import {useDispatch, useSelector} from "react-redux";
import {hideTxResultModal} from "../../../actions/transactions/common";
import {useTranslation} from "react-i18next";
import Loader from "../../../components/Loader";
import Memo from "./Memo";
import FeeModal from "../../Common/Fee/Modal";
import KeyStoreModal from "../../Common/KeyStore/Modal";

const Send = () => {
    const {t} = useTranslation();
    const dispatch = useDispatch();
    // let mode = localStorage.getItem('loginMode');
    const show = useSelector((state) => state.common.modal);
    const response = useSelector(state => state.send.response.value);
    const inProgress = useSelector(state => state.send.inProgress);
    const error = useSelector(state => state.send.error);

    console.log(error.error.message, "error in index");
    const handleClose = () => {
        dispatch(hideTxResultModal());
    };
    if (inProgress) {
        return <Loader/>;
    }

    return (
        <div className="send-container">
            <div className="form-section">
                <ToAddress/>
                <Tokens/>
                <Amount/>
                <Memo/>
                {error !== '' ?
                    <p className="form-error">{error.error.message}</p> : null}
                <SendButton/>
            </div>
            <FeeModal/>
            <Modal show={show} onHide={handleClose} backdrop="static" centered className="modal-custom">
                <ModalViewTxnResponse
                    response={response}
                    successMsg={t("SUCCESSFUL_SEND")}
                    failedMsg={t("FAILED_SEND")}
                    handleClose={handleClose}
                />
            </Modal>
            <KeyStoreModal/>
        </div>
    );
};



export default Send;