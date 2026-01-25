import { InputField } from "@/components/flow/ui/Inputs"
import { DrawCmdForm, DrawCmdFormList, DrawCmdInput } from "./-drawcmd"
import { RadioOption } from "@/components/settings/components/form-elements";
import { Primary, Secondary } from "@/components/ui/Buttons";

interface CreateInputProps {
    data: DrawCmdInput;
    setData: (data: DrawCmdInput) => void;
    requestRemove: () => void;
}

const inputOpts = [
    { value: 'text', label: 'Text Input' },
    { value: 'number', label: 'Number Input' },
    { value: 'select', label: 'Select Input' },
    { value: 'checkbox', label: 'Checkbox Input' },
    { value: 'array', label: 'Array Input' }
]

export const CreateInput = ({ data, setData, requestRemove }: CreateInputProps) => {
    return (
        <>
            <InputField
                type="select"
                label="Input Type"
                value={data.input.type}
                onChange={(e) => setData({
                    ...data,
                    input: {
                        ...data.input,
                        type: e.target.value as any
                    }
                })}
                options={inputOpts}
            />

            <InputField
                type="text"
                label="Input ID"
                value={data.input.id}
                onChange={(e) => setData({
                    ...data,
                    input: {
                        ...data.input,
                        id: e.target.value
                    }
                })}
            />

            <InputField
                type="text"
                label="Input Label"
                value={data.input.label}
                onChange={(e) => setData({
                    ...data,
                    input: {
                        ...data.input,
                        label: e.target.value
                    }
                })}
            />

            <InputField
                type="text"
                label="Input Description"
                value={data.input.description || ''}
                onChange={(e) => setData({
                    ...data,
                    input: {
                        ...data.input,
                        description: e.target.value
                    }
                })}
            />

            <RadioOption 
                label="Clear Description"
                name="clear-description"
                checked={data.input.description === undefined}
                onChange={() => {
                    if(data.input.description !== undefined) {
                        const newInput = { ...data.input };
                        delete newInput.description;
                        setData({
                            ...data,
                            input: newInput
                        });
                    } else {
                        setData({
                            ...data,
                            input: {
                                ...data.input,
                                description: ''
                            }
                        }); 
                    }
                }}
            />

            {data.input.type === 'text' ? (
                <>
                    <InputField
                        type="text"
                        label="Value"
                        value={data.input.value}
                        onChange={(e) => setData({
                            ...data,
                            input: {
                                ...data.input,
                                value: e.target.value
                            } as any
                        })}
                    />

                    <RadioOption
                        label="Read Only"
                        name="readonly"
                        checked={data.input.readonly || false}
                        onChange={() => setData({
                            ...data,
                            input: {
                                ...data.input,
                                readonly: !((data.input as any).readonly || false)
                            } as any
                        })}
                    />

                    <InputField
                        type="text"
                        label="Placeholder"
                        value={data.input.placeholder || ''}
                        onChange={(e) => setData({
                            ...data,
                            input: {
                                ...data.input,
                                placeholder: e.target.value
                            } as any
                        })}
                    />

                    <InputField
                        type="number"
                        label="Min Length"
                        value={(data.input.minLength || 0).toString()}
                        onChange={(e) => setData({
                            ...data,
                            input: {
                                ...data.input,
                                minLength: parseInt(e.target.value)
                            } as any
                        })}
                    />

                    <InputField
                        type="number"
                        label="Max Length"
                        value={(data.input.maxLength || 0).toString()}
                        onChange={(e) => setData({
                            ...data,
                            input: {
                                ...data.input,
                                maxLength: parseInt(e.target.value)
                            } as any
                        })}
                    />

                    <InputField
                        type="text"
                        label="Suggestions (comma separated)"
                        value={data.input.suggestions ? data.input.suggestions.join(', ') : ''}
                        onChange={(e) => setData({
                            ...data,
                            input: {
                                ...data.input,
                                suggestions: e.target.value.split(',').map(s => s.trim())
                            } as any
                        })}
                    />
                </>
            ) : (
                <>Unsupported type</>
            )}

            <Secondary
                Title="Remove Input"
                onClick={() => requestRemove()}
            />
        </>
    )
}


interface CreateFormProps {
    data: DrawCmdForm,
    setData: (data: DrawCmdForm) => void
    requestRemove: () => void
}

export const CreateForm = ({ data, setData, requestRemove }: CreateFormProps) => {
    return (
        <>
            <InputField
                type="text"
                label="Form ID"
                value={data.id}
                onChange={(e) => setData({
                    ...data,
                    id: e.target.value
                })}
            />

            <InputField
                type="text"
                label="Form Title/Label"
                value={data.label}
                onChange={(e) => setData({
                    ...data,
                    label: e.target.value
                })}
            />
            
            <Primary
                Title="Add Input"
                onClick={() => {
                    const newData = { ...data };
                    newData.commands.push({
                        type: 'input',
                        input: {
                            type: 'text',
                            id: `input${newData.commands.length + 1}`,
                            label: `Input ${newData.commands.length + 1}`,
                            value: ''
                        }
                    });
                    setData(newData);
                }}
            />

            {data.commands.map((cmd, index) => (
                <div key={index} className="border border-border rounded-md p-4 mt-4">
                    {cmd.type === 'input' ? (
                        <CreateInput 
                            data={cmd}
                            setData={(newCmd) => {
                                const newData = { ...data };
                                newData.commands[index] = newCmd;
                                setData(newData);
                            }}
                            requestRemove={() => {
                                const newData = { ...data };
                                newData.commands.splice(index, 1);
                                setData(newData);
                            }}
                        />
                    ) : (
                        <>Unsupported command type</>
                    )}
                </div>
            ))}

            <Secondary
                Title="Remove Form"
                onClick={() => requestRemove()}
            />
        </>
    )
}

interface CreateFormListProps {
    data: DrawCmdFormList,
    setData: (data: DrawCmdFormList) => void
}

export const CreateFormList = ({ data, setData }: CreateFormListProps) => {
    return (
        <>
            <InputField
                type="text"
                label="Form List ID"
                value={data.id}
                onChange={(e) => setData({
                    ...data,
                    id: e.target.value
                })}
            />

            <InputField
                type="text"
                label="Form List Title"
                value={data.title}
                onChange={(e) => setData({
                    ...data,
                    title: e.target.value
                })}
            />

            {data.createForm ? (
                <>
                    <h3 className="mt-4 mb-2 font-bold text-foreground">Create Form</h3>
                    <div className="border border-border rounded-md p-4 mt-2">
                        <CreateForm 
                            data={data.createForm}
                            setData={(newForm) => {
                                const newData = { ...data };
                                newData.createForm = newForm;
                                setData(newData);
                            }}
                            requestRemove={() => {
                                const newData = { ...data };
                                delete newData.createForm;
                                setData(newData);
                            }}
                        />
                    </div>
                </>
            ) : (
                <>
                    <Primary
                        Title="Add Create Form"
                        onClick={() => {
                            const newData = { ...data };
                            newData.createForm = {
                                id: `createForm`,
                                label: `Create Form`,
                                commands: []
                            };
                            setData(newData);
                        }}
                    />
                </>
            )}

            <Primary
                Title="Add Form"
                onClick={() => {
                    const newData = { ...data };
                    newData.forms.push({
                        id: `form${newData.forms.length + 1}`,
                        label: `Form ${newData.forms.length + 1}`,
                        commands: []
                    });
                    setData(newData);
                }}
            />

            {data.forms.map((form, index) => (
                <div key={index} className="border border-border rounded-md p-4 mt-4">
                    <CreateForm 
                        data={form}
                        setData={(newForm) => {
                            const newData = { ...data };
                            newData.forms[index] = newForm;
                            setData(newData);
                        }}
                        requestRemove={() => {
                            const newData = { ...data };
                            newData.forms.splice(index, 1);
                            setData(newData);
                        }}
                    />
                </div>
            ))}
        </>
    )
}