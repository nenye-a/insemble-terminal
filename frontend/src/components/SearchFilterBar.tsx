import React, { useState } from 'react';
import styled from 'styled-components';

import { View, Text, TouchableOpacity, Pill, Dropdown } from '../core-ui';
import { DEFAULT_BORDER_RADIUS, FONT_WEIGHT_MEDIUM } from '../constants/theme';
import { BACKGROUND_COLOR, MUTED_TEXT_COLOR } from '../constants/colors';
import { BUSINESS_CATEGORY_DATA } from '../fixtures/dummyData';

import PillSelector from './PillSelector';
import LocationInput from './LocationInput';
import SvgSearch from './icons/search';

// TODO: get type from BE
type Business = {
  type: 'brand' | 'business';
  value: string;
};

const DATA_TYPE_OPTIONS = [
  'News',
  'Performance',
  'Coverage',
  'Ownership',
  'Activity',
];

export default function SearchFilterBar() {
  let [dataTypeFilterVisible, setDataTypeFilterVisible] = useState(false);
  let [selectedDataType, setSelectedDataType] = useState('');
  let [selectedBusiness, setSelectedBusiness] = useState<Business | null>(null);
  return (
    <View>
      <Container>
        <DataFilterContainer
          onPress={() => setDataTypeFilterVisible(!dataTypeFilterVisible)}
        >
          {selectedDataType ? (
            <Pill>{selectedDataType}</Pill>
          ) : (
            <Text>Search for data</Text>
          )}
        </DataFilterContainer>
        <SpacedText>of</SpacedText>
        <Dropdown<Business | null>
          selectedOption={selectedBusiness}
          onOptionSelected={setSelectedBusiness}
          options={BUSINESS_CATEGORY_DATA as Array<Business>}
          placeholder="Any business/category"
          optionExtractor={(item) => item?.value || ''}
        />
        <SpacedText>in</SpacedText>
        <SearchLocationInput
          placeholder="Any Location"
          onPlaceSelected={() => {
            // TODO: get selected place
          }}
        />
        <TouchableOpacity
          onPress={() => {
            // TODO: search on submit
          }}
        >
          <SvgSearch />
        </TouchableOpacity>
      </Container>
      {dataTypeFilterVisible && (
        <PillSelector
          options={DATA_TYPE_OPTIONS}
          style={{ position: 'absolute', marginTop: 5 }}
          selectedOptions={[selectedDataType]}
          onSelect={setSelectedDataType}
          onUnselect={() => {
            setSelectedDataType('');
          }}
          onClickAway={() => setDataTypeFilterVisible(false)}
        />
      )}
    </View>
  );
}

const Container = styled(View)`
  flex-direction: row;
  align-items: center;
  width: 640px;
  height: 42px;
  padding: 0 8px;
  border-radius: ${DEFAULT_BORDER_RADIUS};
  background-color: ${BACKGROUND_COLOR};
  margin-left: 64px;
`;

const DataFilterContainer = styled(TouchableOpacity)`
  height: 36px;
  width: 200px;
  align-items: center;
  justify-content: center;
`;

const SearchLocationInput = styled(LocationInput)`
  border: none;
  background-color: transparent;
`;

const SpacedText = styled(Text)`
  padding: 0 8px;
  color: ${MUTED_TEXT_COLOR};
  font-weight: ${FONT_WEIGHT_MEDIUM};
`;
