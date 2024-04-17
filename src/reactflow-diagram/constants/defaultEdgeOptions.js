import { MarkerType } from "reactflow";

export const defaultEdgeOptions = {
  style: { strokeWidth: 5, stroke: "black" },
  type: "floating",
  markerEnd: {
    type: MarkerType.ArrowClosed,
    color: "black",
  },
  animated: true,
  zIndex: 9999,
};
