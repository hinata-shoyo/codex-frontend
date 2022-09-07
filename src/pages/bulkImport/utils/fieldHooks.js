import {
  validateAssetStrings,
  validateIndividualNames,
  validateMultiselects,
} from './flatfileValidators';

export function partialAssetFieldHook(assetFilenames) {
  return function assetFieldHook(columnCells) {
    return validateAssetStrings(assetFilenames, columnCells);
  };
}

export async function firstNameFieldHook(columnCells) {
  try {
    return await validateIndividualNames(columnCells);
  } catch (e) {
    console.error('Error validating individual names: ', e);
    return [];
  }
}

export function partialMultiselectFieldHook(validOptions) {
  return function multiselectFieldHook(columnCells) {
    return validateMultiselects(validOptions, columnCells);
  };
}
