import React, { ComponentProps, useState } from 'react';
import styled from 'styled-components';

import { TouchableOpacity, Text, View, ClickAway } from '../core-ui';
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

type Props = {
  name: string;
  email: string;
};

const MENUS = [
  {
    label: 'Manage Account',
    onPress: () => {},
  },
  {
    label: 'Give Feedback',
    onPress: () => {},
  },
  {
    label: 'Help',
    onPress: () => {},
  },
  {
    label: 'Sign Out',
    onPress: () => {},
  },
];
export default function ProfileMenuDropdown(props: Props) {
  let { name, email } = props;
  let [menuOpen, setMenuOpen] = useState(false);

  return (
    <ClickAway
      onClickAway={() => {
        setMenuOpen(false);
      }}
    >
      <TouchableContainer
        isOpen={menuOpen}
        onPress={() => {
          setMenuOpen(!menuOpen);
        }}
      >
        <Placeholder>{name}</Placeholder>
        <ArrowIcon src={arrowIcon} alt="arrow-icon" isOpen={menuOpen} />
      </TouchableContainer>
      {menuOpen && (
        <View style={{ zIndex: 99 }}>
          <MenuWrapper>
            <Header>
              <Text
                color={WHITE}
                fontSize={FONT_SIZE_SEMI_MEDIUM}
                fontWeight={FONT_WEIGHT_MEDIUM}
              >
                {name}
              </Text>
              <Text color={WHITE} fontSize={FONT_SIZE_SMALL}>
                {email}
              </Text>
            </Header>
            {MENUS.map(({ label }, index) => {
              let lastIndex = index === MENUS.length - 1;
              return (
                <OptionContainer key={index} onPress={() => {}}>
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
        </View>
      )}
    </ClickAway>
  );
}

type ArrowIconProps = ComponentProps<'img'> & {
  isOpen: boolean;
};

type TouchableContainerProps = ComponentProps<typeof TouchableOpacity> & {
  isOpen: boolean;
};

const TouchableContainer = styled(TouchableOpacity)`
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
  position: absolute;
  margin-top: 5px;
  right: 0px;
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
