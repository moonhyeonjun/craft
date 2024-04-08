import { Route, Routes } from "react-router-dom";
import App from "./App";
import AntvX6Diagram from "./antv-x6-diagram";

export const Router = () => {
  return (
    <Routes>
      <Route path="/" element={<App />} />
      <Route path="/craft/antv-x6-diagram" element={<AntvX6Diagram />} />
    </Routes>
  );
};
