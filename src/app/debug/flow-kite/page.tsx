'use client';
import { useState } from 'react';
import { FlowData } from '@/lib/flow/data';
import { motion } from 'framer-motion';
import { CodeGenASTGenerator } from '@/lib/flow/codegen/blocklayer/block2ast';
import FlowList from '@/components/flow/ui/FlowList';
import { Primary } from '@/components/ui/Buttons';
import { stringifyParseCommands } from '@/lib/flow/codegen/astlayer/parsecommand';

const codegenAst = async (data: FlowData) => {
	let generator = new CodeGenASTGenerator(data.nodes, data.edges);
	let r = await generator.generate();

	let stage1 = r.toJSON();

	let stage2: any = 'Cannot proceed further due to AST errors';
	let compiledStr = null;

	if (!r.isError()) {
		let finalRepr = r.toFinalRepr()
		stage2 = finalRepr.toParseCommand();
		compiledStr = stringifyParseCommands(stage2)
	}

	return { stage1, stage2, compiledStr };
};

/**
 * Renders a Blockly debug UI that manages multiple FlowData entries, allows selecting and compiling a flow into staged AST outputs, and displays both input data and compilation results.
 *
 * The component stores flow list state, the selected flow index, and the compiled AST ({ stage1, stage2, compiledStr }). Clicking "Compile Flow" generates the AST for the selected flow and updates the displayed results.
 *
 * @returns The rendered React element for the Blockly debug interface.
 */
export default function Blockly() {
	const [data, setData] = useState<FlowData[]>([]);
	const [selectedFlowIndex, setSelectedFlowIndex] = useState(0);
	const [compiledAst, setCompiledAst] = useState<{
		stage1: Record<string, unknown>;
		stage2: Record<string, unknown>;
		compiledStr: string | null;
	} | null>(null);

	return (
		<>
			<FlowList
				flowDatas={data}
				onChange={setData}
				selectedFlowIndex={selectedFlowIndex}
				setSelectedFlowIndex={setSelectedFlowIndex}
				addFlowData={() => {
					setData([...data, { nodes: [], edges: [] }]);
					setSelectedFlowIndex(data.length);
				}}
			/>
			<motion.div
				initial={{ opacity: 0, y: 10 }}
				animate={{ opacity: 1, y: 0 }}
				transition={{ duration: 0.5 }}
				className="mt-8"
			>
				<code className="whitespace-pre-wrap break-words bg-gray-100 text-black">
					{JSON.stringify(data)}
				</code>
			</motion.div>

			{selectedFlowIndex >= 0 && data[selectedFlowIndex] && (
				<>
					<div className="mt-2">
						<Primary
							Title="Compile Flow"
							onClick={async () => {
								const flowData = data[selectedFlowIndex];
								const codegennedAst = await codegenAst(flowData);
								setCompiledAst(codegennedAst);
							}}
						/>
					</div>
				</>
			)}

			{compiledAst && (
				<>
					<h2 className="text-lg">CodeGen AST</h2>

					<motion.div
						initial={{ opacity: 0, y: 10 }}
						animate={{ opacity: 1, y: 0 }}
						transition={{ duration: 0.5 }}
						className="mt-8 bg-gray-100 p-1"
					>
						<code className="whitespace-pre-wrap break-words text-black">
							{JSON.stringify(compiledAst, null, 2)}
						</code>
					</motion.div>
				</>
			)}

			{/*<ConditionalTypeField value={dbgConditional} onChange={setDbgConditional} />

			<motion.div
				initial={{ opacity: 0, y: 10 }}
				animate={{ opacity: 1, y: 0 }}
				transition={{ duration: 0.5 }}
				className="mt-8 bg-gray-100 p-1"
			>
				<code className="whitespace-pre-wrap break-words text-black">
					{JSON.stringify(dbgConditional, null, 2)}
				</code>
			</motion.div>*/}
		</>
	);
}