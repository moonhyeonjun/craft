import React, { useState } from "react";
import { Button } from "antd";

import "./NodeCount.css";

const defaults = {
  count: 3,
};

const NodeCount = ({ onChange }) => {
  const [state, setState] = useState(defaults);
  const notifyChange = () => {
    onChange(state);
  };

  const onCountChanged = (count) => {
    setState({ ...state, count });
    notifyChange();
  };

  const onCountPlus = () => {
    const maxCount = 5;
    const count = Math.min(state.count + 1, maxCount);
    return count;
  };

  const onCountMinus = () => {
    const minCount = 2;
    const count = Math.max(state.count - 1, minCount);
    return count;
  };

  return (
    <div className="draw_diagram-node-count">
      <div className="draw_diagram-node-count-header">Change Node Count</div>
      <div className="draw_diagram-node-count-button-container">
        <Button onClick={() => onCountChanged(onCountMinus())}>-</Button>
        <Button onClick={() => onCountChanged(onCountPlus())}>+</Button>
      </div>
    </div>
  );
};

export default NodeCount;
