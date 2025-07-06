export enum ColumnType {
  Scalar = 'Scalar',
  Array = 'Array',
  Widget = 'Widget'
}

export enum InnerColumnType {
  String = 'String',
  Integer = 'Integer',
  Float = 'Float',
  BitFlag = 'BitFlag',
  Boolean = 'Boolean',
  Json = 'Json'
}

export enum InnerWidget {
  Info = 'Info',
  Warning = 'Warning',
  Button = 'Button'
}

// --- InnerColumnType Definitions ---

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

// --- InnerWidget Definitions ---

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

// --- ColumnType Wrappers ---

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

// --- Main Entities ---

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
  description?: string;
  title_template?: string;
  index_by?: string;
  columns: Column[];
  operations: string[];
  footer?: Footer;
  icon?: string;
  validation_template?: string;
}

export interface Footer {
  end_text: string;
}

// --- Setting Values and Validation ---

export interface SettingEntry {
  [key: string]: unknown;
  title?: string;
}

export interface SettingErrors {
  [templateName: string]: string;
}

export interface ValidationParams {
  op: 'Create' | 'Update' | 'Delete' | 'Reorder';
  fields: { [key: string]: unknown } | { [key: string]: unknown }[];
  entries: SettingEntry[];
  guildData: any; // Replace with actual type
}

export interface DispatchResult {
  type: 'Ok' | 'Error';
  data?: unknown;
}

export interface TemplateExecutionContext {
  fields: { [key: string]: unknown };
  guildData: any; // Replace with actual type
}