import React, {useState} from 'react';
import {Form} from "react-bootstrap";
import {useTranslation} from "react-i18next";
import {useDispatch, useSelector} from "react-redux";
import {setTxKeyStore} from "../../../../store/actions/transactions/keyStore";
import {ValidationFileTypeCheck} from "../../../../utils/validations";
import {ENCRYPTED_MNEMONIC} from "../../../../constants/localStorage";

const FileInput = ({disableState}) => {
    const [fileName, setFileName] = useState('No file chosen');
    const error = useSelector((state) => state.keyStore.keyStore.error);
    const {t} = useTranslation();
    const dispatch = useDispatch();
    const onChange = (event) => {
        const file = event.target.files[0];
        if(file) {
            setFileName(file.name);
            localStorage.setItem(ENCRYPTED_MNEMONIC, file);
            dispatch(setTxKeyStore(
                {
                    value: file,
                    error: ValidationFileTypeCheck(file.name)
                }));
        }
    };
    return (
        <div className="form-field upload">
            <p className="label"> {t("KEY_STORE_FILE")}</p>
            <div className="custom-file-section flex-fill">
                <div>
                    <div className={`custom-file ${disableState?"disabled":""}`}>
                        <p className="file-button"> {t("CHOOSE_FILE")}</p>
                        <p className="file-name">{fileName}</p>
                    </div>
                    <Form.File name="uploadFileS" onChange={onChange} disabled={disableState}
                        className="file-upload" accept=".json" required={!disableState}/>
                </div>
                <p className="input-error">{error.message}</p>
            </div>
        </div>
    );
};


export default FileInput;
