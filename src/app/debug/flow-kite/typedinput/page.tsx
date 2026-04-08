'use client';
import { useState } from 'react';
import { TypedInput, TypedInputEnum } from '@/lib/flow/data';
import { TypedInputField } from '@/components/flow/ui/TypedInput';
import logger from '@/lib/logger';

/**
 * Renders an interactive debug view for a TypedInput value and shows its JSON representation.
 *
 * The component displays a typed input field bound to local state and a code block
 * that updates to reflect the current value as pretty-printed JSON.
 *
 * @returns A React element containing the TypedInputField and a JSON display of its value.
 */
export default function TypedInputDebug() {
	const [data, setData] = useState<TypedInput>({
		type: TypedInputEnum.Nil
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

			<div className="mt-8 bg-gray-100 p-1 animate-in fade-in-0 slide-in-from-bottom-2 duration-500">
				<code className="whitespace-pre-wrap break-words text-black">
					{JSON.stringify(data, null, 2)}
				</code>
			</div>
		</>
	);
}
