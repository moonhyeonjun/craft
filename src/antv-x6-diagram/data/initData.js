export const initData = {
  nodes: ["Class", "Interface", "Abstract"],
  relations: [
    { source: 0, target: 1, name: "Class to Interface" },
    { source: 1, target: 2, name: "Interface to Abstract" },
    { source: 2, target: 1, name: "Abstract to Interface" },
    { source: 2, target: 0, name: "Abstract to Class" },
  ],
};
