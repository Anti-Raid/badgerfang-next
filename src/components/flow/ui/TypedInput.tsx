import { stringToTypedInputEnum, TypedInput, TypedInputEnum, TypedInputTableEntry } from '@/lib/flow/data';
import { GripVertical, Icon, Trash2 } from 'lucide-react';
import { BaseLabelAndDescription, InputField, Toggle } from './Inputs';
import { motion, Reorder } from 'framer-motion';
import { Primary } from '@/components/ui/Buttons';
import logger from '@/lib/logger';
import { Fragment } from 'react';

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
    isArray?: boolean;
}

const createValueWithType = (type: TypedInputEnum): TypedInput => {
	switch (type) {
        case TypedInputEnum.Nil:
            return { type: TypedInputEnum.Nil, id: generateTypedInputId() };
		case TypedInputEnum.String:
            return { type: TypedInputEnum.String, value: '', interpolated: false, id: generateTypedInputId() };
        case TypedInputEnum.Raw:
            return { type: TypedInputEnum.Raw, value: '', id: generateTypedInputId() };
		case TypedInputEnum.Table:
            return { type: TypedInputEnum.Table, value: [], inline: true, id: generateTypedInputId() };
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

const valueToString = (value: TypedInput): string => {
    switch (value.type) {
        case TypedInputEnum.Nil:
            return 'nil';
        case TypedInputEnum.String:
            return `"${value.value.replaceAll('\n', '\\n')}"`;
        case TypedInputEnum.Number:
            return value.value.toString();
        case TypedInputEnum.Boolean:
            return value.value ? 'true' : 'false';
        case TypedInputEnum.Vector:
            return `Vector(${value.x}, ${value.y}, ${value.z})`;
        case TypedInputEnum.Raw:
            return value.value;
        case TypedInputEnum.Table:
            return '{ ... }';
        case TypedInputEnum.TableArray:
            return '[ ... ]';
        default:
            return 'unknown';
    }
}

export const TypedInputField: React.FC<TypedInputProps> = ({
	label,
	description,
	placeholder,
	value,
	disabled = false,
	onChange,
	className = '',
	id: idT,
	marginClass = 'mb-1',
    error,
    isArray
}) => {
	const inputId = idT || value.id || label?.toLowerCase().replace(/\s+/g, '-');

	return (
		<>
            <BaseLabelAndDescription id={`${inputId}-type`} label={label} description={description} className={isArray ? "border-4 border-primary" : className} marginClass={marginClass}>
                <div className="relative">
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
                        id={`${inputId}-type`}
                        aria-label={`${label ? label + ' Type' : 'Type'}`}
                        aria-describedby={description ? `${inputId}-desc` : undefined}
                        aria-labelledby={`${inputId}-label`}
                    />

                    {
                        (value.type === TypedInputEnum.Table) && (
                            <>
                                <TableInput 
                                    value={value.value}
                                    onChange={(newArray) => {
                                        if(disabled) return;
                                        onChange({ type: value.type, value: newArray, inline: value.inline, id: value.id});
                                    }}
                                    disabled={disabled}
                                />
                            </>
                        )
                    }

                    {
                        (value.type === TypedInputEnum.String) && (
                            <>
                                <InputField
                                    label="Value"
                                    value={value.value}
                                    disabled={disabled}
                                    type="text"
                                    onChange={(e) => {
                                        if (disabled) return;
                                        onChange({ type: value.type, value: e.target.value, interpolated: value.interpolated, id: value.id});
                                    }}
                                    id={`${inputId}-value`}
                                    aria-required="true"
                                />
                            </>
                        )
                    }

                    {
                        (value.type === TypedInputEnum.Raw) && (
                            <>
                                <InputField
                                    label="Code"
                                    value={value.value}
                                    disabled={disabled}
                                    type="text"
                                    onChange={(e) => {
                                        if (disabled) return;
                                        onChange({ type: value.type, value: e.target.value, id: value.id});
                                    }}
                                    id={`${inputId}-value`}
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
                                    id={`${inputId}-value`}
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
                                        id={`${inputId}-x`}
                                        aria-required="true"
                                        small={true}
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
                                        id={`${inputId}-y`}
                                        aria-required="true"
                                        small={true}
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
                                        id={`${inputId}-z`}
                                        aria-required="true"
                                        small={true}
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
                </div>
            </BaseLabelAndDescription>
		</>
	);
};

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
            {disabled ? (
                <div className="text-gray-500">
                    {value.map((v, i) => {
                        return (
                            <TypedInputField
                                key={i}
                                label={`Item ${i + 1} (${valueToString(v)})`}
                                value={v}
                                onChange={(_newVal) => {}}
                                disabled={true}
                            />
                        );
                    })}
                </div>
            ) : (
                <>
                    <Reorder.Group
                        axis="y"
                        values={value}
                        onReorder={(newValues) => {
                            logger.debug('TypedInput', 'Reordering array table input:', newValues);
                            onChange(newValues);
                        }}
                    >
                        {value.map((v, i) => (
                            <Reorder.Item key={v.id} value={v}>
                                <div
                                    className="border border-border hover:border-primary/20 rounded-lg p-4 transition-all shadow-sm"
                                >
                                    <div className="flex items-center gap-3">
                                        <GripVertical className="w-5 h-5 text-muted-foreground cursor-grab active:cursor-grabbing" />
                                        <span className="font-medium text-foreground">Element {i + 1} ({valueToString(v)})</span>
                                        <div className="ml-auto flex items-center gap-2">
                                            <button
                                                className="p-1 rounded-md hover:bg-accent/50 transition-colors"
                                                onClick={() => {
                                                    let newArray = [...value];
                                                    newArray.splice(i, 1);
                                                    onChange(newArray);
                                                }}
                                                aria-label="Delete entry"
                                            >
                                                <Trash2 className="w-4 h-4 text-muted-foreground" />
                                            </button>
                                        </div>
                                    </div>
                                    
                                    <div className = "p-4">
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
                                    </div>
                                </div>
                            </Reorder.Item>
                        ))}
                    </Reorder.Group>
                </>
            )}

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

interface TableInputProps {
	value: TypedInputTableEntry[];
	onChange: (data: TypedInputTableEntry[]) => void;
	disabled?: boolean;
}

const TableInput: React.FC<TableInputProps> = ({
    value,
    onChange,
    disabled
}) => {
    return (
        <>
            {disabled ? (
                <div className="text-gray-500">
                    {value.map((v, i) => {
                        return (
                            <Fragment key={i}>
                                <TypedInputField
                                    label={`Item ${i + 1} (${valueToString(v.key)}) Key`}
                                    value={v.key}
                                    onChange={(_newVal) => {}}
                                    disabled={true}
                                />

                                <TypedInputField
                                    key={i}
                                    label={`Item ${i + 1} (${valueToString(v.value)}) Value`}
                                    value={v.value}
                                    onChange={(_newVal) => {}}
                                    disabled={true}
                                />  
                            </Fragment>
                        );
                    })}
                </div>
            ) : (
                <>
                    <Reorder.Group
                        axis="y"
                        values={value}
                        onReorder={(newValues) => {
                            logger.debug('TypedInput', 'Reordering array table input:', newValues);
                            onChange(newValues);
                        }}
                    >
                        {value.map((v, i) => (
                            <Reorder.Item key={v.key.id} value={v}>
                                <div
                                    className="border border-border hover:border-primary/20 rounded-lg p-4 transition-all shadow-sm"
                                >
                                    <div className="flex items-center gap-3">
                                        <GripVertical className="w-5 h-5 text-muted-foreground cursor-grab active:cursor-grabbing" />
                                        <span className="font-medium text-foreground">Element {i + 1} ({valueToString(v.key)} = {valueToString(v.value)})</span>
                                        <div className="ml-auto flex items-center gap-2">
                                            <button
                                                className="p-1 rounded-md hover:bg-accent/50 transition-colors"
                                                onClick={() => {
                                                    let newArray = [...value];
                                                    newArray.splice(i, 1);
                                                    onChange(newArray);
                                                }}
                                                aria-label="Delete entry"
                                            >
                                                <Trash2 className="w-4 h-4 text-muted-foreground" />
                                            </button>
                                        </div>
                                    </div>
                                    
                                    <div className = "p-4">
                                        <div>
                                            <TypedInputField
                                                label={`Item ${i + 1} Key`}
                                                value={v.key}
                                                onChange={(newVal) => {
                                                    let newArray = [...value];
                                                    newArray[i].key = newVal;
                                                    onChange(newArray);
                                                }}
                                                disabled={disabled}
                                            />
                                        </div>
                                        <div>
                                        <TypedInputField
                                            label={`Item ${i + 1} Value`}
                                            value={v.value}
                                            onChange={(newVal) => {
                                                let newArray = [...value];
                                                newArray[i].value = newVal;
                                                onChange(newArray);
                                            }}
                                            disabled={disabled}
                                        />
                                        </div>
                                    </div>
                                </div>
                            </Reorder.Item>
                        ))}
                    </Reorder.Group>
                </>
            )}

            {!disabled && (
                <>
                    <Primary 
                        Title="Add Element"
                        onClick={() => {
                            let newArray = [...value];
                            let key = { type: TypedInputEnum.Nil, id: generateTypedInputId() };
                            let valueL = { type: TypedInputEnum.Nil, id: generateTypedInputId() };
                            newArray.push({ key: key as TypedInput, value: valueL as TypedInput });
                            onChange(newArray);
                        }}
                    />
                    <div className="mt-2 mb-2" />
                </>
            )}
        </>
    )
}
