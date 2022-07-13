import React from 'react';
import SwipeableDrawer from '@material-ui/core/SwipeableDrawer';
import Button from '@material-ui/core/Button';
import List from '@material-ui/core/List';
import Divider from '@material-ui/core/Divider';
import MenuIcon from '@material-ui/icons/Menu';
import {NavLink} from "react-router-dom";
import Icon from "../../components/Icon";
import {useTranslation} from "react-i18next";

const EXPLORER_API = process.env.REACT_APP_EXPLORER_API;

const MobileSidebar = () => {
    const {t} = useTranslation();
    const [state, setState] = React.useState({
        top: false,
        left: false,
        bottom: false,
        right: false,
    });

    const toggleDrawer = (anchor, open) => (event) => {
        if (event && event.type === 'keydown' && (event.key === 'Tab' || event.key === 'Shift')) {
            return;
        }

        setState({...state, [anchor]: open});
    };

    const list = (anchor) => (
        <div
            className="sidebar-section"
            role="presentation"
            onClick={toggleDrawer(anchor, false)}
            onKeyDown={toggleDrawer(anchor, false)}
        >
            <List className="mobile-sidebar-container">
                <li className="nav-item link">
                    <NavLink className="nav-link primary-medium-color"
                        to="/">
                        <div className="icon-container">
                            <div className="icon-box">
                                <Icon
                                    viewClass="icon"
                                    icon="wallet"
                                />
                            </div>
                        </div>
                        {t("WALLET")}
                    </NavLink>
                </li>
                <li className="nav-item link">
                    <NavLink className="nav-link primary-medium-color"
                        to="/dashboard/staking">
                        <div className="icon-container">
                            <div className="icon-box">
                                <Icon
                                    viewClass="icon"
                                    icon="staking"/>
                            </div>
                        </div>
                        {t("STAKING")}
                    </NavLink>
                </li>
                <li className="nav-item link">
                    <a className="nav-link primary-medium-color" href={EXPLORER_API}
                        rel="noopener noreferrer" target="_blank">
                        <div className="icon-container">
                            <div className="icon-box">
                                <Icon
                                    viewClass="icon"
                                    icon="explorer"/>
                            </div>
                        </div>
                        {t("EXPLORER")}
                        <div className="icon-box">
                            <Icon
                                viewClass="icon"
                                icon="export"/>
                        </div>
                    </a>
                </li>

                <li className="nav-item link">
                    <a className="nav-link primary-medium-color"
                        href="https://docs.assetmantle.one" rel="noopener noreferrer" target="_blank">
                        <div className="icon-container">
                            <div className="icon-box">
                                <Icon
                                    viewClass="icon"
                                    icon="help"/>
                            </div>
                        </div>
                        {t("HELP")}
                    </a>
                </li>

            </List>
            <Divider/>
        </div>
    );

    return (
        <div>

            <React.Fragment key={'left'}>
                <Button onClick={toggleDrawer('left', true)}><MenuIcon/></Button>
                <SwipeableDrawer
                    anchor={'left'}
                    className="sidebar-container"
                    open={state['left']}
                    onClose={toggleDrawer('left', false)}
                    onOpen={toggleDrawer('left', true)}
                >
                    {list('left')}
                </SwipeableDrawer>
            </React.Fragment>
        </div>
    );
};
export default MobileSidebar;