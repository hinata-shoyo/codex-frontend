import React, { useState, useEffect } from 'react';
import { FlatfileButton } from '@flatfile/react';
import { get, omit } from 'lodash-es';
import { useHistory } from 'react-router-dom';
import { useQueryClient } from 'react-query';

import { useTheme } from '@material-ui/core/styles';
import Grid from '@material-ui/core/Grid';
import Paper from '@material-ui/core/Paper';
import CustomAlert from '../../components/Alert';

import queryKeys from '../../constants/queryKeys';
import usePostAssetGroup from '../../models/assetGroup/usePostAssetGroup';
import useSiteSettings from '../../models/site/useSiteSettings';
import useSightingFieldSchemas from '../../models/sighting/useSightingFieldSchemas';
import useEncounterFieldSchemas from '../../models/encounter/useEncounterFieldSchemas';
import LoadingScreen from '../../components/LoadingScreen';
import InputRow from '../../components/fields/edit/InputRow';
import Button from '../../components/Button';
import Text from '../../components/Text';

import BulkFieldBreakdown from './BulkFieldBreakdown';
import prepareAssetGroup from './utils/prepareAssetGroup';
import useBulkImportFields from './utils/useBulkImportFields';
import { flatfileSchemaOmitList } from './constants/bulkReportConstants';
import { validateMinMax } from './utils/flatfileValidators';

function getFieldHooks(fields) {
  return fields.reduce((memo, field) => {
    if (field.fieldHook) memo[field.key] = field.fieldHook;
    return memo;
  }, {});
}

async function onRecordChange(
  record,
  recordIndex,
  recordChangeHandlers,
) {
  const minMaxMessages = validateMinMax(record);

  const settledHandlerPromises = await Promise.allSettled(
    (recordChangeHandlers || []).map(recordChangeHandler =>
      recordChangeHandler(record, recordIndex),
    ),
  );

  const handlerMessages = settledHandlerPromises.reduce(
    (memo, settledPromise) => {
      if (settledPromise.value) {
        memo = { ...memo, ...settledPromise.value };
      }
      return memo;
    },
    {},
  );

  return { ...minMaxMessages, ...handlerMessages };
}

function onRecordInit(record) {
  return validateMinMax(record);
}

export default function BulkReportForm({ assetReferences }) {
  const theme = useTheme();
  const history = useHistory();
  const { data: siteSettingsData } = useSiteSettings();
  const [sightingData, setSightingData] = useState(null);
  const [detectionModel, setDetectionModel] = useState('');
  const queryClient = useQueryClient();
  const [everythingReadyForFlatfile, setEverythingReadyForFlatfile] =
    useState(false);

  const { postAssetGroup, loading, error } = usePostAssetGroup();

  const filenames = (assetReferences || []).map(a => a?.path);
  const {
    numEncounterFieldsForFlatFile,
    numSightingFieldsForFlatFile,
    availableFields,
  } = useBulkImportFields(filenames);
  const sightingFieldSchemas = useSightingFieldSchemas();
  const encounterFieldSchemas = useEncounterFieldSchemas();

  const recaptchaPublicKey = get(siteSettingsData, [
    'recaptchaPublicKey',
    'value',
  ]);

  const detectionModelField = sightingFieldSchemas.find(
    schema => schema.name === 'speciesDetectionModel',
  );

  useEffect(() => {
    if (
      numEncounterFieldsForFlatFile > 0 &&
      numSightingFieldsForFlatFile > 0
    ) {
      // wait for these to become non-zero to be confident that availableFields is fully populated before sending off to FlatFile
      setEverythingReadyForFlatfile(true);
    }
  }, [
    numEncounterFieldsForFlatFile,
    numSightingFieldsForFlatFile,
    encounterFieldSchemas,
    sightingFieldSchemas,
  ]);

  if (!everythingReadyForFlatfile) return <LoadingScreen />;

  const flatfileKey = get(siteSettingsData, ['flatfileKey', 'value']);

  return (
    <>
      <div style={{ marginLeft: 12 }}>
        <Text variant="h6" style={{ marginTop: 20 }}>
          Review available fields
        </Text>
      </div>
      <BulkFieldBreakdown availableFields={availableFields} />

      <Grid item style={{ marginTop: 12 }}>
        <div style={{ marginLeft: 12 }}>
          <Text variant="h6" style={{ marginTop: 20 }}>
            Import data
          </Text>
        </div>
        <Paper
          elevation={2}
          style={{
            marginTop: 20,
            marginBottom: 32,
            display: 'flex',
            flexDirection: 'column',
            padding: '20px 12px',
          }}
        >
          <FlatfileButton
            licenseKey={flatfileKey}
            customer={{ userId: 'dev' }}
            settings={{
              devMode: __DEV__,
              managed: true,
              disableManualInput: true,
              title: 'Import sightings data',
              type: 'bulk_import',
              fields: availableFields.map(field =>
                omit(field, flatfileSchemaOmitList),
              ),
              styleOverrides: {
                primaryButtonColor: theme.palette.primary.main,
              },
            }}
            onRecordInit={onRecordInit}
            onRecordChange={(record, recordIndex) =>
              onRecordChange(
                record,
                recordIndex,
                availableFields.reduce((memo, schema) => {
                  if (schema.onRecordChange) {
                    memo.push(schema.onRecordChange);
                  }
                  return memo;
                }, []),
              )
            }
            onData={async results => {
              setSightingData(results.data);
            }}
            fieldHooks={getFieldHooks(availableFields)}
            render={(importer, launch) => (
              <Button
                style={{ width: 260 }}
                display="primary"
                onClick={launch}
                id="UPLOAD_SPREADSHEET"
              />
            )}
          />
          {sightingData ? (
            <Text
              id="ENCOUNTERS_IMPORTED_COUNT"
              values={{ encounterCount: sightingData.length }}
              variant="body2"
              style={{ margin: '8px 0 8px 4px' }}
            />
          ) : null}

          {detectionModelField && (
            <InputRow schema={detectionModelField}>
              <detectionModelField.editComponent
                schema={detectionModelField}
                value={detectionModel}
                onChange={value => {
                  setDetectionModel(value);
                }}
                minimalLabels
              />
            </InputRow>
          )}
        </Paper>
      </Grid>

      {error && (
        <Grid style={{ marginTop: 12 }} item>
          <CustomAlert severity="error" titleId="SUBMISSION_ERROR">
            {error}
          </CustomAlert>
        </Grid>
      )}
      <Grid
        item
        style={{
          marginTop: 12,
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        <Button
          onClick={async () => {
            const sightings = prepareAssetGroup(
              sightingData,
              assetReferences,
            );
            const assetGroup = {
              description: 'Bulk import from user',
              uploadType: 'bulk',
              speciesDetectionModel: [detectionModel || null],
              transactionId: get(assetReferences, [
                0,
                'transactionId',
              ]),
              sightings,
            };

            if (window.grecaptcha) {
              const grecaptchaReady = new Promise(resolve => {
                window.grecaptcha.ready(() => {
                  resolve();
                });
              });

              await grecaptchaReady;
              const token = await window.grecaptcha.execute(
                recaptchaPublicKey,
                { action: 'submit' },
              );
              assetGroup.token = token;
            }
            const assetGroupData = await postAssetGroup(assetGroup);
            const assetGroupId = get(assetGroupData, 'guid');
            if (assetGroupId) {
              history.push(`/bulk-import/success/${assetGroupId}`);
              queryClient.invalidateQueries(queryKeys.me);
            }
          }}
          style={{ width: 200 }}
          loading={loading}
          display="primary"
          disabled={!sightingData}
          id="REPORT_SIGHTINGS"
        />
      </Grid>
    </>
  );
}
