'use client';

import { InputField } from "@/components/settings/components/form-elements";
import { luauTemplate } from "@/lib/wasm";
import { useEffect, useState } from "react";

/**
 * Renders the Developers Dashboard page, restricting access to authorized users.
 *
 * Wraps the {@link Dashboard} component in a {@link ProtectedRoute} to ensure only authenticated users can view the dashboard.
 */
export default function LuauWasmTest() {
    let [value, setValue] = useState<string>('');

    const handleValueChange = async (newValue: string) => {
        let resp = await luauTemplate(value, { code: newValue })
        console.log(resp);
    }

    // Handle the value change when the input changes
    useEffect(() => {
        if (value) {
            handleValueChange(value);
        }
    }, [value])

    return (
        <div className="min-h-screen">
            <InputField
                label={"Code"}
                description={"Enter the code for the column."}
                placeholder={"Enter code here..."}
                value={value}
                disabled={false}
                onChange={(e) => setValue(e.target.value)}
                id={"code-input"}
                aria-required="true"
                type={"textarea"}
            />            
        </div>
    );
}
