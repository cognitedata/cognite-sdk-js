module.exports = {
    root: true,
    extends: [
        'eslint:recommended',
        'plugin:@typescript-eslint/recommended', //Add typescript plugin and recomended rules
        "prettier/@typescript-eslint", //Remove typescript rules that would conflict with prettier
        "plugin:prettier/recommended" //Add prettier plugin, recomended config, and remove rules that would conflict (must be last)
    ],
    plugins: [
        '@typescript-eslint',
        'prettier'
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
        "@typescript-eslint/no-unused-vars": "off",
        "prettier/prettier": "error",

        //added manually while migrating from tslint
        "@typescript-eslint/ban-types": "off",
        "@typescript-eslint/no-empty-function": "off",
        "no-constant-condition": "off" //makes while(true) illegal
    },
    env: {
        browser: true,
        node: true
    },
};