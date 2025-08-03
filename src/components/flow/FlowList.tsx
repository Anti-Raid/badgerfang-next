import { FlowData } from '@/lib/flow/data';
import { Ghost } from '../ui/Buttons';
import Flow from './FlowPage';
import { findStartNode, getStartNodeTitle } from '@/lib/flow/startnode';
import { Fragment } from 'react';

interface Props {
    /**
     * Flow data to be displayed and edited. This will ultimately compile down to Luau
     */
    flowDatas: FlowData[];
    /**
     * On change handler that is called whenever the flow data changes.
     */
    onChange: (data: FlowData[]) => void;
    /**
     * Currently selected flow data index.
     */
    selectedFlowIndex: number;
    /**
     * Changes the currently selected flow data index.
     */
    setSelectedFlowIndex: (index: number) => void;
    /**
     * Add a new flow data entry to the list.
     */
    addFlowData: () => void;
}

export default function FlowList({ flowDatas, onChange, selectedFlowIndex, setSelectedFlowIndex, addFlowData }: Props) {    
    return (
        <>
            <div className="flow-lister-ui">
                {/** UI to list and select flows */}
                <p>Selected flow index: {selectedFlowIndex} </p>
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-lg font-semibold">Flows</h2>
                    {flowDatas.map((flowData, index) => {
                        const startNode = findStartNode(flowData.nodes)
                        return (
                            <Fragment key={index}>
                                <div>
                                    <Ghost
                                        key={index}
                                        Title={startNode ? getStartNodeTitle(startNode) : `Flow ${index + 1}`}
                                        onClick={() => setSelectedFlowIndex(index)}
                                    />
                                </div>
                            </Fragment>
                        )
                    })}

                    <Ghost 
                        Title="New Flow"
                        onClick={addFlowData}
                        className="text-[#6e6a95]"
                    />
                </div>
            </div>
            {/* Create flow button */}

            {(selectedFlowIndex > 0 || selectedFlowIndex < flowDatas.length) && (
                <Flow 
                    key={selectedFlowIndex}
                    flowData={flowDatas[selectedFlowIndex]} 
                    onChange={(data) => {
                        // Insert change into index
                        const newData = [...flowDatas];
                        newData[selectedFlowIndex] = data
                        onChange(newData);
                    }}
                />
            )}
        </>
    );
}
