import React, { useState } from 'react';
import styled from 'styled-components';
import { useQuery } from '@apollo/react-hooks';

import {
  View,
  Text,
  TouchableOpacity,
  Pill,
  Dropdown,
  LoadingIndicator,
} from '../core-ui';
import { parsePlaceType, isSearchCombinationValid } from '../helpers';
import { DEFAULT_BORDER_RADIUS, FONT_WEIGHT_MEDIUM } from '../constants/theme';
import { BACKGROUND_COLOR, MUTED_TEXT_COLOR } from '../constants/colors';
import {
  ReviewTag,
  LocationTagInput,
  BusinessTagInput,
} from '../generated/globalTypes';
import { SearchVariables } from '../generated/Search';
import {
  GetBusinessTag,
  GetBusinessTag_businessTags as BusinessTag,
} from '../generated/GetBusinessTag';
import { GET_BUSINESS_TAG } from '../graphql/queries/server/tags';

import PillSelector from './PillSelector';
import LocationInput from './LocationInput';
import SvgSearch from './icons/search';

type SelectedBusiness = BusinessTag | string;

type Props = {
  onSearchPress?: (searchTags: SearchVariables) => void;
  defaultReviewTag?: string;
  defaultBusinessTag?: SelectedBusiness;
  defaultLocationTag?: LocationTagInput;
  disableAll?: boolean;
  disableReviewTag?: boolean;
};

const DATA_TYPE_OPTIONS = [
  'News',
  'Performance',
  'Coverage',
  'Ownership',
  'Activity',
];

export default function SearchFilterBar(props: Props) {
  let {
    onSearchPress,
    defaultReviewTag,
    defaultBusinessTag,
    defaultLocationTag,
    disableAll = false,
    disableReviewTag = false,
  } = props;
  let [dataTypeFilterVisible, setDataTypeFilterVisible] = useState(false);
  let [selectedDataType, setSelectedDataType] = useState(
    defaultReviewTag || '',
  );
  let [
    selectedBusiness,
    setSelectedBusiness,
  ] = useState<SelectedBusiness | null>(defaultBusinessTag || null);
  let [selectedPlace, setSelectedPlace] = useState<LocationTagInput | null>(
    defaultLocationTag || null,
  );
  let [errorMessage, setErrorMessage] = useState('');
  let { data: businessTagData, loading: businessTagLoading } = useQuery<
    GetBusinessTag
  >(GET_BUSINESS_TAG);

  return (
    <View>
      {businessTagLoading ? (
        <LoadingIndicator />
      ) : businessTagData ? (
        <>
          <SearchContainer>
            <DataFilterContainer
              disabled={disableAll || disableReviewTag}
              onPress={() => setDataTypeFilterVisible(!dataTypeFilterVisible)}
            >
              {selectedDataType ? (
                <Pill disabled={disableAll || disableReviewTag}>
                  {selectedDataType}
                </Pill>
              ) : (
                <Text>Search for data</Text>
              )}
            </DataFilterContainer>
            <SpacedText>of</SpacedText>
            <Dropdown<SelectedBusiness | null>
              selectedOption={selectedBusiness}
              onOptionSelected={setSelectedBusiness}
              options={businessTagData.businessTags}
              placeholder="Any business/category"
              optionExtractor={(item) => {
                if (typeof item === 'string') {
                  return item;
                }
                return item?.params || '';
              }}
              disabled={disableAll}
            />
            <SpacedText>in</SpacedText>
            <SearchLocationInput
              placeholder="Any Location"
              onPlaceSelected={(place) => {
                if (place?.address) {
                  setSelectedPlace({
                    params: place.address,
                    type: parsePlaceType(place.placeType),
                  });
                } else {
                  setSelectedPlace(null);
                }
              }}
              disabled={disableAll}
              defaultValue={defaultLocationTag?.params}
            />
            <TouchableOpacity
              onPress={() => {
                let isValid = isSearchCombinationValid(
                  selectedDataType,
                  selectedBusiness,
                  selectedPlace,
                );
                if (isValid) {
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
                } else {
                  setErrorMessage('Search combination is not valid');
                }
              }}
              stopPropagation={true}
            >
              <SvgSearch />
            </TouchableOpacity>
          </SearchContainer>
          {errorMessage && <ErrorMessage>{errorMessage}</ErrorMessage>}
        </>
      ) : null}
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

const SearchContainer = styled(View)`
  flex-direction: row;
  align-items: center;
  width: 640px;
  height: 42px;
  padding: 0 8px;
  border-radius: ${DEFAULT_BORDER_RADIUS};
  background-color: ${BACKGROUND_COLOR};
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

const ErrorMessage = styled(Text)`
  padding-top: 2px;
`;
