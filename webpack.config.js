const path = require('path')
const webpack = require('webpack')
const HtmlWebpackPlugin = require('html-webpack-plugin')
const svgToMiniDataURI = require('mini-svg-data-uri')

const srcPath = 'src/client'
const outputPath = 'public'
const env = process.env.NODE_ENV
const isProdEnv = () => env === 'production'

const config = {
  context: path.resolve(__dirname, srcPath),
  entry: {
    app: './index.js'
  },
  output: {
    path: path.resolve(__dirname, outputPath),
    filename: '[name].js',
    globalObject: 'window'
  },
  node: {
    __filename: true
  },

  module: {
    rules: [
      {
        test: /\.js$/,
        include: path.resolve(__dirname, srcPath),
        use: [
          {
            loader: 'babel-loader'
          }
        ]
      },
      {
        test: /\.css$/,
        use: ["style-loader", "css-loader"],
      },
      {
        test: /\.(png|jpg|jpeg|gif)$/,
        use: ['url-loader']
      },
      {
        test: /\.svg$/i,
        use: [
          {
            loader: 'url-loader',
            options: {
              generator: (content) => svgToMiniDataURI(content.toString())
            }
          }
        ]
      }
    ]
  },

  plugins: [
    new HtmlWebpackPlugin({
      template: path.resolve(__dirname, srcPath, 'html/index.html')
    }),
    new webpack.DefinePlugin({
      'process.env.NODE_ENV': JSON.stringify(`${env}`)
    })
  ],

  devtool: isProdEnv() ? 'source-map' : 'eval-source-map'
}

module.exports = config
