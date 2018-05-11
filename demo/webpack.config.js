const path = require('path');

module.exports = {
    context: __dirname,
    entry: './script.jsm',
    output: {
        path: __dirname,
        filename: 'script.js'
    },
    mode: 'development',
    module: {
        rules: [
            {
                test: /\.jsm$/,
                use: {
                    loader: 'babel-loader',
                    options: {
                        presets: ['@babel/preset-env']
                    }
                }
            }
        ]
    }
}
