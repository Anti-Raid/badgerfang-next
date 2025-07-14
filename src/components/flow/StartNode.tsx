import { FlowContext } from "@/lib/flow/context";
import { CommandArgumentType, commandArgumentTypeToString, NodeData, NodeProps, NodeTypeEnum, registerValidationSource, registerValidationTarget, stringToCommandArgumentType } from "@/lib/flow/data";
import logger from "@/lib/logger";
import { Connection, Edge, Node, Position } from "@xyflow/react";
import { useContext, useEffect, useMemo, useState } from "react";
import FlowNodeBase from "./BaseNode";
import Handle from "./Handle";
import { FlowExpanded } from "./FlowExpanded";
import { InputField, Toggle } from "./Inputs";

// Static validation for Library: Only have one target connection.
registerValidationSource("library", (svi: FlowContext, srcCons: string[], tgtCons: string[], edge: Edge | Connection, source: Node<NodeData>, target: Node<NodeData>) => {
    if(srcCons.length >= 1) {
        logger.error("Flow.Library", "Library can only have one target connection.");
        return false;
    }

    return true;
});

// Static validation for Command: Only have one target connection.
registerValidationSource("command", (svi: FlowContext, srcCons: string[], tgtCons: string[], edge: Edge | Connection, source: Node<NodeData>, target: Node<NodeData>) => {
    if(srcCons.length >= 1) {
        logger.error("Flow.Command", "Command can only have one target connection.");
        return false;
    }

    return true;
});

// Static validation for Command: Can only have a source of CommandArgument.
registerValidationTarget("command", (svi: FlowContext, srcCons: string[], tgtCons: string[], edge: Edge | Connection, source: Node<NodeData>, target: Node<NodeData>) => {
    let data = svi.getData(source.id);
    if (!data || data.type !== NodeTypeEnum.CommandArgumentNode) {
        logger.error("Flow.Command", "Command can only have a source of CommandArgument.");
        return false;
    }

    return true;
});

export const Library = (props: NodeProps) => {
  const svi = useContext(FlowContext);
  const currentData = useMemo(() => svi.getData(props.id), [svi, props.id]);

  if(currentData?.type != NodeTypeEnum.LibraryNode) {
    return <div className="text-red-500">Invalid node type: {currentData?.type}</div>;
  }

  return (
    <FlowNodeBase {...props}>
        <Handle type="source" position={Position.Bottom} />
    </FlowNodeBase>
  );
}

export const Command = (props: NodeProps) => {
  const svi = useContext(FlowContext);
  const currentData = useMemo(() => svi.getData(props.id), [svi, props.id]);

  if(currentData?.type != NodeTypeEnum.CommandNode) {
    return <div className="text-red-500">Invalid node type: {currentData?.type}</div>;
  }

  const [name, setName] = useState(currentData?.data.name || "");
  const [description, setDescription] = useState(currentData?.data.description || "");

  useEffect(() => {
    svi.setData(props.id, {
        ...currentData,
        data: {
            ...currentData.data,
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
registerValidationSource("command_argument", (svi: FlowContext, srcCons: string[], tgtCons: string[], edge: Edge | Connection, source: Node<NodeData>, target: Node<NodeData>) => {
    if(srcCons.length >= 1) {
        logger.error("Flow.CommandArgument", "Command can only have one target connection.");
        return false;
    }

    let data = svi.getData(target.id);
    if (!data || data.type !== NodeTypeEnum.CommandNode) {
        console.log(data.type)
        logger.error("Flow.CommandArgument", "CommandArgument can only be used as a target node.");
        return false;
    }

    return true;
});

export const CommandArgument = (props: NodeProps) => {
  const svi = useContext(FlowContext);
  const currentData = useMemo(() => svi.getData(props.id), [svi, props.id]);

  if(currentData?.type != NodeTypeEnum.CommandArgumentNode) {
    return <div className="text-red-500">Invalid node type: {currentData?.type}</div>;
  }

  const [name, setName] = useState(currentData?.data.name || "");
  const [description, setDescription] = useState(currentData?.data.description || "");
  const [type, setType] = useState(currentData?.data.type || CommandArgumentType.String);
  const [required, setRequired] = useState(currentData?.data.required || false);

  useEffect(() => {
    svi.setData(props.id, {
        ...currentData,
        data: {
            ...currentData.data,
            name: name,
            description: description,
            type: type,
            required: required
        }
    });
  }, [name, description, type, required, props.id]);

  return (
    <FlowNodeBase {...props} title={currentData?.data.name ? `${currentData?.data.name} (${currentData?.data.type})` : "Command Argument"}>
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