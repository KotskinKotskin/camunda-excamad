module.exports = {
  publickPath: './',
  configureWebpack: {
    devtool: "source-map"
  },
  publicPath: process.env.NODE_ENV === "production" ? "/" : "/"
};
