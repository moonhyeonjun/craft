import { useDispatch } from "react-redux";
import { Tooltip } from "antd";
import { FaRegSquarePlus } from "react-icons/fa6";
import { useReactFlow, useStore } from "reactflow";
import { addNode } from "../../../../store/reducers/reactFlowDiagram";

const nodeWidth = 120;
const nodeHeight = 100;

const transformSelector = (state) => state.transform;

const CreateNewProcess = () => {
  const { setNodes } = useReactFlow();
  const dispatch = useDispatch();
  const transform = useStore(transformSelector);

  const createNode = async () => {
    // Defining minimum width and height
    const minWidth = nodeWidth;
    const minHeight = nodeHeight;

    const processName = "New Process";
    const processType = "Process";

    const textLength = processName.length;

    // Calculate width and height based on data length
    const width = Math.max(textLength * 10, minWidth);
    const height = Math.max(100, minHeight);

    // Create a node in the middle of the reactflow screen
    const position = {
      x: (window.innerWidth - width) / 2 - transform[0],
      y: (window.innerHeight - height) / 2 - transform[1],
    };

    const style = {
      width,
      height,
    };

    const data = {
      label: processName,
      expanded: true,
    };

    const newNode = {
      id: `${processName}-${Date.now()}`,
      type: processType,
      position,
      data,
      style,
      zIndex: 9999,
    };

    dispatch(addNode(newNode));
    setNodes((nds) => nds.concat(newNode));
  };
  return (
    <>
      <Tooltip title="Create New Process">
        <FaRegSquarePlus onClick={createNode} />
      </Tooltip>
    </>
  );
};

export default CreateNewProcess;
