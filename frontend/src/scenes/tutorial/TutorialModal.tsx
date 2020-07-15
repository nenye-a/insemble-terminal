import React, { useState } from 'react';
import styled from 'styled-components';

import { Modal, TouchableOpacity, View } from '../../core-ui';
import { TutorialContextProvider } from '../../context';
import { useViewport } from '../../helpers';
import { WHITE, BACKGROUND_COLOR, THEME_COLOR } from '../../constants/colors';
import SvgMenu from '../../components/icons/menu';

import SideBar from './SideBar';
import TutorialContent from './TutorialContent';

type Props = {
  visible: boolean;
  onClose?: () => void;
};

export default function TutorialModal(props: Props) {
  let { visible, onClose } = props;
  let { isDesktop } = useViewport();
  // TODO: better typing for selectedPage
  let [selectedPage, setSelectedPage] = useState('overview');
  let [sidebarVisible, setSidebarVisible] = useState(false);

  let closeSideBar = () => {
    setSidebarVisible(false);
  };
  return (
    <TutorialContextProvider
      value={{ selectedPage, onPageChange: setSelectedPage }}
    >
      <Container
        visible={visible}
        onClose={onClose}
        hideCloseButton={isDesktop}
        isDesktop={isDesktop}
      >
        {!isDesktop && (
          <>
            <IconContainer
              onPress={() => {
                setSidebarVisible(true);
              }}
              visible={sidebarVisible}
            >
              <SvgMenu style={{ color: THEME_COLOR }} />
            </IconContainer>
            {sidebarVisible && <Overlay onClick={closeSideBar} />}
            <SideBarContainer visible={sidebarVisible}>
              <SideBar />
            </SideBarContainer>
          </>
        )}
        <Row flex>
          {isDesktop && <SideBar />}
          <TutorialContent />
        </Row>
      </Container>
    </TutorialContextProvider>
  );
}

const Container = styled(Modal)<WithViewport>`
  width: ${({ isDesktop }) => (isDesktop ? '90vw' : '100vw')};
`;

const Row = styled(View)`
  flex-direction: row;
  overflow-y: scroll;
`;
const SideBarContainer = styled(View)<{ visible: boolean }>`
  position: absolute;
  transform: translateX(${(props) => (props.visible ? '0px' : '-250px')});
  transition: all linear ${(props) => (props.visible ? '0.4s' : '0.3s')};
  z-index: 99;
  height: 100%;
  background-color: ${WHITE};
`;

const IconContainer = styled(TouchableOpacity)<WithViewport>`
  padding: 16px;
  visibility: ${(props) => (props.visible ? 'none' : 'visible')};
  opacity: ${(props) => (props.visible ? 0 : 1)};
  transition: opacity linear 0.4s;
  height: fit-content;
  background-color: ${BACKGROUND_COLOR};
`;

const Overlay = styled(View)`
  background-color: rgba(0, 0, 0, 0.4);
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 99;
`;
