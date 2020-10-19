// Type definitions for wkt
// Project: https://github.com/benrei/wkt
// Definitions by: Adam Tombleson rekarnar@gmail.com
// Definitions: https://github.com/DefinitelyTyped/DefinitelyTyped
declare module 'wkt' {
  function stringify(geoJSON: object): string;
  function parse(wkt: string): object;
}
