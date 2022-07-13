import React from "react";
import {Nav, Tab,} from "react-bootstrap";
import ValidatorsTable from "./ValidatorsTable";
import {connect} from "react-redux";
import {useTranslation} from "react-i18next";
import ReactGA from "react-ga";
import loader from "../../../assets/images/loader.svg";

const Validators = (props) => {
    const {t} = useTranslation();

    if (props.inProgress) {
        return <div className="transaction-loader">
            <img src={loader} alt="loader" className="loader"/>
        </div>;
    }


    const onClick = (key) => {
        ReactGA.event({
            category: `${key} Validators`,
            action: `Clicked on ${key} Validators`
        });
    };

    return (
        <div className="validators-section">
            <div className="txns-container">
                <Tab.Container id="left-tabs-example" defaultActiveKey="active" onSelect={onClick}>
                    <div className="tab-header">
                        <div className="info">
                            <div className="left">
                                <Nav variant="pills">
                                    <Nav.Item>
                                        <Nav.Link eventKey="active"> {t("ACTIVE")}</Nav.Link>
                                    </Nav.Item>
                                    <Nav.Item>
                                        <Nav.Link eventKey="inactive"> {t("IN_ACTIVE")}</Nav.Link>
                                    </Nav.Item>
                                </Nav>
                            </div>
                        </div>
                    </div>
                    <Tab.Content>
                        <Tab.Pane eventKey="active">
                            <ValidatorsTable validatorsList={props.activeList}
                                activeValidatorsTokens={props.activeVotingPower.active}/>
                        </Tab.Pane>
                        <Tab.Pane eventKey="inactive">
                            <ValidatorsTable validatorsList={props.inActiveList}
                                inActiveValidatorsTokens={props.inActiveVotingPower.inActive}/>
                        </Tab.Pane>
                    </Tab.Content>
                </Tab.Container>
            </div>
        </div>
    );
};

const stateToProps = (state) => {
    return {
        activeList: state.validators.activeList,
        inActiveList: state.validators.inActiveList,
        activeVotingPower: state.validators.activeVotingPower,
        inActiveVotingPower: state.validators.inActiveVotingPower,
        inProgress: state.validators.inProgress,
    };
};


export default connect(stateToProps)(Validators);
