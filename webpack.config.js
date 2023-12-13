import * as path from "path";

var config = {
    entry: "./src/index.js",
    //output: {
    //    path: path.resolve("dist"),
    //    filename: "index.js",
    //    chunkFormat: "module",
    //    module: true,
        //libraryTarget: 'umd',
    //},
    output: {
        filename: "index.es6.js",
        library: {
            type: 'module'
        },
    },
    //devServer: {
    //    static: ["dist", "examples"],
    //    compress: false,
    //    hot: false,
    //    port: 9000,
    //},
    experiments: {
        topLevelAwait: true,
        syncWebAssembly: true,
        outputModule: true,
    },
    resolve: {
        fallback: {
            "fs": false,
            "https": false,
            "http": false,
            "url": false,
            "stream": false,
            "crypto": false,
            "zlib": false,
            "utf-8-validate": false,
            "bufferutil": false,
            "net": false,
            "tls": false,
            "child_process": false
        },
    },
    //target: "web"
};

export default (env, argv) => {
    if (argv.mode === "development") {
        config.devtool = "source-map";
    }

    if (argv.mode === "production") {
        config.output.filename = "index.es6.min.js";
    }
    /*
    if (argv.mode === "production-es5") {
        config.output.filename = "index.es5.min.js";
        config.library.type = 'commonjs';
    }

    if (argv.mode === "production-global") {
        config.output.filename = "index..min.js";
        config.library.type = 'window';
    }*/
    return config;
};