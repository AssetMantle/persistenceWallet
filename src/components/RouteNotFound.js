import React from "react";
import {NavLink, 
    useHistory
} from 'react-router-dom';
import {Nav, Navbar} from "react-bootstrap";
import logo from "../assets/images/footer_logo.svg";
import {useTranslation} from "react-i18next";
// import { useEffect } from "react";

const RouteNotFound = () => {
    const {t} = useTranslation();

    const history = useHistory();

    const reloadApp = () => {
        localStorage.removeItem("loginInfo");
        localStorage.removeItem("keplrAddress");
        localStorage.removeItem("encryptedMnemonic");
        localStorage.removeItem("keyStoreOnUse");
        history.push('/');
        window.location.reload();
    };
    
    return (
        <div className="home-page pageError">
            <Navbar collapseOnSelect expand="lg" bg="dark" variant="dark">
                <div className="container">
                    <Navbar.Brand><NavLink to="/">
                        <img src={logo} alt="logo"/>
                    </NavLink></Navbar.Brand>
                    <Navbar.Toggle aria-controls="responsive-navbar-nav"/>
                    <Navbar.Collapse id="responsive-navbar-nav">
                        <Nav className="ml-auto">
                            <a className="nav-link" href="https://assetmantle.one/" target="_blank"
                                rel="noopener noreferrer">Learn More</a>
                            <li className="nav-item link">
                                <a className="nav-link primary-medium-color"
                                    href="https://docs.assetmantle.one/" rel="noopener noreferrer"
                                    target="_blank">
                                    {t("HELP")}
                                </a>
                            </li>
                        </Nav>
                    </Navbar.Collapse>
                </div>
            </Navbar>
            <div className="text-container">
                <h3>Page Not Found</h3>
                <button className="button button-primary large" onClick={reloadApp}>Refresh App</button>
            </div>
        </div>
    );
};
export default RouteNotFound;