import { memo, useState, useEffect } from "react";
import { NodeResizer } from "reactflow";
import Node from "./Node";

const ProcessNode = ({ id, data, selected }) => {
  const [color, setColor] = useState("#99a21a");

  useEffect(() => {
    const intervalId = setInterval(() => {
      const isOddTime = Math.floor(Date.now() / 1000) % 2;
      const randomColor = isOddTime ? "#5b6010" : "#99a21a";
      setColor(randomColor);
    }, 500);

    return () => clearInterval(intervalId);
  }, []);

  return (
    <>
      <NodeResizer
        color={color}
        isVisible={selected}
        minWidth={120}
        minHeight={100}
      />
      <Node id={id} data={data} color={color} />
    </>
  );
};

export default memo(ProcessNode);
