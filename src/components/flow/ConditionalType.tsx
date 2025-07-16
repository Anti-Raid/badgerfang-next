import {
	ConditionalLogicTypeEnum,
	conditionalLogicTypeEnumToString,
	ConditionalType,
	ConditionalTypeContinuable,
	ConditionalTypeEnum,
	ConditionalTypeLiteral,
	ConditionalTypeLogic,
	ConditionalTypeParensBlock,
	stringToConditionalLogicTypeEnum,
	TypedInputEnum
} from '@/lib/flow/data';
import { InlineGhost, SmallGhost } from '../ui/Buttons';
import { InputField, TypedInputField } from './Inputs';

export interface ConditionalTypeProps {
	value: ConditionalType;
	onChange: (value: ConditionalType) => void;
}

export const ConditionalTypeField: React.FC<ConditionalTypeProps> = ({ value, onChange }) => {
	return (
		<>
			{value.type === ConditionalTypeEnum.Unselected ? (
				<>
					<div className="text-gray-500">No condition selected</div>
					<InlineGhost
						Title="Add Logic Condition"
						onClick={() => {
							onChange({
								type: ConditionalTypeEnum.LogicExpr,
								condition: {
									type: ConditionalLogicTypeEnum.Unselected,
									left: { type: TypedInputEnum.String, value: '' },
									right: { type: TypedInputEnum.String, value: '' }
								}
							});
						}}
					/>

					<InlineGhost
						Title="Add Group"
						onClick={() => {
							onChange({
								type: ConditionalTypeEnum.ParensBlock,
								condition: {
									type: ConditionalTypeEnum.Unselected
								}
							});
						}}
					/>

					<InlineGhost
						Title="Add Raw"
						onClick={() => {
							onChange({
								type: ConditionalTypeEnum.Raw,
								condition: ''
							});
						}}
					/>

					<InlineGhost
						Title="Add Literal"
						onClick={() => {
							onChange({
								type: ConditionalTypeEnum.Literal,
								value: { type: TypedInputEnum.String, value: '' }
							});
						}}
					/>
				</>
			) : value.type === ConditionalTypeEnum.LogicExpr ? (
				<ConditionalTypeLogicField
					value={value}
					onChange={(logic) => {
						onChange({
							...value,
							condition: logic.condition,
							next: logic.next
						});
					}}
				/>
			) : value.type === ConditionalTypeEnum.ParensBlock ? (
				<ConditionalTypeParensBlockField
					value={value as ConditionalTypeParensBlock}
					onChange={(block) => {
						onChange({
							...value,
							condition: block.condition,
							next: block.next
						});
					}}
				/>
			) : value.type === ConditionalTypeEnum.Raw ? (
				<>
					<InputField
						type="text"
						label="Raw Condition"
						value={value.condition as string}
						onChange={(e) => {
							onChange({
								...value,
								condition: e.target.value
							});
						}}
					/>

					<ConditionalTypeContinuationField
						value={value.next}
						onChange={(continuation) => {
							onChange({
								...value,
								next: continuation
							});
						}}
					/>
				</>
			) : value.type == ConditionalTypeEnum.Literal ? (
				<ConditionalTypeLiteralField
					value={value}
					onChange={(literal) => {
						onChange({
							...value,
							value: literal.value,
							next: literal.next
						});
					}}
				/>
			) : (
				<div className="text-red-500">Unknown condition type: {JSON.stringify(value)}</div>
			)}

			{value.type !== ConditionalTypeEnum.Unselected && (
				<SmallGhost
					Title="Remove Condition"
					onClick={() => {
						onChange({
							type: ConditionalTypeEnum.Unselected
						});
					}}
				/>
			)}
		</>
	);
};

export interface ConditionalTypeContinuationProps {
	value: ConditionalTypeContinuable | undefined;
	onChange: (value: ConditionalTypeContinuable | undefined) => void;
}

/**
 * A continuation field for conditional types, allowing users to add more conditions in a chain
 */
export const ConditionalTypeContinuationField: React.FC<ConditionalTypeContinuationProps> = ({
	value,
	onChange
}) => {
	return (
		<>
			{value ? (
				<div className="gap-2 p-9">
					<div className="text-gray-500 font-semibold gap-1">{value.op.toUpperCase()}</div>
					<ConditionalTypeField
						value={value.condition}
						onChange={(condition) => {
							onChange({
								...value,
								condition
							});
						}}
					/>

					<InlineGhost
						Title="Remove"
						onClick={() => {
							onChange(undefined);
						}}
					/>
				</div>
			) : (
				<div className="flex items-center gap-2">
					<InlineGhost
						Title="AND"
						onClick={() => {
							onChange({
								op: 'and',
								condition: {
									type: ConditionalTypeEnum.Unselected
								}
							});
						}}
					/>

					<InlineGhost
						Title="OR"
						onClick={() => {
							onChange({
								op: 'or',
								condition: {
									type: ConditionalTypeEnum.Unselected
								}
							});
						}}
					/>
				</div>
			)}
		</>
	);
};

export interface ConditionalTypeLogicProps {
	value: ConditionalTypeLogic;
	onChange: (value: ConditionalTypeLogic) => void;
}

const ConditionalTypeLogicField: React.FC<ConditionalTypeLogicProps> = ({ value, onChange }) => {
	return (
		<>
			<div className="gap-2">
				<TypedInputField
					label="Left Operand"
					value={value.condition.left}
					onChange={(left) => {
						onChange({
							...value,
							condition: {
								...value.condition,
								left
							}
						});
					}}
				/>
			</div>
			<div className="flex items-center gap-2">
				<InputField
					type="select"
					label="Comparison Type"
					value={conditionalLogicTypeEnumToString(value.condition.type)}
					options={[
						{
							label: 'Equals',
							value: stringToConditionalLogicTypeEnum(ConditionalLogicTypeEnum.IfEq)
						},
						{
							label: 'Not Equals',
							value: stringToConditionalLogicTypeEnum(ConditionalLogicTypeEnum.IfNeq)
						},
						{
							label: 'Greater Than',
							value: stringToConditionalLogicTypeEnum(ConditionalLogicTypeEnum.IfGt)
						},
						{
							label: 'Less Than',
							value: stringToConditionalLogicTypeEnum(ConditionalLogicTypeEnum.IfLt)
						},
						{
							label: 'Greater Than or Equal To',
							value: stringToConditionalLogicTypeEnum(ConditionalLogicTypeEnum.IfGte)
						},
						{
							label: 'Less Than or Equal To',
							value: stringToConditionalLogicTypeEnum(ConditionalLogicTypeEnum.IfLte)
						}
					]}
					onChange={(e) => {
						onChange({
							...value,
							condition: {
								...value.condition,
								type: stringToConditionalLogicTypeEnum(e.target.value || 'unselected')
							}
						});
					}}
				/>
			</div>
			<div className="gap-2">
				<TypedInputField
					label="Right Operand"
					value={value.condition.right}
					onChange={(right) => {
						onChange({
							...value,
							condition: {
								...value.condition,
								right
							}
						});
					}}
				/>
			</div>

			<ConditionalTypeContinuationField
				value={value.next}
				onChange={(continuation) => {
					onChange({
						...value,
						next: continuation
					});
				}}
			/>
		</>
	);
};

export interface ConditionalTypeParensBlockProps {
	value: ConditionalTypeParensBlock;
	onChange: (value: ConditionalTypeParensBlock) => void;
}

const ConditionalTypeParensBlockField: React.FC<ConditionalTypeParensBlockProps> = ({
	value,
	onChange
}) => {
	return (
		<div className="gap-2 p-9">
			<div className="text-gray-500">Parens Block</div>
			<ConditionalTypeField
				value={value.condition}
				onChange={(condition) => {
					onChange({
						...value,
						condition
					});
				}}
			/>

			<ConditionalTypeContinuationField
				value={value.next}
				onChange={(continuation) => {
					onChange({
						...value,
						next: continuation
					});
				}}
			/>
		</div>
	);
};

export interface ConditionalTypeLiteralProps {
	value: ConditionalTypeLiteral;
	onChange: (value: ConditionalTypeLiteral) => void;
}

const ConditionalTypeLiteralField: React.FC<ConditionalTypeLiteralProps> = ({
	value,
	onChange
}) => {
	return (
		<>
			<div className="gap-2">
				<TypedInputField
					label="Left Operand"
					value={value.value}
					onChange={(val) => {
						onChange({
							...value,
							value: val
						});
					}}
				/>
			</div>

			<ConditionalTypeContinuationField
				value={value.next}
				onChange={(continuation) => {
					onChange({
						...value,
						next: continuation
					});
				}}
			/>
		</>
	);
};
