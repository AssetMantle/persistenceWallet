import React  from "react";
import {Nav, Tab,} from "react-bootstrap";
import SendTransactions from "./SendTransactions";
import ReceiveTransactions from "./ReceiveTransactions";
import ReactGA from "react-ga";

const Transactions = () => {
    const onClick = (key) => {
        ReactGA.event({
            category: `${key} transactions`,
            action: `Clicked on ${key} transactions`
        });
    };

    return (
        <div className="txns-container">
            <Tab.Container id="left-tabs-example" defaultActiveKey="sent" onSelect={onClick}>
                <div className="tab-header">
                    <div className="info">
                        <div className="left">
                            <Nav variant="pills">
                                <Nav.Item>
                                    <Nav.Link eventKey="sent">Sent</Nav.Link>
                                </Nav.Item>
                                <Nav.Item>
                                    <Nav.Link eventKey="receive">Received</Nav.Link>
                                </Nav.Item>
                            </Nav>
                        </div>
                    </div>

                </div>
                <Tab.Content>
                    <Tab.Pane eventKey="sent">
                        <SendTransactions/>
                    </Tab.Pane>
                    <Tab.Pane eventKey="receive">
                        <ReceiveTransactions/>
                    </Tab.Pane>
                </Tab.Content>
            </Tab.Container>
        </div>
    );
};


export default Transactions;
