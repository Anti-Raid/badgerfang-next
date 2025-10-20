import React, { useState } from 'react';
import { Field, FieldData, GroupData, Node as NodeIDLNode } from '@/lib/flow/nodeidl/nodeidl';
import { TypedInputField } from '../ui/TypedInput';
import { TypedInputEnum, TypedInput, NodeProps, NodeTypeEnum } from '@/lib/flow/data';
import { generateTypedInputId } from '../ui/TypedInput';
import { IDLCommon, IDLInput, IDLInputEnum, IDLInputField } from '../ui/IDLInput';

const getFieldData = (field: Field): FieldData | GroupData => {
	if (field.type == 'scalar') return field.data;
	else if (field.type == 'array') return getFieldData(field.elementType);
	else if (field.type == 'group') return field.groupData;
	else throw new Error('Invalid field with no field data found');
};

export const fieldToIDLInput = (field: Field, ud: TypedInput): IDLInput => {
	let data = getFieldData(field);
	let common: IDLCommon = {
		shortname: data.shortname,
		description: data.description
	};

	if (field.type == 'scalar') {
		switch (field.data.type) {
			case 'string': {
				return {
					type: IDLInputEnum.String,
					interpolated: false,
					value: ud.type == TypedInputEnum.String ? ud.value : '',
					id: field.data.id,
					common
				};
			}
			case 'number':
				return {
					type: IDLInputEnum.Number,
					value: ud.type == TypedInputEnum.Number ? ud.value : 0,
					id: field.data.id,
					common
				};
			case 'integer': {
				return {
					type: IDLInputEnum.Number,
					value: ud.type == TypedInputEnum.Number ? ud.value : 0,
					id: field.data.id,
					common
				};
			}
			case 'boolean': {
				return {
					type: IDLInputEnum.Boolean,
					value: ud.type == TypedInputEnum.Boolean ? ud.value : false,
					id: field.data.id,
					common
				};
			}
			default: {
				return {
					type: IDLInputEnum.Nil,
					id: field.data.id,
					common
				};
			}
		}
	} else if (field.type == 'array') {
		let idlFields = [];

		// Inject array elements into idlinput if found
		if (ud.type == TypedInputEnum.TableArray) {
			for (let element of ud.value) {
				idlFields.push(fieldToIDLInput(field.elementType, element));
			}
		}
		return {
			type: IDLInputEnum.Array,
			common,
			id: data.id,
			inline: false,
			value: idlFields
		};
	} else if (field.type == 'group') {
		let groupVals = [];

		// Add in every group field into the group
		for (let gfield of field.fields) {
			let element: TypedInput = {
				type: TypedInputEnum.Nil,
				id: ud.id
			};
			let gdata = getFieldData(gfield);

			// Inject the value into the idlinput if found

			if (ud.type == TypedInputEnum.Table) {
				let e = ud.value.find((v) => {
					if (v.key.type != TypedInputEnum.String) return false;
					return v.key.value == gdata.id;
				});
				if (e) {
					element = e.value;
				}
			}

			groupVals.push(fieldToIDLInput(gfield, element));
		}
		return {
			type: IDLInputEnum.Group,
			common,
			id: data.id,
			values: groupVals
		};
	} else {
		throw new Error(`Invalid field of type ${JSON.stringify(field)}`);
	}
};

/**
 * Lossily convert a IDLInput to a TypedInput that can then be stored
 * @param inp The idl input
 * @returns typed input data to save
 */
export const idlInputToField = (inp: IDLInput): TypedInput => {
	switch (inp.type) {
		case IDLInputEnum.Nil:
			return {
				type: TypedInputEnum.Nil,
				id: inp.id
			};
		case IDLInputEnum.String:
			return {
				type: TypedInputEnum.String,
				value: inp.value,
				interpolated: inp.interpolated,
				id: inp.id
			};
		case IDLInputEnum.Number:
			return {
				type: TypedInputEnum.Number,
				value: inp.value,
				id: inp.id
			};
		case IDLInputEnum.Boolean:
			return {
				type: TypedInputEnum.Boolean,
				value: inp.value,
				id: inp.id
			};
		case IDLInputEnum.Raw:
			return {
				type: TypedInputEnum.Raw,
				value: inp.value,
				id: inp.id
			};
		case IDLInputEnum.Vector:
			return {
				type: TypedInputEnum.Vector,
				x: inp.x,
				y: inp.y,
				z: inp.z,
				id: inp.id
			};
		case IDLInputEnum.Array:
			return {
				type: TypedInputEnum.TableArray,
				value: inp.value.map((x) => idlInputToField(x)),
				inline: inp.inline,
				id: inp.id
			};
		case IDLInputEnum.Table:
			return {
				type: TypedInputEnum.Table,
				value: inp.value.map((x) => {
					return {
						key: idlInputToField(x.key),
						value: idlInputToField(x.value)
					};
				}),
				inline: inp.inline,
				id: inp.id
			};
		case IDLInputEnum.Group:
			// TODO: Check this again
			return {
				type: TypedInputEnum.Table,
				value: inp.values.map((x) => {
					return {
						key: {
							type: TypedInputEnum.String,
							id: `g${inp.id}_${x.id}`,
							interpolated: false,
							value: x.id
						},
						value: idlInputToField(x)
					};
				}),
				inline: true,
				id: inp.id
			};
	}
};
