import { stringToTypedInputEnum, TypedInput, TypedInputEnum } from '@/lib/flow/data';
import { motion } from 'framer-motion';
import { AlertCircle, Icon } from 'lucide-react';
import { useState } from 'react';
import { BaseLabelAndDescription, InputField, Toggle } from './Inputs';

interface TypedInputProps {
	label?: string;
	description?: string;
	placeholder?: string;
	value: TypedInput;
	onChange: (data: TypedInput) => void;
	className?: string;
	id?: string;
	icon?: typeof Icon;
	error?: string;
	marginClass?: string;
	disabled?: boolean;
}

const defaultLValue = (type: TypedInputEnum): unknown => {
	switch (type) {
		case TypedInputEnum.String:
			return '';
		case TypedInputEnum.Table:
			return {};
		case TypedInputEnum.Number:
			return 0;
		case TypedInputEnum.Boolean:
			return false;
		default:
			return '';
	}
};

export const TypedInputField: React.FC<TypedInputProps> = ({
	label,
	description,
	placeholder,
	value,
	disabled = false,
	onChange,
	className = '',
	id,
	marginClass = 'mb-1',
    error
}) => {
	let lvalueInit = value.value
		? value.type == TypedInputEnum.Table
			? JSON.stringify(value.value)
			: value.value.toString()
		: '';

	const [type, setType] = useState<TypedInputEnum>(value.type || TypedInputEnum.String);
	const [lvalue, setLValue] = useState<unknown>(lvalueInit);
	const inputId = id || label?.toLowerCase().replace(/\s+/g, '-');

	return (
		<>
            <BaseLabelAndDescription id={inputId} label={label} description={description} className={className} marginClass={marginClass}>
                <div className="relative"></div>

                <InputField
                    type="select"
                    label="Type"
                    value={type}
                    disabled={disabled}
                    onChange={(e) => {
                        if (disabled) return;
                        const newType = stringToTypedInputEnum(e.target.value);
                        setType(newType);
                        setLValue(defaultLValue(newType));
                        // Dispatch onChange with default value for new type
                        onChange({ type: newType as any, value: defaultLValue(newType) as any });
                    }}
                    options={[
                        { value: TypedInputEnum.String, label: 'String' },
                        { value: TypedInputEnum.Number, label: 'Number' },
                        { value: TypedInputEnum.Table, label: 'Table' },
                        { value: TypedInputEnum.Boolean, label: 'Boolean' }
                    ]}
                    id={`${id}-type`}
                    aria-label={`${label ? label + ' Type' : 'Type'}`}
                    aria-describedby={description ? `${id}-desc` : undefined}
                    aria-labelledby={`${id}-label`}
                />

                {
                    (type === TypedInputEnum.Table) && (
                        <>
                            <TableInput 
                                value={value}
                                onChange={onChange}
                                disabled={disabled}
                            />
                        </>
                    )
                }

                {
                    (type === TypedInputEnum.String || type === TypedInputEnum.Raw) && (
                        <>
                            <InputField
                                label="Value"
                                value={lvalue as string}
                                disabled={disabled}
                                type="text"
                                onChange={(e) => {
                                    if (disabled) return;
                                    setLValue(e.target.value);
                                    onChange({ type, value: e.target.value });
                                }}
                                id={id}
                                aria-required="true"
                            />
                        </>
                    )
                }

                {
                    (type === TypedInputEnum.Number) && (
                        <>
                            <InputField
                                label="Value"
                                value={lvalue as string}
                                disabled={disabled}
                                type="number"
                                onChange={(e) => {
                                    if (disabled) return;
                                    
                                    const numberValue = parseFloat(e.target.value);
                                    if (isNaN(numberValue)) {
                                        return;
                                    }

                                    setLValue(e.target.value);
                                    onChange({ type, value: numberValue });
                                }}
                                id={id}
                                aria-required="true"
                            />
                        </>
                    )
                }

                {
                    (type === TypedInputEnum.Boolean) && (
                        <>
                            <Toggle
                                label="Value"
                                checked={!!lvalue}
                                disabled={disabled}
                                onChange={() => {
                                    if (disabled) return;
                                    let currValue = !!lvalue;
                                    setLValue(!currValue);
                                    onChange({ type, value: !currValue });
                                }}
                                aria-required="true"
                            />
                        </>
                    )
                }

                {error && (
                    <p className="mt-1.5 text-sm text-destructive" role="alert">
                        {error}
                    </p>
                )}
            </BaseLabelAndDescription>
		</>
	);
};

interface TableInputProps {
	value: TypedInput;
	onChange: (data: TypedInput) => void;
	disabled?: boolean;
}


const TableInput: React.FC<TableInputProps> = ({
    value,
    onChange,
    disabled
}) => {
    // TODO
    return (
        <></>
    )
}