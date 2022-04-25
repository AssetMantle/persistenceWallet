import React, {useState} from 'react';
import {useDispatch, useSelector} from "react-redux";
import {useTranslation} from "react-i18next";
import {WithdrawMsg} from "../../../utils/protoMsgHelper";
import {
    setTxWithDrawTotalRewardsAmount,
    setTxWithDrawTotalValidators
} from "../../../store/actions/transactions/withdrawTotalRewards";
import {ValidateMultipleValidatorsClaim} from "../../../utils/validations";
import NumberView from "../../../components/NumberView";
import {formatNumber, stringToNumber} from "../../../utils/scripts";
import {tokenValueConversion} from "../../../utils/helper";
import {LOGIN_INFO} from "../../../constants/localStorage";
import Select from 'react-select';
import { components } from "react-select";
import {DefaultChainInfo} from "../../../config";

const Option = (props) => {
    return (
        <div className='AHJ-Option'>
            <components.Option {...props}>
                <input
                    type="checkbox"
                    checked={props.isSelected}
                    onChange={() => null}
                />{" "}
                <label>{props.label}</label>
            </components.Option>
        </div>
    );
};

const Validators = () => {
    const {t} = useTranslation();
    const dispatch = useDispatch();
    const [optionSelected, setOptionSelected] = useState(null);
    const loginInfo = JSON.parse(localStorage.getItem(LOGIN_INFO));
    const validatorsList = useSelector((state) => state.rewards.validatorsRewardsList);
    let validatorsRewards = useSelector((state) => state.mulitpleRewardsWithDraw.rewards);
    // const tokenPrice = useSelector((state) => state.tokenPrice.tokenPrice);
    const onChangeSelect = (evt) => {
        setOptionSelected(evt);
        let totalValidatorsRewards = 0;
        let messages = [];
        evt.forEach(async (item) => {
            totalValidatorsRewards = totalValidatorsRewards + (stringToNumber(tokenValueConversion(item.rewards).toFixed(6)));
            messages.push(WithdrawMsg(loginInfo.address, item.value));
        });
        dispatch(setTxWithDrawTotalValidators({
            value: messages,
            error: ValidateMultipleValidatorsClaim(evt),
        }));
        dispatch(setTxWithDrawTotalRewardsAmount({
            value: totalValidatorsRewards,
            error: ValidateMultipleValidatorsClaim(evt),
        }));
    };

    const style = {
        option: () => ({
            color: '#000',
        }),
    };

    return (
        <>
            <div className="form-field rewards-validators-list">
                <p className="label">{t("SELECT_VALIDATOR")}</p>
                <Select
                    onChange={onChangeSelect}
                    options={validatorsList}
                    isMulti
                    components={{
                        Option
                    }}
                    styles={style}
                    theme={(theme) => ({
                        ...theme,
                        borderRadius: 0,
                        colors: {
                            ...theme.colors,
                            primary: '#F5F6FA',
                        },
                    })}
                    classNamePrefix="react-select"
                    closeMenuOnSelect={false}
                    hideSelectedOptions={false}
                    MultiValueRemove={true}
                    MultiValueContainer={false}
                    MultiValueLabel={false}
                    valueContainer={false}
                    defaultValue={optionSelected}
                />
            </div>
            <div className="form-field p-0">
                <p className="label"></p>
                <div className="available-tokens">
                    <p className="tokens">{t("CLAIMING_REWARDS")} <NumberView
                        value={formatNumber(validatorsRewards.value)}/><span>
                        {DefaultChainInfo.currency.coinDenom}
                    </span></p>
                    {/*<p className="usd">= $<NumberView*/}
                    {/*    value={formatNumber(validatorsRewards.value * tokenPrice)}/></p>*/}
                </div>
            </div>
        </>
    );
};


export default Validators;