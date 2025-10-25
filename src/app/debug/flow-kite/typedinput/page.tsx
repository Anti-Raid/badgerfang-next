'use client';
import { useState } from 'react';
import { TypedInput, TypedInputEnum } from '@/lib/flow/data';
import { generateTypedInputId, TypedInputField } from '@/components/flow/ui/TypedInput';
import { motion } from 'framer-motion';
import logger from '@/lib/logger';

export default function TypedInputDebug() {
	const [data, setData] = useState<TypedInput>({
		type: TypedInputEnum.Nil,
	});

	return (
		<>
			<TypedInputField
				label="My Typed Input"
				description="This is a typed input field"
				value={data}
				onChange={(data) => {
					logger.debug('TypedInputDebug', 'TypedInput changed:', data);
					setData(data);
				}}
			/>

			<motion.div
				initial={{ opacity: 0, y: 10 }}
				animate={{ opacity: 1, y: 0 }}
				transition={{ duration: 0.5 }}
				className="mt-8 bg-gray-100 p-1"
			>
				<code className="whitespace-pre-wrap break-words text-black">
					{JSON.stringify(data, null, 2)}
				</code>
			</motion.div>
		</>
	);
}
