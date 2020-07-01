import React, { ComponentProps, useState } from 'react';
import styled from 'styled-components';
import { useHistory } from 'react-router-dom';
import Popover from 'react-tiny-popover';

import { TouchableOpacity, Text, View } from '../core-ui';
import {
  LIGHT_GRAY,
  DARK_TEXT_COLOR,
  THEME_COLOR,
  WHITE,
  SHADOW_COLOR,
} from '../constants/colors';
import {
  FONT_SIZE_SMALL,
  FONT_WEIGHT_MEDIUM,
  FONT_SIZE_SEMI_MEDIUM,
} from '../constants/theme';
import arrowIcon from '../assets/images/arrow-down.svg';
import { useAuth } from '../context/AuthContext';
import AddFeedbackModal from '../scenes/results/AddFeedbackModal';

export default function ProfileMenuDropdown() {
  let [menuOpen, setMenuOpen] = useState(false);
  let [feedbackModalVisible, setFeedbackModalVisible] = useState(false);
  let { user, logout } = useAuth();
  let history = useHistory();
  let logoutMenu = {
    label: 'Sign Out',
    onPress: () => {
      logout();
      history.push('/login');
    },
  };
  const GENERAL_MENUS = [
    {
      label: 'Manage Account',
      onPress: () => {
        history.push('/edit-profile');
      },
    },
    {
      label: 'Give Feedback',
      onPress: () => {
        setFeedbackModalVisible(true);
      },
    },
    {
      label: 'Help',
      onPress: () => {},
    },
  ];
  const USER_MENUS = [...GENERAL_MENUS, logoutMenu];
  const ADMIN_MENUS = [
    ...GENERAL_MENUS,
    {
      label: 'Generate Token',
      onPress: () => {
        history.push('/manage-token/generate-token');
      },
    },
    logoutMenu,
  ];
  const MENUS = user?.role === 'ADMIN' ? ADMIN_MENUS : USER_MENUS;
  return (
    <>
      <AddFeedbackModal
        visible={feedbackModalVisible}
        onClose={() => {
          setFeedbackModalVisible(false);
        }}
      />
      <Popover
        isOpen={menuOpen}
        content={
          <MenuWrapper>
            <Header>
              <Text
                color={WHITE}
                fontSize={FONT_SIZE_SEMI_MEDIUM}
                fontWeight={FONT_WEIGHT_MEDIUM}
              >
                {user?.firstName}
              </Text>
              <Text color={WHITE} fontSize={FONT_SIZE_SMALL}>
                {user?.email}
              </Text>
            </Header>
            {MENUS.map(({ label, onPress }, index) => {
              let lastIndex = index === MENUS.length - 1;
              return (
                <OptionContainer key={index} onPress={onPress}>
                  <Text
                    fontWeight={FONT_WEIGHT_MEDIUM}
                    color={lastIndex ? THEME_COLOR : DARK_TEXT_COLOR}
                    fontSize={FONT_SIZE_SEMI_MEDIUM}
                  >
                    {label}
                  </Text>
                </OptionContainer>
              );
            })}
          </MenuWrapper>
        }
        position={['bottom']}
        onClickOutside={() => setMenuOpen(false)}
        align="end"
      >
        {(ref) => (
          <TouchableContainer
            ref={ref}
            isOpen={menuOpen}
            onPress={() => {
              setMenuOpen(!menuOpen);
            }}
          >
            <Placeholder>{user?.firstName}</Placeholder>
            <ArrowIcon src={arrowIcon} alt="arrow-icon" isOpen={menuOpen} />
          </TouchableContainer>
        )}
      </Popover>
    </>
  );
}

type ArrowIconProps = ComponentProps<'img'> & {
  isOpen: boolean;
};

type TouchableContainerProps = ComponentProps<typeof TouchableOpacity> & {
  isOpen: boolean;
};

const TouchableContainer = styled(TouchableOpacity)<TouchableContainerProps>`
  background-color: ${(props) => (props.isOpen ? LIGHT_GRAY : 'transparent')};
  flex-direction: row;
  border-radius: 14px;
  height: 28px;
  border: 1px solid ${LIGHT_GRAY};
  padding: 0 14px;
  justify-content: center;
  align-items: center;
  transition: background-color 200ms linear;
`;

const Placeholder = styled(Text)`
  font-size: ${FONT_SIZE_SMALL};
  font-weight: ${FONT_WEIGHT_MEDIUM};
  color: ${DARK_TEXT_COLOR};
`;

const ArrowIcon = styled.img<ArrowIconProps>`
  transform: ${(props) => (props.isOpen ? 'rotate(180deg)' : 'rotate(0deg)')};
  transition-duration: 200ms;
`;

const Header = styled(View)`
  background-color: ${THEME_COLOR};
  padding: 8px;
  align-items: center;
`;

const MenuWrapper = styled(View)`
  width: 215px;
  box-shadow: ${SHADOW_COLOR};
`;

const OptionContainer = styled(TouchableOpacity)`
  padding: 8px;
  height: 44px;
  justify-content: center;
  align-items: center;
  background-color: ${WHITE};
  cursor: pointer;
  border-bottom-width: 1px;
  border-color: ${LIGHT_GRAY};
  &:last-child {
    border-color: transparent;
  }
`;
