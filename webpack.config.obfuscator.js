const path = require('path');
const JavaScriptObfuscator = require('webpack-obfuscator');

module.exports = {
    mode: 'production',
    entry: {
        game: './game.js'
    },
    output: {
        filename: '[name].js',
        libraryTarget: "umd",
        path: path.resolve(__dirname, '[name]-dist'),
    },
    module: {
        rules: [
            {
                test: /\.js$/,
                exclude: /node_modules/,
                use: {
                    loader: 'babel-loader',
                    options: {
                        presets: ['env']
                    }
                }
            }]
    },
    plugins: [
        new JavaScriptObfuscator({
            rotateUnicodeArray: true
        }, ['excluded_bundle_name.js'])
    ],
    optimization: {
        
        minimizer: [],
        
    },
};
