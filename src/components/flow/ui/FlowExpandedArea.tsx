import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiLayers, FiZap, FiChevronDown, FiChevronUp } from 'react-icons/fi';
import { NodeValues } from '@/lib/flow/nodes';
import SubflowSection from './typedinputflow/SubflowSection';

/**
 * FlowExpandedArea
 *
 * Collapsible horizontal panel where expanded flows will show up in.
 */
export default function FlowExpandedArea() {
    const [isCollapsed, setIsCollapsed] = useState(false);
    const [testData, setTestData] = useState({
        nodes: [],
        edges: []
    });
    const [children, setChildren] = useState<React.ReactNode>(
        <>
            <SubflowSection flowData={testData} onChange={setTestData} id="test-subflow" />
        </>
    );

    return (
        <motion.div
            initial={false}
            animate={{ height: isCollapsed ? 70 : "100%", width: "100%" }}
            className="w-full bg-muted/30 border-r border-border flex flex-col relative shadow-xl"
        >
            {/* Collapse Button */}
            <button
                onClick={() => setIsCollapsed(!isCollapsed)}
                className="absolute -left-1 top-6 z-50 h-6 w-6 rounded-full bg-primary hover:bg-primary/80 flex items-center justify-center shadow-lg transition-colors duration-200"
            >
                {isCollapsed ? (
                    <FiChevronDown className="text-primary-foreground w-4 h-4" />
                ) : (
                    <FiChevronUp className="text-primary-foreground w-4 h-4" />
                )}
            </button>

            <AnimatePresence mode="wait">
                {!isCollapsed ? (
                    <>
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="flex flex-row w-full"
                        >
                            {/* Header */}
                            <div className="p-6 py-3 border-b border-border">
                                <div className="flex items-center gap-3 mb-2">
                                    <div className="p-2 rounded-lg bg-primary/10">
                                        <FiLayers className="w-5 h-5 text-primary" />
                                    </div>
                                    <h2 className="text-xl font-bold text-foreground">Editting INSERT_NAME_HERE</h2>
                                </div>
                                <p className="text-sm text-muted-foreground">INSERT_DESCRIPTION_HERE</p>
                            </div>
                        </motion.div>
                        {/* Content */}
                        <div className="flex-1 overflow-x-auto p-2 space-y-6">
                            {children}
                        </div>
                    </>
                ) : (
                    <>
                        <motion.div 
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="flex flex-row w-full"
                        >
                            {/* Header */}
                            <div className="p-6 py-3 border-b border-border">
                                <div className="flex items-center gap-3 mb-2">
                                    <div className="p-2 rounded-lg bg-primary/10">
                                        <FiLayers className="w-5 h-5 text-primary" />
                                    </div>
                                    <h2 className="text-xl font-bold text-foreground">Expand Area</h2>
                                </div>
                            </div>
                        </motion.div>
                    </>
                )}
            </AnimatePresence>
        </motion.div>
    );
}

/**
 * Draggable node card
 */
function AvailableNode({ type, values }: { type: string; values: NodeValues }) {
    const Icon = FiZap;

    function onStartDrag(e: React.DragEvent<HTMLDivElement>) {
        e.dataTransfer.setData('application/reactflow', type);
        e.dataTransfer.effectAllowed = 'move';
    }

    return (
        <div
            draggable
            onDragStart={onStartDrag}
            className="p-3 rounded-lg bg-card/50 hover:bg-card border border-border hover:border-primary/50 cursor-grab transition-all duration-200 backdrop-blur-sm"
        >
            <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-primary/10">
                    <Icon className="w-4 h-4 text-primary" />
                </div>
                <div className="flex-1 min-w-0">
                    <div className="font-medium text-foreground text-sm truncate">{values.defaultTitle}</div>
                    <div className="text-xs text-muted-foreground truncate">{values.defaultDescription}</div>
                </div>
            </div>
        </div>
    );
}
