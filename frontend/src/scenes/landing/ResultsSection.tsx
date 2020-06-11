import React, { useEffect, useState } from 'react';
import styled, { css } from 'styled-components';
import { useTransition, animated } from 'react-spring';

import { View, Text as BaseText } from '../../core-ui';
import { FONT_SIZE_XLARGE, FONT_WEIGHT_MEDIUM } from '../../constants/theme';
import { THEME_COLOR } from '../../constants/colors';
import { useViewport } from '../../helpers';
import activitySearchBox from '../../assets/images/activity-searchbox.svg';
import coverageSearchBox from '../../assets/images/coverage-searchbox.svg';
import newsSearchbox from '../../assets/images/news-searchbox.svg';
import performanceSearchbox from '../../assets/images/performance-searchbox.svg';
import newsExample from '../../assets/images/news-example.svg';
import activityExample from '../../assets/images/activity-example.svg';
import coverageExample from '../../assets/images/coverage-example.svg';
import performanceExample from '../../assets/images/performance-example.png';
import activitySearchBoxSmall from '../../assets/images/activity-searchbox-small.svg';
import coverageSearchBoxSmall from '../../assets/images/coverage-searchbox-small.svg';
import newsSearchBoxSmall from '../../assets/images/news-searchbox-small.svg';
import performanceSearchBoxSmall from '../../assets/images/performance-searchbox-small.svg';
import newsExampleSmall from '../../assets/images/news-example-small.svg';
import activityExampleSmall from '../../assets/images/activity-example-small.svg';
import coverageExampleSmall from '../../assets/images/coverage-example-small.svg';
import performanceExampleSmall from '../../assets/images/performance-example-small.png';
import SvgDotArrow from '../../components/icons/dot-arrow';
import SvgTripleDots from '../../components/icons/triple-dots';

type WithViewport = { isDesktop: boolean };
type TextWithViewport = TextProps & WithViewport;
type ViewWithViewport = ViewProps & WithViewport;

const INTERVAL = 7500;

export default function ResultsSection() {
  let [selectedTagIndex, setSelectedTagIndex] = useState(0);
  let { isDesktop } = useViewport();
  let tags = isDesktop ? TAGS : MOBILE_TAGS;
  let transitionConfig = {
    config: {
      duration: 500,
    },
  };

  let textTransitions = useTransition([selectedTagIndex], (item) => item, {
    from: {
      marginTop: isDesktop ? -50 : -20,
      position: 'absolute',
      alignSelf: 'center',
    },
    enter: { opacity: 1, marginTop: 0 },
    leave: { opacity: 0, marginTop: isDesktop ? 40 : 20 },
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
      <TitleContainer isDesktop={isDesktop}>
        {textTransitions.map(({ item, props, key }) => (
          <animated.div key={key} style={props}>
            <TrackRetailText reviewTag={tags[item].label} />
          </animated.div>
        ))}
      </TitleContainer>
      <SubTitle isDesktop={isDesktop}>
        See and compare the{' '}
        <SubTitleAnimationContainer isDesktop={isDesktop}>
          {textTransitions.map(({ item, props, key }) => (
            <animated.div key={key} style={props}>
              <PurpleText isDesktop={isDesktop}>{tags[item].label}</PurpleText>
            </animated.div>
          ))}
        </SubTitleAnimationContainer>
        of any restaurant or retailer.
      </SubTitle>
      {isDesktop && (
        <Row>
          <Description>In any market.</Description>
          <Description>In any location.</Description>
          <Description>In any scope.</Description>
        </Row>
      )}
      <SearchBarContainer isDesktop={isDesktop}>
        {opacityTransition.map(({ item, props, key }) => (
          <animated.div key={key} style={props}>
            <img src={tags[item].searchBarImage} alt="searchbar-img" />
          </animated.div>
        ))}
      </SearchBarContainer>
      {isDesktop ? (
        <SvgDotArrow style={{ marginBottom: 20 }} />
      ) : (
        <SvgTripleDots />
      )}
      <ExampleImageContainer isDesktop={isDesktop}>
        {transitions.map(({ item, props, key }) => (
          <animated.img
            key={key}
            src={tags[item].image}
            alt="example-img"
            style={props}
          />
        ))}
      </ExampleImageContainer>
    </Container>
  );
}

function TrackRetailText({ reviewTag }: { reviewTag: string }) {
  let { isDesktop } = useViewport();
  return (
    <Row>
      <Title isDesktop={isDesktop}>
        Track retail{' '}
        <PurpleTitle isDesktop={isDesktop}>{reviewTag}</PurpleTitle>
      </Title>
    </Row>
  );
}

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

const MOBILE_TAGS = [
  {
    label: 'activity',
    searchBarImage: activitySearchBoxSmall,
    image: activityExampleSmall,
  },
  {
    label: 'news',
    searchBarImage: newsSearchBoxSmall,
    image: newsExampleSmall,
  },
  {
    label: 'coverage',
    searchBarImage: coverageSearchBoxSmall,
    image: coverageExampleSmall,
  },
  {
    label: 'performance',
    searchBarImage: performanceSearchBoxSmall,
    image: performanceExampleSmall,
  },
];

const Container = styled(View)`
  padding: 42px 24px;
  align-items: center;
`;

const Text = styled(BaseText)`
  display: inline-block;
  white-space: nowrap;
`;
const Title = styled(Text)<TextWithViewport>`
  font-size: ${(props) => (props.isDesktop ? '40px' : '22px')};
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
  flex-wrap: wrap;
  font-size: ${(props) => (props.isDesktop ? FONT_SIZE_XLARGE : '19px')};
  text-align: center;
  flex: 1;
  justify-content: center;
`;
const PurpleText = styled(Text)<TextWithViewport>`
  font-size: ${(props) => (props.isDesktop ? FONT_SIZE_XLARGE : '19px')};
  color: ${THEME_COLOR};
  font-weight: ${FONT_WEIGHT_MEDIUM};
  text-align: center;
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
const SearchBarContainer = styled(View)<ViewWithViewport>`
  ${(props) =>
    props.isDesktop
      ? css`
          margin: 32px 0;
          height: 140px;
        `
      : css`
          margin: 16px 0;
          height: 110px;
          background-color: red;
        `}
  align-items: center;
`;
const TitleContainer = styled(View)<ViewWithViewport>`
  height: ${(props) => (props.isDesktop ? '60px' : '30px')};
`;
const SubTitleAnimationContainer = styled(View)<ViewWithViewport>`
  ${(props) =>
    props.isDesktop
      ? css`
          width: 200px;
          height: 40px;
        `
      : css`
          width: 130px;
          height: 20px;
        `}
`;
const ExampleImageContainer = styled(View)<ViewWithViewport>`
  align-items: center;
  ${(props) =>
    props.isDesktop
      ? css`
          height: 490px;
        `
      : css`
          height: 460px;
        `}
`;
