import React, { useState, useEffect, CSSProperties } from 'react';
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
  Button,
} from '../core-ui';
import {
  parsePlaceType,
  isSearchCombinationValid,
  capitalize,
} from '../helpers';
import {
  DEFAULT_BORDER_RADIUS,
  FONT_WEIGHT_MEDIUM,
  FONT_SIZE_NORMAL,
} from '../constants/theme';
import {
  BACKGROUND_COLOR,
  MUTED_TEXT_COLOR,
  LIGHT_PURPLE,
  DARK_TEXT_COLOR,
  GRAY_TEXT,
  LIGHTER_GRAY,
  WHITE,
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
import { REVIEW_TAG_OPTIONS } from '../constants/app';
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
  focus?: boolean; // search bar on edit mode
  hideReviewTag?: boolean;
  containerStyle?: CSSProperties;
};

export default function SearchFilterBarMobile(props: Props) {
  let {
    onSearchPress,
    defaultReviewTag,
    defaultBusinessTag,
    defaultLocationTag,
    disableAll = false,
    disableReviewTag = false,
    focus = false,
    hideReviewTag = false,
    containerStyle,
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
      /**
       * When user press delete and the review tag selection is open,
       * remove the review tag selection
       */
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

  return (
    <View flex>
      {businessTagLoading ? (
        <LoadingIndicator />
      ) : businessTagData ? (
        <SearchContainer focus={focus} style={containerStyle}>
          {/* Review tag selector */}
          {!hideReviewTag && (
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
                  focus={focus}
                >
                  {selectedDataType ? (
                    <Pill disabled={disableAll || disableReviewTag}>
                      {selectedDataType}
                    </Pill>
                  ) : (
                    <ReviewTagPlaceholder>Search data</ReviewTagPlaceholder>
                  )}
                </DataFilterContainer>
              )}
            </Popover>
          )}
          {focus ? <SpacedText>of</SpacedText> : <Spacing />}
          {/*
              Business tag selector
              SelectedBusiness can be selected from the dropdown list from BE (object with id)
              or create a new one which will be counted as string and will be assumed as BRAND
            */}
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
                    <TagType type={item.type}>{capitalize(item.type)}</TagType>
                  </Row>
                );
              }
              return null;
            }}
          />
          {focus ? <SpacedText>in</SpacedText> : <Spacing />}
          {/* Location tag selector */}
          <SearchLocationInput
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
          {focus && (
            <Button
              text="Search"
              icon={
                <SvgSearch
                  fill={WHITE}
                  style={{ marginLeft: 4 }}
                  width={17}
                  height={17}
                />
              }
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
              style={{ marginTop: 20 }}
              textProps={{ fontSize: FONT_SIZE_NORMAL }}
            />
          )}
        </SearchContainer>
      ) : null}
    </View>
  );
}

type TagTypeProps = TextProps & {
  tagType: BusinessTagType;
};

const SearchContainer = styled(View)<ViewProps & { focus: boolean }>`
  ${(props) =>
    props.focus
      ? css`
          flex-direction: column;
        `
      : css`
          flex-direction: row;
          align-items: center;
        `}
  width: 100%;
  padding: 0 8px;
  border-radius: ${DEFAULT_BORDER_RADIUS};
  background-color: ${WHITE};
`;

const DataFilterContainer = styled(TouchableOpacity)`
  ${(props: { focus: boolean }) =>
    props.focus
      ? css`
          height: 42px;
          width: 100%;
        `
      : css`
          height: 36px;
        `}
  flex: 0.5;
  align-items: center;
  justify-content: center;
  background-color: ${BACKGROUND_COLOR};
  padding: 8px;
`;

const SearchLocationInput = styled(LocationInput)`
  border: none;
  background-color: transparent;
  margin-left: 8px;
  margin-right: 8px;
  padding-left: 8px;
  padding-right: 8px;
  &::placeholder {
    text-align: center;
  }
`;

const SpacedText = styled(Text)`
  padding: 0 8px;
  margin: 4px 0;
  color: ${MUTED_TEXT_COLOR};
  font-weight: ${FONT_WEIGHT_MEDIUM};
  text-align: center;
`;

const Spacing = styled(View)`
  width: 8px;
  height: 36px;
  background-color: ${BACKGROUND_COLOR};
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

const ReviewTagPlaceholder = styled(Text)`
  text-overflow: ellipsis;
  overflow: hidden;
  white-space: nowrap;
  color: ${GRAY_TEXT};
  font-weight: ${FONT_WEIGHT_MEDIUM};
`;
