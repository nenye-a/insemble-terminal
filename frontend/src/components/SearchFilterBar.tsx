import React, { useState, useEffect } from 'react';
import styled, { css } from 'styled-components';
import { useQuery } from '@apollo/react-hooks';
import { useHistory } from 'react-router-dom';
import { useAlert } from 'react-alert';

import {
  View,
  Text,
  TouchableOpacity,
  Pill,
  Dropdown,
  LoadingIndicator,
} from '../core-ui';
import {
  parsePlaceType,
  isSearchCombinationValid,
  capitalize,
} from '../helpers';
import { DEFAULT_BORDER_RADIUS, FONT_WEIGHT_MEDIUM } from '../constants/theme';
import {
  BACKGROUND_COLOR,
  MUTED_TEXT_COLOR,
  LIGHT_PURPLE,
  DARK_TEXT_COLOR,
  GRAY_TEXT,
  LIGHTER_GRAY,
} from '../constants/colors';
import { useAuth } from '../context';
import { SearchTag, BusinessTagResult } from '../types/types';
import {
  ReviewTag,
  LocationTagInput,
  BusinessTagType,
} from '../generated/globalTypes';
import {
  GetBusinessTag,
  GetBusinessTag_businessTags as BusinessTag,
} from '../generated/GetBusinessTag';
import { GET_BUSINESS_TAG } from '../graphql/queries/server/tags';

import PillSelector from './PillSelector';
import LocationInput from './LocationInput';
import SvgSearch from './icons/search';

type SelectedBusiness = BusinessTagResult | BusinessTag | string;

type Props = {
  onSearchPress?: (searchTags: SearchTag) => void;
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
  'Contact',
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
  let alert = useAlert();

  let [dataTypeFilterVisible, setDataTypeFilterVisible] = useState(false);
  let [selectedDataType, setSelectedDataType] = useState('');
  let [
    selectedBusiness,
    setSelectedBusiness,
  ] = useState<SelectedBusiness | null>(null);
  let [selectedPlace, setSelectedPlace] = useState<LocationTagInput | null>(
    null,
  );
  let history = useHistory();
  let { isAuthenticated, user } = useAuth();
  let { data: businessTagData, loading: businessTagLoading } = useQuery<
    GetBusinessTag
  >(GET_BUSINESS_TAG);

  useEffect(() => {
    let handleKeyPress = (e: KeyboardEvent) => {
      if (e.keyCode === 8 && dataTypeFilterVisible) {
        setSelectedDataType('');
      }
    };
    window.addEventListener('keydown', handleKeyPress);

    return () => {
      window.removeEventListener('keydown', handleKeyPress);
    };
  }, [dataTypeFilterVisible]);

  useEffect(() => {
    setSelectedDataType(defaultReviewTag || '');
  }, [defaultReviewTag]);

  useEffect(() => {
    setSelectedBusiness(defaultBusinessTag || null);
  }, [defaultBusinessTag]);

  useEffect(() => {
    setSelectedPlace(defaultLocationTag || null);
  }, [defaultLocationTag]);

  return (
    <View flex>
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
              renderCustomList={(item: SelectedBusiness | null) => {
                if (item && typeof item !== 'string') {
                  return (
                    <Row>
                      <Text>{item.params}</Text>
                      <TagType type={item.type}>
                        {capitalize(item.type)}
                      </TagType>
                    </Row>
                  );
                }
                return null;
              }}
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
              text="Search"
              forwardedAs="button"
              onPress={() => {
                if (isAuthenticated && !!user?.license) {
                  let isValid = isSearchCombinationValid(
                    selectedDataType,
                    selectedBusiness,
                    selectedPlace,
                  );
                  if (isValid) {
                    onSearchPress &&
                      onSearchPress({
                        reviewTag: selectedDataType.toUpperCase() as ReviewTag, // TODO: change this to enum,
                        businessTag:
                          typeof selectedBusiness === 'string'
                            ? {
                                type: BusinessTagType.BUSINESS,
                                params: selectedBusiness,
                              }
                            : undefined,
                        businessTagWithId:
                          selectedBusiness &&
                          typeof selectedBusiness !== 'string' &&
                          selectedBusiness?.id
                            ? selectedBusiness
                            : undefined,
                        locationTag: selectedPlace ? selectedPlace : undefined,
                      });
                  } else {
                    alert.show(
                      'Search combination is not valid. Please try again.',
                    );
                  }
                } else {
                  history.push('/contact-us');
                }
              }}
              stopPropagation={true}
              disabled={disableAll}
            >
              <SvgSearch />
            </TouchableOpacity>
          </SearchContainer>
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

type TagTypeProps = TextProps & {
  tagType: BusinessTagType;
};

const SearchContainer = styled(View)`
  flex-direction: row;
  align-items: center;
  width: 100%;
  height: 42px;
  padding: 0 8px;
  border-radius: ${DEFAULT_BORDER_RADIUS};
  background-color: ${BACKGROUND_COLOR};
`;

const DataFilterContainer = styled(TouchableOpacity)`
  height: 36px;
  flex: 0.5;
  align-items: center;
  justify-content: center;
`;

const SearchLocationInput = styled(LocationInput)`
  border: none;
  background-color: transparent;
  &::placeholder {
    text-align: center;
  }
`;

const SpacedText = styled(Text)`
  padding: 0 8px;
  color: ${MUTED_TEXT_COLOR};
  font-weight: ${FONT_WEIGHT_MEDIUM};
`;

const Row = styled(View)`
  flex: 1;
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
`;

const TagType = styled(Text)<TagTypeProps>`
  padding: 4px 8px;
  height: 26px;
  width: 92px;
  border-radius: 13px;
  text-align: center;
  font-weight: ${FONT_WEIGHT_MEDIUM};
  ${(props) =>
    props.type === BusinessTagType.BUSINESS
      ? css`
          background-color: ${LIGHT_PURPLE};
          color: ${DARK_TEXT_COLOR};
        `
      : css`
          background-color: ${LIGHTER_GRAY};
          color: ${GRAY_TEXT};
        `}
`;
