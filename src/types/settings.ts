export enum ColumnType {
	Scalar = 'Scalar',
	Array = 'Array',
	Widget = 'Widget'
}

export interface Scalar {
	type: ColumnType.Scalar;
	inner: InnerColumnTypeUnion;
}

export interface Array {
	type: ColumnType.Array;
	inner: InnerColumnTypeUnion;
}

export interface Widget {
	type: ColumnType.Widget;
	inner: InnerWidgetUnion;
}

export type ColumnTypeUnion = Scalar | Array | Widget;

export enum InnerWidget {
	Info = 'Info',
	Warning = 'Warning',
	Button = 'Button'
}

export interface Info {
	type: InnerWidget.Info;
	message: string;
}

export interface Warning {
	type: InnerWidget.Warning;
	message: string;
}

export interface Button {
	type: InnerWidget.Button;
	label: string;
	op: string;
}

export type InnerWidgetUnion = Info | Warning | Button;

export enum InnerColumnType {
	String = 'String',
	Integer = 'Integer',
	Float = 'Float',
	BitFlag = 'BitFlag',
	Boolean = 'Boolean',
	Json = 'Json'
}

export interface StringType {
	type: InnerColumnType.String;
	min_length?: number;
	max_length?: number;
	allowed_values: string[];
	suggestions?: string[];
	kind: string;
}

export interface IntegerType {
	type: InnerColumnType.Integer;
}

export interface FloatType {
	type: InnerColumnType.Float;
}

export interface BitFlag {
	type: InnerColumnType.BitFlag;
	values: Map<string, number>;
}

export interface BooleanType {
	type: InnerColumnType.Boolean;
}

export interface Json {
	type: InnerColumnType.Json;
	style: string;
}

export type InnerColumnTypeUnion =
	| StringType
	| IntegerType
	| FloatType
	| BitFlag
	| BooleanType
	| Json;

export interface Column {
	id: string;
	name: string;
	description: string;
	placeholder?: string;
	column_type: ColumnTypeUnion;
	primary_key: boolean;
	nullable: boolean;
	hidden?: string[];
	readonly: string[];
}

export interface Setting {
	id: string;
	name: string;
	description: string;
	title_template: string;
	index_by?: string;
	columns: Column[];
	operations: string[];
	footer?: Footer;
	icon?: string;
}

export interface Footer {
	end_text: string;
}
