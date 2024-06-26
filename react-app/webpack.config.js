const webpack = require("webpack");
const HtmlWebpackPlugin = require("html-webpack-plugin");
const TerserWebpackPlugin = require("terser-webpack-plugin");
const { resolveTsAliases } = require("resolve-ts-aliases");

const isProd = process.env.NODE_ENV === "production";

console.log({ e: process.env.NODE_ENV, __dirname });

const config = {
  mode: isProd ? "production" : "development",
  entry: ["./src/index.tsx"],
  output: {
    path: `${__dirname}/dist`,
    publicPath: "/",
    filename: "[name].js",
  },
  devtool: "source-map",
  resolve: {
    extensions: [".js", ".jsx", ".ts", ".tsx"],
    alias: {
      ...resolveTsAliases(__dirname + "/tsconfig.json")
    },
  },
  module: {
    rules: [
      {
        test: /\.tsx?$/,
        use: "babel-loader",
        exclude: /node_modules/,
      },
      {
        test: /\.s[ac]ss$/i,
        use: ["style-loader", "css-loader", "sass-loader"],
      },
      {
        test: /\.svg$/,
        use: ["@svgr/webpack", "file-loader"],
      },
      {
        test: /\.(png|jpg|gif|ico)$/,
        use: ["file-loader"],
      },
    ],
  },
  plugins: [
    new HtmlWebpackPlugin({
      template: "src/index.html",
      templateParameters: {
        env: process.env.NODE_ENV,
      },
      favicon: "src/assets/favicon.ico",
    }),
    new webpack.DefinePlugin({
      "process.env.NODE_ENV": JSON.stringify(process.env.NODE_ENV),
    }),
  ],
};

if (isProd) {
  config.optimization = {
    minimizer: [new TerserWebpackPlugin()],
  };
} else {
  config.devServer = {
    // publicPath: "/",
    // port: 8080,
    client: {
      overlay: true,
      progress: true,
    },
    static: {
      publicPath: "/",
    },
    port: 8080,
    // open: true,
    // // hot: false,
    // compress: true,
    // stats: "errors-only",
    // overlay: true,
    historyApiFallback: {
      disableDotRule: true,
    },
    // watchOptions: {
    //     aggregateTimeout: 500,
    //     poll: 3000,
    //     ignored: 'node_modules/**'
    // },
  };
}

console.log({ config });

module.exports = config;
