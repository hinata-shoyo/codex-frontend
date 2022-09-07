import { get } from 'lodash-es';

import {
  validateAssetStrings,
  validateIndividualNames,
  validateMultiselects,
} from './flatfileValidators';

export function assetReferencesOnRecordChange(
  record,
  recordIndex,
  filenames,
) {
  const assetString = record?.assetReferences;
  if (!assetString) return null;

  const assetValidationResponse = validateAssetStrings(filenames, [
    [assetString, recordIndex],
  ]);

  const assetMessage = get(assetValidationResponse, [0, 0]);

  return { assetReferences: assetMessage };
}

export async function firstNameOnRecordChange(record, recordIndex) {
  const firstName = record?.firstName;
  if (!firstName) return null;

  try {
    const nameValidationResponse = await validateIndividualNames([
      [firstName, recordIndex],
    ]);
    const nameMessage = get(nameValidationResponse, [0, 0]);

    return nameMessage ? { firstName: nameMessage } : null;
  } catch (e) {
    console.error(
      `Error validating individual name "${firstName}" at ${recordIndex}`,
      e,
    );
    return null;
  }
}

export function multiselectOnRecordChange(
  record,
  recordIndex,
  key,
  validOptions,
) {
  const optionString = record?.[key];
  if (!optionString) return null;

  const multiselectValidationResponse = validateMultiselects(
    validOptions,
    [[optionString, recordIndex]],
  );

  const multiselectMessage = get(
    multiselectValidationResponse,
    [0, 0],
  );

  return { [key]: multiselectMessage };
}
