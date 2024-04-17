import { memo } from "react";
import { getNodeColor } from "../utils/getNodeColor";
import classNames from "classnames/bind";
import styles from "./Node.module.scss";

const cn = classNames.bind(styles);

const LifecycleGroupNode = ({ id, data }) => {
  return (
    <div
      className={cn("lifecycle-group-node")}
      style={{ backgroundColor: getNodeColor(id) }}
    >
      {data.label}
    </div>
  );
};

export default memo(LifecycleGroupNode);
