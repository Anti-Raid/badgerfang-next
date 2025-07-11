// Originated from Kite
// SPDX: GPL-3.0
import { NodeValues, nodeTypes } from "@/lib/flow/nodes";
import clsx from "clsx";
import { DragEvent, useMemo, useState } from "react";
import { useReactFlow } from "@xyflow/react";
import { getNodeId } from "@/lib/flow/nodes";

const nodeCategories = {
  action: [
    {
      title: "Commands",
      nodeTypes: [
      ],
    },
    {
      title: "Discord",
      nodeTypes: [],
    },
    {
      title: "Key-Value",
      nodeTypes: [
      ],
    },
    {
      title: "Other Actions",
      nodeTypes: ["custom_code"],
    },
  ],
  control_flow: [
    {
      title: "Conditions",
      nodeTypes: ["set_variable", "if_condition", "elseif_condition", "end_condition"],
      
    },
    {
      title: "Loops",
      nodeTypes: ["for_loop"],
      
    },
    {
      title: "Others",
      nodeTypes: [],
      
    },
  ],
};

type NodeCategory = keyof typeof nodeCategories;

export default function FlowNodeExplorer() {
  const [category, setCategory] = useState<NodeCategory>("action");

  const sections = useMemo(() => {
    const sections = nodeCategories[category];
    if (!sections) return [];

    return sections
  }, [category]);

  return (
    <div className="w-30 h-full flex flex-col">
      <NodeCategories category={category} setCategory={setCategory} />
      <div className="flex-auto mr-1">
        <div className="space-y-3 pl-2 pr-1 pb-5">
          {sections.map((section, i) => (
            <div key={i}>
              <div className="text-foreground font-medium mb-2 px-1">
                {section.title}
              </div>
              <div className="space-y-2">
                {section.nodeTypes.map((type) => (
                  <AvailableNode
                    key={type}
                    type={type}
                    values={nodeTypes[type]}
                  />
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      <h1 className="flex text-lg px-4 justify-between">Nodes</h1>
      <div className="flex-none px-4 py-1 text-sm text-muted-foreground">
        Current nodes.
      </div>
    </div>
  );
}

function NodeCategories({
  category,
  setCategory,
}: {
  category: NodeCategory;
  setCategory: (tab: NodeCategory) => void;
}) {
  return (
    <div className="flex space-x-3 text-lg mb-3 px-5 justify-between text-muted-foreground border-b-2 border-dark-5">
      <div onClick={() => setCategory("action")} className="cursor-pointer">
        <div
          className={clsx(
            "pb-2 px-3 hover:text-foreground",
            category === "action" && "text-foreground"
          )}
        >
          Actions
        </div>
        <div
          className={clsx("h-1 rounde", category === "action" && "bg-primary")}
        ></div>
      </div>
      <div
        onClick={() => setCategory("control_flow")}
        className="cursor-pointer"
      >
        <div
          className={clsx(
            "pb-2 px-3 hover:text-foreground",
            category === "control_flow" && "text-foreground"
          )}
        >
          Control Flow
        </div>
        <div
          className={clsx(
            "h-1 rounde",
            category === "control_flow" && "bg-primary"
          )}
        ></div>
      </div>
    </div>
  );
}

function AvailableNode({ type, values }: { type: string; values: NodeValues }) {
  function onStartDrag(e: DragEvent) {
    e.dataTransfer.setData("application/reactflow", type);
    e.dataTransfer.effectAllowed = "move";
  }

  return (
    <div
      className="p-1 hover:bg-muted rounded-md relative select-none cursor-grab"
      onDragStart={onStartDrag}
      draggable
    >
      <div className="flex items-start space-x-3">
        <div className="overflow-hidden">
          <div className="font-medium text-foreground leading-5 mb-1 truncate">
            {values.defaultTitle}
          </div>
          <div className="text-sm text-muted-foreground">
            {values.defaultDescription}
          </div>
        </div>
      </div>
    </div>
  );
}