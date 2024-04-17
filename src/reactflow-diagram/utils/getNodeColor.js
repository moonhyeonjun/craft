import { Lifecycle } from "../constants/lifecycle";

export const getNodeColor = (type) => {
  const node = Lifecycle.find((node) => node.type === type);
  return node ? node.color : "#eee";
};
