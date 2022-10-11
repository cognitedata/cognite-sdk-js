import {
  Converter,
  UnitDictionariesProcessorImpl,
} from '@cognite-ornellas/units/';

const converter = new Converter(new UnitDictionariesProcessorImpl());

const unitConverter = (
  value: any,
  inputUnit: string,
  outputUnit: string,
  precision = 6
) => {
  return converter
    .unitConvert(value, inputUnit, outputUnit)
    .toPrecision(precision);
};

export default unitConverter;
