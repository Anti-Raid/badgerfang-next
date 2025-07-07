'use client';
import { motion } from 'framer-motion';
import { FaDiscord } from 'react-icons/fa';
import Head from 'next/head';
import { useEffect, useRef, useState } from 'react';
import { BlockBuilder } from '@/lib/blockbuilder/init';
import { Primary } from '@/components/ui/Buttons';

export default function Blockly() {
    const divRef = useRef<HTMLDivElement>(null);
    const blocklyInstanceRef = useRef<BlockBuilder | null>(null);
    const [code, setCode] = useState<string>("");

    useEffect(() => {
        console.log("Initializing Blockly workspace");
        if(divRef && !blocklyInstanceRef.current) {
            blocklyInstanceRef.current = (new BlockBuilder(divRef.current!));
        }

        return () => {
            console.log("Disposing workspace", blocklyInstanceRef.current);
            if(blocklyInstanceRef.current) {
                blocklyInstanceRef.current.close();
                blocklyInstanceRef.current = null; // Clear the reference
                setCode(""); // Clear the code
            }
        }
    }, []);

    return (
        <>
            <div ref={divRef}>
            </div>

            <Primary 
                Title="Generate Code"
                onClick={() => {
                    setCode(blocklyInstanceRef?.current?.toCode() || "");
                }}
            />
            <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="mt-8"
            >
                <code className="whitespace-pre-wrap break-words p-4 bg-gray-100 rounded-lg mt-4">{code}</code>
            </motion.div>
        </>
    );
}
