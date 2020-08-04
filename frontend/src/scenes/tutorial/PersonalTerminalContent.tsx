import React from 'react';
import styled from 'styled-components';

import { View, Text as BaseText } from '../../core-ui';
import { FONT_WEIGHT_MEDIUM } from '../../constants/theme';
import { DARK_TEXT_COLOR, THEME_COLOR } from '../../constants/colors';
import { useTutorialContext } from '../../context';
import { DemoType, PerformanceTableType } from '../../generated/globalTypes';
import terminalHeader from '../../assets/images/terminal-header.svg';
import addTerminal from '../../assets/images/add-terminal-demo.svg';
import PerformanceResult from '../results/PerformanceResult';
import SvgArrowPointerRight from '../../components/icons/arrow-pointer-right';

import BottomNavigation from './BottomNavigation';

export default function PersonalTerminalContent() {
  let { onPageChange } = useTutorialContext();
  return (
    <View>
      <Title>Personal Terminals</Title>
      <SubTitle>Track customizable and shareable reports with ease.</SubTitle>
      <Paragraph>
        Insemble allows you to save your favorite graphs for later, and store
        them in personalized terminals, they can be shared and they remain
        updated.
      </Paragraph>
      <Row>
        <View flex>
          <Text>Navigate To Terminals</Text>
        </View>
        <View flex>
          <img src={terminalHeader} alt="terminal-header" />
        </View>
      </Row>
      <Row>
        <View flex>
          <Text>Add a new terminal</Text>
        </View>
        <View flex>
          <img src={addTerminal} alt="add-terminal" />
        </View>
      </Row>
      <Paragraph style={{ paddingBottom: 0 }}>
        Use the pin on your favorite graph to add to the terminal!
      </Paragraph>
      <View>
        <SvgArrowPointerRight
          style={{
            color: THEME_COLOR,
            position: 'absolute',
            right: 100,
            top: 30,
          }}
        />
        <PerformanceResult
          title="Overall Performance"
          performanceType={PerformanceTableType.OVERALL}
          demoType={DemoType.WITH_COMPARE}
          containerStyle={{ paddingBottom: 65 }}
          zoomIcon="pin"
        />
      </View>
      <BottomNavigation
        leftButton={{
          text: 'Contacts',
          onPress: () => {
            onPageChange('contacts');
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

const Row = styled(View)`
  flex-direction: row;
  align-items: center;
  padding: 36px 0;
`;
