const HtmlWebpackPlugin = require("html-webpack-plugin");
const DashboardPlugin = require("@module-federation/dashboard-plugin");
const { ModuleFederationPlugin } = require("webpack").container;
const path = require("path");
const AutomaticVendorFederation = require("@module-federation/automatic-vendor-federation");
const packageJson = require("./package.json");
const exclude = ["babel", "plugin", "preset", "webpack", "loader", "serve"];
const ignoreVersion = [
  "react",
  "react-dom",
  "@emotion/core",
  "antd",
  "@ant-design/icons",
];

module.exports = {
  entry: "./src/index",
  mode: "development",
  devServer: {
    contentBase: path.join(__dirname, "dist"),
    port: 3002,
  },
  output: {
    publicPath: "http://localhost:3002/",
  },
  module: {
    rules: [
      {
        test: /\.less$/,
        use: [
          {
            loader: "style-loader",
          },
          {
            loader: "css-loader",
          },
          {
            loader: "less-loader",
            options: {
              lessOptions: {
                javascriptEnabled: true,
              },
            },
          },
        ],
      },
      {
        test: /\.jsx?$/,
        loader: "babel-loader",
        exclude: /node_modules/,
        options: {
          presets: ["@babel/preset-react"],
        },
      },
    ],
  },
  plugins: [
    new ModuleFederationPlugin({
      name: "dsl",
      library: { type: "var", name: "dsl" },
      filename: "remoteEntry.js",
      remotes: {},
      exposes: {
        Button: "./src/Button",
        Carousel: "./src/Carousel",
        TextField: "./src/TextField",
      },
      // sharing code based on the installed version, to allow for multiple vendors with different versions
      shared: AutomaticVendorFederation({
        exclude,
        ignoreVersion,
        packageJson,
        shareFrom: ["dependencies"],
        ignorePatchVersion: true,
      }),
    }),
    new HtmlWebpackPlugin({
      template: "./public/index.html",
    }),
    new DashboardPlugin({
      filename: "dashboard.json",
      metadata: {
        source: {
          url:
            "https://github.com/module-federation/federation-dashboard/tree/master/dashboard-example/dsl",
        },
        remote: "http://localhost:3002/remoteEntry.js",
      },
      reportFunction: (data) => {
        console.log("afterDone", data);
      },
    }),
  ],
};
