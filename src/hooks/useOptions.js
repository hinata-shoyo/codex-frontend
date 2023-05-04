import { useMemo, useState } from 'react';
import { get } from 'lodash-es';

import { flattenTree } from '../utils/treeUtils';
import useSiteSettings from '../models/site/useSiteSettings';
import { convertRowsPropToState } from '@material-ui/data-grid';

// import {relationshipRolesOptions} from '../components/filterFields/OptionTermFilter';

export default function useOptions() {
  const { data, loading, error } = useSiteSettings();
  const [ options, setOpt ] = useState([]);
  // console.log("data: ",data);
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

    const socialGroupRolesOptions = data['social_group_roles'].value.map(o => {
      return {
        label: o.label,
        value: o.guid
      }
    });

    const relationshipOptions = Object.values(data['relationship_type_roles'].value).map(o => {
      return {
        label: o.label,
        value: o.guid,
        roles: o.roles
      }
    });

    // console.log("data['relationship_type_roles'].value",data['relationship_type_roles'].value[guid])
    // const options1 = relationshipRolesOptions.map(data => {
    //   return {
    //     label: data.label,
    //     value: data.guid
    //   }
    // })

    // setOpt(options1);
    
    // const op = options1?.map(data => {
    //   return {
    //     label: data.label,
    //     value: data.guid
    //   }
    // })

    return { regionOptions, speciesOptions, pipelineStateOptions, stageOptions, socialGroupRolesOptions, relationshipOptions };
  }, [loading, error, data]);
}
