import React from 'react';
import Accordion from '@material-ui/core/Accordion';
import AccordionSummary from '@material-ui/core/AccordionSummary';
import AccordionDetails from '@material-ui/core/AccordionDetails';
import ExpandMoreIcon from '@material-ui/icons/ExpandMore';
import Text from './Text';
import OptionTermFilter from './filterFields/OptionTermFilter';
import DateRangeFilter from './filterFields/DateRangeFilter';
import SubstringFilter from './filterFields/SubstringFilter';

function setFilter(newFilter, formFilters, setFormFilters) {
  const matchingFilterIndex = formFilters.findIndex(
    f => f.filterId === newFilter.filterId,
  );
  if (matchingFilterIndex === -1) {
    setFormFilters([...formFilters, newFilter]);
  } else {
    const newFormFilters = [...formFilters];
    newFormFilters[matchingFilterIndex] = newFilter;
    setFormFilters(newFormFilters);
  }
}

export default function FilterPanel({
  formFilters,
  setFormFilters,
  updateFilters,
}) {
  const handleFilterChange = filter => {
    setFilter(filter, formFilters, setFormFilters);
    updateFilters();
  };

  return (
    <div>
      <Text
        variant="h5"
        style={{ margin: '16px 0 16px 16px' }}
        id="FILTERS"
      />
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          padding: '8px 16px 16px',
        }}
      >
        <SubstringFilter
          labelId="INDIVIDUAL_NAME"
          onChange={handleFilterChange}
          queryTerms={['alias', 'name', 'id']}
          filterId="name"
        />
        <SubstringFilter
          labelId="SPECIES"
          onChange={handleFilterChange}
          queryTerms={['genus', 'species', 'id']}
          filterId="species"
          style={{ marginTop: 4 }}
        />
        <OptionTermFilter
          labelId="SEX"
          onChange={handleFilterChange}
          queryTerm="sex"
          filterId="sex"
          choices={[
            {
              label: 'Male',
              value: 'male',
            },
            {
              label: 'Female',
              value: 'female',
            },
          ]}
          style={{ marginTop: 4 }}
        />
      </div>
      <Accordion>
        <AccordionSummary
          expandIcon={<ExpandMoreIcon />}
          aria-controls="time-filter-panel-content"
          id="time-filter-panel-header"
        >
          <Text id="TIME" />
        </AccordionSummary>
        <AccordionDetails>
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <DateRangeFilter
              labelId="SIGHTING_DATE_RANGE"
              onChange={handleFilterChange}
              queryTerm="last_sighting"
              filterId="last_sighting"
            />
            <DateRangeFilter
              labelId="BIRTH_DATE_RANGE"
              onChange={handleFilterChange}
              queryTerm="birth"
              filterId="birth"
            />
            <DateRangeFilter
              labelId="DEATH_DATE_RANGE"
              onChange={handleFilterChange}
              queryTerm="death"
              filterId="death"
            />
          </div>
        </AccordionDetails>
      </Accordion>
      {/* {categoryList.map(category => {
        const filtersInCategory = filters.filter(
          f => f.category === category.name,
        );

        return (
          <Accordion key={category.name}>
            <AccordionSummary
              expandIcon={<ExpandMoreIcon />}
              aria-controls={`${category.name}-filter-panel-content`}
              id={`${category.name}-filter-panel-header`}
            >
              <Text id={category.labelId}>{category.label}</Text>
            </AccordionSummary>
            <AccordionDetails>
              <div
                style={{ display: 'flex', flexDirection: 'column' }}
              >
                {filtersInCategory.map(filter => (
                  <LabeledInput
                    key={`${category.name} - ${filter.name}`}
                    schema={filter}
                    value={formValues[filter.name]}
                    onChange={value => {
                      setFormValues({
                        ...formValues,
                        [filter.name]: value,
                      });
                    }}
                    width={232}
                  />
                ))}
              </div>
            </AccordionDetails>
          </Accordion>
        );
      })} */}
    </div>
  );
}
