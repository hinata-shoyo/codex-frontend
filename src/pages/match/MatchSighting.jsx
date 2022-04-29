import React, { useMemo, useState } from 'react';
import { useIntl, FormattedMessage } from 'react-intl';
import { useParams } from 'react-router-dom';
import { get, maxBy } from 'lodash-es';

import Chip from '@material-ui/core/Chip';
import Fab from '@material-ui/core/Fab';
import DoneIcon from '@material-ui/icons/Done';

import useSighting from '../../models/sighting/useSighting';
import useMatchResults from '../../models/matching/useMatchResults';
import { formatDate } from '../../utils/formatters';
import useDocumentTitle from '../../hooks/useDocumentTitle';
import ReviewSightingDialog from '../../components/dialogs/ReviewSightingDialog';
import LoadingScreen from '../../components/LoadingScreen';
import SadScreen from '../../components/SadScreen';
import MainColumn from '../../components/MainColumn';
import ButtonLink from '../../components/ButtonLink';
import ButtonMenu from '../../components/ButtonMenu';
import Text from '../../components/Text';
import QueryAnnotationsTable from './QueryAnnotationsTable';
import MatchCandidatesTable from './MatchCandidatesTable';
import ImageCard from './ImageCard';

const spaceBetweenColumns = 16;

export default function MatchSighting() {
  const intl = useIntl();
  const { sightingGuid } = useParams();

  const {
    data: sightingData,
    loading: sightingDataLoading,
    error: sightingDataError,
  } = useSighting(sightingGuid);

  const {
    data: matchResults,
    loading: matchResultsLoading,
    error: matchResultsError,
  } = useMatchResults(sightingGuid);

  const [
    selectedQueryAnnotation,
    setSelectedQueryAnnotation,
  ] = useState(null);

  const [
    selectedMatchCandidate,
    setSelectedMatchCandidate,
  ] = useState(null);

  const [reviewDialogOpen, setReviewDialogOpen] = useState(false);

  const queryAnnotations = useMemo(
    () => {
      const annotationData = get(matchResults, 'annotation_data', {});
      const originalQueryAnnotations = get(
        matchResults,
        'query_annotations',
        [],
      );
      return originalQueryAnnotations.map((annotSageData, index) => {
        const hotspotterAnnotationScores = get(
          annotSageData,
          ['algorithms', 'hotspotter_nosv', 'scores_by_annotation'],
          [],
        );
        const topScoreAnnotation = maxBy(
          hotspotterAnnotationScores,
          'score',
        );
        const annotHoustonData = get(
          annotationData,
          annotSageData?.guid,
          {},
        );
        return {
          ...annotHoustonData,
          ...annotSageData,
          topScore: topScoreAnnotation?.score,
          index,
        };
      });
    },
    [matchResults],
  );

  const matchCandidates = useMemo(
    () => {
      const hotspotterAnnotationScores = get(
        selectedQueryAnnotation,
        ['algorithms', 'hotspotter_nosv', 'scores_by_annotation'],
        [],
      );
      return hotspotterAnnotationScores.map((scoreObject, index) => {
        const matchingAnnotation = get(matchResults, [
          'annotation_data',
          scoreObject?.guid,
        ]);
        return {
          ...matchingAnnotation,
          ...scoreObject,
          index,
        };
      });
    },
    [matchResults, selectedQueryAnnotation],
  );

  useDocumentTitle(`Match results for sighting ${sightingGuid}`, {
    translateMessage: false,
  });

  const loading = sightingDataLoading || matchResultsLoading;
  const error = sightingDataError || matchResultsError;

  if (loading) return <LoadingScreen />;
  if (error) return <SadScreen variant="genericError" />;

  const buttonActions = [
    {
      id: 'mark-sighting-reviewed',
      labelId: 'MARK_SIGHTING_REVIEWED',
      onClick: () => setReviewDialogOpen(true),
    },
  ];

  const idCompleteTime = sightingData?.unreviewed_start_time;
  const formattedIdTime = formatDate(
    idCompleteTime,
    true,
    'Unknown time',
  );

  const sightingIsReviewed = Boolean(sightingData?.review_time);
  const matchPossible =
    selectedMatchCandidate && selectedQueryAnnotation;

  return (
    <MainColumn
      fullWidth
      style={{ maxWidth: 'unset', padding: '0 16px' }}
    >
      <ReviewSightingDialog
        open={reviewDialogOpen}
        onClose={() => setReviewDialogOpen(false)}
        sightingGuid={sightingGuid}
      />
      <div
        style={{
          padding: '16px 0',
          display: 'flex',
          justifyContent: 'space-between',
        }}
      >
        <div>
          <ButtonLink
            href={`/sightings/${sightingGuid}`}
            display="back"
            id="BACK_TO_SIGHTING"
          />
          <Text variant="h4">Review match candidates</Text>
          <Text
            variant="subtitle2"
            id="IDENTIFICATION_FINISHED_TIME"
            values={{ time: formattedIdTime }}
            style={{ padding: '2px 0 0 2px' }}
          />
          {sightingIsReviewed && (
            <Chip
              icon={<DoneIcon />}
              variant="outlined"
              label="Reviewed"
              style={{ marginTop: 8 }}
            />
          )}
        </div>
        <ButtonMenu
          buttonId="match-actions"
          style={{ marginTop: 44 }}
          actions={buttonActions}
        >
          Actions
        </ButtonMenu>
      </div>
      <div style={{ display: 'flex' }}>
        <div
          style={{
            width: '50%',
            paddingRight: 0.5 * spaceBetweenColumns,
          }}
        >
          <ImageCard
            titleId="SELECTED_QUERY_ANNOTATION"
            annotation={selectedQueryAnnotation}
          />
          <QueryAnnotationsTable
            queryAnnotations={queryAnnotations}
            selectedQueryAnnotation={selectedQueryAnnotation}
            setSelectedQueryAnnotation={setSelectedQueryAnnotation}
          />
        </div>
        <div
          style={{
            width: '50%',
            paddingLeft: 0.5 * spaceBetweenColumns,
          }}
        >
          <ImageCard
            titleId="SELECTED_MATCH_CANDIDATE"
            annotation={selectedMatchCandidate}
          />
          <MatchCandidatesTable
            matchCandidates={matchCandidates}
            selectedMatchCandidate={selectedMatchCandidate}
            setSelectedMatchCandidate={setSelectedMatchCandidate}
          />
        </div>
      </div>
      {matchPossible && (
        <Fab
          style={{
            position: 'fixed',
            bottom: 16,
            right: 40,
            zIndex: 1,
          }}
          color="primary"
          variant="extended"
        >
          <DoneIcon style={{ marginRight: 4 }} />
          <FormattedMessage id="CONFIRM_MATCH" />
        </Fab>
      )}
    </MainColumn>
  );
}