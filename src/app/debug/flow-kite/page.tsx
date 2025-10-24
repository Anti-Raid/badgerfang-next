'use client';
import { useState } from 'react';
import { ConditionalType, ConditionalTypeEnum, FlowData, NodeExtData } from '@/lib/flow/data';
import { motion } from 'framer-motion';
import { CodeGenASTGenerator } from '@/lib/flow/codegen/blocklayer/block2ast';
import { ConditionalTypeField } from '@/components/flow/ui/ConditionalType';
import FlowList from '@/components/flow/ui/FlowList';
import { Primary } from '@/components/ui/Buttons';

const codegenAst = async (data: FlowData) => {
	let generator = new CodeGenASTGenerator(data.nodes, data.edges)
	let r = await generator.generate();

	let stage1 = r.toJSON();

	let stage2: any = 'Cannot proceed further due to AST errors';

	if (!r.isError()) {
		r.applyDefaultTransforms();
		stage2 = r.toJSON();
	}

	return { stage1, stage2 };
};

export default function Blockly() {
	const [data, setData] = useState<FlowData[]>([]);
	const [selectedFlowIndex, setSelectedFlowIndex] = useState(0);
	const [dbgConditional, setDbgConditional] = useState<ConditionalType>({
		type: ConditionalTypeEnum.Unselected
	});
	const [compiledAst, setCompiledAst] = useState<{
		stage1: Record<string, unknown>;
		stage2: Record<string, unknown>;
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

			<ConditionalTypeField value={dbgConditional} onChange={setDbgConditional} />

			<motion.div
				initial={{ opacity: 0, y: 10 }}
				animate={{ opacity: 1, y: 0 }}
				transition={{ duration: 0.5 }}
				className="mt-8 bg-gray-100 p-1"
			>
				<code className="whitespace-pre-wrap break-words text-black">
					{JSON.stringify(dbgConditional, null, 2)}
				</code>
			</motion.div>
		</>
	);
}
