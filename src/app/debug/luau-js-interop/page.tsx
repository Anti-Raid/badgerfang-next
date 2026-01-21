'use client';
import { useMemo, useState } from 'react';
import { Primary } from '@/components/ui/Buttons';
import { motion } from 'framer-motion';
import { InputField } from '@/components/settings/components/form-elements';
import { setupLuauVm, luauTemplate } from '@/lib/wasm/wasm';
import { DrawCmdFormList, DrawCmdList } from './settingsv2/drawcmd';
import { SettingsErrorDisplay } from '@/components/settings/components/ErrorDisplay';
import z from 'zod';
import { SettingsCanvas } from './settingsv2/Canvas';
import { CreateFormList } from './settingsv2/CreateUi';

const SettingsV2 = () => {
    const [text, setText] = useState<string>(`
[{
  "type": "formlist",
   "reorderable": true,
  "id": "example",
  "title": "Example Form List",
  "forms": [
    {
      "id": "form1",
      "label": "Form 1",
      "commands": []
    },
    {
      "id": "form2",
      "label": "Form 2",
      "commands": []
    },
    {
      "id": "form3",
      "label": "Form 3",
      "commands": [
        {
          "type": "input",
          "input": {
            "type": "text",
            "id": "input1",
            "label": "Input 1",
            "value": ""
          }
        }
      ]
    }
  ]
}]    
    `);
    const [stdout, setStdout] = useState<string>('');
    const data = useMemo(() => {
        let obj: any = {}
        try {
            obj = JSON.parse(text);
        } catch (e) {
            obj.msgerror = `Invalid JSON: ${(e as Error).message}`;
        }

        return DrawCmdList.safeParse(obj)
    }, [text]);

    return (
        <>
             <div className="bg-gray-700 text-white p-2 rounded-md mb-4">
                <InputField 
                    type="textarea"
                    id="settings-drawcmds"
                    label="Settings Draw Commands (JSON)"
                    value={text}
                    onChange={(e) => setText(e)}
                />
             </div>

            {!data.success ? (
                <SettingsErrorDisplay loadErrors={{"default": z.prettifyError(data.error)}} />
            ) : (
                <SettingsCanvas 
                    drawcmds={data.data} 
                    execAdd={(newData) => {
                        setStdout((prev) => prev + `Executed add with data: ${JSON.stringify(newData)}\n`);
                    }}
                    execEdit={(formId, data) => {
                        setStdout((prev) => prev + `Executed edit on form ${formId} with data: ${JSON.stringify(data)}\n`);
                    }}
                    execReorder={(data) => {
                        setStdout((prev) => prev + `Executed reorder with data: ${JSON.stringify(data)}\n`);
                    }}
                    execDelete={(formId) => {
                        setStdout((prev) => prev + `Executed delete on form ${formId}\n`);
                    }}
                />
            )}

            {stdout && (
                <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                    className="mt-4"
                >
                    <code className="whitespace-pre-wrap break-words bg-green-100 text-black">
                        {stdout}
                    </code>
                </motion.div>
            )}
        </>
    )
}

const SettingsV2CreateUI = () => {
    const [ui, setUi] = useState<DrawCmdFormList>({type: "formlist", id: "example", title: "Example Form List", forms: []});

    return (
        <>
            <div className="bg-gray-700 text-white p-2 rounded-md mb-4">
                <CreateFormList data={ui} setData={setUi} />
            </div>

            <pre className="bg-gray-100 text-black p-4 rounded-md mb-4">
                {JSON.stringify(ui, null, 2)}
            </pre>
        </>
    )
}

/**
 * Renders a luau text input menu for debugging JS-Luau interop on Badgerfang
 */
export default function LuauJsInteropDbj() {
	const [vfs, setVfs] = useState<Record<string, string>>({
		'init.luau': '',
		'client.luau': `return function(ctx) 
    print("Hello world " .. tostring(ctx))
end`
	});
	const [currentFile, setCurrentFile] = useState<string>('client.luau');
	const [vmId, setVmId] = useState<number | null>(null);
	const [errors, setErrors] = useState<string | null>(null);
	const [stdout, setStdout] = useState<string>('');

	return (
		<>
			<div className="p-16"></div>
			{/* Show menu of vfs files */}
			<Primary
				Title="Add File"
				onClick={() => {
					const newVfs = { ...vfs };
					newVfs[`file${Object.keys(vfs).length + 1}.luau`] = '';
					setVfs(newVfs);
					setCurrentFile(`file${Object.keys(vfs).length + 1}.luau`);
				}}
			/>

			<div className="mt-4">
				<InputField
					type="select"
					value={currentFile}
					onChange={(e) => setCurrentFile(e)}
					options={Object.keys(vfs)
						.filter((x) => x !== 'init.luau')
						.map((filename) => ({ value: filename, label: filename }))}
				/>
			</div>

			<InputField
				type="textarea"
				value={vfs[currentFile]}
				onChange={(e) => {
					const newVfs = { ...vfs };
					newVfs[currentFile] = e;
					setVfs(newVfs);
				}}
				className="w-full w-64"
			/>

			<motion.div
				initial={{ opacity: 0, y: 10 }}
				animate={{ opacity: 1, y: 0 }}
				transition={{ duration: 0.5 }}
				className="mt-8"
			>
				<code className="whitespace-pre-wrap break-words bg-gray-100 text-black">
					{JSON.stringify(vfs)}
				</code>
			</motion.div>

			<>
				<Primary
					Title="Setup Luau VM"
					onClick={async () => {
						try {
							const id = await setupLuauVm(vfs);
							setVmId(id);
							setErrors(null);
							setStdout('');
						} catch (error) {
							setErrors(error?.toString() || 'Unknown error setting up Luau VM');
						}
					}}
				/>
			</>

			{vmId !== null && (
				<>
					<motion.div
						initial={{ opacity: 0, y: 10 }}
						animate={{ opacity: 1, y: 0 }}
						transition={{ duration: 0.5 }}
						className="mt-8"
					>
						<code className="whitespace-pre-wrap break-words bg-gray-100 text-black">
							Luau VM ID: {vmId}
						</code>
					</motion.div>
					<Primary
						Title="Execute Luau VM w/ Settings Context"
						onClick={async () => {
							// No-op if vmId is null
							if (vmId === null) return;
							try {
								// For testing, just send a dummy context
								const result = await luauTemplate(vmId, {
									testKey: 'testValue',
									print: (s: any[]) => {
										setStdout((prev) => prev + `${s}!\n`);
									}
								});
								console.log('Luau Template Result:', result);
								setErrors(null);
							} catch (error) {
								console.log(error);
								setErrors(error?.toString() || 'Unknown error executing Luau template');
							}
						}}
					/>
				</>
			)}

			{errors && (
				<>
					<motion.div
						initial={{ opacity: 0, y: 10 }}
						animate={{ opacity: 1, y: 0 }}
						transition={{ duration: 0.5 }}
						className="mt-8"
					>
						<code className="whitespace-pre-wrap break-words bg-red-100 text-black">
							[ERROR] {errors}
						</code>
					</motion.div>
				</>
			)}

			{stdout && (
				<>
					<motion.div
						initial={{ opacity: 0, y: 10 }}
						animate={{ opacity: 1, y: 0 }}
						transition={{ duration: 0.5 }}
						className="mt-8"
					>
						<code className="whitespace-pre-wrap break-words bg-green-100 text-black">
							{stdout}
						</code>
					</motion.div>
				</>
			)}

            <SettingsV2CreateUI />

            <div className="p-16"></div>

            <SettingsV2 />
		</>
	);
}
