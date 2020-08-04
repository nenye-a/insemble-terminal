import React, { useState, useEffect } from 'react';
import styled, { css } from 'styled-components';
import { useQuery } from '@apollo/react-hooks';
import { useHistory } from 'react-router-dom';
import { useAlert } from 'react-alert';
import Popover from 'react-tiny-popover';

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
  isEqual,
  omitTypename,
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
import { REVIEW_TAG_OPTIONS } from '../constants/app';
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
  disableAll?: boolean; // disable all input and pill color will be gray
  disableReviewTag?: boolean; // disable only the review tag
};

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
  let [locationFocus, setLocationFocus] = useState(false);
  let [businessFocus, setBusinessFocus] = useState(false);
  let [isInputChange, setIsInputChange] = useState(false);
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

  let search = () => {
    // Check if user is authenticated and has license
    if (isAuthenticated && !!user?.license) {
      // Check if search combination valid
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
            locationTag: selectedPlace ?? undefined,
          });
      } else {
        alert.show('Search combination is not valid. Please try again.');
      }
    } else {
      history.push('/contact-us');
    }
  };

  useEffect(() => {
    let handleKeyPress = (e: KeyboardEvent) => {
      /**
       * When user press delete and the review tag selection is open,
       * remove the review tag selection
       */
      if (e.keyCode === 8 && dataTypeFilterVisible) {
        setSelectedDataType('');
      }
      /**
       * This will check first if the input are enter, and all of search input
       * are not focused.
       * Also if it won't do anything if the search not changed.
       */
      if (
        e.keyCode === 13 &&
        !dataTypeFilterVisible &&
        !businessFocus &&
        !locationFocus &&
        isInputChange
      ) {
        search();
      }
    };
    window.addEventListener('keydown', handleKeyPress);

    return () => {
      window.removeEventListener('keydown', handleKeyPress);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dataTypeFilterVisible, businessFocus, locationFocus, isInputChange]);

  useEffect(() => {
    /**
     * Use to populate the default review tag
     * when searching from scene than result scene
     * e.g when searching from terminal scene search bar, and navigated to result scene
     */
    setSelectedDataType(defaultReviewTag || '');
  }, [defaultReviewTag]);

  useEffect(() => {
    /**
     * Use to populate the default business tag
     * when searching from scene than result scene
     * e.g when searching from terminal scene search bar, and navigated to result scene
     */
    setSelectedBusiness(defaultBusinessTag || null);
  }, [defaultBusinessTag]);

  useEffect(() => {
    /**
     * Use to populate the default location tag
     * when searching from scene than result scene
     * e.g when searching from terminal scene search bar, and navigated to result scene
     */
    setSelectedPlace(defaultLocationTag || null);
  }, [defaultLocationTag]);

  useEffect(() => {
    let defaultLocationWithoutId;
    if (defaultLocationTag) {
      /**
       * Clean defaultLocationTag from id.
       */
      defaultLocationWithoutId = {
        params: defaultLocationTag.params,
        type: defaultLocationTag.type,
      };
    }
    let cleanSelectedBusiness;
    if (selectedBusiness && typeof selectedBusiness !== 'string') {
      /**
       * Cleaning business input from _typeName.
       */
      cleanSelectedBusiness = omitTypename(selectedBusiness);
    }
    /**
     * Check review tags changes.
     */
    let dataTypeChanged = !isEqual(
      selectedDataType,
      defaultReviewTag ? defaultReviewTag : '',
    );
    /**
     * Check business tags changes.
     */
    let businessChanged = !isEqual(cleanSelectedBusiness, defaultBusinessTag);
    /**
     * First run will have id on selectedPlace because it set from defaultLocation.
     * but if input the same again selectedPlace won't have id so we check both with and without id.
     */
    let locationChanged =
      !isEqual(selectedPlace, defaultLocationWithoutId) &&
      !isEqual(selectedPlace, defaultLocationTag);
    if (dataTypeChanged || businessChanged || locationChanged) {
      setIsInputChange(true);
    } else {
      setIsInputChange(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedDataType, selectedBusiness, selectedPlace]);

  return (
    <View flex>
      {businessTagLoading ? (
        <LoadingIndicator />
      ) : businessTagData ? (
        <>
          <SearchContainer>
            {/* Review tag selector */}
            <Popover
              isOpen={dataTypeFilterVisible}
              content={
                <PillSelector
                  options={REVIEW_TAG_OPTIONS}
                  style={{ position: 'absolute', marginTop: 5, zIndex: 999 }}
                  selectedOptions={[selectedDataType]}
                  onSelect={setSelectedDataType}
                  onUnselect={() => {
                    setSelectedDataType('');
                  }}
                  onClickAway={() => setDataTypeFilterVisible(false)}
                />
              }
              position={['bottom']}
              onClickOutside={() => setDataTypeFilterVisible(false)}
              align="start"
            >
              {(ref) => (
                <DataFilterContainer
                  ref={ref}
                  disabled={disableAll || disableReviewTag}
                  onPress={() =>
                    setDataTypeFilterVisible(!dataTypeFilterVisible)
                  }
                >
                  {selectedDataType ? (
                    <Pill disabled={disableAll || disableReviewTag}>
                      {selectedDataType}
                    </Pill>
                  ) : (
                    <Text color={GRAY_TEXT} fontWeight={FONT_WEIGHT_MEDIUM}>
                      Search for data
                    </Text>
                  )}
                </DataFilterContainer>
              )}
            </Popover>
            <SpacedText>of</SpacedText>
            {/*
              Business tag selector
              SelectedBusiness can be selected from the dropdown list from BE (object with id)
              or create a new one which will be counted as string and will be assumed as BRAND
            */}
            <Dropdown<SelectedBusiness | null>
              setFocus={setBusinessFocus}
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
            {/* Location tag selector */}
            <SearchLocationInput
              setFocus={setLocationFocus}
              placeholder="Any Location"
              onPlaceSelected={(place) => {
                // if place has address, user has entered the correct location.
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
              onPress={search}
              stopPropagation={true}
              disabled={disableAll}
            >
              <SvgSearch />
            </TouchableOpacity>
          </SearchContainer>
        </>
      ) : null}
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
  padding: 8px 18px;
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
