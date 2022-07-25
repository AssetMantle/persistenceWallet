import React, {useEffect, useState} from 'react';
import {Route, Switch, useHistory, withRouter} from 'react-router-dom';
import DashboardWallet from "./views/DashboardWallet";
import Homepage from "./views/Homepage";
import DashboardStaking from "./views/Staking";
import PrivateRoute from "./containers/PrivateRoute";
import RouteNotFound from "./components/RouteNotFound";
import icon_white from "./assets/images/icon_white.svg";
import {useTranslation} from "react-i18next";
import KeplrWallet from "./utils/keplr";
import {useDispatch} from "react-redux";
import * as Sentry from "@sentry/react";
import {Integrations} from "@sentry/tracing";
import {keplrLogin, setKeplrInfo} from "./store/actions/signIn/keplr";
import { KEPLR_ADDRESS, LOGIN_INFO} from "./constants/localStorage";
import ReactGA from 'react-ga';
import {userLogout} from "./store/actions/logout";
import TransportWebUSB from "@ledgerhq/hw-transport-webusb";
import packageJson from "../package.json";

const SENTRY_API = process.env.REACT_APP_SENTRY_API;
const GOOGLE_ANALYTICS = process.env.REACT_APP_GA_TRACKING_ID;

ReactGA.initialize(GOOGLE_ANALYTICS);

const trackPage = page => {
    ReactGA.set({ page });
    ReactGA.pageview(page);
};

//Update the package.json version everytime whenever new deployment happened to production to clear the browser cache.

const App = () => {
    console.log("inside App.js");
    const {t} = useTranslation();
    const history = useHistory();
    const loginInfo = JSON.parse(localStorage.getItem(LOGIN_INFO));

    const routes = [
        {
            path: '/dashboard/staking',
            component: DashboardStaking,
            private: true,
        },
        {
            path: '/dashboard/:selectedLoginMode',
            component: DashboardWallet,
            private: false,
        }, 
        /* {
            path: '/dashboard',
            component: DashboardWallet,
            private: false,
        }, */
    ];

    const [isOnline, setNetwork] = useState(window.navigator.onLine);
    const updateNetwork = () => {
        if(window.navigator.onLine){
            window.location.reload();
        }
        setNetwork(window.navigator.onLine);
    };

    const dispatch = useDispatch();

    let address = loginInfo && loginInfo.address;

    /* const version = loginInfo && loginInfo.version;
    if (version == null || packageJson.version !== version) {
        localStorage.removeItem("loginInfo");
        localStorage.removeItem("keplrAddress");
        localStorage.removeItem("encryptedMnemonic");
        localStorage.removeItem("keyStoreOnUse");
        history.push('/');
    } else {
        address = loginInfo && loginInfo.address;
    } */

    useEffect(() => {
        console.log("inside useEffect");
        const page = location.pathname;
        trackPage(page);
    }, [location]);

    useEffect(() => {
        console.log("inside useEffect");
        window.addEventListener("offline", updateNetwork);
        window.addEventListener("online", updateNetwork);
        return () => {
            window.removeEventListener("offline", updateNetwork);
            window.removeEventListener("online", updateNetwork);
        };
    });

    window.addEventListener('storage', () => {
        if (JSON.parse(localStorage.getItem(LOGIN_INFO)) === null){
            dispatch(userLogout());
            
            localStorage.removeItem("loginInfo");
            localStorage.removeItem("keplrAddress");
            localStorage.removeItem("encryptedMnemonic");
            history.push('/');
            window.location.reload();
            if(loginInfo && loginInfo.loginMode==="ledger"){
                TransportWebUSB.close();
            }
        }
    });

    window.addEventListener("keplr_keystorechange", () => {
        if (loginInfo && loginInfo.loginMode === "keplr") {
            const keplr = KeplrWallet();
            keplr.then(function () {
                const address = localStorage.getItem(KEPLR_ADDRESS);
                dispatch(setKeplrInfo({
                    value: address,
                    error: {
                        message: '',
                    },
                }));
                dispatch(keplrLogin(history));
            }).catch(error => {
                Sentry.captureException(error.response
                    ? error.response.data.message
                    : error.message);
                console.log(error.message);
            });
        }
    });

    Sentry.init({
        dsn: SENTRY_API,
        release: "wallet"+packageJson.version,
        integrations: [new Integrations.BrowserTracing()],
        tracesSampleRate: 1.0,
    });

    console.log("localstorage: ", JSON.parse(window.localStorage.getItem(LOGIN_INFO)));
    console.log("address: ", address);

    return (
        <>
            {
                !isOnline ?
                    <div className="network-check">
                        <div className="stage">
                            <div className="bouncer-holder">
                                <div className="bouncer">
                                    <img src={icon_white} className="icon-white" alt="icon_white"/>
                                </div>
                            </div>
                            <h3 className="text-left">{t("NO_INTERNET")}</h3>
                            <p>Try:</p>
                            <ul>
                                <li>{t("NO_INTERNET_NOTE1")}</li>
                                <li>{t("NO_INTERNET_NOTE2")}</li>
                            </ul>
                        </div>
                    </div>
                    : ""
            }
            <Switch>
                <Route
                    key="/"
                    exact
                    component={(JSON.parse(window.localStorage.getItem(LOGIN_INFO)) === null || address === undefined ||
                        address === null || address === '') ? withRouter(Homepage) : withRouter(DashboardWallet)}
                    path="/"/>
                {
                    routes.map((route) => {
                        if (route.private) {
                            return (
                                <PrivateRoute
                                    key={route.path}
                                    exact
                                    component={withRouter(route.component)}
                                    path={route.path}
                                />
                            );
                        }

                        return (
                            <Route
                                key={route.path}
                                exact
                                component={withRouter(route.component)}
                                path={route.path}/>
                        );
                    })
                }
                <Route component={RouteNotFound}/>
            </Switch>
        </>
    );
};
export default App;
