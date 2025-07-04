'use client';

import { Column, ColumnSuggestion, ColumnType, InnerColumnType } from '@/types/settings';
import { useState } from 'react';
import { SettingsColumn } from '../components/setting';

const column1: Column = {
	id: 'column1',
	name: 'Column 1',
	description: 'This is the first column for input.',
	placeholder: 'Enter your value here',
	primary_key: false,
	nullable: true,
	column_type: {
		type: ColumnType.Scalar,
		inner: {
			type: InnerColumnType.String,
			allowed_values: [],
			kind: 'Text'
		}
	},
	suggestions: {
		type: ColumnSuggestion.None
	},
	secret: false,
	readonly: []
};
const initialColumn1Value = 'Bacon and eggs';

const column2: Column = {
	id: 'column2',
	name: 'Column 2',
	description: 'This is the second column for input.',
	placeholder: 'Enter your value here',
	primary_key: false,
	nullable: true,
	column_type: {
		type: ColumnType.Array,
		inner: {
			type: InnerColumnType.Integer
		}
	},
	suggestions: {
		type: ColumnSuggestion.None
	},
	secret: false,
	readonly: []
};
const initialColumn2Value = [1, 2, 3, 6];

const column3: Column = {
	id: 'column3',
	name: 'Column 3',
	description: 'This is the third column for input.',
	placeholder: 'Enter your value here',
	primary_key: false,
	nullable: true,
	column_type: {
		type: ColumnType.Array,
		inner: {
			type: InnerColumnType.Boolean
		}
	},
	suggestions: {
		type: ColumnSuggestion.None
	},
	secret: false,
	readonly: []
};
const initialColumn3Value = [false, false];

const column4: Column = {
	id: 'column4',
	name: 'Column 4',
	description: 'This is the fourth column for input.',
	placeholder: 'Enter your value here',
	primary_key: false,
	nullable: true,
	column_type: {
		type: ColumnType.Scalar,
		inner: {
			type: InnerColumnType.String,
			allowed_values: ['Cats', 'Dogs', 'Donkies'],
			kind: 'normal'
		}
	},
	suggestions: {
		type: ColumnSuggestion.None
	},
	secret: false,
	readonly: []
};
const initialColumn4Value = 'Cats';

export const ColumnInputTest = () => {
	let [column1Value, setColumn1Value] = useState<any>(initialColumn1Value);
	let [column2Value, setColumn2Value] = useState<any>(initialColumn2Value);
	let [column3Value, setColumn3Value] = useState<any>(initialColumn3Value);
	let [column4Value, setColumn4Value] = useState<any>(initialColumn4Value);

	return (
		<>
			<SettingsColumn
				column={column1}
				value={column1Value}
				onChange={(newValue) => setColumn1Value(newValue)}
			/>

			<SettingsColumn
				column={column2}
				value={column2Value}
				onChange={(newValue) => setColumn2Value(newValue)}
			/>

			<SettingsColumn
				column={column3}
				value={column3Value}
				onChange={(newValue) => setColumn3Value(newValue)}
			/>

			<SettingsColumn
				column={column4}
				value={column4Value}
				onChange={(newValue) => setColumn4Value(newValue)}
			/>

			<p>Column 1: {column1Value}</p>
			<p>Column 2: {JSON.stringify(column2Value)}</p>
			<p>Column 3: {JSON.stringify(column3Value)}</p>
			<p>Column 4: {JSON.stringify(column4Value)}</p>
		</>
	);
};
