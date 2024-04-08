import React, { useEffect, useRef, useState } from "react";
import { Button, Divider, Input, Select, Space } from "antd";

import "./NodeLabel.css";

const { Option } = Select;

const defaultNodeOptions = [
  { id: 1, name: "Class" },
  { id: 2, name: "Interface" },
  { id: 3, name: "Abstract" },
  { id: 4, name: "Enum" },
  { id: 5, name: "Annotation" },
];

const NodeLabel = ({
  countNodes,
  setCountNodes,
  nodeLabels,
  setNodeLabels,
  onChangeNodeLabel,
  enteredNode,
  inputIdx,
  nodeChangeHandler,
}) => {
  const inputRef = useRef(null);
  const [nodeOptions, setNodeOptions] = useState(defaultNodeOptions);
  const [name, setName] = useState("");

  useEffect(() => {
    if (nodeLabels) {
      setNodeLabels((prev) => {
        const newNodeLabels = prev.map((nodeLabel, i) => {
          return { ...nodeLabel, idx: i };
        });
        prev = newNodeLabels.map((nodeLabel) => {
          if (enteredNode === "" && nodeLabel.idx === inputIdx) {
            nodeLabel = { ...nodeLabel, value: null };
            onChangeNodeLabel(nodeLabel, true);
            return nodeLabel;
          }
          if (nodeLabel.idx !== inputIdx) return nodeLabel;
          return { ...nodeLabel, value: enteredNode };
        });
        return [...prev];
      });
    }
  }, [enteredNode, inputIdx]);

  const onNameChange = (event) => {
    setName(event.target.value);
  };

  const addItem = (e) => {
    e.preventDefault();
    if (name) {
      setNodeOptions((prev) => {
        return (
          [{ id: nodeOptions.length + 1, name: name }, ...prev] ||
          `New item ${nodeOptions.length + 1}`
        );
      });
    }
    setName("");
    setTimeout(() => {
      inputRef.current?.focus();
    }, 0);
  };

  const onSelect = (value, index) => {
    const newNodes = countNodes.map((node, i) => {
      if (i === index) {
        return { ...node, value: value };
      }
      return node;
    });
    setCountNodes(newNodes);
    nodeChangeHandler(value, index);
  };

  const dropdownRender = (menu) => {
    return (
      <>
        {menu}
        <Divider style={{ margin: "8px 0" }} />
        <Space style={{ padding: "0 8px 4px" }}>
          <Input
            placeholder="Custom label"
            ref={inputRef}
            value={name}
            onChange={onNameChange}
          />
          <Button type="text" onClick={addItem}>
            +
          </Button>
        </Space>
      </>
    );
  };

  return (
    <div className="draw_diagram-node-label">
      {countNodes && countNodes.length > 0 && (
        <div className="draw_diagram-node-label-title">Change Node label</div>
      )}
      {countNodes &&
        countNodes.map((node, i) => {
          return (
            <div key={i} className="draw_diagram-node-label-select-wrapper">
              <div className="draw_diagram-node-label-select-index">
                {i + 1}.
              </div>
              <Select
                key={i}
                placeholder={"Select node label..."}
                style={{ width: "100%" }}
                optionFilterProp="children"
                onSelect={(value) => onSelect(value, i)}
                value={node.value}
                listHeight={200}
                dropdownRender={dropdownRender}
              >
                {nodeOptions.map((option) => {
                  return (
                    <Option key={option.id} idx={node.idx} value={option.name}>
                      {option.name}
                    </Option>
                  );
                })}
              </Select>
            </div>
          );
        })}
    </div>
  );
};
export default NodeLabel;
