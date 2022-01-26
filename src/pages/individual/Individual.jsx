import React, { useState, useMemo } from 'react';
import { useParams, useHistory } from 'react-router-dom';
import { FormattedMessage } from 'react-intl';
import { get, capitalize } from 'lodash-es';
import { useQueryClient } from 'react-query';

import SexIcon from '@material-ui/icons/Nature';
import AgeIcon from '@material-ui/icons/Height';
import StatusIcon from '@material-ui/icons/LocalHospital';

import { getIndividualQueryKey } from '../../constants/queryKeys';
import useIndividual from '../../models/individual/useIndividual';
import useDeleteIndividual from '../../models/individual/useDeleteIndividual';
import usePatchIndividual from '../../models/individual/usePatchIndividual';

// VERILY BAD HOTFIX //
import defaultIndividualSrc from '../../assets/defaultIndividual.png';
import FeaturedPhoto from '../sighting/featuredPhoto/FeaturedPhoto';
// VERILY BAD HOTFIX //

import useIndividualFieldSchemas from '../../models/individual/useIndividualFieldSchemas';
import LoadingScreen from '../../components/LoadingScreen';
import MoreMenu from '../../components/MoreMenu';
import EntityHeaderNew from '../../components/EntityHeaderNew';
import MainColumn from '../../components/MainColumn';
import SadScreen from '../../components/SadScreen';
import Button from '../../components/Button';
import Text from '../../components/Text';
import CardContainer from '../../components/cards/CardContainer';
import SightingsCard from '../../components/cards/SightingsCard';
import MetadataCard from '../../components/cards/MetadataCard';
import GalleryCard from '../../components/cards/GalleryCard';
import ConfirmDelete from '../../components/ConfirmDelete';
import RelationshipsCard from '../../components/cards/RelationshipsCard';
import CooccurrenceCard from '../../components/cards/CooccurrenceCard';
import useDocumentTitle from '../../hooks/useDocumentTitle';
import EditIndividualMetadata from './EditIndividualMetadata';
import fakeAssets from './fakeAssets';
import fakeCoocs from './fakeCoocs';
import fakeRelationships from './fakeRelationships';

const items = [
  {
    key: 'sex',
    id: 'sex',
    icon: SexIcon,
    value: 'Male',
    titleId: 'PROFILE_LABEL_SEX',
  },
  {
    key: 'age',
    id: 'age',
    icon: AgeIcon,
    value: 42,
    titleId: 'PROFILE_LABEL_AGE',
  },
  {
    id: 'status',
    key: 'status',
    icon: StatusIcon,
    value: 'Alive',
    titleId: 'PROFILE_LABEL_STATUS',
  },
];

export default function Individual() {
  const { id } = useParams();
  const queryClient = useQueryClient();
  const { data: individualData, statusCode, loading } = useIndividual(
    id,
  );
  const history = useHistory();
  const fieldSchemas = useIndividualFieldSchemas();

  function refreshIndividualData() {
    const queryKey = getIndividualQueryKey(id);
    queryClient.invalidateQueries(queryKey);
  }

  const metadata = useMemo(
    () => {
      if (!individualData || !fieldSchemas) return null;
      return fieldSchemas.map(schema => ({
        ...schema,
        value: schema.getValue(schema, individualData),
      }));
    },
    [individualData, fieldSchemas],
  );

  const defaultName = get(
    individualData,
    ['names', 'defaultName'],
    'Unnamed individual',
  );
  const nickname = individualData?.names?.nickname;

  const {
    deleteIndividual,
    loading: deleteInProgress,
    error: deleteError,
    setError: setDeleteError,
  } = useDeleteIndividual();

  const {
    removeEncounterFromIndividual,
    loading: patchInProgress,
    error: patchError,
    setError: setPatchError,
  } = usePatchIndividual();

  useDocumentTitle(capitalize(defaultName), {
    translateMessage: false,
  });
  const [editingProfile, setEditingProfile] = useState(false);
  const [deletingIndividual, setDeletingIndividual] = useState(false);
  const [deleteEncounterId, setDeleteEncounterId] = useState(null);

  if (loading) return <LoadingScreen />;

  if (statusCode === 404)
    return (
      <SadScreen
        variant="notFoundOcean"
        subtitleId="INDIVIDUAL_NOT_FOUND"
      />
    );

  return (
    <MainColumn fullWidth>
      <EditIndividualMetadata
        open={editingProfile}
        onClose={() => setEditingProfile(false)}
        individualId={id}
        metadata={metadata}
        refreshIndividualData={refreshIndividualData}
      />
      <ConfirmDelete
        open={Boolean(deleteEncounterId)}
        onClose={() => setDeleteEncounterId(null)}
        onDelete={async () => {
          const deleteSuccessful = await removeEncounterFromIndividual(
            id,
            deleteEncounterId,
          );

          if (deleteSuccessful) {
            setDeleteEncounterId(null);
            refreshIndividualData();
          }
        }}
        deleteInProgress={patchInProgress}
        error={patchError}
        onClearError={() => setPatchError(null)}
        messageId="CONFIRM_REMOVE_CLUSTER_FROM_INDIVIDUAL"
      />
      <ConfirmDelete
        open={deletingIndividual}
        onClose={() => setDeletingIndividual(false)}
        onDelete={async () => {
          const deleteSuccessful = await deleteIndividual(id);
          if (deleteSuccessful) {
            setDeletingIndividual(false);
            history.push('/individuals');
          }
        }}
        deleteInProgress={deleteInProgress}
        error={deleteError}
        onClearError={() => setDeleteError(null)}
        messageId="CONFIRM_DELETE_INDIVIDUAL"
      />
      <EntityHeaderNew
        name={defaultName}
        renderAvatar={
          <FeaturedPhoto
            data={null}
            loading={false}
            refreshSightingData={Function.prototype}
            defaultPhotoSrc={defaultIndividualSrc}
          />
        }
        renderOptions={
          <div style={{ display: 'flex' }}>
            <Button display="primary">SUBSCRIBE</Button>
            <MoreMenu
              menuId="individual-actions"
              items={[
                {
                  id: 'edit-profile',
                  onClick: () => setEditingProfile(true),
                  label: 'Edit profile',
                },
                {
                  id: 'view-history',
                  onClick: Function.prototype,
                  label: 'View history',
                },
                {
                  id: 'delete-individual',
                  onClick: () => setDeletingIndividual(true),
                  label: 'Delete individual',
                },
              ]}
            />
          </div>
        }
      >
        <Text>{`Also known as ${nickname}.`}</Text>
      </EntityHeaderNew>
      <div style={{ display: 'flex', flexWrap: 'wrap' }}>
        <CardContainer size="small">
          <GalleryCard title="Photos of Teddy" assets={fakeAssets} />
          <MetadataCard editable metadata={items} />
        </CardContainer>
        <CardContainer>
          <SightingsCard
            title={
              <FormattedMessage
                id="SIGHTINGS_OF"
                values={{ name: individualData?.name }}
              />
            }
            columns={['date', 'submitter', 'location', 'actions']}
            onDelete={encounterId =>
              setDeleteEncounterId(encounterId)
            }
          />
          <RelationshipsCard
            title="Relationships"
            relationships={fakeRelationships}
          />
          <CooccurrenceCard data={fakeCoocs} />
        </CardContainer>
      </div>
    </MainColumn>
  );
}
