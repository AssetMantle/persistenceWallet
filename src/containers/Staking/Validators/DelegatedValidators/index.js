import React from "react";
import helper, {tokenValueConversion} from "../../../../utils/helper";
import Avatar from "../Avatar";
import activeIcon from "../../../../assets/images/active.svg";
import inActiveIcon from "../../../../assets/images/inactive.svg";
import DataTable from "../../../../components/DataTable";
import {
    fetchValidatorDelegations,
    fetchValidatorRewards,
    fetchValidators,
    setValidatorTxData,
    showValidatorTxModal
} from "../../../../store/actions/validators";
import {connect, useDispatch} from "react-redux";
import {useTranslation} from "react-i18next";
import {LOGIN_INFO} from "../../../../constants/localStorage";
import {stringToNumber} from "../../../../utils/scripts";
import {DefaultChainInfo} from "../../../../config";

const DelegatedValidators = (props) => {
    const {t} = useTranslation();
    const dispatch = useDispatch();
    const loginInfo = JSON.parse(localStorage.getItem(LOGIN_INFO));
    const handleModal = (name, validator) => {
        dispatch(showValidatorTxModal());
        dispatch(setValidatorTxData({
            value: validator,
            error: new Error(''),
        }));
        dispatch(fetchValidatorDelegations(loginInfo && loginInfo.address));
        dispatch(fetchValidatorRewards(loginInfo && loginInfo.address, validator.operatorAddress));
    };


    const columns = [{
        name: 'validator',
        label: t("VALIDATOR"),
        options: {
            sortCompare: (order) => {
                return (obj1, obj2) => {
                    let val1 = obj1.data.props.children[1];
                    let val2 = obj2.data.props.children[1];
                    return (val1.toUpperCase() < val2.toUpperCase() ? -1 : 1) * (order === 'asc' ? 1 : -1);
                };
            }

        }
    }, {
        name: 'delegatedAmount',
        label: `${t("DELEGATED_AMOUNT")}(${DefaultChainInfo.currency.coinDenom})`,
        options: {
            sortCompare: (order) => {
                return (obj1, obj2) => {
                    let val1 = stringToNumber(obj1.data.props.children);
                    let val2 = stringToNumber(obj2.data.props.children);
                    return (val1 - val2) * (order === 'asc' ? 1 : -1);
                };
            }
        }
    }, {
        name: 'status',
        label: t("STATUS"),
        options: {sort: false}
    }, {
        name: 'actions',
        label: t("ACTIONS"),
        options: {sort: false}
    }];
    const tableData = props.validatorsList.length ?
        props.validatorsList.map((validator, index) => [
            <div key={index} className="validator-name">
                <Avatar
                    identity={validator.data.description.identity}/>
                {validator.data.description.moniker}
            </div>,
            <div className="voting" key={index}>
                {tokenValueConversion(validator.delegations)}
            </div>
            ,
            <div className="" key={index}>
                {helper.isActive(validator.data) ?
                    <span className="icon-box" title="active">
                        <img src={activeIcon} alt="activeIcon"/>
                    </span>
                    :
                    <span className="icon-box" title="Inactive">
                        <img src={inActiveIcon} alt="inActiveIcon"/>
                    </span>
                }
            </div>,
            <div className="actions-td" key={index}>
                <button
                    onClick={() => handleModal('ModalActions', validator.data)}
                    className="button button-primary">
                    Actions
                </button>
            </div>
        ])
        : [];

    const options = {
        responsive: "standard",
        filters: false,
        pagination: false,
        selectableRows: 'none',
        print: false,
        download: false,
        filter: false,
        viewColumns: false,
        search: false,
    };

    return (
        <div className="validators-section">
            <div className="txns-container delegated-validators">
                <DataTable
                    columns={columns}
                    data={tableData}
                    name=""
                    options={options}/>
            </div>
        </div>
    );
};


const stateToProps = (state) => {
    return {
        validatorsList: state.validators.delegatedValidators,
        inActiveList: state.validators.inActiveList,
        activeVotingPower: state.validators.activeVotingPower,
        inActiveVotingPower: state.validators.inActiveVotingPower,
        inProgress: state.validators.inProgress,
    };
};

const actionsToProps = {
    fetchValidators,
};

export default connect(stateToProps, actionsToProps)(DelegatedValidators);
