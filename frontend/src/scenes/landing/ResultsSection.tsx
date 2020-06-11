import React, { useEffect, useState } from 'react';
import styled from 'styled-components';
import { useTransition, animated } from 'react-spring';

import { View, Text as BaseText } from '../../core-ui';
import { FONT_SIZE_XLARGE, FONT_WEIGHT_MEDIUM } from '../../constants/theme';
import { THEME_COLOR } from '../../constants/colors';
import activitySearchBox from '../../assets/images/activity-searchbox.svg';
import coverageSearchBox from '../../assets/images/coverage-searchbox.svg';
import newsSearchbox from '../../assets/images/news-searchbox.svg';
import performanceSearchbox from '../../assets/images/performance-searchbox.svg';
import newsExample from '../../assets/images/news-example.svg';
import activityExample from '../../assets/images/activity-example.svg';
import coverageExample from '../../assets/images/coverage-example.svg';
import performanceExample from '../../assets/images/performance-example.png';
import SvgDotArrow from '../../components/icons/dot-arrow';

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

const INTERVAL = 7500;

export default function ResultsSection() {
  let [selectedTagIndex, setSelectedTagIndex] = useState(0);
  let transitionConfig = {
    config: {
      duration: 500,
    },
  };

  let textTransitions = useTransition([selectedTagIndex], (item) => item, {
    from: {
      marginTop: -50,
      position: 'absolute',
      alignSelf: 'center',
    },
    enter: { opacity: 1, marginTop: 0 },
    leave: { opacity: 0, marginTop: 40 },
    ...transitionConfig,
  });
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
    ...transitionConfig,
  });

  let opacityTransition = useTransition([selectedTagIndex], (item) => item, {
    from: {
      opacity: 0,
      position: 'absolute',
    },
    enter: { opacity: 1 },
    leave: { opacity: 0 },
    ...transitionConfig,
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
    <Container>
      <TitleContainer>
        {textTransitions.map(({ item, props, key }) => (
          <animated.div key={key} style={props}>
            <TrackRetailText reviewTag={TAGS[item].label} />
          </animated.div>
        ))}
      </TitleContainer>
      <SubTitle>
        See and compare the{' '}
        <SubTitleAnimationContainer>
          {textTransitions.map(({ item, props, key }) => (
            <animated.div key={key} style={props}>
              <PurpleText>{TAGS[item].label}</PurpleText>
            </animated.div>
          ))}
        </SubTitleAnimationContainer>
        of any restaurant or retailer.
      </SubTitle>
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
      <SvgDotArrow style={{ marginBottom: 20 }} />
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
  padding: 42px 24px;
  align-items: center;
`;

const Text = styled(BaseText)`
  display: inline-block;
  white-space: nowrap;
`;
const Title = styled(Text)`
  font-size: 40px;
  font-weight: ${FONT_WEIGHT_MEDIUM};
  text-align: center;
`;
const PurpleTitle = styled(Title)`
  color: ${THEME_COLOR};
`;
const SubTitle = styled(Text)`
  margin-top: 32px;
  display: flex;
  flex-direction: row;
  font-size: ${FONT_SIZE_XLARGE};
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
const TitleContainer = styled(View)`
  height: 60px;
`;
const SubTitleAnimationContainer = styled(View)`
  width: 200px;
  height: 40px;
`;
