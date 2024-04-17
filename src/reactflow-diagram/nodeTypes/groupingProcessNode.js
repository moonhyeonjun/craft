import { memo } from "react";
import { NodeResizer, useReactFlow } from "reactflow";
import { useDispatch } from "react-redux";
import { editNode } from "../../store/reducers/reactFlowDiagram";
import Node from "./Node";

const GroupingProcessNode = ({ id, data, selected }) => {
  const dispatch = useDispatch();
  const { getNode, setNodes } = useReactFlow();

  const color = "#000000";

  const onResizeEnd = (event, params) => {
    const { x, y, width, height } = params;
    const node = getNode(id);
    if (!node) return;
    dispatch(
      editNode({
        ...node,
        position: {
          x,
          y,
        },
        style: {
          ...node.style,
          width,
          height,
        },
      })
    );
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

export default memo(GroupingProcessNode);
