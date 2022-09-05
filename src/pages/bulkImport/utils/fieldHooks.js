import {
  validateAssetStrings,
  validateIndividualNames,
} from './flatfileValidators';

export function assetReferencesFieldHook(
  columnCells,
  assetFilenames,
) {
  return validateAssetStrings(assetFilenames, columnCells);
}

export async function firstNameFieldHook(columnCells) {
  try {
    return await validateIndividualNames(columnCells);
  } catch (e) {
    console.error('Error validating individual names: ', e);
    return [];
  }
}
