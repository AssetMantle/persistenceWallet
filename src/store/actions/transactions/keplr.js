import transactions from "../../../utils/transactions";
import {fee} from "../../../utils/aminoMsgHelper";
import {showTxResultModal, txFailed, txInProgress, txResponse, txSuccess} from "./common";
import * as Sentry from "@sentry/browser";

export const keplrSubmit = (messages = "") => (dispatch, getState) => {
    dispatch(txInProgress());
    const response = transactions.TransactionWithKeplr(messages, fee(0, 500000),"");
    response.then(result => {
        if (getState().common.txName.value.name !== "send" && getState().common.txName.value.name !== "ibc") {
            dispatch(getState().common.txInfo.value.modal);
        }
        if (result.code !== undefined) {
            dispatch(txSuccess());
            dispatch(txResponse(result));
            dispatch(showTxResultModal());
        } else {
            console.log(result, "final result");
        }
    }).catch(error => {
        Sentry.captureException(error.response
            ? error.response.data.message
            : error.message);
        dispatch(txFailed(error.message));
    });

};