import React, { useCallback } from "react";
import { useReactFlow } from "reactflow";
import { AiOutlineSelect } from "react-icons/ai";
import CustomContextMenuButton from "../components/button/CustomContextMenuButton";

import classNames from "classnames/bind";
import styles from "./ContextMenu.module.scss";
const cn = classNames.bind(styles);

const PaneContextMenu = ({ top, left, right, bottom, ...props }) => {
  const { getNodes, setNodes } = useReactFlow();

  const selectAll = useCallback(() => {
    setNodes((nodes) =>
      nodes.map((n) => ({
        ...n,
        selected: true,
      }))
    );
  }, [getNodes]);

  return (
    <div
      style={{ top, left, right, bottom }}
      className={cn("context-menu")}
      {...props}
    >
      {CustomContextMenuButton({
        text: "Select All",
        icon: <AiOutlineSelect />,
        func: selectAll,
      })}
    </div>
  );
};

export default PaneContextMenu;
