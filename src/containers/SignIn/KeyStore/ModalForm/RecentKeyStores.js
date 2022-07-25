import React from 'react';
import { useState } from 'react';
import { useDispatch } from 'react-redux';
import styled from 'styled-components';
import { KEY_STORE_USING } from '../../../../constants/localStorage';
import { setAccountIndex, setAccountNumber, setBip39Passphrase } from '../../../../store/actions/transactions/advanced';
import { ValidateAccountIndex, ValidateBip39PassPhrase } from '../../../../utils/validations';

export default function RecentKeyStores({setSelected}) {
    const dispatch = useDispatch();
    const [SelectedIndex, setSelectedIndex] = useState();

    const RecentKeyStores = localStorage.recentKeyStores !== undefined ? JSON.parse(localStorage.recentKeyStores) : [];

    function handleClick(data,index) {
        console.log(data, index);
        localStorage.setItem(KEY_STORE_USING, JSON.stringify(data));
        setSelected(true);
        setSelectedIndex(index);

        dispatch(setAccountNumber({
            value: (data.accountNumber.value),
            error: ValidateAccountIndex(data.accountNumber.value)
        }));

        dispatch(setAccountIndex({
            value: (data.accountIndex.value),
            error: ValidateAccountIndex(data.accountIndex.value)
        }));

        dispatch(setBip39Passphrase({
            value: (data.bip39PassPhrase.value),
            error: ValidateBip39PassPhrase(data.bip39PassPhrase.value)
        }));
    }

    return (
        <Container className='form-field'>
            <p className="label">Recent Keystores (Address)</p>
            
            {RecentKeyStores.length === 0 ? 
                (
                    <p className="not_found">No Recent file found</p>
                )
                : ""
            }
            <div className="recent_keystores">
                {React.Children.toArray(RecentKeyStores.map((data, index)=>
                    (
                        <div key={data.address} className={`form-control recent_keystores__KeyStore ${index === SelectedIndex ? "selected": ""}`} onClick={()=>handleClick(data, index)}>
                            <strong>{index + 1}.</strong> {data.address.substring(0, 9)}...{data.address.substring(data.address.length - 9)}
                        </div>
                    )
                ))}
            </div>
        </Container>
    );
}

const Container = styled.div`
padding-bottom: 16px;
    .recent_keystores{
        display: flex;
        /* flex-direction: column; */
        flex-wrap: wrap;
        align-items: center;
        justify-content: space-evenly;
        width: 100%;
        overflow: hidden;
        gap: 12px;
        &__KeyStore{
            display: inline-block;
            width: min(220px, 100%);
            background-color: transparent;
            padding: 0 8px;
            margin: 0;
            height: auto;
            cursor: pointer;
            &.selected {
                font-weight: 900;
            }
        }
    }
`;