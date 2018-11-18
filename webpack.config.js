module.exports = [
  {
    entry: "./src/main.js",
    output: {
      library: "wigly",
      libraryTarget: "umd",
      path: __dirname + "/dist",
      publicPath: "/",
      filename: "wigly.es6.js"
    }
  },
  {
    entry: "./src/main.js",
    output: {
      library: "wigly",
      libraryTarget: "umd",
      path: __dirname + "/dist",
      publicPath: "/",
      filename: "wigly.es5.js"
    },
    module: {
      rules: [
        {
          test: /\.(js|jsx)$/,
          use: {
            loader: "babel-loader",
            options: {
              presets: [
                [
                  "@babel/preset-env",
                  {
                    targets: { browsers: ["last 2 versions"] }
                  }
                ]
              ]
            }
          }
        }
      ]
    }
  }
];
