module.exports = {
    root: true,
    ignorePatterns: ['node_modules/', 'dist/', 'react/'],
    extends: [
        'eslint:recommended',
        'plugin:@typescript-eslint/recommended', //Add typescript plugin and recomended rules
        "prettier/@typescript-eslint", //Remove typescript rules that would conflict with prettier
        "plugin:prettier/recommended" //Add prettier plugin, recomended config, and remove rules that would conflict (must be last)
    ],
    plugins: [
        '@typescript-eslint',
        'prettier',
        'header'
    ],
    parser: '@typescript-eslint/parser',
    parserOptions: {
        tsconfigRootDir: __dirname,
        project: "tsconfig.common.json",
        sourceType: "module"
    },
    rules: {
        "@typescript-eslint/explicit-module-boundary-types": "off",
        "@typescript-eslint/no-inferrable-types": "off",
        "@typescript-eslint/no-explicit-any": "off",
        "@typescript-eslint/no-non-null-assertion": "off",
        "@typescript-eslint/ban-ts-comment": "off",
        "react/prop-types": "off",
        "prettier/prettier": "error",

        //added manually while migrating from tslint
        "@typescript-eslint/ban-types": "off",
    },
    overrides: [{
        files: ['**/src/*'],
        rules: {
            "header/header": [2, "line",
                [{
                    "pattern": " Copyright \\d{4} Cognite AS",
                    "template": " Copyright 2020 Cognite AS"
                }]
            ]
        }
    }],
    env: {
        browser: true,
        node: true
    },
};
