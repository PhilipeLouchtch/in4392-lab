const path = require('path');
const glob = require('glob');
const packages = glob.sync('./packages/*');    

const entries = packages.map(package => ({
    name: package.match(/[a-zA-Z\-\_0-9]+$/)[0],
    entry: package + '/index.ts',
}))

module.exports = {
    entry: entries.reduce((o, e) => ({ ...o, [e.name]: e.entry }), {}),
    module: {
        rules: [
            {
                test: /\.tsx?$/,
                use: 'ts-loader',
                exclude: /node_modules/
            }
        ]
    },
    resolve: {
        extensions: ['.tsx', '.ts', '.js']
    },
    output: {
        filename: '[name]/index.js',
        path: path.resolve(__dirname, 'dist')
    }
};
