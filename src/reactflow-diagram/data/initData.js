import { MarkerType } from "reactflow";
import { Lifecycle } from "../constants/lifecycle";

const rawMaterialsColor = Lifecycle.find((l) => l.type === "Raw materials").color;
const useColor = Lifecycle.find((l) => l.type === "Use").color;
const transportColor = Lifecycle.find((l) => l.type === "Transport").color;
const manufacturingColor = Lifecycle.find((l) => l.type === "Manufacturing").color;
 
export const initNodes = [
  {
    id: "Raw materials-1632797389923",
    type: "Raw materials",
    position: { x: 140, y: 200 },
    data: { label: "Raw materials 1", expanded: true },
    style: { width: 150, height: 100 },
    zIndex: 9999,
  },
  {
    id: "Manufacturing-1632797389924",
    type: "Manufacturing",
    position: { x: 540, y: 200 },
    data: { label: "Manufacturing 1", expanded: true },
    style: { width: 150, height: 100 },
    zIndex: 9999,
  },
  {
    id: "Transport-1632797389925",
    type: "Transport",
    position: { x: 940, y: 400 },
    data: { label: "Transport", expanded: true },
    style: { width: 120, height: 100 },
    zIndex: 9999,
  },
  {
    id: "Use-1632797389926",
    type: "Use",
    position: { x: 1340, y: 400 },
    data: { label: "Use", expanded: true },
    style: { width: 100, height: 100 },
    zIndex: 9999,
  },
  {
    id: "Disposal-1632797389927",
    type: "Disposal",
    position: { x: 1740, y: 400 },
    data: { label: "Disposal", expanded: true },
    style: { width: 110, height: 100 },
    zIndex: 9999,
  },
  {
    id: "Raw materials-1632797389928",
    type: "Raw materials",
    position: { x: 140, y: 600 },
    data: { label: "Raw materials 2", expanded: true },
    style: { width: 150, height: 100 },
    zIndex: 9999,
  },
  {
    id: "Manufacturing-1632797389929",
    type: "Manufacturing",
    position: { x: 540, y: 600 },
    data: { label: "Manufacturing 2", expanded: true },
    style: { width: 150, height: 100 },
    zIndex: 9999,
  },
];

export const initEdges = [
  {
    id: "Raw materials-1632797389923Manufacturing-1632797389924",
    source: "Raw materials-1632797389923",
    target: "Manufacturing-1632797389924",
    style: { strokeWidth: 5, stroke: rawMaterialsColor },
    type: "floating",
    markerEnd: {
      type: MarkerType.ArrowClosed,
      color: rawMaterialsColor
    },
    animated: true,
    zIndex: 9999,
  },
  {
    id: "Manufacturing-1632797389924Transport-1632797389925",
    source: "Manufacturing-1632797389924",
    target: "Transport-1632797389925",
    style: { strokeWidth: 5, stroke: manufacturingColor },
    type: "floating",
    markerEnd: {
      type: MarkerType.ArrowClosed,
      color: manufacturingColor
    },
    animated: true,
    zIndex: 9999,
  },
  {
    id: "Transport-1632797389925Use-1632797389926",
    source: "Transport-1632797389925",
    target: "Use-1632797389926",
    style: { strokeWidth: 5, stroke: transportColor },
    type: "floating",
    markerEnd: {
      type: MarkerType.ArrowClosed,
      color: transportColor,
    },
    animated: true,
    zIndex: 9999,
  },
  {
    id: "Use-1632797389926Disposal-1632797389927",
    source: "Use-1632797389926",
    target: "Disposal-1632797389927",
    style: { strokeWidth: 5, stroke: useColor },
    type: "floating",
    markerEnd: {
      type: MarkerType.ArrowClosed,
      color: useColor,
    },
    animated: true,
    zIndex: 9999,
  },
  {
    id: "Raw materials-1632797389928Manufacturing-1632797389929",
    source: "Raw materials-1632797389928",
    target: "Manufacturing-1632797389929",
    style: { strokeWidth: 5, stroke: rawMaterialsColor },
    type: "floating",
    markerEnd: {
      type: MarkerType.ArrowClosed,
      color: rawMaterialsColor,
    },
    animated: true,
    zIndex: 9999,
  },
];
