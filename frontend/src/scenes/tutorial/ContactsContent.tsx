import React from 'react';
import styled from 'styled-components';

import { Text as BaseText, View } from '../../core-ui';
import {
  FONT_WEIGHT_MEDIUM,
  DEFAULT_BORDER_RADIUS,
} from '../../constants/theme';
import {
  DARK_TEXT_COLOR,
  SLIGHT_GRAY,
  SHADOW_COLOR,
} from '../../constants/colors';
import { DemoType, OwnershipType } from '../../generated/globalTypes';
import ContactSearchbarDemo from '../../assets/images/contact-searchbox-demo.svg';
import SvgFourDotsArrow from '../../components/icons/four-dots-arrow';
import { useTutorialContext } from '../../context';
import ContactResult from '../results/ContactsResult';
import InfoResult from '../results/OwnershipInformationResult';

import BottomNavigation from './BottomNavigation';

export default function ContactsContent() {
  let { onPageChange } = useTutorialContext();
  return (
    <View>
      <Title>Contacts</Title>
      <SubTitle>Contact information for retailers/restaurants</SubTitle>
      <Paragraph>
        Search for the contacts of any retailer at an address.
      </Paragraph>
      <SearchBar src={ContactSearchbarDemo} />
      <SvgFourDotsArrow
        style={{
          alignSelf: 'center',
          color: SLIGHT_GRAY,
        }}
      />
      <ContactResult
        ownershipType={OwnershipType.COMPANY}
        title="Company Contact"
        demoType={DemoType.BASIC}
      />
      <InfoResult
        ownershipType={OwnershipType.COMPANY}
        title="Company Information"
        demoType={DemoType.BASIC}
        containerStyle={{
          alignSelf: 'center',
        }}
      />
      <BottomNavigation
        leftButton={{
          text: 'News',
          onPress: () => {
            onPageChange('news');
          },
        }}
        rightButton={{
          text: 'Personal Terminals',
          onPress: () => {
            onPageChange('terminal');
          },
        }}
      />
    </View>
  );
}

const Text = styled(BaseText)`
  font-weight: ${FONT_WEIGHT_MEDIUM};
`;

const Title = styled(Text)`
  font-size: 30px;
  padding: 6px 0;
`;

const SubTitle = styled(Text)`
  font-size: 20px;
  color: ${DARK_TEXT_COLOR};
`;

const Paragraph = styled(Text)`
  padding: 30px 0;
`;

const SearchBar = styled.img`
  width: 100%;
  border-radius: ${DEFAULT_BORDER_RADIUS};
  box-shadow: ${SHADOW_COLOR};
  margin: 33px 0;
`;
