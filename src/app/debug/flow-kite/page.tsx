'use client';
import { useMemo, useState } from 'react';
import Flow from '@/components/flow/FlowPage';
import { FlowData, NodeExtData } from '@/lib/flow/data';
import { motion } from 'framer-motion';
import { CodeGenASTGenerator } from '@/lib/flow/codegen/block2ast';

export default function Blockly() {
	const [data, setData] = useState<FlowData>({nodes: [], edges: []})

	const codegennedAst = useMemo(() => {
		let r = new CodeGenASTGenerator(
			data.nodes,
			data.edges,
		)
		.generate()

		return r
	}, [data]);

	return (
		<>
			<Flow 
				flowData={data}
				onChange={setData}
			/>
			<motion.div
				initial={{ opacity: 0, y: 10 }}
				animate={{ opacity: 1, y: 0 }}
				transition={{ duration: 0.5 }}
				className="mt-8"
			>
				<code className="whitespace-pre-wrap break-words bg-gray-100 text-black">{JSON.stringify(data)}</code>
			</motion.div>

			<h2 className="text-lg">CodeGen AST</h2>

			<motion.div
				initial={{ opacity: 0, y: 10 }}
				animate={{ opacity: 1, y: 0 }}
				transition={{ duration: 0.5 }}
				className="mt-8 bg-gray-100 p-1"
			>
				<code className="whitespace-pre-wrap break-words text-black">
					{JSON.stringify(codegennedAst.toJSON(), null, 2)}
				</code>
			</motion.div>
		</>
	);
}
