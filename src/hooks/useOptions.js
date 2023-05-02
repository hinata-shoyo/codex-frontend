import { useMemo } from 'react';
import { get } from 'lodash-es';

import { flattenTree } from '../utils/treeUtils';
import useSiteSettings from '../models/site/useSiteSettings';
import useSocialGroups from '../models/socialGroups/useSocialGroups';


export default function useOptions() {
  const { data, loading, error } = useSiteSettings();
  const { data: socialGroups } = useSocialGroups();
  // console.log("socialGroups is ", socialGroups)

  return useMemo(() => {
    if (loading || error)
      return { regionOptions: [], speciesOptions: [] };

    const backendRegionOptions = get(
      data,
      ['site.custom.regions', 'value', 'locationID'],
      [],
    );

    const pipelineStateOptions = [{label:"preparation", value: "preparation"},
    {label: "detection", value: "detection"},
    {label: "curation", value: "curation"},
    {label: "identification", value: "identification"},
   ];

   const stageOptions = [{label:"un_reviewed", value: "un_reviewed"},
    {label: "processed", value: "processed"},
    {label: "failed", value: "failed"},
    {label: "identification", value: "identification"},
   ];   
    const regionOptions = flattenTree(backendRegionOptions).map(
      r => ({
        label: get(r, 'name'),
        value: get(r, 'id'),
      }),
    );

    const backendSpeciesOptions = get(
      data,
      ['site.species', 'value'],
      [],
    );

    const speciesOptions = backendSpeciesOptions
      .map(o => ({
        label: get(o, 'scientificName'),
        value: get(o, 'id'),
        alternates: [
          ...get(o, 'commonNames', []),
          get(o, 'itisTsn', '').toString(),
        ],
      }))
      .filter(o => o);
    const socialGroupOptions = socialGroups?.map(data => {
      return {
        label: data.name,
        value: data.guid
      }
    })

    return { regionOptions, speciesOptions, pipelineStateOptions, stageOptions, socialGroupOptions};
  }, [loading, error, data]);
}
