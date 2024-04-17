import { Tooltip } from "antd";
import CreateNewProcess from "./funcs/create-new-process";
import classNames from "classnames/bind";
import styles from "./index.module.scss";

const cn = classNames.bind(styles);

const Shortcut = () => {
  const buttons = [
    {
      title: "Create New Process",
      icon: <CreateNewProcess />,
    },
  ];

  return (
    <div className={cn("short-cut-wapper")}>
      {buttons.map((button, index) => (
        <div
          className={cn("button")}
          key={index}
          //  onClick={button.onClick}
        >
          <Tooltip title={button.title} placement="bottom">
            {button.icon}
          </Tooltip>
        </div>
      ))}
    </div>
  );
};

export default Shortcut;
