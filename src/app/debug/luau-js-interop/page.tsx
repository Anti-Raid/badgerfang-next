'use client';
import { useState } from 'react';
import { Primary } from '@/components/ui/Buttons';
import { motion } from 'framer-motion';
import { InputField } from '@/components/settings/components/form-elements';
import { setupLuauVm, luauTemplate } from '@/lib/wasm/wasm';

/**
 * Renders a luau text input menu for debugging JS-Luau interop on Badgerfang
 */
export default function LuauJsInteropDbj() {
	const [vfs, setVfs] = useState<Record<string, string>>({
        'init.luau': "",
        'client.luau': `return function(ctx) 
    print("Hello world " .. tostring(ctx))
end`
    });
    const [currentFile, setCurrentFile] = useState<string>('client.luau');
    const [vmId, setVmId] = useState<number | null>(null);
    const [errors, setErrors] = useState<string | null>(null);
    const [stdout, setStdout] = useState<string>("");

	return (
		<>
            <div className="p-16"></div>
            {/* Show menu of vfs files */}
            <Primary
                Title="Add File"
                onClick={() => {
                    const newVfs = { ...vfs };
                    newVfs[`file${Object.keys(vfs).length + 1}.luau`] = "";
                    setVfs(newVfs);
                    setCurrentFile(`file${Object.keys(vfs).length + 1}.luau`);
                }}
            />

            <div className="mt-4">
                <InputField
                    type="select"
                    value={currentFile}
                    onChange={(e) => setCurrentFile(e)}
                    options={Object.keys(vfs).filter(x => x !== "init.luau").map((filename) => ({ value: filename, label: filename }))}
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
                            setStdout("");
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
                                const result = await luauTemplate(vmId, { testKey: "testValue", print: (s: any[]) => {
                                    setStdout((prev) => prev + `${s}!\n`);
                                } });
                                console.log("Luau Template Result:", result);
                                setErrors(null);
                            } catch (error) {
                                console.log(error)
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
		</>
	);
}
