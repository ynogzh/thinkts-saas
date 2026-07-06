export default {
  // Plugin dependencies — the app only loads these
  plugins: ["tenant", "identity", "permission", "trade", "payment", "promote", "cms"],

  model: {
    type: "mysql",
    prefix: "",
    pagesize: 10,
  },
};
