'use client';
import { useMemo, useState } from 'react';
import { ConditionalType, ConditionalTypeEnum, FlowData, NodeExtData } from '@/lib/flow/data';
import { motion } from 'framer-motion';
import { CodeGenASTGenerator } from '@/lib/flow/codegen/block2ast';
import { ConditionalTypeField } from '@/components/flow/ConditionalType';
import FlowList from '@/components/flow/FlowList';

export default function Blockly() {
	const [data, setData] = useState<FlowData[]>([]);
	const [selectedFlowIndex, setSelectedFlowIndex] = useState(0);
	const [dbgConditional, setDbgConditional] = useState<ConditionalType>({
		type: ConditionalTypeEnum.Unselected
	});

	const codegennedAst = useMemo(() => {
		if (!data[selectedFlowIndex]) return { stage1: 'No flow data selected', stage2: 'No flow data selected' };
		let r = new CodeGenASTGenerator(data[selectedFlowIndex].nodes, data[selectedFlowIndex].edges).generate();

		let stage1 = r.toJSON();

		let stage2: any = 'Cannot proceed further due to AST errors';

		if (!r.isError()) {
			r.applyDefaultTransforms();
			stage2 = r.toJSON();
		}

		return { stage1, stage2 };
	}, [data, selectedFlowIndex]);

	return (
		<>
			<FlowList flowDatas={data} onChange={setData} selectedFlowIndex={selectedFlowIndex} setSelectedFlowIndex={setSelectedFlowIndex} addFlowData={() => {
				setData([...data, { nodes: [], edges: [] }]);
				setSelectedFlowIndex(data.length);
			}} />
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

			<h2 className="text-lg">CodeGen AST</h2>

			<motion.div
				initial={{ opacity: 0, y: 10 }}
				animate={{ opacity: 1, y: 0 }}
				transition={{ duration: 0.5 }}
				className="mt-8 bg-gray-100 p-1"
			>
				<code className="whitespace-pre-wrap break-words text-black">
					{JSON.stringify(codegennedAst, null, 2)}
				</code>
			</motion.div>

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
