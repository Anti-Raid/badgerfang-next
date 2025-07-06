'use client';

import { InputField } from '@/components/settings/components/form-elements';
import { luauTemplate } from '@/lib/wasm';
import { useEffect, useState } from 'react';

/**
 * Provides an interactive interface for entering code and viewing the processed result using a WebAssembly-powered function.
 *
 * Users can input code into a textarea, which is asynchronously processed via the `luauTemplate` function. The output or any error message is displayed below the input in real time.
 */
export default function LuauWasmTest() {
	let [value, setValue] = useState<string>('');
	let [result, setResult] = useState<string>('');

	const handleValueChange = async (newValue: string) => {
		try {
			let resp = await luauTemplate(value, { code: newValue });
			setResult(resp?.toString() || 'No result returned');
		} catch (e) {
			let err = e?.toString() || 'Unknown error';
			setResult(err);
		}
	};

	// Handle the value change when the input changes
	useEffect(() => {
		if (value) {
			handleValueChange(value);
		}
	}, [value]);

	return (
		<div className="min-h-screen">
			<InputField
				label={'Code'}
				description={'Enter the code for the column.'}
				placeholder={'Enter code here...'}
				value={value}
				disabled={false}
				onChange={(e) => setValue(e.target.value)}
				id={'code-input'}
				aria-required="true"
				type={'textarea'}
			/>

			<code className="whitespace-pre-wrap">{result}</code>
		</div>
	);
}
