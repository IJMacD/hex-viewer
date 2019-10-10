const HtmlWebpackPlugin = require('html-webpack-plugin');
const TerserJSPlugin = require('terser-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const OptimizeCSSAssetsPlugin = require('optimize-css-assets-webpack-plugin');
const devMode = process.env.NODE_ENV !== 'production';

module.exports = {
    optimization: {
        minimizer: [
            new TerserJSPlugin({}),
            new OptimizeCSSAssetsPlugin({}),
        ],
    },
    plugins: [
        new HtmlWebpackPlugin({
            title: "HexViewer",
            template: "index.html",
            minify: { 
                // https://github.com/kangax/html-minifier#options-quick-reference 
                collapseWhitespace: true, 
                removeComments: true, 
                removeRedundantAttributes: true, 
                removeScriptTypeAttributes: true, 
                removeStyleLinkTypeAttributes: true, 
                useShortDoctype: true,
            },
        }),
        new MiniCssExtractPlugin({
            // Options similar to the same options in webpackOptions.output
            // both options are optional
            filename: devMode ? '[name].css' : '[name].[hash].css',
            chunkFilename: devMode ? '[id].css' : '[id].[hash].css',
        }),
    ],
    resolve: {
        extensions: [".jsx",".js"],
    },
    module: {
        rules: [
            {
                test: /\.jsx?/,
                exclude: /node_modules/,
                use: {
                    loader: "babel-loader",
                    options: {
                        presets: ['@babel/preset-env','@babel/preset-react'],
                    },
                },
            },
            {
                test: /\.css$/i,
                use: [
                    {
                        loader: MiniCssExtractPlugin.loader,
                        options: {
                            hmr: process.env.NODE_ENV === 'development',
                        },
                    },
                    'css-loader',
                    'postcss-loader',
                ],
            },
        ],
    },
};