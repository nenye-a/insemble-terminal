import React from 'react';
import styled from 'styled-components';

import { Text, View } from '../core-ui';
import { ReviewTag, LocationTagType } from '../generated/globalTypes';
import {
  Search_search_businessTag as BusinessTag,
  Search_search_locationTag as LocationTag,
} from '../generated/Search';
import { THEME_COLOR, WHITE } from '../constants/colors';
import { FONT_SIZE_XLARGE, FONT_WEIGHT_MEDIUM } from '../constants/theme';
import { capitalize } from '../helpers';

type Props = {
  reviewTag?: ReviewTag | null;
  businessTag?: BusinessTag | null;
  locationTag?: LocationTag | null;
  text?: string;
};

export default function PageTitle(props: Props) {
  let { reviewTag, businessTag, locationTag, text } = props;

  let formattedReview = reviewTag ? capitalize(reviewTag) : '';
  let formattedBusiness = businessTag?.params ? businessTag?.params : '';
  let formattedLocation =
    locationTag?.type === LocationTagType.ADDRESS
      ? `near ${locationTag.params}`
      : locationTag?.type === LocationTagType.CITY ||
        locationTag?.type === LocationTagType.COUNTY ||
        locationTag?.type === LocationTagType.STATE
      ? `in ${locationTag?.params}`
      : '';
  let formattedText = `${formattedBusiness} ${formattedReview} ${formattedLocation}`.trim();

  return (
    <TitleContainer>
      <Title>{text ? text : formattedText}</Title>
      {(locationTag?.type === LocationTagType.NATION || !locationTag) && (
        <USText>All United States</USText>
      )}
    </TitleContainer>
  );
}

const Title = styled(Text)`
  color: ${THEME_COLOR};
  font-size: ${FONT_SIZE_XLARGE};
`;

const TitleContainer = styled(View)`
  background-color: ${WHITE};
  flex-direction: row;
  align-items: center;
  justify-content: space-between;
  padding: 25px 15%;
`;

const USText = styled(Text)`
  font-weight: ${FONT_WEIGHT_MEDIUM};
  color: ${THEME_COLOR};
`;
