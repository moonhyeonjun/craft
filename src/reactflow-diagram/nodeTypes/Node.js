import React, { memo } from "react";
import { useDispatch } from "react-redux";
import { Handle, Position, useReactFlow, useStore } from "reactflow";
import { editNode } from "../../store/reducers/reactFlowDiagram";
import { saturate } from "polished";
import classNames from "classnames/bind";
import styles from "./Node.module.scss";

const cn = classNames.bind(styles);

const SELETC_COLOR = "#a52020";

const connectionNodeIdSelector = (state) => state.connectionNodeId;

const Node = ({ id, data, color, selected }) => {
  const dispatch = useDispatch();
  const { getNode, setNodes } = useReactFlow();
  const connectionNodeId = useStore(connectionNodeIdSelector);
  const isExpandle = data?.expandable;
  const isExpanded = data?.expanded;
  const isConnecting = !!connectionNodeId;
  const isGrouped = data?.include && data.include.length > 0;

  const onChangeExpandedNode = () => {
    const currentNode = getNode(id);
    if (!currentNode) return;

    const newCurrentNode = {
      ...currentNode,
      data: { ...currentNode.data, expanded: !currentNode.data.expanded },
    };

    setNodes((nds) =>
      nds.map((n) => {
        if (n.id === currentNode.id) {
          return newCurrentNode;
        }
        return n;
      })
    );
    dispatch(editNode(newCurrentNode));
  };

  const getButtonLabel = () => {
    if (isExpandle) {
      if (isExpanded) {
        return "- collapse child node";
      } else {
        return "+ expand child node";
      }
    } else {
      return "";
    }
  };

  const reduceSaturation = (color, amount) => {
    return saturate(amount, color);
  };

  return (
    <div className={cn("io")}>
      <div
        className={cn("customNodeBody")}
        style={{
          border: selected ? `2px solid ${SELETC_COLOR}` : `2px solid ${color}`,
          background: selected
            ? `repeating-linear-gradient(45deg, ${SELETC_COLOR}, ${SELETC_COLOR} 10px, #fff 0, #fff 20px)`
            : `repeating-linear-gradient(45deg, ${color}, ${color} 10px, #fff 0, #fff 20px)`,
        }}
      >
        <span
          className={cn("custom-drag-handle")}
          style={{
            border: selected
              ? `1px solid ${SELETC_COLOR}`
              : `1px solid ${color}`,
            backgroundColor: selected
              ? reduceSaturation(SELETC_COLOR, -0.1)
              : reduceSaturation(color, -0.1),
          }}
        >
          {data.label}
        </span>
        {!isConnecting && (
          <Handle
            className={cn("customHandle")}
            position={Position.Right}
            type="source"
          />
        )}

        <Handle
          className={cn("customHandle")}
          position={Position.Left}
          type="target"
          isConnectableStart={false}
        />
      </div>
      <div className={styles.button} onClick={onChangeExpandedNode}>
        {isGrouped && <div className={styles.group}>Group</div>}
        {getButtonLabel()}
      </div>
    </div>
  );
};

export default memo(Node);
