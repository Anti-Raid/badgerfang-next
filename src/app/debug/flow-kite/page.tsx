'use client';
import { useState } from 'react';
import Flow from '@/components/flow/FlowPage';
import { FlowData, NodeExtData } from '@/lib/flow/data';
import { motion } from 'framer-motion';

export default function Blockly() {
	const [data, setData] = useState<FlowData>({nodes: [], edges: []})
	const [auxData, setAuxData] = useState<Record<string, NodeExtData>>({});

	return (
		<>
			<Flow 
                flowData={data}
                onChange={setData}
				flowContext={{
					getData: (id: string) => {
						console.log("Getting aux data for", { id, auxData }, auxData);
						return auxData[id]
					},
					setData: (id: string, data: NodeExtData) => {
						console.log("Setting aux data for", id, "to", data);
						setAuxData((prev) => ({ ...prev, [id]: data }));
					},
					removeData: (id: string) => {
						setAuxData((prev) => {
							const newAuxData = { ...prev };
							delete newAuxData[id];
							return newAuxData;
						});
					}
				}}
            />
			<motion.div
				initial={{ opacity: 0, y: 10 }}
				animate={{ opacity: 1, y: 0 }}
				transition={{ duration: 0.5 }}
				className="mt-8"
			>
				<code className="whitespace-pre-wrap break-words bg-gray-100 text-black">{JSON.stringify({data, auxData})}</code>
			</motion.div>
		</>
	);
}
