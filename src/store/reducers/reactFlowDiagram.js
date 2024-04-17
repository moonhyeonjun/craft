import { createSlice } from "@reduxjs/toolkit";
import { initNodes, initEdges } from "../../reactflow-diagram/data/initData";

const initialState = {
  nodes: initNodes,
  edges: initEdges,
  lifecycleGroups: [],
  groupingNodes: [],
  selectedNode: undefined,
  selectedEdge: undefined,
  selectedNodes: [],
};

export const dataSlice = createSlice({
  name: "reactFlowDiagram",
  initialState,
  reducers: {
    selectData: (state, action) => {
      state.selectedNode = action.payload.node;
      state.selectedEdge = action.payload.edge;
    },
    saveNode: (state, action) => {
      state.nodes = action.payload;
    },
    addNode: (state, action) => {
      state.nodes.push(action.payload);
    },
    editNode: (state, action) => {
      state.nodes = state.nodes.map((item) => {
        if (item.id === action.payload.id) {
          return {
            ...item,
            ...action.payload,
          };
        }
        return item;
      });
    },
    deleteNode: (state, action) => {
      const ids = action.payload.map((item) => item.id);
      state.nodes = state.nodes.filter((item) => !ids.includes(item.id));
    },
    saveEdge: (state, action) => {
      state.edges = action.payload;
    },
    addEgde: (state, action) => {
      state.edges.push(action.payload);
    },
    editEgde: (state, action) => {
      state.edges = state.edges.map((item) => {
        if (item.id === action.payload.id) {
          return {
            ...item,
            ...action.payload,
          };
        }
        return item;
      });
    },
    deleteEgde: (state, action) => {
      const ids = action.payload.map((item) => item.id);
      state.edges = state.edges.filter((item) => !ids.includes(item.id));
    },
    saveLifecycleGroup: (state, action) => {
      state.lifecycleGroups = action.payload;
    },
    changeLifecycleGroup: (state, action) => {
      state.lifecycleGroups = state.lifecycleGroups.map((item) => {
        if (item.id === action.payload.id) {
          return {
            ...item,
            ...action.payload,
          };
        }
        return item;
      });
    },
    changeSelectedNodes(state, action) {
      state.selectedNodes = action.payload;
    },
    saveGroupingNodes(state, action) {
      state.groupingNodes = action.payload;
    },
    editGroupingNodes(state, action) {
      state.groupingNodes = state.groupingNodes.map((item) => {
        if (item.id === action.payload.id) {
          return {
            ...item,
            ...action.payload,
          };
        }
        return item;
      });
    },
    addGroupingNodes(state, action) {
      state.groupingNodes.push(action.payload);
    },
    deleteGroupingNodes(state, action) {
      const id = action.payload?.id;
      state.groupingNodes = state.groupingNodes.filter(
        (item) => item.id !== id
      );
    },
  },
});

export const {
  selectData,
  saveNode,
  addNode,
  editNode,
  deleteNode,
  saveEdge,
  addEgde,
  editEgde,
  deleteEgde,
  saveLifecycleGroup,
  changeLifecycleGroup,
  changeSelectedNodes,
  saveGroupingNodes,
  addGroupingNodes,
  editGroupingNodes,
  deleteGroupingNodes,
} = dataSlice.actions;
export default dataSlice.reducer;
