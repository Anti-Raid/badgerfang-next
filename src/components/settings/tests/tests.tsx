'use client';

import { Column, ColumnType, InnerColumnType, Setting } from '@/types/settings';
import { useEffect, useState } from 'react';
import { noOpFetcher, SettingComponent, SettingDataFetcher } from '../components/setting';

import { getUserGuildBaseInfo } from '@/lib/api';
import { toast } from 'react-toastify';
import { DispatchResult, UserGuildBaseData } from '@/types/gosdk/types';
import { SettingsColumnList } from '../components/settings-column';

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
			kind: 'normal'
		}
	},
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
	readonly: ['View']
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
	readonly: ['View']
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
	readonly: []
};
const initialColumn4Value = 'Cats';

const column5: Column = {
	id: 'column5',
	name: 'Column 5',
	description: 'This is the fifth column for input.',
	placeholder: 'Enter your value here',
	primary_key: false,
	nullable: true,
	column_type: {
		type: ColumnType.Scalar,
		inner: {
			type: InnerColumnType.Json,
			style: 'normal'
		}
	},
	readonly: []
};
const initialColumn5Value = { a: 1 };

const column6: Column = {
	id: 'column6',
	name: 'Column 6',
	description: 'This is the sixth column for input.',
	placeholder: 'Enter your value here',
	primary_key: false,
	nullable: true,
	column_type: {
		type: ColumnType.Scalar,
		inner: {
			type: InnerColumnType.String,
			allowed_values: [],
			kind: 'password'
		}
	},
	readonly: []
};
const initialColumn6Value = 'My little password';

const column7: Column = {
	id: 'column7',
	name: 'Column 7',
	description: 'This is the seventh column for input.',
	placeholder: 'Enter your value here',
	primary_key: false,
	nullable: true,
	column_type: {
		type: ColumnType.Scalar,
		inner: {
			type: InnerColumnType.String,
			allowed_values: [],
			suggestions: ['Piano', 'Guitar', 'Drums', 'Violin'],
			kind: 'normal'
		}
	},
	readonly: []
};
const initialColumn7Value = 'Piano';

const column8: Column = {
	id: 'column8',
	name: 'Column 8',
	description: 'This is the eight column for input.',
	placeholder: 'Enter your value here',
	primary_key: false,
	nullable: true,
	column_type: {
		type: ColumnType.Scalar,
		inner: {
			type: InnerColumnType.String,
			allowed_values: [],
			suggestions: [],
			kind: 'role'
		}
	},
	readonly: []
};
const initialColumn8Value = '';

const column9: Column = {
	id: 'column9',
	name: 'Column 9',
	description: 'This is the ninth column for input.',
	placeholder: 'Enter your value here',
	primary_key: false,
	nullable: true,
	column_type: {
		type: ColumnType.Scalar,
		inner: {
			type: InnerColumnType.String,
			allowed_values: [],
			suggestions: [],
			kind: 'channel'
		}
	},
	readonly: []
};
const initialColumn9Value = '';

const column10: Column = {
	id: 'column10',
	name: 'Column 10',
	description: 'This is the tenth column for input.',
	placeholder: 'Enter your value here',
	primary_key: false,
	nullable: true,
	column_type: {
		type: ColumnType.Scalar,
		inner: {
			type: InnerColumnType.String,
			allowed_values: [],
			suggestions: [],
			kind: 'textarea'
		}
	},
	readonly: []
};
const initialColumn10Value = '';

const column11: Column = {
	id: 'column11',
	name: 'Column 11',
	description: 'This is the eleventh column for input.',
	placeholder: 'Enter your value here',
	primary_key: false,
	nullable: true,
	column_type: {
		type: ColumnType.Scalar,
		inner: {
			type: InnerColumnType.Json,
			style: 'template-content'
		}
	},
	readonly: []
};
const initialColumn11Value = { 'init.luau': 'print(123456)' };

const columns = [
	column1,
	column2,
	column3,
	column4,
	column5,
	column6,
	column7,
	column8,
	column9,
	column10,
	column11
];

interface ColumnInputTestProps {
	guildId: string;
}

export const ColumnInputTest: React.FC<ColumnInputTestProps> = ({ guildId }) => {
	const [userGuildBaseData, setUserGuildBaseData] = useState<UserGuildBaseData | null>(null);
	useEffect(() => {
		const fetchRoleOptions = async () => {
			try {
				const data = await getUserGuildBaseInfo(guildId);
				setUserGuildBaseData(data);
			} catch (error) {
				toast.error('Failed to fetch user guild base data'); // Display error toast
			}
		};

		fetchRoleOptions();
	}, [guildId]);

	let [columnData, setColumnData] = useState<{ [key: string]: any }>({
		column1: initialColumn1Value,
		column2: initialColumn2Value,
		column3: initialColumn3Value,
		column4: initialColumn4Value,
		column5: initialColumn5Value,
		column6: initialColumn6Value,
		column7: initialColumn7Value,
		column8: initialColumn8Value,
		column9: initialColumn9Value,
		column10: initialColumn10Value,
		column11: initialColumn11Value
	});

	let settingsFetcher: SettingDataFetcher = {
		...noOpFetcher,
		listEntries: async (setting: Setting): Promise<{ [key: string]: DispatchResult }> => {
			return {
				builtins: {
					type: 'Ok',
					data: [
						{
							id: '1',
							column1: initialColumn1Value,
							column2: initialColumn2Value,
							column3: initialColumn3Value,
							column4: initialColumn4Value,
							column5: initialColumn5Value,
							column6: initialColumn6Value,
							column7: initialColumn7Value,
							column8: initialColumn8Value,
							column9: initialColumn9Value,
							column10: initialColumn10Value,
							column11: initialColumn11Value,
							index: 1
						},
						{
							id: '2',
							column1: initialColumn1Value,
							column2: initialColumn2Value,
							column3: initialColumn3Value,
							column4: initialColumn4Value,
							column5: initialColumn5Value,
							column6: initialColumn6Value,
							column7: initialColumn7Value,
							column8: initialColumn8Value,
							column9: initialColumn9Value,
							column10: initialColumn10Value,
							column11: initialColumn11Value,
							index: 2
						}
					]
				}
			};
		}
	};

	let setting: Setting = {
		id: 'testsetting',
		name: 'Test Setting',
		description: 'This is a test setting for column input.',
		title_template:
			'local data = ...; return `{#data.guildData.roles} roles with ID {data.fields.id} and index {data.fields.index}`',
		columns: [
			{
				id: 'ID',
				name: 'ID',
				description: 'This is the ID for input.',
				placeholder: 'Enter your value here',
				primary_key: true,
				nullable: true,
				column_type: {
					type: ColumnType.Scalar,
					inner: {
						type: InnerColumnType.String,
						allowed_values: [],
						kind: 'normal'
					}
				},
				readonly: []
			},
			...columns,
			{
				id: 'index',
				name: 'Index',
				description: 'This is the index for input.',
				placeholder: 'Enter your value here',
				primary_key: true,
				nullable: true,
				column_type: {
					type: ColumnType.Scalar,
					inner: {
						type: InnerColumnType.String,
						allowed_values: [],
						kind: 'normal'
					}
				},
				readonly: []
			}
		],
		index_by: 'index',
		operations: ['View', 'Create', 'Update', 'Delete']
	};

	return (
		<>
			<SettingsColumnList
				columns={columns}
				values={columnData}
				onChange={(newValues) => setColumnData(newValues)}
				guildData={userGuildBaseData}
				operation="View"
			/>

			<p>Column Data: {JSON.stringify(columnData)}</p>

			{userGuildBaseData && (
				<>
					{/* Test settings display */}
					<SettingComponent
						guildId={guildId}
						setting={setting}
						fetcher={settingsFetcher}
						guildData={userGuildBaseData}
					/>
				</>
			)}
		</>
	);
};
