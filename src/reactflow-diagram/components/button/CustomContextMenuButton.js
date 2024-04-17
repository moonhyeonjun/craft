import styles from "./Button.module.scss";
import classNames from "classnames/bind";
const cn = classNames.bind(styles);

const CustomContextMenuButton = ({ text, icon, func = null, divider }) => {
  return (
    <div className={cn("custom-context-menu-button")}>
      <div className={cn(divider && "under-divider")}>
        <button onClick={func}>
          <div className={cn("button")}>
            {icon}
            {text}
          </div>
        </button>
      </div>
    </div>
  );
};

export default CustomContextMenuButton;
