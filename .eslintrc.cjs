module.exports = {
    "env": {
        "es6": true,
        "browser": true,
        "es2021": true
    },
    "extends": [
        "eslint:recommended",
        //"plugin:@typescript-eslint/recommended"
    ],
    //"parser": "@typescript-eslint/parser",
    "parserOptions": {
        "ecmaVersion": "latest",
        "sourceType": "module"
    },
    "plugins": [
        "jsdoc"
       // "@typescript-eslint"
    ],
    "rules": {
        "indent": [
            "error",
            4
        ],
        "linebreak-style": [
            "error",
            "unix"
        ],
        "quotes": [
            "error",
            "double"
        ],
        "semi": [
            "error",
            "always"
        ],
        //"@typescript-eslint/no-explicit-any": "off"//remove this later
        "jsdoc/no-undefined-types": 1
    }
};
