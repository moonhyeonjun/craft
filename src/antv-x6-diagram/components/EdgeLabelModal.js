import React, { useState, useEffect, useRef } from "react";
import { Modal, Input } from "antd";

const EdgeLabelModal = ({ open, setOpen, setEdgeLabel }) => {
  const inputRef = useRef(null);
  const [label, setLabel] = useState("");

  useEffect(() => {
    if (open) {
      setTimeout(() => inputRef.current.focus(), 0);
    } else {
      setLabel("");
    }
  }, [open]);

  const onOk = () => {
    setEdgeLabel(label);
    setOpen(false);
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter") {
      onOk();
    }
  };

  const onCancel = () => {
    setOpen(false);
  };

  return (
    <Modal
      title=""
      open={open}
      onOk={onOk}
      onCancel={onCancel}
      okText="Save"
      cancelText="Cancel"
      width={300}
      closable={false}
    >
      <Input
        ref={inputRef}
        placeholder="Please enter the label"
        value={label}
        onChange={(e) => setLabel(e.target.value)}
        onKeyDown={handleKeyDown}
      />
    </Modal>
  );
};

export default EdgeLabelModal;
