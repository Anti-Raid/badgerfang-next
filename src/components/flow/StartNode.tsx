import { FlowContext } from "@/lib/flow/context";
import { CommandArgumentType, commandArgumentTypeToString, NodeData, NodeProps, NodeTypeEnum, registerValidationSource, registerValidationTarget, stringToCommandArgumentType } from "@/lib/flow/data";
import logger from "@/lib/logger";
import { Connection, Edge, Node, Position, useReactFlow } from "@xyflow/react";
import { useEffect, useState } from "react";
import FlowNodeBase from "./BaseNode";
import Handle from "./Handle";
import { FlowExpanded } from "./FlowExpanded";
import { InputField, Toggle } from "./Inputs";

// Static validation for Library: Only have one target connection.
registerValidationSource("library", (srcCons: string[]) => {
    if(srcCons.length >= 1) {
        logger.error("Flow.Library", "Library can only have one target connection.");
        return false;
    }

    return true;
});

// Static validation for Command: Only have one target connection.
registerValidationSource("command", (srcCons: string[]) => {
    if(srcCons.length >= 1) {
        logger.error("Flow.Command", "Command can only have one target connection.");
        return false;
    }

    return true;
});

// Static validation for Command: Can only have a source of CommandArgument.
registerValidationTarget("command", (srcCons: string[], tgtCons: string[], edge: Edge | Connection, source: Node<NodeData>, target: Node<NodeData>, getNodes) => {
    let data = getNodes(source.id);
    if (!data || data.data.type !== NodeTypeEnum.CommandArgumentNode) {
        logger.error("Flow.Command", "Command can only have a source of CommandArgument.");
        return false;
    }

    return true;
});

export const Library = (props: NodeProps) => {
  if(props?.data?.type != NodeTypeEnum.LibraryNode) {
    return <div className="text-red-500">Invalid node type: {props?.data?.type}</div>;
  }

  return (
    <FlowNodeBase {...props}>
        <Handle type="source" position={Position.Bottom} />
    </FlowNodeBase>
  );
}

export const Command = (props: NodeProps) => {
  if(props?.data?.type != NodeTypeEnum.CommandNode) {
    return <div className="text-red-500">Invalid node type: {JSON.stringify(props.data)}</div>;
  }

  const flow = useReactFlow();
  const [name, setName] = useState(props.data.data.name || "");
  const [description, setDescription] = useState(props.data.data.description || "");

  useEffect(() => {
    flow.updateNodeData(props.id, {
      data: {
        name: name,
        description: description
      }
    });
  }, [name, description, props.id]);

  return (
    <FlowNodeBase {...props}>
        <Handle type="target" position={Position.Top} />
        <Handle type="source" position={Position.Bottom} />

        <FlowExpanded nodeProps={props}>
          <InputField 
              id={`${props.id}-name`}
              label="Name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Enter name"
              className="w-full"
              error={!name ? "Name is required." : ""}
          /> 
          <InputField 
              id={`${props.id}-description`}
              label="Description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Enter description"
              className="w-full"
          /> 
        </FlowExpanded>
    </FlowNodeBase>
  );
}

// Static validation for CommandArgument: Can only have a target of Command.
registerValidationSource("command_argument", (srcCons: string[], tgtCons: string[], edge: Edge | Connection, source: Node<NodeData>, target: Node<NodeData>, getNodes) => {
    if(srcCons.length >= 1) {
        logger.error("Flow.CommandArgument", "Command can only have one target connection.");
        return false;
    }

    let data = getNodes(target.id);
    if (!data || data.data.type !== NodeTypeEnum.CommandNode) {
        logger.error("Flow.CommandArgument", "CommandArgument can only be used as a target node.");
        return false;
    }

    return true;
});

export const CommandArgument = (props: NodeProps) => {
  if(props?.data?.type != NodeTypeEnum.CommandArgumentNode) {
    return <div className="text-red-500">Invalid node type: {props?.data?.type}</div>;
  }

  const flow = useReactFlow();
  const [name, setName] = useState(props.data.data.name || "");
  const [description, setDescription] = useState(props.data.data.description || "");
  const [type, setType] = useState(props.data.data.type || CommandArgumentType.String);
  const [required, setRequired] = useState(props.data.data.required || false);

  useEffect(() => {
    flow.updateNodeData(props.id, {
      data: {
        name: name,
        description: description,
        type: type,
        required: required
      }
    });
  }, [name, description, type, required, props.id]);

  return (
    <FlowNodeBase {...props} title={props.data.data.name ? `${props.data.data.name} (${props.data.data.type})` : "Command Argument"}>
        <Handle type="source" position={Position.Bottom} />

        <FlowExpanded nodeProps={props}>
          <InputField 
              id={`${props.id}-name`}
              label="Name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Enter variable name"
              className="w-full"
              error={!name ? "Name is required." : ""}
          /> 

          <InputField 
              id={`${props.id}-description`}
              label="Description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Enter variable name"
              className="w-full"
          /> 

          <InputField 
              id={`${props.id}-type`}
              label="Type"
              value={commandArgumentTypeToString(type)}
              onChange={(e) => setType(stringToCommandArgumentType(e.target.value))}
              placeholder="Enter variable name"
              className="w-full"
              type="select"
              options={[
                { value: CommandArgumentType.String, label: "String (Text)" },
                { value: CommandArgumentType.Integer, label: "Integer" },
                { value: CommandArgumentType.Boolean, label: "Boolean" },
                { value: CommandArgumentType.User, label: "User" },
                { value: CommandArgumentType.Channel, label: "Channel" },
                { value: CommandArgumentType.Role, label: "Role" },
                { value: CommandArgumentType.Member, label: "Member" },
              ]}
          /> 

          <Toggle 
            label="Required"
            checked={required}
            onChange={() => setRequired(!required)}
            description="Whether this argument is required for the command to execute."
          />
        </FlowExpanded>
    </FlowNodeBase>
  );
}