import {stringToNumber} from "./scripts";
import {DefaultChainInfo} from "../config";

const restAPI = process.env.REACT_APP_API_KEY;
const tendermintRPC = process.env.REACT_APP_TENDERMINT_RPC_ENDPOINT;
const chainID = process.env.REACT_APP_CHAIN_ID;
const chainName = process.env.REACT_APP_CHAIN_NAME;
const websiteURL = process.env.REACT_APP_WEBSITE_URL;
const coinName = DefaultChainInfo.currency.coinDenom;
const coinDenom = DefaultChainInfo.currency.coinMinimalDenom;
const prefix = DefaultChainInfo.prefix;

async function KeplrWallet() {
    // Keplr extension injects the offline signer that is compatible with cosmJS.
    // You can get this offline signer from `window.getOfflineSigner(chainId:string)` after load event.
    // And it also injects the helper function to `window.keplr`.
    // If `window.getOfflineSigner` or `window.keplr` is null, Keplr extension may be not installed on browser.
    if (!window.getOfflineSigner || !window.keplr) {
        throw new Error("install keplr extension");
    } else {
        if (window.keplr.experimentalSuggestChain) {
            try {
                // Keplr v0.6.4 introduces an experimental feature that supports the feature to suggests the chain from a webpage.
                // cosmoshub-3 is integrated to Keplr so the code should return without errors.
                // The code below is not needed for cosmoshub-3, but may be helpful if you’re adding a custom chain.
                // If the user approves, the chain will be added to the user's Keplr extension.
                // If the user rejects it or the suggested chain information doesn't include the required fields, it will throw an error.
                // If the same chain id is already registered, it will resolve and not require the user interactions.
                await window.keplr.experimentalSuggestChain({
                    // Chain-id of the Cosmos SDK chain.
                    chainId: chainID,
                    // The name of the chain to be displayed to the user.
                    chainName: chainName,
                    // RPC endpoint of the chain.
                    rpc: tendermintRPC,
                    // REST endpoint of the chain.
                    rest: restAPI,
                    // Staking coin information
                    stakeCurrency: {
                        // Coin denomination to be displayed to the user.
                        coinDenom: coinName,
                        // Actual denom (i.e. uatom, uscrt) used by the blockchain.
                        coinMinimalDenom: coinDenom,
                        // # of decimal points to convert minimal denomination to user-facing denomination.
                        coinDecimals: 6,
                        // (Optional) Keplr can show the fiat value of the coin if a coingecko id is provided.
                        // You can get id from https://api.coingecko.com/api/v3/coins/list if it is listed.
                        coinGeckoId: DefaultChainInfo.currency.coinGeckoId
                    },
                    // (Optional) If you have a wallet webpage used to stake the coin then provide the url to the website in `walletUrlForStaking`.
                    // The 'stake' button in Keplr extension will link to the webpage.
                    walletUrlForStaking: `${websiteURL}/dashboard/staking`,
                    // The BIP44 path.
                    bip44: {
                        // You can only set the coin type of BIP44.
                        // 'Purpose' is fixed to 44.
                        coinType: stringToNumber(DefaultChainInfo.coinType),
                    },
                    // Bech32 configuration to show the address to user.
                    // This field is the interface of
                    // {
                    //   bech32PrefixAccAddr: string;
                    //   bech32PrefixAccPub: string;
                    //   bech32PrefixValAddr: string;
                    //   bech32PrefixValPub: string;
                    //   bech32PrefixConsAddr: string;
                    //   bech32PrefixConsPub: string;
                    // }
                    bech32Config: {
                        bech32PrefixAccAddr: prefix,
                        bech32PrefixAccPub: prefix + "pub",
                        bech32PrefixValAddr: prefix + "valoper",
                        bech32PrefixValPub: prefix + "valoperpub",
                        bech32PrefixConsAddr: prefix + "valcons",
                        bech32PrefixConsPub: prefix + "valconspub"
                    },
                    // List of all coin/tokens used in this chain.
                    currencies: [{
                        // Coin denomination to be displayed to the user.
                        coinDenom: coinName,
                        // Actual denom (i.e. uatom, uscrt) used by the blockchain.
                        coinMinimalDenom: coinDenom,
                        // # of decimal points to convert minimal denomination to user-facing denomination.
                        coinDecimals: 6,
                        // (Optional) Keplr can show the fiat value of the coin if a coingecko id is provided.
                        // You can get id from https://api.coingecko.com/api/v3/coins/list if it is listed.
                        coinGeckoId: DefaultChainInfo.currency.coinGeckoId
                    }],
                    // List of coin/tokens used as a fee token in this chain.
                    feeCurrencies: [{
                        // Coin denomination to be displayed to the user.
                        coinDenom: coinName,
                        // Actual denom (i.e. uatom, uscrt) used by the blockchain.
                        coinMinimalDenom: coinDenom,
                        // # of decimal points to convert minimal denomination to user-facing denomination.
                        coinDecimals: 6,
                        // (Optional) Keplr can show the fiat value of the coin if a coingecko id is provided.
                        // You can get id from https://api.coingecko.com/api/v3/coins/list if it is listed.
                        coinGeckoId: DefaultChainInfo.currency.coinGeckoId
                    }],
                    // (Optional) The number of the coin type.
                    // This field is only used to fetch the address from ENS.
                    // Ideally, it is recommended to be the same with BIP44 path's coin type.
                    // However, some early chains may choose to use the Cosmos Hub BIP44 path of '118'.
                    // So, this is separated to support such chains.
                    coinType: stringToNumber(DefaultChainInfo.coinType),
                    // (Optional) This is used to set the fee of the transaction.
                    // If this field is not provided, Keplr extension will set the default gas price as (low: 0.01, average: 0.025, high: 0.04).
                    // Currently, Keplr doesn't support dynamic calculation of the gas prices based on on-chain data.
                    // Make sure that the gas prices are higher than the minimum gas prices accepted by chain validators and RPC/REST endpoint.
                    gasPriceStep: {
                        low: 0.00,
                        average: 0.025,
                        high: 0.04
                    }
                });
            } catch {
                alert("Failed to suggest the chain");
            }
        } else {
            alert("Please use the recent version of keplr extension");
        }
    }

    const chainId = chainID;
    // You should request Keplr to enable the wallet.
    // This method will ask the user whether or not to allow access if they haven't visited this website.
    // Also, it will request user to unlock the wallet if the wallet is locked.
    // If you don't request enabling before usage, there is no guarantee that other methods will work.
    await window.keplr.enable(chainId);

    const offlineSigner = window.getOfflineSigner(chainId);
    // You can get the address/public keys by `getAccounts` method.
    // It can return the array of address/public key.
    // But, currently, Keplr extension manages only one address/public key pair.
    // XXX: This line is needed to set the sender address for SigningStargateClient.
    const accounts = await offlineSigner.getAccounts();
    // Initialize the gaia api with the offline signer that is injected by Keplr extension.
    // const cosmJS = SigningStargateClient.connectWithSigner(
    //     tendermintRPC,
    //     offlineSigner,
    // );
    localStorage.setItem('keplrAddress', accounts[0].address);

}

export default KeplrWallet;
