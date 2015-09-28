var webpack = require('webpack')
module.exports = {
    // configuration
    context: __dirname + "/public/src",
    entry: "./entry",
    devtool: "#source-map",
    output: {
        // sourceMapFilename:"bundle.js.map",
        path: __dirname + "/public/",
        filename: "bundle.js"
    },
    module:{
        loaders:[
            { test: /\.coffee$/, loader:"coffee-loader" },
            {
              test: /\.js$/,
              exclude: /(node_modules|bower_components)/,
              loader: 'babel'
            }
        ]},
    plugins: [
        // new webpack.optimize.UglifyJsPlugin({
        //     compress: {
        //         warnings: false
        //     }
        // })
    ]
};
