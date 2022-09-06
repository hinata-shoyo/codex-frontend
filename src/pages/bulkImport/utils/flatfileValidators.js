import axios from 'axios';
import { partition } from 'lodash-es';

import parseAssetString from './parseAssetString';

export async function validateIndividualNames(names) {
  const response = await axios.request({
    method: 'post',
    url: `${__houston_url__}/api/v1/individuals/validate`,
    data: names,
  });
  return response?.data || [];
}

const minmax = {
  decimalLatitude: [-180, 180],
  decimalLongitude: [-180, 180],
  timeYear: [1900, 2099],
  timeMonth: [1, 12],
  timeDay: [1, 31],
  timeHour: [0, 23],
  timeMinutes: [0, 59],
  timeSeconds: [0, 59],
};
const minmaxKeys = Object.keys(minmax);

export function validateMinMax(record) {
  const recordHookResponse = {};
  minmaxKeys.forEach(key => {
    if (record[key]) {
      const value = parseFloat(record[key]);
      const min = minmax[key][0];
      const max = minmax[key][1];
      if (value < min || value > max) {
        recordHookResponse[key] = {
          info: [
            {
              message: `Value must be between ${min} and ${max}`,
              level: 'error',
            },
          ],
        };
      }
    }
  });
  return recordHookResponse;
}

export function validateAssetStrings(filenames, assetStringInputs) {
  const validationMessages = assetStringInputs.map(
    assetStringInput => {
      const [assetString, rowIndex] = assetStringInput;
      const assets = parseAssetString(assetString);
      if (assets.length === 0) return null;
      const [matchedAssets, unmatchedAssets] = partition(assets, a =>
        filenames.includes(a),
      );

      const matchedAssetsString = matchedAssets.join(', ');
      const unmatchedAssetsString = unmatchedAssets.join(', ');
      const matchedAssetsMessage = `The following asset(s) were found: ${matchedAssetsString}.`;
      const unmatchedAssetsMessage = ` The following asset(s) were not found and will be ignored: ${unmatchedAssetsString}.`;

      let message =
        matchedAssets.length > 0 ? matchedAssetsMessage : '';
      message = message.concat(
        unmatchedAssets.length > 0 ? unmatchedAssetsMessage : '',
      );

      const level = unmatchedAssets.length > 0 ? 'warning' : 'info';

      const rowMessage = {
        info: [
          {
            message,
            level,
          },
        ],
      };
      return [rowMessage, rowIndex];
    },
  );

  return validationMessages.filter(message => message);
}

export function validateMultiselects(validOptions, columnCells) {
  const validationMessages = columnCells.map(cell => {
    const [cellValue, rowIndex] = cell;

    const enteredValues = parseAssetString(cellValue);
    if (enteredValues.length === 0) return null;

    const [matchedValues, unmatchedValues] = partition(
      enteredValues,
      value => validOptions.includes(value),
    );

    const matchedOptionsString = matchedValues.join(', ');
    const unmatchedOptionsString = unmatchedValues.join(', ');
    const matchedOptionsMessage = `The following option(s) were found: ${matchedOptionsString}.`;
    const unmatchedOptionsMessage = ` The following option(s) were not found and will be ignored: ${unmatchedOptionsString}.`;

    let message =
      matchedValues.length > 0 ? matchedOptionsMessage : '';
    message = message.concat(
      unmatchedValues.length > 0 ? unmatchedOptionsMessage : '',
    );

    const level = unmatchedValues.length > 0 ? 'warning' : 'info';

    const rowMessage = {
      info: [
        {
          message,
          level,
        },
      ],
    };
    return [rowMessage, rowIndex];
  });

  return validationMessages.filter(message => message);
}
