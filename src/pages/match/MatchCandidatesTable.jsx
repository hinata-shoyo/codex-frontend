import React from 'react';

import DataDisplay from '../../components/dataDisplays/DataDisplay';
import { cellRendererTypes } from '../../components/dataDisplays/cellRenderers';
import ActionIcon from '../../components/ActionIcon';

const columns = [
  {
    name: 'index',
    labelId: 'CANDIDATE_RANK',
    options: {
      customBodyRender: i => `${i + 1}`,
    },
  },
  {
    name: 'individual_first_name',
    labelId: 'INDIVIDUAL_NAME',
    align: 'left',
  },
  {
    name: 'asset_filename',
    labelId: 'FILENAME',
    align: 'left',
  },
  {
    name: 'viewpoint',
    labelId: 'VIEWPOINT',
    align: 'left',
    options: {
      cellRenderer: cellRendererTypes.viewpoint,
    },
  },
  {
    name: 'score',
    labelId: 'SCORE',
    align: 'left',
    options: {
      cellRenderer: cellRendererTypes.float,
    },
  },
  {
    name: 'sighting_guid',
    labelId: 'VIEW_SIGHTING',
    sortable: false,
    options: {
      customBodyRender: guid => (
        <ActionIcon
          labelId="VIEW"
          variant="view"
          href={`/sightings/${guid}`}
          linkProps={{ newTab: true }}
        />
      ),
    },
  },
];

export default function MatchCandidatesTable({
  matchCandidates,
  selectedMatchCandidate,
  setSelectedMatchCandidate,
}) {
  const processedCandidates = matchCandidates.map(data => ({
    ...data,
    individual_first_name : data.individual_first_name || '-'
  }))
  return (
    <DataDisplay
      idKey="guid"
      titleId="CANDIDATE_ANNOTATIONS"
      data={processedCandidates}
      columns={columns}
      // variant="secondary"
      noResultsTextId="NO_MATCH_CANDIDATES"
      hideDownloadCsv
      hideFilterColumns
      selectionControlled
      selectedRow={selectedMatchCandidate?.guid}
      onSelectRow={nextSelection => {
        if (nextSelection) {
          setSelectedMatchCandidate(nextSelection);
        }
      }}
      tableContainerStyles={{ maxHeight: 300 }}
    />
  );
}
