module.exports = {
  configureWebpack: {
    devtool: "source-map"
  },
  baseUrl: process.env.NODE_ENV === "production" ? "/" : "/"
};
