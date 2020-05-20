import React, { useState } from 'react';
import styled from 'styled-components';

import { View, Text, TouchableOpacity, Pill, Dropdown } from '../core-ui';
import { DEFAULT_BORDER_RADIUS, FONT_WEIGHT_MEDIUM } from '../constants/theme';
import { BACKGROUND_COLOR, MUTED_TEXT_COLOR } from '../constants/colors';
import { BUSINESS_CATEGORY_DATA } from '../fixtures/dummyData';
import {
  ReviewTag,
  LocationTagInput,
  BusinessTagInput,
  LocationTagType,
  BusinessTagType,
} from '../generated/globalTypes';
import { SearchVariables } from '../generated/Search';

import PillSelector from './PillSelector';
import LocationInput from './LocationInput';
import SvgSearch from './icons/search';

// TODO: get type from BE
type Business = {
  id: string;
  type: BusinessTagType;
  params: string;
};

type Props = {
  onSearchPress?: (searchTags: SearchVariables) => void;
};

const DATA_TYPE_OPTIONS = [
  'News',
  'Performance',
  'Coverage',
  'Ownership',
  'Activity',
];

export default function SearchFilterBar(props: Props) {
  let { onSearchPress } = props;
  let [dataTypeFilterVisible, setDataTypeFilterVisible] = useState(false);
  let [selectedDataType, setSelectedDataType] = useState('');
  let [selectedBusiness, setSelectedBusiness] = useState<
    Business | string | null
  >(null);
  let [selectedPlace, setSelectedPlace] = useState<LocationTagInput | null>(
    null,
  );

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
        <Dropdown<Business | string | null>
          selectedOption={selectedBusiness}
          onOptionSelected={setSelectedBusiness}
          options={BUSINESS_CATEGORY_DATA as Array<Business>}
          placeholder="Any business/category"
          optionExtractor={(item) => {
            if (typeof item === 'string') {
              return item;
            }
            return item?.params || '';
          }}
        />
        <SpacedText>in</SpacedText>
        <SearchLocationInput
          placeholder="Any Location"
          onPlaceSelected={(place) => {
            setSelectedPlace({
              type: 'ADDRESS' as LocationTagType,
              params: place.address,
            });
          }}
        />
        <TouchableOpacity
          onPress={() => {
            onSearchPress &&
              onSearchPress({
                reviewTag: selectedDataType.toUpperCase() as ReviewTag, // TODO: change this to enum,
                businessTag: (typeof selectedBusiness === 'string'
                  ? { type: 'BUSINESS', params: selectedBusiness }
                  : undefined) as BusinessTagInput,
                businessTagId:
                  selectedBusiness &&
                  typeof selectedBusiness !== 'string' &&
                  selectedBusiness?.id
                    ? selectedBusiness.id
                    : undefined,
                locationTag: selectedPlace ? selectedPlace : undefined,
              });
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
