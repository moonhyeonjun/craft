import React, { useRef, useId } from "react";
import { useDispatch } from "react-redux";
import { useReactFlow } from "reactflow";
import { Modal, Input } from "antd";
import { FaRegObjectUngroup, FaRegObjectGroup } from "react-icons/fa";
import { BiEdit } from "react-icons/bi";
import { RiDeleteBin5Line } from "react-icons/ri";
import { toast } from "react-toastify";
import * as reducerSlice from "../../store/reducers/reactFlowDiagram";
import { defaultEdgeOptions } from "../constants/defaultEdgeOptions";
import { Lifecycle } from "../constants/lifecycle";
import { store } from "../../store/index";
import CustomContextMenuButton from "../components/button/CustomContextMenuButton";

import classNames from "classnames/bind";
import styles from "./ContextMenu.module.scss";

const cn = classNames.bind(styles);

const NodeContextMenu = ({ id, top, left, right, bottom, ...props }) => {
  const uuid = useId();
  const dispatch = useDispatch();
  const inputRef = useRef(null);
  const { getNodes, getNode, setNodes, getEdges, setEdges } = useReactFlow();
  const { nodes, lifecycleGroups, selectedNodes } =
    store.getState().reactFlowDiagram;

  const deleteProcess = () => {
    const node = getNode(id);

    if (!node) return;
    if (node.type === "Grouping") {
      return toast.error("Please release the group before deleting.");
    }

    Modal.confirm({
      title: "Delete Process",
      content: "Are you sure you want to delete it?",
      onOk() {
        deleteProcessHandler();
      },
      onCancel() {
        console.log("Cancel");
      },
    });
  };

  const deleteProcessHandler = () => {
    setNodes((nodes) => nodes.filter((node) => node.id !== id));
    setEdges((edges) => edges.filter((edge) => edge.source !== id));
  };

  const changeProcessNameModal = () => {
    const node = getNode(id);
    if (node === undefined) return;

    let data = node.data.label;

    const onPressEnter = (e) => {
      if (e.key === "Enter") {
        Modal.destroyAll();
        changeProcessName(node, data);
      }
    };

    Modal.info({
      title: "Edit Process Name",
      content: (
        <Input
          ref={inputRef}
          onChange={(e) => (data = e.target.value)}
          onPressEnter={onPressEnter}
          placeholder={node.data.label}
        />
      ),
      onOk() {
        changeProcessName(node, data);
      },
      onCancel() {
        console.log("Cancel");
      },
    });

    setTimeout(() => {
      inputRef.current?.focus({
        cursor: "start",
      });
    }, 100);
  };

  const changeProcessName = (node, data) => {
    const newNode = {
      ...node,
      data: {
        ...node.data,
        label: data,
      },
      processName: data,
    };

    node.type === "Grouping"
      ? dispatch(reducerSlice.editGroupingNodes(newNode))
      : dispatch(reducerSlice.editNode(newNode));

    setNodes((nodes) =>
      nodes.map((n) => {
        return n.id === id ? newNode : n;
      })
    );
  };

  const groupingProcess = () => {
    if (selectedNodes.length < 2)
      return toast.error("Please select more than 2 nodes");

    const isGrouping = selectedNodes.some((node) => node.type === "Grouping");

    if (isGrouping) return toast.error("The process is already grouped.");

    const position = selectedNodes.map((node) => {
      return node.position;
    });

    const maxX = Math.max(...position.map((pos) => pos.x));
    const minX = Math.min(...position.map((pos) => pos.x));
    const maxY = Math.max(...position.map((pos) => pos.y));
    const minY = Math.min(...position.map((pos) => pos.y));

    const x = (maxX + minX) / 2;
    const y = (maxY + minY) / 2;

    const nodes = getNodes();
    const selectedNodeIds = selectedNodes.map((node) => node.id);

    const includedNodes = [];
    const excludedNodes = [];

    nodes.forEach((node) => {
      if (selectedNodeIds.includes(node.id)) {
        includedNodes.push(node);
      } else {
        excludedNodes.push(node);
      }
    });

    // id는 selectedNodes들의 id값을 합친 값
    const id = selectedNodes.map((node) => node.id).join("-");

    const newNodes = {
      id,
      data: { label: "Grouping", include: selectedNodes },
      position: { x, y },
      type: "Grouping",
      dataCategory: "Grouping",
      style: {
        width: 120,
        height: 100,
      },
      zIndex: 9999,
    };

    const edges = getEdges();

    const newEdges = [];

    edges.forEach((edge) => {
      if (
        selectedNodeIds.includes(edge.source) &&
        selectedNodeIds.includes(edge.target)
      )
        return;

      if (selectedNodeIds.includes(edge.source)) {
        newEdges.push({
          id: `edge-${uuid}`,
          source: newNodes.id,
          target: edge.target,
          ...defaultEdgeOptions,
        });
      }

      if (selectedNodeIds.includes(edge.target)) {
        const node = getNode(edge.source);
        if (!node) return;
        const edgeColor = Lifecycle.find(
          (lifecycle) => lifecycle.type === node.type
        )?.color;

        newEdges.push({
          id: `edge-${uuid}`,
          source: edge.source,
          target: newNodes.id,
          style: { ...defaultEdgeOptions.style, stroke: edgeColor },
          markerEnd: {
            ...defaultEdgeOptions.markerEnd,
            color: edgeColor,
          },
        });
      }
    });

    setNodes([...excludedNodes, newNodes]);
    setEdges([...edges, ...newEdges]);
    dispatch(reducerSlice.addGroupingNodes(newNodes));
    dispatch(reducerSlice.deleteNode(includedNodes));
    dispatch(reducerSlice.saveEdge([...edges, ...newEdges]));
  };

  const ungroupingProcess = () => {
    const node = getNode(id);
    if (!node) return;

    const edges = getEdges();

    const includedNodes = node.data.include.map((n) => ({
      ...n,
      selected: true,
    }));
    const includedNodesId = includedNodes.map((n) => n.id);
    const excluededNodes = nodes
      .filter((n) => !includedNodesId.includes(n.id) && n.id !== id)
      .map((n) => ({
        ...n,
        selected: false,
      }));

    const edgeIds = edges.filter(
      (edge) => edge.source === id || edge.target === id
    );

    setEdges(edges);
    setNodes([...lifecycleGroups, ...excluededNodes, ...includedNodes]);
    dispatch(reducerSlice.changeSelectedNodes(includedNodes));
    dispatch(reducerSlice.saveNode([...excluededNodes, ...includedNodes]));
    dispatch(reducerSlice.deleteGroupingNodes(node));
    dispatch(reducerSlice.deleteEgde(edgeIds));
  };

  return (
    <div
      style={{ top, left, right, bottom }}
      className={cn("context-menu")}
      {...props}
    >
      <p style={{ margin: "0.5em" }}>
        <small>Process: {id}</small>
      </p>
      {CustomContextMenuButton({
        text: "Change Process Name",
        icon: <BiEdit />,
        func: changeProcessNameModal,
        divider: true,
      })}
      {CustomContextMenuButton({
        text: "Delete Process",
        icon: <RiDeleteBin5Line />,
        func: deleteProcess,
        divider:
          (getNode(id) && getNode(id)?.type === "Grouping") ||
          (selectedNodes.length > 1 &&
            selectedNodes.some((node) => node.id === id))
            ? true
            : false,
      })}
      {getNode(id) &&
        selectedNodes.length > 1 &&
        selectedNodes.some((node) => node.id === id) && (
          <>
            {CustomContextMenuButton({
              text: "Group",
              icon: <FaRegObjectGroup />,
              func: groupingProcess,
            })}
          </>
        )}

      {getNode(id) && getNode(id)?.type === "Grouping" && (
        <>
          {CustomContextMenuButton({
            text: "Ungroup",
            icon: <FaRegObjectUngroup />,
            func: ungroupingProcess,
          })}
        </>
      )}
    </div>
  );
};

export default NodeContextMenu;
