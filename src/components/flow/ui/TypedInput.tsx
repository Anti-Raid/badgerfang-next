import { stringToTypedInputEnum, TypedInput, TypedInputEnum } from '@/lib/flow/data';
import { Icon } from 'lucide-react';
import { BaseLabelAndDescription, InputField, Toggle } from './Inputs';
import { Reorder } from 'framer-motion';
import { Primary } from '@/components/ui/Buttons';
import logger from '@/lib/logger';

export const generateTypedInputId = () => {
    return Math.random().toString(36).substring(2, 15);
}

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

const createValueWithType = (type: TypedInputEnum): TypedInput => {
	switch (type) {
        case TypedInputEnum.Nil:
            return { type: TypedInputEnum.Nil, id: generateTypedInputId() };
		case TypedInputEnum.String:
            return { type: TypedInputEnum.String, value: '', id: generateTypedInputId() };
        case TypedInputEnum.Raw:
            return { type: TypedInputEnum.Raw, value: '', id: generateTypedInputId() };
		case TypedInputEnum.Table:
            return { type: TypedInputEnum.Table, value: {}, inline: true, id: generateTypedInputId() };
        case TypedInputEnum.TableArray:
            return { type: TypedInputEnum.TableArray, value: [], inline: true, id: generateTypedInputId() };
		case TypedInputEnum.Number:
            return { type: TypedInputEnum.Number, value: 0, id: generateTypedInputId() };
		case TypedInputEnum.Boolean:
            return { type: TypedInputEnum.Boolean, value: false, id: generateTypedInputId() };
        case TypedInputEnum.Vector:
            return { type: TypedInputEnum.Vector, x: 0, y: 0, z: 0, id: generateTypedInputId() };
		default:
            return { type: TypedInputEnum.Nil, id: generateTypedInputId()};
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
	const inputId = id || label?.toLowerCase().replace(/\s+/g, '-');

	return (
		<>
            <BaseLabelAndDescription id={inputId} label={label} description={description} className={className} marginClass={marginClass}>
                <div className="relative"></div>

                <InputField
                    type="select"
                    label="Type"
                    value={value.type}
                    disabled={disabled}
                    hideSelectOptionsPlaceholder={true}
                    onChange={(e) => {
                        if (disabled) return;
                        const newType = stringToTypedInputEnum(e.target.value);
                        // Dispatch onChange with default value for new type
                        onChange(createValueWithType(newType));
                    }}
                    
                    options={[
                        { value: TypedInputEnum.Nil, label: 'Nil / Null / None' },
                        { value: TypedInputEnum.String, label: 'String' },
                        { value: TypedInputEnum.Number, label: 'Number' },
                        { value: TypedInputEnum.Table, label: 'Table' },
                        { value: TypedInputEnum.TableArray, label: 'Array' },
                        { value: TypedInputEnum.Boolean, label: 'Boolean' },
                        { value: TypedInputEnum.Vector, label: 'Vector' },
                        { value: TypedInputEnum.Raw, label: 'Raw (Lua code snippet)' }
                    ]}
                    id={`${id}-type`}
                    aria-label={`${label ? label + ' Type' : 'Type'}`}
                    aria-describedby={description ? `${id}-desc` : undefined}
                    aria-labelledby={`${id}-label`}
                />

                {
                    (value.type === TypedInputEnum.Table) && (
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
                    (value.type === TypedInputEnum.String || value.type === TypedInputEnum.Raw) && (
                        <>
                            <InputField
                                label="Value"
                                value={value.value}
                                disabled={disabled}
                                type="text"
                                onChange={(e) => {
                                    if (disabled) return;
                                    onChange({ type: value.type, value: e.target.value, id: value.id});
                                }}
                                id={id}
                                aria-required="true"
                            />
                        </>
                    )
                }

                {
                    (value.type === TypedInputEnum.Number) && (
                        <>
                            <InputField
                                label="Value"
                                value={value.value.toString()}
                                disabled={disabled}
                                type="number"
                                onChange={(e) => {
                                    if (disabled) return;
                                    
                                    const numberValue = parseFloat(e.target.value);
                                    if (isNaN(numberValue)) {
                                        return;
                                    }

                                    onChange({ type: value.type, value: numberValue, id: value.id});
                                }}
                                id={id}
                                aria-required="true"
                            />
                        </>
                    )
                }

                {
                    (value.type === TypedInputEnum.Boolean) && (
                        <>
                            <Toggle
                                label="Value"
                                checked={value.value}
                                disabled={disabled}
                                onChange={() => {
                                    if (disabled) return;
                                    onChange({ type: value.type, value: !value.value, id: value.id});
                                }}
                                aria-required="true"
                            />
                        </>
                    )
                }

                {
                    (value.type === TypedInputEnum.Vector) && (
                        <>
                            <div className="md:grid md:grid-cols-3 md:gap-2">
                                <InputField
                                    label="X"
                                    value={value.x.toString()}
                                    disabled={disabled}
                                    type="number"
                                    onChange={(e) => {
                                        if (disabled) return;
                                        
                                        const numberValue = parseFloat(e.target.value);
                                        if (isNaN(numberValue)) {
                                            return;
                                        }

                                        onChange({ type: value.type, x: numberValue, y: value.y, z: value.z, id: value.id});
                                    }}
                                    id={id}
                                    aria-required="true"
                                />

                                <InputField
                                    label="Y"
                                    value={value.y.toString()}
                                    disabled={disabled}
                                    type="number"
                                    onChange={(e) => {
                                        if (disabled) return;
                                        
                                        const numberValue = parseFloat(e.target.value);
                                        if (isNaN(numberValue)) {
                                            return;
                                        }

                                        onChange({ type: value.type, x: value.x, y: numberValue, z: value.z, id: value.id});
                                    }}
                                    id={id}
                                    aria-required="true"
                                />

                                <InputField
                                    label="Z"
                                    value={value.z.toString()}
                                    disabled={disabled}
                                    type="number"
                                    onChange={(e) => {
                                        if (disabled) return;
                                        
                                        const numberValue = parseFloat(e.target.value);
                                        if (isNaN(numberValue)) {
                                            return;
                                        }

                                        onChange({ type: value.type, x: value.x, y: value.y, z: numberValue, id: value.id});
                                    }}
                                    id={id}
                                    aria-required="true"
                                />
                            </div>
                        </>
                    )
                }

                {
                    (value.type === TypedInputEnum.TableArray) && (
                        <>
                            <ArrayTableInput 
                                value={value.value}
                                onChange={(newArray) => {
                                    onChange({ type: value.type, value: newArray, inline: value.inline, id: value.id});
                                }}
                                disabled={disabled}
                            />

                            <Toggle
                                label="Inline Table"
                                description="Whether or not the table should be formatted inline (e.g. { key = value }) or expanded over multiple lines."
                                checked={value.inline}
                                disabled={disabled}
                                onChange={() => {
                                    if (disabled) return;
                                    onChange({ type: value.type, value: value.value, inline: !value.inline, id: value.id});
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

interface ArrayTableInputProps {
	value: TypedInput[];
	onChange: (data: TypedInput[]) => void;
	disabled?: boolean;
}

const ArrayTableInput: React.FC<ArrayTableInputProps> = ({
    value,
    onChange,
    disabled
}) => {
    return (
        <>
            {disabled && (
                <div className="text-gray-500">
                    {value.map((v, i) => {
                        return (
                            <TypedInputField
                                key={i}
                                label={`Item ${i + 1}`}
                                value={v}
                                onChange={(_newVal) => {}}
                                disabled={true}
                            />
                        );
                    })}
                </div>
            )}

            <Reorder.Group
                axis="y"
                values={value}
                onReorder={(newValues) => {
                    logger.debug('TypedInput', 'Reordering array table input:', newValues);
                    onChange(newValues);
                }}
            >
                {value.map((v, i) => (
                    <Reorder.Item key={v.id} value={v} className="p-3">
                        <TypedInputField
                            label={`Item ${i + 1}`}
                            value={v}
                            onChange={(newVal) => {
                                let newArray = [...value];
                                newArray[i] = newVal;
                                onChange(newArray);
                            }}
                            disabled={disabled}
                        />
                    </Reorder.Item>
                ))}
            </Reorder.Group>

            {!disabled && (
                <>
                    <Primary 
                        Title="Add Element"
                        onClick={() => {
                            let newArray = [...value];
                            newArray.push({ type: TypedInputEnum.Nil, id: generateTypedInputId() });
                            onChange(newArray);
                        }}
                    />
                    <div className="mt-2 mb-2" />
                </>
            )}
        </>
    )
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