import * as path from "path";

var config = {
    entry: "./src/index.js",
    output: {
        path: path.resolve("dist"),
        filename: "bundle.js",
        library: {
            type: 'module',
        },
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
    target: "web",
    experiments: {
        outputModule: true,
    }
};

export default (env, argv) => {
    if (argv.mode === "development") {
        config.devtool = "source-map";
    }

    if (argv.mode === "production") {
    //...
    }

    return config;
};