// Do not modify this file!
// It was generated by the command "yarn codegen".
// Instead update the code generation logic or the OpenAPI document.

/**
 * A response with cyclic references
 */
export type CyclicResponse = Filter;
export interface Filter {
    filter?: FilterOption;
}
export interface FilterOption {
    option?: Filter;
}
