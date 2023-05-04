import useOptions from '../../hooks/useOptions';
import OptionTermFilter from '../../components/filterFields/OptionTermFilter';
import SubstringFilter from '../../components/filterFields/SubstringFilter';
import DateRangeFilter from '../../components/filterFields/DateRangeFilter';
import useSiteSettings from '../../models/site/useSiteSettings';
import IntegerFilter from '../../components/filterFields/IntegerFilter';

export default function useSightingSearchSchemas() {
  const { regionOptions, speciesOptions, pipelineStateOptions, stageOptions } = useOptions();
  const { data: siteSettings } = useSiteSettings();
  const customSightingFields = siteSettings['site.custom.customFields.Sighting'].value.definitions;
  console.log("customSightingFields", customSightingFields);
  console.log("================>>>>>>>>>", regionOptions);
  const allFields = customSightingFields.map(data => {return {
    id: data.name,
    labelId: 'BEHAVIORS',
    FilterComponent: data.schema.displayType == "select" ? OptionTermFilter : SubstringFilter,
    filterComponentProps: {
      filterId: data.id,
      queryTerms: ['123'],
      choices: data.schema.choices,
    },
  }
})

  return [
    {
      id: 'owner',
      labelId: 'OWNER',
      FilterComponent: SubstringFilter,
      filterComponentProps: {
        filterId: 'owner',
        queryTerms: ['owners.full_name'],
      },
    },
    {
      id: 'numberEncounters',
      labelId: 'NUMBER_ENCOUNTERS',
      FilterComponent: IntegerFilter,
      filterComponentProps: {
        filterId: 'numberEncounters',
        queryTerm: 'numberEncounters',
      },
    },
    {
      id: 'numberImages',
      labelId: 'NUMBER_IMAGES',
      FilterComponent: IntegerFilter,
      filterComponentProps: {
        filterId: 'numberImages',
        queryTerm: 'numberImages',
      },
    },
    {
      id: 'numberAnnotations',
      labelId: 'NUMBER_ANNOTATIONS',
      FilterComponent: IntegerFilter,
      filterComponentProps: {
        filterId: 'numberAnnotations',
        queryTerm: 'numberAnnotations',
      },
    },
    {
      id: 'stage',
      labelId: 'STAGE',
      FilterComponent: OptionTermFilter,
      filterComponentProps: {
        filterId: 'Stage',
        queryTerm: 'stage',
        choices: stageOptions,
        // queryTerms: ["customFields.817e749f-0468-4d26-bccb-f3c2e00351cc"],
      },
    },
    // 'numberEncounters',
    //         'numberImages',
    //         'numberAnnotations'
    
    {
      id: 'region',
      labelId: 'REGION',
      FilterComponent: OptionTermFilter,
      filterComponentProps: {
        queryTerm: 'locationId',
        filterId: 'locationId',
        choices: regionOptions,
      },
    },
    {
      id: 'species',
      labelId: 'SPECIES',
      FilterComponent: OptionTermFilter,
      filterComponentProps: {
      filterId: 'species',
      queryTerm: 'taxonomy_guids',
      choices: speciesOptions,
      },
    },
    {
      id: 'pipelineState',
      labelId: 'PIPELINE_STATE',
      FilterComponent: OptionTermFilter,
      filterComponentProps: {
      filterId: 'pipelineState',
      queryTerm: 'pipelineState',
      choices: pipelineStateOptions,
      },
    },
    {
      id: 'verbatimLocality',
      labelId: 'FREEFORM_LOCATION',
      FilterComponent: SubstringFilter,
      filterComponentProps: {
        filterId: 'verbatimLocality',
        queryTerms: ['verbatimLocality', 'locationId_value'],
      },
    },
    {
      id: 'comments',
      labelId: 'NOTES',
      FilterComponent: SubstringFilter,
      filterComponentProps: {
        filterId: 'comments',
        queryTerms: ['comments'],
      },
    },
    {
      id: 'time',
      labelId: 'SIGHTING_DATE_RANGE',
      FilterComponent: DateRangeFilter,
      filterComponentProps: { queryTerm: 'time', filterId: 'time' },
    },

    // {
    //   id: 'numberOfImages',
    //   labelId: 'numberOfImages',
    //   FilterComponent: SubstringFilter,
    //   filterComponentProps: {
    //     filterId: 'numberOfImages',
    //     queryTerms: ['numberOfImages'],
    //   },
    // },
    // {
    //   id: 'pipelineStatus',
    //   labelId: 'pipelineStatus',
    //   FilterComponent: SubstringFilter,
    //   filterComponentProps: {
    //     filterId: 'pipelineStatus',
    //     queryTerms: ['pipelineStatus'],
    //   },
    // },
    // {
    //   id: 'numberOfAnnotations',
    //   labelId: 'numberOfAnnotations',
    //   FilterComponent: SubstringFilter,
    //   filterComponentProps: {
    //     filterId: 'numberOfAnnotations',
    //     queryTerms: ['numberOfAnnotations'],
    //   },
    // },
    // {
    //   id: 'numberOfEncounters',
    //   labelId: 'numberOfEncounters',
    //   FilterComponent: SubstringFilter,
    //   filterComponentProps: {
    //     filterId: 'numberOfEncounters',
    //     queryTerms: ['numberOfEncounters'],
    //   },
    // },
    // ...allFields
  ]
  
}
