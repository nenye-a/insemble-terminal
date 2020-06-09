import React, { useEffect, useState } from 'react';
import styled from 'styled-components';
import TextLoop from 'react-text-loop';
import { useTransition, animated } from 'react-spring';

import { View, Text as BaseText, Divider } from '../../core-ui';
import { FONT_SIZE_XLARGE, FONT_WEIGHT_MEDIUM } from '../../constants/theme';
import { THEME_COLOR, GREY_DIVIDER } from '../../constants/colors';
import activitySearchBox from '../../assets/images/activity-searchbox.svg';
import coverageSearchBox from '../../assets/images/coverage-searchbox.svg';
import newsSearchbox from '../../assets/images/news-searchbox.svg';
import performanceSearchbox from '../../assets/images/performance-searchbox.svg';
import newsExample from '../../assets/images/news-example.svg';
import activityExample from '../../assets/images/activity-example.svg';
import coverageExample from '../../assets/images/coverage-example.svg';
import performanceExample from '../../assets/images/performance-example.png';
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

const INTERVAL = 10000;

export default function LandingScene() {
  let [selectedTagIndex, setSelectedTagIndex] = useState(0);
  let transitions = useTransition([selectedTagIndex], (item) => item, {
    from: {
      opacity: 0,
      marginTop: -10,
      position: 'absolute',
      maxWidth: 750,
      objectFit: 'contain',
    },
    enter: { opacity: 1, marginTop: 0 },
    leave: { opacity: 0, marginTop: 30 },
    config: {
      duration: 500,
    },
  });

  let opacityTransition = useTransition([selectedTagIndex], (item) => item, {
    from: {
      opacity: 0,
      position: 'absolute',
    },
    enter: { opacity: 1 },
    leave: { opacity: 0 },
    config: {
      duration: 500,
    },
  });

  useEffect(() => {
    let interval = setInterval(() => {
      if (selectedTagIndex === 3) {
        setSelectedTagIndex(0);
      } else {
        setSelectedTagIndex(selectedTagIndex + 1);
      }
    }, INTERVAL);
    return () => clearInterval(interval);
  }, [selectedTagIndex]);

  return (
    <View>
      <Container>
        <TextLoop interval={INTERVAL}>
          {TAGS.map((tag, idx) => (
            <TrackRetailText
              key={`${tag.label}-${idx}`}
              reviewTag={tag.label}
            />
          ))}
        </TextLoop>
        <Text fontSize={FONT_SIZE_XLARGE} style={{ marginTop: 32 }}>
          See and compare the{' '}
          <TextLoop interval={INTERVAL}>
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
          {opacityTransition.map(({ item, props, key }) => (
            <animated.div key={key} style={props}>
              <img src={TAGS[item].searchBarImage} alt="searchbar-img" />
            </animated.div>
          ))}
        </SearchBarContainer>
        <SvgDotArrow />
        <View
          style={{
            alignItems: 'center',
            height: 490,
          }}
        >
          {transitions.map(({ item, props, key }) => (
            <animated.img
              key={key}
              src={TAGS[item].image}
              alt="example-img"
              style={props}
            />
          ))}
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
  font-weight: ${FONT_WEIGHT_MEDIUM};
  text-align: center;
  width: 150px;
`;
const Row = styled(View)`
  flex-direction: row;
  align-items: center;
  justify-content: center;
  width: 500px;
`;
const Description = styled(Text)`
  font-size: ${FONT_SIZE_XLARGE};
  font-weight: ${FONT_WEIGHT_MEDIUM};
  padding: 8px;
`;
const SearchBarContainer = styled(View)`
  margin: 32px 0;
  height: 140px;
  align-items: center;
`;
