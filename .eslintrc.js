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
        'header',
        'lodash'
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
        "lodash/import-scope": ["error", "method"], // see PR #386

        "@typescript-eslint/ban-types": [
        "error",
        {
          "types": {
            "String": {
              "message": "Use ts primitive 'string' instead",
              "fixWith": "string"
            },
            "Boolean": {
              "message": "Use ts primitive 'boolean' instead",
              "fixWith": "boolean"
            },
            "Number": {
              "message": "Use ts primitive 'number' instead",
              "fixWith": "number"
            },
            "symbol": {
              "message": "Use ts primitive 'symbol' instead",
              "fixWith": "symbol"
            },

            "{}": {
              "message": "Use object instead",
              "fixWith": "object"
            }
          }
        }
      ]
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
