import React from 'react';
import { useParams } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { FormattedMessage } from 'react-intl';
import { capitalize } from 'lodash-es';
import EntityHeader from '../../components/EntityHeader';
import MainColumn from '../../components/MainColumn';
import NotFoundPage from '../../components/NotFoundPage';
import EncounterGallery from '../../components/EncounterGallery';
import { selectIndividuals } from '../../modules/individuals/selectors';
import { selectSpeciesFields } from '../../modules/site/selectors';
import useDocumentTitle from '../../hooks/useDocumentTitle';

export default function Individual() {
  const { id } = useParams();

  // fetch data for Id...
  const individuals = useSelector(selectIndividuals);
  const speciesFields = useSelector(selectSpeciesFields);
  useDocumentTitle(capitalize(id));

  const individual = individuals[id];
  if (!individual)
    return (
      <NotFoundPage
        subtitle={<FormattedMessage id="INDIVIDUAL_NOT_FOUND" />}
      />
    );

  const fieldSchema = speciesFields[individual.species];

  return (
    <MainColumn>
      <EntityHeader
        name={individual.name}
        imgSrc={individual.profile}
        fieldValues={individual.fields}
        fieldSchema={fieldSchema}
        editable={individual.editable}
      />
      <EncounterGallery
        title={
          <FormattedMessage
            id="ENCOUNTERS_WITH"
            values={{ name: individual.name }}
          />
        }
        encounters={individual.encounters}
      />
    </MainColumn>
  );
}
