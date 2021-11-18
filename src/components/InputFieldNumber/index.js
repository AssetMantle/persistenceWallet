import React from 'react';
import {Form} from "react-bootstrap";
import helper from "../../utils/helper";

const InputFieldNumber = ({
    className,
    name,
    error,
    placeholder,
    required = true,
    type = 'number',
    value,
    onChange,
    min,
    onBlur= helper.emptyFunc,
}) => {
    // const isError = error.message.length > 0;

    return (
        <>
            <Form.Control
                className={className}
                min={min}
                name={name}
                placeholder={placeholder}
                required={required}
                type={type}
                value={value}
                onChange={onChange}
                onBlur={onBlur}
            />
            <p className="input-error">{error.message}</p>
        </>
    );
};


export default InputFieldNumber;