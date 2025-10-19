import React from 'react';
import { Field, Node as NodeIDLNode } from '@/lib/flow/nodeidl/nodeidl';
import { TypedInputField } from '../ui/TypedInput';
import { TypedInputEnum, TypedInput } from '@/lib/flow/data';
import { generateTypedInputId } from '../ui/TypedInput';

interface Props {
  nodeidl: NodeIDLNode | null;
  inputValues: Record<string, TypedInput>;
  onChange: (key: string, value: TypedInput) => void;
  renderOnly?: boolean; // if true, only render inputs, don't modify state
}

// Small helper to create label/description
const fieldLabel = (field: Field) => {
  if (field.type === 'scalar') return field.data.shortname || field.data.id || 'Field';
  if (field.type === 'group') return 'Group';
  if (field.type === 'array') return 'Array';
  return 'Field';
};

const NodeFromIDL: React.FC<Props> = ({ nodeidl, inputValues, onChange }) => {
  if (!nodeidl || !nodeidl.flowui?.input) return <div className="text-muted-foreground">No input schema defined</div>;

  const fields: JSX.Element[] = [];

  const processFieldForRender = (field: Field, prefix: string) => {
    let fieldKey = '';
    if (field.type === 'scalar') fieldKey = `${prefix}_${field.data.id}`;
    else if (field.type === 'array') fieldKey = `${prefix}_array`;
    else if (field.type === 'group') fieldKey = `${prefix}_group`;
    else fieldKey = `${prefix}_unknown`;

    if (field.type === 'group') {
      field.fields.forEach((subField, idx) => {
        let subKey = '';
        if (subField.type === 'scalar') subKey = `${prefix}_${subField.data.id}`;
        else if (subField.type === 'array') subKey = `${prefix}_array_${idx}`;
        else subKey = `${prefix}_field_${idx}`;
        processFieldForRender(subField, subKey);
      });
    } else {
      const value = inputValues[fieldKey] || {
        type: TypedInputEnum.String,
        value: '',
        id: generateTypedInputId()
      };

      fields.push(
        <TypedInputField
          key={fieldKey}
          id={fieldKey}
          label={fieldLabel(field)}
          description={field.type === 'scalar' ? (field.data.description || '') : ''}
          value={value}
          onChange={(v) => onChange(fieldKey, v)}
          placeholder={`Enter ${fieldLabel(field).toLowerCase()}`}
          className="w-full"
        />
      );
    }
  };

  processFieldForRender(nodeidl.flowui.input, 'input');

  return <div className="space-y-2">{fields}</div>;
};

export default NodeFromIDL;
