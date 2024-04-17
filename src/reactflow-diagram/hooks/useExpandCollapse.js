import { useMemo } from "react";
import { stratify, tree } from "d3-hierarchy";

function isHierarchyPointNode(pointNode) {
  return typeof pointNode.x === "number" && typeof pointNode.y === "number";
}

const treeWidth = 220;
const treeHeight = 100;
const layoutNodes = false;

function useExpandCollapse(nodes, edges) {
  return useMemo(() => {
    if (nodes.length === 0 || edges.length === 0) return { nodes, edges };

    const newNodes = nodes.filter((node) => node.type !== "Group");
    const newEdges = [...edges];
    const groupNodes = nodes.filter((node) => {
      return node.type === "Group";
    });

    // 가상 root를 생성하여 multiple root error 방지
    const virtualRoot = {
      id: "virtualRoot",
      type: "virtualRoot",
      position: { x: 0, y: 0 },
      data: {
        label: "virtualRoot",
        depth: 0,
        expanded: true,
        expandable: true,
        tmpChildren: undefined,
      },
    };

    // target에 해당하지 않는 node를 가상 root에 연결한다.
    newNodes.forEach((node) => {
      const connectEdges = newEdges.filter((edge) => {
        return edge.source === node.id;
      });

      if (connectEdges.length === 0) {
        newEdges.push({
          id: `virtualRoot-${node.id}`,
          source: node.id,
          target: virtualRoot.id,
        });
      }
    });

    const newRootNodes = [...newNodes, virtualRoot];

    const hierarchy = stratify()
      .id((d) => d.id)
      .parentId((d) => newEdges.find((e) => e.source === d.id)?.target)(
      newRootNodes
    );

    const updateNodeData = (node) => {
      const { children, data } = node;
      const { data: nodeData } = data;

      const hasChildren = !!children?.length;
      const hasTmpChildren = !!nodeData?.tmpChildren?.length;

      const updatedNodeData = {
        ...nodeData,
        depth: node.depth,
        expanded: nodeData?.expanded,
        expandable: hasChildren || hasTmpChildren,
      };

      if (nodeData?.expanded && hasChildren) {
        updatedNodeData.tmpChildren = children;
      }

      node.data = {
        ...data,
        data: updatedNodeData,
      };

      node.children = nodeData?.expanded
        ? updatedNodeData.tmpChildren
        : undefined;
    };

    hierarchy.descendants().forEach(updateNodeData);

    const layout = tree()
      .nodeSize([treeWidth, treeHeight])
      .separation(() => 1);

    const root = layoutNodes ? layout(hierarchy) : hierarchy;

    return {
      nodes: [
        ...groupNodes,
        ...root
          .descendants()
          .map((d) => ({
            ...d.data,
            position: isHierarchyPointNode(d)
              ? { x: d.x, y: d.y }
              : d.data.position,
          }))
          .filter((node) => node.type !== "virtualRoot"),
      ],
      edges: edges.filter(
        (edge) =>
          root.find((h) => h.id === edge.source) &&
          root.find((h) => h.id === edge.target)
      ),
    };
  }, [nodes, edges, layoutNodes, treeWidth, treeHeight]);
}

export default useExpandCollapse;
