import { useCallback } from "react";
import { useReactFlow } from "reactflow";
import { useDispatch } from "react-redux";
import { RiDeleteBin5Line } from "react-icons/ri";
import { deleteEgde } from "../../store/reducers/reactFlowDiagram";
import CustomContextMenuButton from "../components/button/CustomContextMenuButton";

import classNames from "classnames/bind";
import styles from "./ContextMenu.module.scss";

const cn = classNames.bind(styles);

const EdgeContextMenu = ({ id, top, left, right, bottom, ...props }) => {
  const dispatch = useDispatch();
  const { setEdges } = useReactFlow();

  const deleteEdge = useCallback(() => {
    dispatch(deleteEgde([{ id }]));
    setEdges((edges) => edges.filter((edge) => edge.id !== id));
  }, [id, setEdges]);

  return (
    <div
      style={{ top, left, right, bottom }}
      className={cn("context-menu")}
      {...props}
    >
      <p style={{ margin: "0.5em" }}>
        <small>Edge: {id}</small>
      </p>
      {CustomContextMenuButton({
        text: "Delete",
        icon: <RiDeleteBin5Line />,
        func: deleteEdge,
      })}
    </div>
  );
};

export default EdgeContextMenu;
