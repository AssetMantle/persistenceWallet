import {
    PAGE_NUMBER_FETCH_SUCCESS,
    RECEIVE_PAGE_NUMBER_FETCH_SUCCESS,
    RECEIVE_TRANSACTIONS_FETCH_ERROR,
    RECEIVE_TRANSACTIONS_FETCH_SUCCESS,
    RECEIVE_TRANSACTIONS_IN_PROGRESS,
    TRANSACTIONS_FETCH_ERROR,
    TRANSACTIONS_FETCH_SUCCESS,
    TRANSACTIONS_IN_PROGRESS
} from "../../constants/transactionQueries";
import {buildQuery} from "@cosmjs/tendermint-rpc/build/tendermint34/requests";
import {Tendermint34Client} from "@cosmjs/tendermint-rpc";
import {decodeTxRaw, Registry} from "@cosmjs/proto-signing";
import helper, {generateHash} from "../../utils/helper";
import * as Sentry from "@sentry/browser";

const {defaultRegistryTypes} = require("@cosmjs/stargate");
const tendermintRPCURL = process.env.REACT_APP_TENDERMINT_RPC_ENDPOINT;
const vestingTx = require("cosmjs-types/cosmos/vesting/v1beta1/tx");
const tx_7 = require("cosmjs-types/ibc/core/channel/v1/tx");
const authzTx = require("cosmjs-types/cosmos/authz/v1beta1/tx");
const feeGrantTx = require("cosmjs-types/cosmos/feegrant/v1beta1/tx");

function createDefaultRegistry() {
    return new Registry([...defaultRegistryTypes, ['/cosmos.authz.v1beta1.MsgGrant', authzTx.MsgGrant],
        ["/cosmos.vesting.v1beta1.MsgCreateVestingAccount", vestingTx.MsgCreateVestingAccount],
        ["/ibc.core.channel.v1.MsgTimeout", tx_7.MsgTimeout],
        ["/cosmos.feegrant.v1beta1.MsgGrantAllowance", feeGrantTx.MsgGrantAllowance],
        ["/cosmos.feegrant.v1beta1.MsgRevokeAllowance", feeGrantTx.MsgRevokeAllowance],
        ["/cosmos.authz.v1beta1.MsgExec", authzTx.MsgExec], ["/cosmos.authz.v1beta1.MsgRevoke", authzTx.MsgRevoke]]);
}

const registry = createDefaultRegistry();

export const fetchTransactionsProgress = () => {
    return {
        type: TRANSACTIONS_IN_PROGRESS,
    };
};

export const fetchPageNumberSuccess = (number, totalPages) => {
    return {
        type: PAGE_NUMBER_FETCH_SUCCESS,
        number,
        totalPages
    };
};


export const fetchTransactionsSuccess = (list) => {
    return {
        type: TRANSACTIONS_FETCH_SUCCESS,
        list,
    };
};

export const fetchTransactionsError = (list) => {
    return {
        type: TRANSACTIONS_FETCH_ERROR,
        list,
    };
};

export const fetchTransactions = (address, limit, pageNumber) => {
    return async dispatch => {
        dispatch(fetchTransactionsProgress());
        let txData = [];
        try {
            const tmClient = await Tendermint34Client.connect(tendermintRPCURL);
            const txSearch = await tmClient.txSearch(txSearchParams(address, pageNumber, limit, "message.sender"));
            for (let transaction of txSearch.txs) {
                const decodedTransaction = decodeTxRaw(transaction.tx);
                const block = await tmClient.block(transaction.height);
                if (transaction.result.code === 0) {
                    const txHash = generateHash(transaction.tx);
                    let body;
                    let typeUrl;
                    if (decodedTransaction.body.messages.length > 1) {
                        typeUrl = decodedTransaction.body.messages[decodedTransaction.body.messages.length - 1].typeUrl;
                        body = registry.decode(decodedTransaction.body.messages[decodedTransaction.body.messages.length - 1]);
                    } else {
                        typeUrl = decodedTransaction.body.messages[0].typeUrl;
                        body = registry.decode(decodedTransaction.body.messages[0]);
                    }
                    const txAmount = helper.getTransactionAmount(body);

                    txData.push({
                        'typeUrl': typeUrl,
                        'messageCount': decodedTransaction.body.messages.length,
                        'fee': decodedTransaction.authInfo.fee,
                        'height': transaction.height,
                        'hash': txHash,
                        'body': body,
                        'amount': txAmount,
                        'timestamp': block.block.header.time
                    });
                }
            }
            let txnsResponseList = txData;
            dispatch(fetchPageNumberSuccess(pageNumber, txSearch.totalCount));
            dispatch(fetchTransactionsSuccess(txnsResponseList));
        } catch (error) {
            Sentry.captureException(error.response
                ? error.response.data.message
                : error.message);
            console.log(error.message);
        }
    };
};

export const fetchReceiveTransactionsProgress = () => {
    return {
        type: RECEIVE_TRANSACTIONS_IN_PROGRESS,
    };
};

export const fetchReceivePageNumberSuccess = (number, totalPages) => {
    return {
        type: RECEIVE_PAGE_NUMBER_FETCH_SUCCESS,
        number,
        totalPages
    };
};


export const fetchReceiveTransactionsSuccess = (list) => {
    return {
        type: RECEIVE_TRANSACTIONS_FETCH_SUCCESS,
        list,
    };
};
export const fetchReceiveTransactionsError = (list) => {
    return {
        type: RECEIVE_TRANSACTIONS_FETCH_ERROR,
        list,
    };
};


function txSearchParams(recipientAddress, pageNumber, perPage, type) {
    return {
        query: buildQuery({
            tags: [
                {key: type, value: recipientAddress},
            ],
        }), page: pageNumber, per_page: perPage, prove: true, order_by: 'desc'
    };
}

export const fetchReceiveTransactions = (address, limit, pageNumber) => {
    return async dispatch => {
        dispatch(fetchReceiveTransactionsProgress());
        let txData = [];
        try {
            const tmClient = await Tendermint34Client.connect(tendermintRPCURL);
            const txSearch = await tmClient.txSearch(txSearchParams(address, pageNumber, limit, "transfer.recipient"));
            for (let transaction of txSearch.txs) {
                const decodedTransaction = decodeTxRaw(transaction.tx);
                const block = await tmClient.block(transaction.height);

                if (transaction.result.code === 0) {
                    const txHash = generateHash(transaction.tx);
                    let body;
                    let typeUrl;
                    if (decodedTransaction.body.messages.length > 1) {
                        typeUrl = decodedTransaction.body.messages[decodedTransaction.body.messages.length - 1].typeUrl;
                        body = registry.decode(decodedTransaction.body.messages[decodedTransaction.body.messages.length - 1]);
                    } else {
                        typeUrl = decodedTransaction.body.messages[0].typeUrl;
                        body = registry.decode(decodedTransaction.body.messages[0]);
                    }
                    const txAmount = helper.getTransactionAmount(body);
                    txData.push({
                        'typeUrl': typeUrl,
                        'messageCount': decodedTransaction.body.messages.length,
                        'fee': decodedTransaction.authInfo.fee,
                        'height': transaction.height,
                        'hash': txHash,
                        'body': body,
                        'amount': txAmount,
                        'timestamp': block.block.header.time
                    });
                }
            }
            let txnsResponseList = txData;
            dispatch(fetchReceivePageNumberSuccess(pageNumber, txSearch.totalCount));
            dispatch(fetchReceiveTransactionsSuccess(txnsResponseList));
        } catch (error) {
            Sentry.captureException(error.response
                ? error.response.data.message
                : error.message);
            console.log(error.message);
        }
    };
};
