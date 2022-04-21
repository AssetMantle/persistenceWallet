import {TOKEN_PRICE_FETCH_ERROR, TOKEN_PRICE_FETCH_SUCCESS,} from "../../constants/tokenPrice";
import CoinGecko from 'coingecko-api';
import * as Sentry from "@sentry/browser";


const CoinGeckoClient = new CoinGecko();

export const fetchTokenPriceSuccess = (data) => {
    return {
        type: TOKEN_PRICE_FETCH_SUCCESS,
        data,
    };
};
export const fetchTokenPriceError = (data) => {
    return {
        type: TOKEN_PRICE_FETCH_ERROR,
        data,
    };
};

export const fetchTokenPrice = () => (dispatch) => {
    CoinGeckoClient.simple.price({ids: "assetmantle"}).then((res) => {
        if (res.data.assetmantle.usd) {
            dispatch(fetchTokenPriceSuccess(res.data.assetmantle.usd));
        }
    }).catch((error) => {
        Sentry.captureException(error.response
            ? error.response.data.message
            : error.message);
        dispatch(fetchTokenPriceError(error.response
            ? error.response.data.message
            : error.message));
    });
};
