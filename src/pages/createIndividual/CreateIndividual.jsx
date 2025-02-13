import React, { useMemo, useEffect, useState } from 'react';
import { useLocation } from 'react-router';
import { set, get } from 'lodash-es';
import { useIntl } from 'react-intl';

import Grid from '@material-ui/core/Grid';

import useDocumentTitle from '../../hooks/useDocumentTitle';
import MainColumn from '../../components/MainColumn';
import Text from '../../components/Text';
import Button from '../../components/Button';
import InputRow from '../../components/fields/edit/InputRow';
import Alert from '../../components/Alert';
import EncounterCard from '../../components/cards/EncounterCard';
import useIndividualFieldSchemas from '../../models/individual/useIndividualFieldSchemas';
import usePostIndividual from '../../models/individual/usePostIndividual';

function calculateInitialState(schemas) {
  if (!schemas) return {};
  return schemas.reduce((memo, field) => {
    set(memo, field.name, field.defaultValue);
    return memo;
  }, {});
}

export default function CreateIndividual() {
  const { search } = useLocation();
  useDocumentTitle('CREATE_INDIVIDUAL');

  const searchParams = new URLSearchParams(search);
  const encounterGuids = searchParams.getAll('e') || [];

  const {
    mutate: createIndividual,
    loading: createIndividualLoading,
    error: createIndividualError,
  } = usePostIndividual();
  const intl = useIntl();

  const fieldSchemas = useIndividualFieldSchemas();

  const createFieldSchemas = useMemo(
    () => fieldSchemas.filter(f => f.requiredForIndividualCreation),
    [fieldSchemas, fieldSchemas?.length],
  );

  const [formState, setFormState] = useState({});
  const [formErrors, setFormErrors] = useState([]);

    const showErrorAlert =
    createIndividualError || formErrors.length > 0;

  useEffect(() => {
    const initialState = calculateInitialState(createFieldSchemas);
    setFormState(initialState);
  }, [createFieldSchemas]);

  async function postIndividual() {

    const requiredFieldErrors = createFieldSchemas.reduce((acc, cur) => {
      if(!cur?.required) return acc;
      
      const isFieldEmpty = !formState[cur.name];
      if(isFieldEmpty) {
        const fieldName = cur.labelId ? intl.formatMessage({id : cur.labelId}) : cur.label;
        acc.push(
          intl.formatMessage(
            { id: 'INCOMPLETE_FIELD' },
            { fieldName },
          ),
        );
      }

      return acc;
    }, [])
    
    setFormErrors(requiredFieldErrors);    
    if(requiredFieldErrors.length > 0) {
      return;
    }


    const firstName = formState?.firstName;
    const adoptionName = formState?.adoptionName;
    const names = [
      {
        context: 'FirstName',
        value: firstName,
      },
    ];
    if (adoptionName)
      names.push({
        context: 'AdoptionName',
        value: adoptionName,
      });
    const individualData = {
      names,
      sex: formState?.sex,
      taxonomy: formState?.taxonomy
    };
    await createIndividual({
      individualData,
      encounterGuids,
    });
  }

  return (
    <MainColumn
      style={{
        display: 'flex',
        justifyContent: 'center',
        maxWidth: 1000,
      }}
    >
      <Grid
        container
        direction="column"
        spacing={2}
        style={{ padding: '20px 6vw' }}
      >
        <Grid item>
          <Text variant="h4" id="CREATE_INDIVIDUAL" />
        </Grid>
        <Grid item>
          <Text
            variant="subtitle2"
            id="CREATE_INDIVIDUAL_INSTRUCTIONS"
          />
        </Grid>
        <Grid item>
          <Text variant="h5" id="ANNOTATIONS" />
        </Grid>
        <Grid item>
          {encounterGuids.map(encounterGuid => (
            <EncounterCard
              key={encounterGuid}
              encounterGuid={encounterGuid}
            />
          ))}
        </Grid>
        <Grid
          item
          style={{ display: 'flex', flexDirection: 'column' }}
        >
          <Text variant="h5" id="METADATA" />
          <Grid
            container
            spacing={2}
            justifyContent="center"
            component="form"
            direction="column"
          >
            {createFieldSchemas.map(schema => (
              <Grid item key={schema.name}>
                <InputRow schema={schema}>
                  <schema.editComponent
                    schema={schema}
                    value={get(formState, schema.name)}
                    onChange={newFieldValue => {
                      const newFormState = {
                        ...set(formState, schema.name, newFieldValue),
                      };
                      setFormState(newFormState);
                    }}
                  />
                </InputRow>
              </Grid>
            ))}
          </Grid>
        </Grid>
        <Grid item style={{ marginTop: 16 }}>
          {showErrorAlert && (
            <Alert
              titleId="SUBMISSION_ERROR"
              style={{ marginTop: 12, marginBottom: 12 }}
              severity="error"
            >
              {formErrors.length > 0 &&
              formErrors.map(formError => (
                <Text key={formError} variant="body2">
                  {formError}
                </Text>
              ))}
              {createIndividualError}
            </Alert>
          )}
          <Button
            display="primary"
            id="CREATE_INDIVIDUAL"
            loading={createIndividualLoading}
            onClick={postIndividual}
          />
        </Grid>
      </Grid>
    </MainColumn>
  );
}
