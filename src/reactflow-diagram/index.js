import { useState, useEffect, useCallback, useRef } from "react";
import ReactFlow, {
  ReactFlowProvider,
  useNodesState,
  useEdgesState,
  addEdge,
  useOnSelectionChange,
  useReactFlow,
} from "reactflow";
import { useDispatch, useSelector } from "react-redux";
import * as reducerSlice from "../store/reducers/reactFlowDiagram";
import { defaultEdgeOptions } from "./constants/defaultEdgeOptions";
import { Lifecycle } from "./constants/lifecycle";
import RawMaterialsNode from "./nodeTypes/RawMaterialsNode";
import ManufacturingNode from "./nodeTypes/ManufacturingNode";
import TransportNode from "./nodeTypes/TransportNode";
import UseNode from "./nodeTypes/UseNode";
import DisposalNode from "./nodeTypes/DisposalNode";
import groupingProcessNode from "./nodeTypes/groupingProcessNode";
import LifecycleGroupNode from "./nodeTypes/LifecycleGroupNode";
import ProcessNode from "./nodeTypes/ProcessNode";
import FloatingEdge from "./edgeTypes/FloatingEdge";
import FloatingConnectionLine from "./edgeTypes/FloatingConnectionLine";
import NodeContextMenu from "./contextMenu/NodeContextMenu";
import EdgeContextMenu from "./contextMenu/EdgeContextMenu";
import PaneContextMenu from "./contextMenu/PaneContextMenu";
import Shortcut from "./shortcut";
import styles from "./index.module.scss";
import classNames from "classnames/bind";

import "reactflow/dist/style.css";

const cn = classNames.bind(styles);

const nodeTypes = {
  "Raw materials": RawMaterialsNode,
  Manufacturing: ManufacturingNode,
  Transport: TransportNode,
  Use: UseNode,
  Disposal: DisposalNode,
  Group: LifecycleGroupNode,
  Grouping: groupingProcessNode,
  Process: ProcessNode,
};

const edgeTypes = {
  floating: FloatingEdge,
};

// Redux updates are not immediately reflected and are stored in random variables
let _lifecycleGroups = [];

const ReactFlowDiagram = () => {
  return (
    <ReactFlowProvider>
      <Flow />
    </ReactFlowProvider>
  );
};

export default ReactFlowDiagram;

const Flow = () => {
  const dispatch = useDispatch();
  const flowWrapperRef = useRef(null);
  const flowRef = useRef(null);

  const {
    nodes: storeNodes,
    edges: storeEdges,
    lifecycleGroups,
  } = useSelector((state) => state.reactFlowDiagram);

  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  const [reactFlowInstance, setReactFlowInstance] = useState(null);
  const [NodeMenu, setNodeMenu] = useState();
  const [edgeMenu, setEdgeMenu] = useState();
  const [paneMenu, setPaneMenu] = useState();

  const { getNode } = useReactFlow();

  useEffect(() => {
    const lifecycleGroups = createGroupNode({ lifecycle: "Cradle-to-Grave" });
    dispatch(reducerSlice.saveLifecycleGroup(lifecycleGroups));
    setNodes([...lifecycleGroups, ...storeNodes]);
    setEdges([...storeEdges]);
  }, []);

  useEffect(() => {
    if (lifecycleGroups.length === 0) return;
    _lifecycleGroups = lifecycleGroups;
  }, [lifecycleGroups]);

  const onConnect = useCallback((params) => createEdge(params), [setEdges]);

  const onNodesDelete = useCallback(
    (nodesToDelete) => {
      setNodes((els) => els.filter((n) => !nodesToDelete.includes(n.id)));
      setEdges((els) => els.filter((e) => !nodesToDelete.includes(e.source)));
      dispatch(reducerSlice.deleteNode(nodesToDelete));
    },
    [setNodes, setEdges]
  );

  const onDragOver = useCallback((event) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = "move";
  }, []);

  /** Function to find the distance between two points */
  const calculateDistance = (point1, point2) => {
    return Math.sqrt(
      Math.pow(point1.x - point2.x, 2) + Math.pow(point1.y - point2.y, 2)
    );
  };

  /** Function to find the closest Lifecycle group */
  const findNearestGroup = (position) => {
    const distances = _lifecycleGroups.map((groupNode) => {
      const center = {
        x: groupNode.position.x + groupNode.style.width / 2,
        y: groupNode.position.y + groupNode.style.height / 2,
      };

      const distance = calculateDistance(center, position);

      return { node: groupNode, distance };
    });

    const nearestNode = distances.reduce(
      (nearest, current) =>
        current.distance < nearest.distance ? current : nearest,
      distances[0]
    );

    const leftBoarderLinePosition = nearestNode.node.position.x;
    const rightBoarderLinePosition =
      nearestNode.node.position.x + nearestNode.node.style.width;

    if (!nearestNode.node.right && !nearestNode.node.left) {
      return nearestNode.node.id;
    }

    if (position.x > rightBoarderLinePosition) {
      return nearestNode.node.right;
    } else if (position.x < leftBoarderLinePosition) {
      return nearestNode.node.left;
    } else {
      return nearestNode.node.id;
    }
  };

  const onNodeDragStop = useCallback(
    (event, node, nodes) => {
      event.preventDefault();
      if (nodes.length === 0) return;
      nodes.forEach((node) => {
        if (node.type === "Group") {
          dispatch(reducerSlice.changeLifecycleGroup(node));
          return;
        }

        if (node.type === "Grouping") {
          dispatch(reducerSlice.editGroupingNodes(node));
          return;
        }

        const position = {
          x: node.position.x + node.style.width / 2,
          y: node.position.y + node.style.height / 2,
        };

        const nearestGroup = findNearestGroup(position);

        const id = node.id;

        const newNode = {
          ...node,
          type: nearestGroup,
          dataCategory: nearestGroup,
        };

        // Determine if the node is located within the lifecycle group
        if (!inRect(node.position, node.style)) {
          const prevNode = storeNodes.find((node) => node.id === id);
          setNodes((nodes) => nodes.map((n) => (n.id === id ? prevNode : n)));
          return;
        }

        setNodes((nodes) => nodes.map((n) => (n.id === id ? newNode : n)));
        dispatch(reducerSlice.editNode(newNode));

        const sourceEdges = storeEdges.filter((edge) => edge.source === id);

        sourceEdges.forEach((edge) => {
          const edgeColor = Lifecycle.find(
            (lifecycle) => lifecycle.type === nearestGroup
          )?.color;

          const newEdge = {
            ...edge,
            style: { ...defaultEdgeOptions.style, stroke: edgeColor },
            markerEnd: {
              ...defaultEdgeOptions.markerEnd,
              color: edgeColor,
            },
          };

          setEdges((edges) =>
            edges.map((e) => (e.id === newEdge.id ? newEdge : e))
          );
          dispatch(reducerSlice.editEgde(newEdge));
        });
      });
    },
    [reactFlowInstance, storeNodes]
  );

  const onNodeDrag = useCallback(
    (event) => {
      event.preventDefault();
    },
    [reactFlowInstance]
  );

  const onNodeContextMenu = useCallback(
    (event, node) => {
      event.preventDefault();
      resetMenu();
      if (!flowRef.current) return;
      const pane = flowRef.current.getBoundingClientRect();
      if (node.type === "Group") {
        setPaneMenu({
          top: event.clientY - pane.top,
          left: event.clientX - pane.left,
          right: pane.width - event.clientX - 50,
          bottom: pane.height - event.clientY - 50,
        });
        return;
      }
      setNodeMenu({
        id: node.id,
        top: event.clientY - pane.top,
        left: event.clientX - pane.left,
        right: pane.width - event.clientX - 50,
        bottom: pane.height - event.clientY - 50,
      });
    },
    [setNodeMenu, setPaneMenu]
  );

  const onEdgeContextMenu = useCallback(
    (event, edge) => {
      event.preventDefault();
      resetMenu();
      if (!flowRef.current) return;
      const pane = flowRef.current.getBoundingClientRect();
      setEdgeMenu({
        id: edge.id,
        top: event.clientY - pane.top,
        left: event.clientX - pane.left,
        right: pane.width - event.clientX - 50,
        bottom: pane.height - event.clientY - 50,
      });
    },
    [setEdgeMenu]
  );

  const onPaneContextMenu = useCallback(
    (event) => {
      event.preventDefault();
      resetMenu();
      if (!flowRef.current) return;
      const pane = flowRef.current.getBoundingClientRect();
      setPaneMenu({
        top: event.clientY - pane.top,
        left: event.clientX - pane.left,
        right: pane.width - event.clientX - 50,
        bottom: pane.height - event.clientY - 50,
      });
    },
    [setPaneMenu]
  );

  const onPaneClick = useCallback(() => {
    resetMenu();
  }, [setNodeMenu, setEdgeMenu, setPaneMenu]);

  const resetMenu = () =>
    new Promise((resolve) => {
      setNodeMenu(undefined);
      setEdgeMenu(undefined);
      setPaneMenu(undefined);
      resolve(true);
    });

  const createEdge = (params) => {
    if (params.source === params.target) {
      return;
    }

    if (!params.source || !params.target) return;

    const sourceNode = getNode(params.source);
    const targetNode = getNode(params.target);

    if (sourceNode?.type === "Grouping" || targetNode?.type === "Grouping") {
      return "Grouping";
    }

    const edgeColor = Lifecycle.find(
      (lifecycle) => lifecycle.type === sourceNode?.type
    )?.color;

    const newEdge = {
      ...params,
      id: `${params.source}-${params.target}`,
      style: { ...defaultEdgeOptions.style, stroke: edgeColor },
      markerEnd: {
        ...defaultEdgeOptions.markerEnd,
        color: edgeColor,
      },
    };

    setEdges((eds) => addEdge(newEdge, eds));
    dispatch(reducerSlice.addEgde(newEdge));
  };

  /** Functions to obtain minimum and maximum values of x- and y-axes of a Lifecycle group */
  const findMinMaxXYValues = (lifecycleGroups) => {
    const result = {
      minX: 0,
      maxX: 0,
      minY: 0,
      maxY: 0,
      leftNodeType: "",
      rightNodeType: "",
    };

    lifecycleGroups.forEach((node) => {
      const { id, position, style, left, right } = node;
      const nodeX = position.x + (!left ? 0 : style.width);
      const nodeMaxY = position.y + style.height;

      if (!left) {
        result.minX = nodeX;
        result.leftNodeType = id;
      } else if (!right) {
        result.maxX = nodeX;
        result.rightNodeType = id;
      }

      result.minY = Math.min(result.minY, position.y);
      result.maxY = Math.max(result.maxY, nodeMaxY);
    });

    return result;
  };

  /** Function to determine whether a node is located in a life cycle */
  const inRect = (position, style) => {
    const { minX, maxX, minY, maxY } = findMinMaxXYValues(_lifecycleGroups);
    if (
      position.x > minX &&
      position.x + style.width <= maxX &&
      position.y >= minY &&
      position.y + style.height <= maxY
    ) {
      return true;
    } else {
      return false;
    }
  };

  const createGroupNode = ({ lifecycle }) => {
    let filteredLifecycle;

    switch (lifecycle) {
      case "Cradle-to-Gate": // Process from raw material acquisition to transportation stage
        filteredLifecycle = [1, 2, 3];
        break;
      case "Cradle-to-Grave": // Process from raw material acquisition to product disposal stage
        filteredLifecycle = [1, 2, 3, 4, 5];
        break;
      case "Gate-to-Grave": // Process from product manufacturing to disposal
        filteredLifecycle = [2, 3, 4, 5];
        break;
      case "Gate-to-Gate": // Product manufacturing step process
        filteredLifecycle = [2];
        break;
      default:
        return [];
    }

    const groupNodes = filteredLifecycle
      .map((key, i) => {
        const node = Lifecycle.find(
          (lifecycleNode) => lifecycleNode.key === key
        );

        if (!node) {
          return null;
        }

        return {
          id: node.type,
          type: "Group",
          position: { x: 400 * i, y: 0 },
          data: { label: node?.displayName },
          draggable: false,
          right:
            i === filteredLifecycle.length - 1
              ? null
              : getAdjacentNodeType(key, 1),
          left: i === 0 ? null : getAdjacentNodeType(key, -1),
          style: {
            width: 400,
            height: 1000,
            backgroundColor: node.backgroundColor,
            border: "1px solid #ccc",
          },
        };
      })
      .filter(Boolean);

    return groupNodes;
  };

  const findLifecycleNodeByKey = (key) => {
    return Lifecycle.find((lifecycleNode) => lifecycleNode.key === key);
  };

  const getAdjacentNodeType = (key, direction) => {
    const adjacentNode = findLifecycleNodeByKey(key + direction);
    return adjacentNode?.type || null;
  };

  const onNodeCilick = useCallback(
    (event, node) => {
      event.preventDefault();
      resetMenu();
      if (node.type === "Group") {
        unselectAll();
        return;
      }
      dispatch(reducerSlice.selectData({ node }));
    },
    [reducerSlice.selectData]
  );

  const onEdgeClick = (event) => {
    event.preventDefault();
    resetMenu();
  };

  const onEdgeDoubleClick = (event) => {
    event.preventDefault();
    resetMenu();
  };

  const unselectAll = () => {
    setNodes((nodes) =>
      nodes.map((n) => ({
        ...n,
        selected: false,
      }))
    );
  };

  /** Logic executed when selecting multiple nodes */
  useOnSelectionChange({
    onChange: ({ nodes }) => {
      const filteredNodes = nodes.filter((node) => node.type !== "Group");
      dispatch(reducerSlice.changeSelectedNodes(filteredNodes));
    },
  });

  return (
    <div className={cn("react_flow_diagram-wrapper")} ref={flowWrapperRef}>
      <Shortcut />
      <ReactFlow
        ref={flowRef}
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onNodeClick={onNodeCilick}
        onEdgeClick={onEdgeClick}
        onEdgeDoubleClick={onEdgeDoubleClick}
        onConnect={onConnect}
        onNodeContextMenu={onNodeContextMenu}
        onEdgeContextMenu={onEdgeContextMenu}
        onPaneContextMenu={onPaneContextMenu}
        onNodesDelete={onNodesDelete}
        onPaneClick={onPaneClick}
        nodeTypes={nodeTypes}
        edgeTypes={edgeTypes}
        onInit={setReactFlowInstance}
        defaultEdgeOptions={defaultEdgeOptions}
        connectionLineComponent={FloatingConnectionLine}
        onDragOver={onDragOver}
        onNodeDragStop={onNodeDragStop}
        onNodeDrag={onNodeDrag}
        selectNodesOnDrag={false}
        deleteKeyCode={null}
        selectionKeyCode={null}
        fitView
        snapToGrid={true}
      >
        {NodeMenu && <NodeContextMenu onClick={onPaneClick} {...NodeMenu} />}
        {edgeMenu && <EdgeContextMenu onClick={onPaneClick} {...edgeMenu} />}
        {paneMenu && <PaneContextMenu onClick={onPaneClick} {...paneMenu} />}
      </ReactFlow>
    </div>
  );
};
