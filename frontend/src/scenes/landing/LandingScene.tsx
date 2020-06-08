import React, { useEffect, useState } from 'react';
import styled from 'styled-components';
import TextLoop from 'react-text-loop';

import { View, Text as BaseText } from '../../core-ui';
import newsExample from '../../assets/images/news-example.png';
import { FONT_SIZE_XLARGE, FONT_WEIGHT_MEDIUM } from '../../constants/theme';
import { THEME_COLOR } from '../../constants/colors';

const TAGS = [
  {
    label: 'activity',
    image: newsExample,
  },
  {
    label: 'news',
    image: newsExample,
  },
  {
    label: 'coverage',
    image: newsExample,
  },
  {
    label: 'performance',
    image: newsExample,
  },
];
export default function LandingScene() {
  let [selectedTagIndex, setSelectedTagIndex] = useState(0);
  let description = 'In any market.     In any location.     At any scope.';
  // useEffect(() => {
  //   let interval = setInterval(() => {
  //     setSelectedTagIndex((idx) => idx + 1);
  //   }, 3000);
  //   return () => clearInterval(interval);
  // }, []);

  return (
    <Container>
      <TextLoop interval={2000}>
        {TAGS.map((tag, idx) => (
          <TrackRetailText key={`${tag.label}-${idx}`} reviewTag={tag.label} />
        ))}
      </TextLoop>
      <Text fontSize={FONT_SIZE_XLARGE} style={{ marginTop: 32 }}>
        See and compare the{' '}
        <TextLoop interval={2000}>
          {TAGS.map((tag, idx) => (
            <PurpleText key={`subtitle-${tag.label}-${idx}`}>
              {tag.label}
            </PurpleText>
          ))}
        </TextLoop>{' '}
        of any restaurant or retailer.
      </Text>
      <Description>{description}</Description>
    </Container>
  );
}

function TrackRetailText({ reviewTag }: { reviewTag: string }) {
  return (
    <Row>
      <Title>
        Track retail <PurpleTitle>{reviewTag}</PurpleTitle>
      </Title>
      <span> </span>
    </Row>
  );
}

const Container = styled(View)`
  padding: 24px;
  align-items: center;
`;
const Text = styled(BaseText)`
  display: inline-block;
  white-space: nowrap;
`;
const Title = styled(Text)`
  font-size: 40px;
  font-weight: ${FONT_WEIGHT_MEDIUM};
`;
const PurpleTitle = styled(Title)`
  color: ${THEME_COLOR};
`;
const PurpleText = styled(Text)`
  color: ${THEME_COLOR};
  font-size: ${FONT_SIZE_XLARGE};
`;
const Row = styled(View)`
  flex-direction: row;
  justify-content: center;
`;
const Description = styled(Text)`
  font-size: ${FONT_SIZE_XLARGE};
  font-weight: ${FONT_WEIGHT_MEDIUM};
  padding: 8px;
`;
const Img = styled.img`
  transition-property: all;
  transform: translateY(-100%);
  transition: 0.4s ease-in-out;
`;

const ImgContainer = styled(View)`
  overflow: hidden;
`;
