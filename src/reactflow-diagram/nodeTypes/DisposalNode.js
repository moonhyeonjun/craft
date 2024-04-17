import { memo } from "react";
import { NodeResizer, useReactFlow } from "reactflow";
import Node from "./Node";

const DisposalNode = ({ id, data, selected }) => {
  const { getNode, setNodes } = useReactFlow();

  const color = "#FFA222";

  const onResizeEnd = () => {
    const node = getNode(id);
    if (!node) return;
    setNodes((nodes) => nodes);
  };

  return (
    <>
      <NodeResizer
        color={color}
        isVisible={selected}
        minWidth={120}
        minHeight={100}
        onResizeEnd={onResizeEnd}
      />
      <Node id={id} data={data} color={color} selected={selected} />
    </>
  );
};

export default memo(DisposalNode);
