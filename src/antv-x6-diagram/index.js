import React, { useEffect, useRef, useState } from "react";
import { Graph, Dom } from "@antv/x6";
import { initData } from "./data/initData";
import { Drawer } from "antd";
import { GiHamburgerMenu } from "react-icons/gi";
import NodeCount from "./components/NodeCount";
import NodeLabel from "./components/NodeLabel";
import EdgeLabelModal from "./components/EdgeLabelModal";

import "./index.css";

const expandHeight = 0;
const lineIdPrefix = "newLine";

let idx = 0;
let currentPortStack = [];
let currentView;
let graph;

const defaultNodeLabel = "Select Node";
const defaultEdgeLabel = "Click to Edit";

const PRIMARY_COLOR = "#3300a3";

Graph.registerNode(
  "custom-node",
  {
    markup: [
      {
        tagName: "rect",
        selector: "body",
      },
      {
        tagName: "text",
        selector: "label",
      },
      {
        tagName: "g",
        children: [
          {
            tagName: "text",
            selector: "btnText",
          },
          {
            tagName: "rect",
            selector: "btn",
          },
        ],
      },
    ],
    attrs: {
      body: {
        fill: "transparent",
        stroke: "#000000",
        strokeWidth: 2,
        refWidth: "100%",
        refHeight: "100%",
      },
      label: {
        fontSize: 14,
        fill: "#000000",
        refX: "50%",
        refY: "50%",
        textAnchor: "middle",
        textVerticalAnchor: "middle",
      },
    },
  },
  true
);

const defaultPortOptions = {
  group: "line",
  markup: [
    {
      tagName: "rect",
      selector: "rect",
    },
  ],
};

const buttonTextProps = {
  fontSize: 10,
  refX2: 5,
  y: 15,
  cursor: "pointer",
  pointerEvent: "none",
};

const AntvX6Diagram = () => {
  const containerRef = useRef(null);
  const [nodeLabels, setNodeLabels] = useState(null);
  const [edgeLabel, setEdgeLabel] = useState(defaultEdgeLabel);
  const [edgeLabelArgs, setEdgeLabelArgs] = useState({});
  const [enteredNode, setEnteredNode] = useState("");
  const [countNodes, setCountNodes] = useState([]);
  const [inputIdx, setInputIdx] = useState(null);
  const [isEdgeLabelModalOpen, setIsEdgeLabelModalOpen] = useState(false);
  const [isSettingsDrawerOpen, setisSettingsDrawerOpen] = useState(false);
  const [initRender, setInitRender] = useState(false);

  useEffect(() => {
    graph = initGraph();
    graphEventRegister();
    loadGraph(initData);

    return () => {
      graph.dispose();
    };
  }, []);

  useEffect(() => {
    if (edgeLabel === defaultEdgeLabel) return;
    defaultEdgeOptions(edgeLabelArgs, true);
  }, [edgeLabel]);

  useEffect(() => {
    if (!nodeLabels || nodeLabels.length === 0) return;
    nodeLabels.forEach((nodeLabel) => {
      if (!nodeLabel.value) return;
      onChangeNodeLabel(nodeLabel);
    });
  }, [nodeLabels]);

  useEffect(() => {
    const nodes = new Array(countNodes.length).fill("");
    const nodeLabels = nodes.map((_, idx) => {
      return { value: null, idx };
    });

    if (!initRender) return;
    setNodeLabels(nodeLabels);

    initData.nodes.forEach((node, n) => {
      setNodeLabels((prev) => {
        const newNodeLabels = prev.map((nodeLabel, i) => {
          return { ...nodeLabel, idx: i };
        });
        prev = newNodeLabels.map((nodeLabel) => {
          if (nodeLabel.idx !== n) return nodeLabel;
          nodeLabel = { ...nodeLabel, value: node };
          onChangeNodeLabel(nodeLabel, true);
          return nodeLabel;
        });
        return [...prev];
      });
    });
    setInitRender(false);
  }, [countNodes]);

  const initGraph = () => {
    return new Graph({
      container: containerRef.current ?? undefined,
      interacting: function (cellView) {
        if (cellView.cell.id.startsWith(lineIdPrefix)) {
          return { nodeMovable: false, magnetConnectable: true };
        }
        return false;
      },
      connecting: {
        snap: {
          radius: 100,
        },
        allowNode: false,
        allowBlank: true,
        multi: true,
        dangling: false,
      },
      onEdgeLabelRendered: (args) => {
        defaultEdgeOptions(args);
      },
    });
  };

  const graphEventRegister = () => {
    const events = {
      "node:mouseenter": nodeMouseEnterHandler,
      "node:mouseleave": nodeMouseLeaveHandler,
      "node:delete": nodeDeleteHandler,
      "edge:mouseenter": edgeMouseEnterHandler,
      "edge:mouseleave": edgeMouseLeaveHandler,
      "edge:dblclick": edgeDoubleClickHandler,
      "edge:connected": edgeConnectedHandler,
      "edge:moving": edgeMovingHandler,
    };

    Object.entries(events).forEach(([event, handler]) => {
      graph.on(event, handler);
    });
  };

  const loadGraph = (data) => {
    graph.clearCells();
    setCountNodes([]);
    setInitRender(true);

    const count = data.nodes.length;

    data.nodes.forEach((node, n) => {
      const { clientWidth, clientHeight } = graph.view.container;
      const divisionDistance = clientWidth / count;
      const width = (divisionDistance / 2) * (2 * n + 1);
      setCountNodes((prev) => {
        return [...prev, { idx: n, value: node }];
      });
      addNodes(n, width, clientHeight);
    });
    // Create an arrow: Repeat connecting to the edge after creating the port
    data.relations.forEach((relation, n) => {
      // n becomes port height to help align after loop ends
      const { source, target } = relation;
      const sourceLine = graph.getCellById(`${lineIdPrefix}${source}`);
      const targetLine = graph.getCellById(`${lineIdPrefix}${target}`);
      sourceLine.addPort({
        id: `sourcePort${n}`,
        args: { x: 0, y: n },
        ...defaultPortOptions,
      });
      targetLine.addPort({
        id: `targetPort${n}`,
        args: { x: 0, y: n },
        ...defaultPortOptions,
      });
      const edge = graph.addEdge({
        source: { cell: sourceLine, port: `sourcePort${n}` },
        target: { cell: targetLine, port: `targetPort${n}` },
      });
      edge.appendLabel({
        label: {
          text: relation.name,
          position: 0.25,
          data: 1,
        },
      });
    });
    edgeSorting();
  };

  const onChangeNodeLabel = (nodeLabel, release = false) => {
    const topNode = graph.getCellById(`topNode${nodeLabel.idx}`);
    const bottomNode = graph.getCellById(`bottomNode${nodeLabel.idx}`);
    const text = release ? defaultNodeLabel : `${nodeLabel.value}`;
    const fill = release ? "#ffffff" : PRIMARY_COLOR;
    const buttonFill = release ? PRIMARY_COLOR : "#ffffff";
    const color = release ? "#000000" : "#ffffff";
    for (const node of [topNode, bottomNode]) {
      node.setProp({
        attrs: {
          btnText: {
            fill: buttonFill,
            text: `${nodeLabel.idx + 1}.`,
            ...buttonTextProps,
          },
          body: { fill },
          label: {
            text,
            fill: color,
          },
        },
      });
    }
  };

  const defaultEdgeOptions = (args, isEdit = false) => {
    const { label, container } = args;
    const { data, text } = label.label;
    if (data) {
      const content = appendForeignObject(container);
      if (data === 1) {
        const txt = document.createTextNode(text ?? defaultEdgeLabel);
        content.className = "draw_diagram-edge-label";
        content.appendChild(txt);
        content.addEventListener("click", (event) => {
          setEdgeLabelArgs(args);
          setIsEdgeLabelModalOpen(true);
        });
        content.addEventListener("mouseover", (event) => {
          currentView?.unhighlight();
        });
        content.addEventListener("mouseout", (event) => {
          currentView?.highlight();
        });
        isEdit &&
          edgeLabelArgs.edge.setLabels({
            label: { position: 0.25, data: 1, text: edgeLabel },
          });
      }
    }
  };

  const onChanged = (settings) => {
    graph.clearCells();
    const nodes = new Array(settings.count).fill("");
    const nodeLabels = nodes.map((_, idx) => {
      return { value: null, idx };
    });
    setNodeLabels(nodeLabels);
    Array.from({ length: settings.count }).forEach((_, n) => {
      const { clientWidth, clientHeight } = graph.view.container;
      const divisionDistance = clientWidth / settings.count;
      const width = (divisionDistance / 2) * (2 * n + 1);
      addNodes(n, width, clientHeight);
    });
    setCountNodes(
      Array.from({ length: settings.count }, (_, i) => [
        { idx: i, value: null },
      ])
    );
  };

  const edgeSorting = () => {
    const { clientHeight } = graph.view.container;
    // Current Edge, i.e. the length of Line
    const currentHeight = clientHeight - (40 + 40) * 2 + 10 + expandHeight;
    const revisedEdgeLength = 0;
    const edges = graph.getEdges();
    const edgeLength = edges.length - revisedEdgeLength;
    const divisionDistance = currentHeight / (edgeLength + 1);
    const ports = edges
      .map((e) => {
        const { source, target } = e["store"]["data"];
        return {
          source,
          target,
          height: graph.getCellById(source.cell).getPort(source.port).args.y,
        };
      })
      .sort((a, b) => a.height - b.height);

    for (const [idx, line] of ports.entries()) {
      for (const cellKey of ["source", "target"]) {
        const node = line[cellKey];

        graph.getCellById(node.cell).setPortProp(node.port, {
          args: { x: 0, y: (idx + 1) * divisionDistance },
        });
      }
    }
  };

  const addNodes = (n, width, clientHeight) => {
    graph
      .addNode({
        id: `topNode${n}`,
        shape: "custom-node",
        width: 120,
        height: 40,
        attrs: {
          btnText: {
            fill: "#000000",
            text: `${n + 1}.`,
            ...buttonTextProps,
          },
        },
      })
      .position(width - 60, 40)
      .attr("label/text", defaultNodeLabel);
    graph
      .addNode({
        id: `bottomNode${n}`,
        width: 120,
        height: 40,
      })
      .position(width - 60, clientHeight - 28 * 2 + expandHeight)
      .attr("label/text", defaultNodeLabel);
    graph
      .addNode({
        id: `${lineIdPrefix}${n}`,
        width: 1,
        height: clientHeight - (28 + 40) * 2 + expandHeight - 2,
        ports: {
          groups: {
            line: {
              position: { name: "absolute" },
            },
          },
        },
      })
      .position(width, 82);
  };

  const appendForeignObject = (container) => {
    const fo = Dom.createSvgElement("foreignObject");
    const body = Dom.createElementNS("body", Dom.ns.xhtml);
    const content = Dom.createElementNS("div", Dom.ns.xhtml);

    fo.setAttribute("width", "90");
    fo.setAttribute("height", "30");
    fo.setAttribute("x", "-45");
    fo.setAttribute("y", "-15");

    body.setAttribute("xmlns", Dom.ns.xhtml);
    body.style.width = "100%";
    body.style.height = "100%";
    body.style.padding = "0";
    body.style.margin = "0";

    content.style.width = "100%";
    content.style.height = "100%";
    content.style.display = "flex";
    content.style.justifyContent = "center";
    content.style.alignItems = "center";

    body.appendChild(content);
    fo.appendChild(body);
    container.appendChild(fo);

    return content;
  };

  const nodeChangeHandler = (value, idx) => {
    setEnteredNode(value);
    setInputIdx(idx);
  };

  const resetPortFocusing = (filteringNodes = []) => {
    let nodes = graph.getNodes().filter((e) => e.id.includes("Line"));
    // Exclude nodes that do not remove ports (ex. ports that have just been connected)
    if (filteringNodes.length !== 0) {
      nodes = nodes.filter((node) => {
        return filteringNodes.every((e) => node.id !== e.cell);
      });
    }
    for (const node of nodes) {
      const ports = node.getPorts();
      if (ports.length === 0) continue;
      currentPortStack.forEach((element) => {
        node.removePort(element);
      });
    }
  };

  const nodeMouseEnterHandler = (props) => {
    if (!props.node.id.includes("Line")) return;
    if (currentPortStack.length !== 0) resetPortFocusing();
    idx++; // port id == key
    const { layerY } = props.e.originalEvent;
    const { y } = props.node.position();
    const nodes = graph.getNodes().filter((e) => e.id.includes("Line"));
    for (const node of nodes) {
      node.addPort({
        args: { x: 0, y: layerY - y },
        id: `${idx}`,
        group: "line",
        markup: [
          {
            tagName: "circle",
            selector: "dot",
          },
        ],
        attrs: {
          dot: {
            magnet: true,
            fill: PRIMARY_COLOR,
            r: 5,
          },
        },
        position: { name: "absolute" },
      });
    }
    currentPortStack.push(`${idx}`);
  };

  const nodeMouseLeaveHandler = (props) => {
    resetPortFocusing();
  };

  const nodeDeleteHandler = (props) => {
    props.e.stopPropagation();
    props.view.cell.remove();
  };

  const edgeMouseEnterHandler = (props) => {
    currentView = props.view;
    if (!(props.e.target.className === "draw_diagram-edge-label"))
      props.view.highlight();
  };

  const edgeMovingHandler = (props) => {
    const { source, target } = props.edge.store.data;
    const { layerY } = props.e.originalEvent;
    const { y } = graph.getCellById(source.cell).position();
    for (const nodeInfo of [source, target]) {
      const node = graph.getCellById(nodeInfo.cell);
      node.setPortProp(nodeInfo.port, {
        args: { x: 0, y: layerY - y },
      });
    }
    edgeSorting();
  };

  const edgeMouseLeaveHandler = (props) => {
    resetPortFocusing();
    props.view.unhighlight();
  };

  const edgeDoubleClickHandler = (props) => {
    props.view.cell.remove();
    // port remove
    const { source, target } = props.view.cell.store.data;
    graph.getCellById(source.cell).removePort(source.port);
    graph.getCellById(target.cell).removePort(target.port);
    edgeSorting();
  };

  const edgeConnectedHandler = (props) => {
    // created validation
    if (!props.isNew) return;
    // self targeting validation
    const { source, target } = props.edge["store"]["data"];
    if (source.cell === target.cell) return;
    // None Port validation
    if (currentPortStack.length === 0) return;

    const nodes = graph.getNodes().filter((e) => e.id.includes("Line"));
    for (const node of nodes) {
      for (const portId of currentPortStack) {
        const port = node.getPort(portId);
        if (!port) continue;
        node.setPortProp(portId, {
          attrs: {
            dot: {
              magnet: false,
              fill: "transparent",
              r: 0,
            },
          },
        });
      }
    }
    props.edge.setLabels({ label: { position: 0.25, data: 1 } });
    edgeSorting();
    resetPortFocusing([source, target]);
    currentPortStack = [];
    setTimeout(() => props.view.unhighlight(), 0);
  };

  const SettingContents = (
    <div className="draw_diagram-setting">
      <NodeCount onChange={onChanged} />
      <NodeLabel
        countNodes={countNodes}
        setCountNodes={setCountNodes}
        nodeLabels={nodeLabels}
        setNodeLabels={setNodeLabels}
        onChangeNodeLabel={onChangeNodeLabel}
        enteredNode={enteredNode}
        inputIdx={inputIdx}
        nodeChangeHandler={nodeChangeHandler}
      />
    </div>
  );

  const drawerProps = {
    title: "",
    open: isSettingsDrawerOpen,
    placement: "left",
    closable: false,
    width: "fit-content",
    onClose: () => setisSettingsDrawerOpen(false),
  };

  return (
    <div className="draw_diagram-wapper">
      <div className="draw_diagram-setting-drawer">
        <button onClick={() => setisSettingsDrawerOpen(true)}>
          <GiHamburgerMenu />
        </button>
        <Drawer {...drawerProps}>{SettingContents}</Drawer>
      </div>
      <EdgeLabelModal
        open={isEdgeLabelModalOpen}
        setOpen={setIsEdgeLabelModalOpen}
        setEdgeLabel={setEdgeLabel}
      />
      <div className="draw_diagram-graph" ref={containerRef} />
    </div>
  );
};

export default AntvX6Diagram;
