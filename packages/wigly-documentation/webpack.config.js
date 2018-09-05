var path = require("path");
var webpack = require("webpack");
var MiniCssExtractPlugin = require("mini-css-extract-plugin");
var OptimizeCSSAssetsPlugin = require("optimize-css-assets-webpack-plugin");

module.exports = {
  entry: "./src/browser.js",
  output: {
    path: __dirname + "/dist",
    publicPath: "/",
    filename: "main.js"
  },
  resolve: {
    alias: {
      ["wigly"]: path.resolve(__dirname, "node_modules/wigly/dist/es6.js"),
      ["wigly-store"]: path.resolve(__dirname, "node_modules/wigly-store/dist/es6.js"),
      ["wigly-store-connect"]: path.resolve(__dirname, "node_modules/wigly-store-connect/dist/es6.js")
    }
  },
  module: {
    rules: [
      {
        test: /\.css$/,
        use: [
          {
            loader: MiniCssExtractPlugin.loader,
            options: {}
          },
          "css-loader"
        ]
      },
      {
        test: /\.(png|jpg|jpeg|gif)$/,
        use: [
          {
            loader: "file-loader",
            options: {}
          }
        ]
      },
      {
        test: /\.js$/,
        exclude: /(node_modules)/,
        use: {
          loader: "babel-loader"
        }
      }
    ]
  },
  devServer: {
    contentBase: "./dist",
    compress: true,
    port: 8081,
    // host: "http://localhost;",
    proxy: {
      "*": "http://localhost:8080"
    }
  },
  plugins: [new MiniCssExtractPlugin(), new OptimizeCSSAssetsPlugin(), new webpack.DefinePlugin({})]
};
