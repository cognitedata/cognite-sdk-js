import {
  Datapoints,
  StringDatapoint,
  DoubleDatapoint,
  UnitConverterOptions,
} from '../../types';

import convertUnit from './unitConverter';

/**
 * Convert datapoints based on the given output unit.
 * Note that there are two possible behaviors if the conversion fails:
 * It will depend on `unitsConversionOptions.continueIfConversionFails` parameter. If it's true
 * the application will throw an error and stop running if conversion fails. If it's false it will log warns.
 * A fail might occur if there is something wrong with the datapoint value or the selected output unit
 * is unsuported.
 * @param dataPointsData
 * @param unitsConversionOptions
 * @returns dataPointsData that were possible to convert
 */
const dataPointsUnitsConverter = (
  dataPointsData: Datapoints[],
  unitsConversionOptions: UnitConverterOptions
): Datapoints[] => {
  const converted = dataPointsData?.map((data) =>
    processDataPointsData(data, unitsConversionOptions)
  );

  return converted;
};

function processDataPointsData(
  data: Datapoints,
  unitsConversionOptions: UnitConverterOptions
): Datapoints {
  if (data.unit && unitsConversionOptions.continueIfConversionFails) {
    try {
      return convertDataPoints(data, unitsConversionOptions);
    } catch (e) {
      console.warn(
        `
          Something went wrong when converting from ${data.unit}
          to ${unitsConversionOptions.outputUnit}
          for datapoints with ${
            data.externalId ? `externalId ${data.externalId}` : `id ${data.id}`
          }
        `
      );
    }
  } else if (data.unit && !unitsConversionOptions.continueIfConversionFails) {
    return convertDataPoints(data, unitsConversionOptions);
  }

  return data;
}

/**
 * Tries to convert datapoints units. If any fails it gives up converting and returns
 * the @data input param
 * @param data
 * @param unitsConversionOptions
 * @returns converted data points
 */
function convertDataPoints(
  data: Datapoints,
  unitsConversionOptions: UnitConverterOptions
): Datapoints {
  const convertedDataPoints: StringDatapoint[] | DoubleDatapoint[] =
    processDataPoints(data, unitsConversionOptions);

  const newData = Object.assign({}, data);
  newData.datapoints = convertedDataPoints;

  return newData;
}

function processDataPoints(
  data: Datapoints,
  unitsConversionOptions: UnitConverterOptions
): StringDatapoint[] | DoubleDatapoint[] {
  const datapoints: (StringDatapoint | DoubleDatapoint)[] = [];

  for (const dataPoint of data.datapoints) {
    const convertedValue = convertUnit(
      dataPoint.value,
      data.unit!,
      unitsConversionOptions.outputUnit,
      unitsConversionOptions.precision
    );

    const newDataPoint = Object.assign({}, dataPoint);
    newDataPoint.value = convertedValue;

    datapoints.push(newDataPoint);
  }

  return datapoints as StringDatapoint[] | DoubleDatapoint[];
}

export default dataPointsUnitsConverter;
