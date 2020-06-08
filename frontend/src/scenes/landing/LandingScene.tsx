import React, { useEffect, useState } from 'react';
import styled from 'styled-components';
import TextLoop from 'react-text-loop';

import { View, Text as BaseText, Divider } from '../../core-ui';
import activitySearchBox from '../../assets/images/activity-searchbox.svg';
import coverageSearchBox from '../../assets/images/coverage-searchbox.svg';
import newsSearchbox from '../../assets/images/news-searchbox.svg';
import performanceSearchbox from '../../assets/images/performance-searchbox.svg';
import newsExample from '../../assets/images/news-example.svg';
import activityExample from '../../assets/images/activity-example.svg';
import coverageExample from '../../assets/images/coverage-example.svg';
import performanceExample from '../../assets/images/performance-example.svg';
import { FONT_SIZE_XLARGE, FONT_WEIGHT_MEDIUM } from '../../constants/theme';
import { THEME_COLOR, GREY_DIVIDER } from '../../constants/colors';
import SvgDotArrow from '../../components/icons/dot-arrow';

import TerminalSection from './TerminalSection';
import ContactUsSection from './ContactUsSection';
import Footer from './Footer';

const TAGS = [
  {
    label: 'activity',
    searchBarImage: activitySearchBox,
    image: activityExample,
  },
  {
    label: 'news',
    searchBarImage: newsSearchbox,
    image: newsExample,
  },
  {
    label: 'coverage',
    searchBarImage: coverageSearchBox,
    image: coverageExample,
  },
  {
    label: 'performance',
    searchBarImage: performanceSearchbox,
    image: performanceExample,
  },
];

export default function LandingScene() {
  let [selectedTagIndex, setSelectedTagIndex] = useState(0);

  useEffect(() => {
    let interval = setInterval(() => {
      if (selectedTagIndex === 3) {
        setSelectedTagIndex(0);
      } else {
        setSelectedTagIndex(selectedTagIndex + 1);
      }
    }, 10000);
    return () => clearInterval(interval);
  }, [selectedTagIndex]);

  return (
    <View>
      <Container>
        <TextLoop interval={10000}>
          {TAGS.map((tag, idx) => (
            <TrackRetailText
              key={`${tag.label}-${idx}`}
              reviewTag={tag.label}
            />
          ))}
        </TextLoop>
        <Text fontSize={FONT_SIZE_XLARGE} style={{ marginTop: 32 }}>
          See and compare the{' '}
          <TextLoop interval={10000}>
            {TAGS.map((tag, idx) => (
              <PurpleText key={`subtitle-${tag.label}-${idx}`}>
                {tag.label}
              </PurpleText>
            ))}
          </TextLoop>{' '}
          of any restaurant or retailer.
        </Text>
        <Row>
          <Description>In any market.</Description>
          <Description>In any location.</Description>
          <Description>In any scope.</Description>
        </Row>
        <SearchBarContainer>
          {TAGS.map((tag, idx) => {
            return (
              <img
                key={idx}
                src={tag.searchBarImage}
                style={{
                  position: 'absolute',
                  alignSelf: 'center',
                  visibility: idx === selectedTagIndex ? 'visible' : 'hidden',
                }}
              />
            );
          })}
        </SearchBarContainer>
        <SvgDotArrow />
        <View style={{ height: 600 }}>
          {TAGS.map((tag, idx) => {
            return (
              <img
                key={idx}
                src={tag.image}
                style={{
                  position: 'absolute',
                  alignSelf: 'center',
                  visibility: idx === selectedTagIndex ? 'visible' : 'hidden',
                }}
              />
            );
          })}
        </View>
      </Container>
      <TerminalSection />
      <Divider color={GREY_DIVIDER} />
      <ContactUsSection />
      <Footer />
    </View>
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
const SearchBarContainer = styled(View)`
  margin: 32px 0;
  height: 140px;
`;
const Img = styled.img`
  transition-property: all;
  transform: translateY(-100%);
  transition: 0.4s ease-in-out;
`;

const ImgContainer = styled(View)`
  overflow: hidden;
`;
