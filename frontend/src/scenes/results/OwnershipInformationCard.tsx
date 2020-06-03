import React from 'react';
import styled from 'styled-components';

import { View, Text, Link } from '../../core-ui';
import { FONT_WEIGHT_MEDIUM, FONT_SIZE_XSMALL } from '../../constants/theme';
import { GRAY, SHADOW_COLOR, WHITE } from '../../constants/colors';

type Props = {
  name: string;
  address: string;
  phone: string;
  website: string;
  lastUpdate: string;
};

export default function OwnershipInformationCard(props: Props) {
  let { name, address, phone, website, lastUpdate } = props;
  return (
    <Container>
      <Row>
        <LabelText>Parent Company:</LabelText>
        <ValueText>{name}</ValueText>
      </Row>
      <Row>
        <LabelText>Headquarters Address:</LabelText>
        <ValueText>{address}</ValueText>
      </Row>
      <Row>
        <LabelText>Phone:</LabelText>
        <ValueText>{phone}</ValueText>
      </Row>
      <Row>
        <LabelText>Website</LabelText>
        <Link href={website}>{website}</Link>
      </Row>
      <LastUpdateText>Last Updated: {lastUpdate}</LastUpdateText>
    </Container>
  );
}

const Container = styled(View)`
  padding: 8px 28px;
  background-color: ${WHITE};
  box-shadow: ${SHADOW_COLOR};
`;

const Row = styled(View)`
  flex-direction: row;
  justify-content: space-between;
  padding: 8px 0;
`;

const LabelText = styled(Text)`
  font-weight: ${FONT_WEIGHT_MEDIUM};
  color: ${GRAY};
`;

const ValueText = styled(Text)`
  text-align: right;
`;

const LastUpdateText = styled(Text)`
  font-size: ${FONT_SIZE_XSMALL};
  align-self: flex-end;
  text-align: right;
  margin-top: 30px;
`;
