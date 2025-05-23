import React, { useState, useEffect } from 'react';
import styled, { css } from 'styled-components';
import { useHistory } from 'react-router-dom';

import { TouchableOpacity, View, Button, ClickAway } from '../core-ui';
import {
  WHITE,
  HEADER_SHADOW_COLOR,
  DARK_TEXT_COLOR,
  LIGHT_PURPLE,
} from '../constants/colors';
import { useAuth } from '../context';
import { useViewport } from '../helpers';
import { GetBusinessTag_businessTags as BusinessTag } from '../generated/GetBusinessTag';
import { LocationTagInput } from '../generated/globalTypes';
import { SearchTag, BusinessTagResult } from '../types/types';

import InsembleLogo from './InsembleLogo';
import SearchFilterBar from './SearchFilterBar';
import ProfileMenuDropdown from './ProfileMenuDropdown';
import ReadOnlyBanner from './ReadOnlyBanner';
import SearchFilterBarMobile from './SearchFilterBarMobile';

/**
 * Types of header mode
 * default: white background and shadowed bottom border with insemble logo on the left.
 * transparent: transparent background with insemble logo on the left.
 * logoOnly: light purple background with insemble logo on the center.
 * lightPurple: light purple background with insemble logo on the left.
 */
export type HeaderMode = 'default' | 'transparent' | 'logoOnly' | 'lightPurple';

type Props = {
  mode?: HeaderMode;
  onSearchPress?: (searchTags: SearchTag) => void;
  showSearchBar?: boolean;
  defaultReviewTag?: string;
  defaultBusinessTag?: BusinessTagResult | BusinessTag | string;
  defaultLocationTag?: LocationTagInput;
  readOnly?: boolean;
};

export default function HeaderNavigationBar(props: Props) {
  let {
    mode = 'default',
    onSearchPress,
    showSearchBar,
    defaultReviewTag,
    defaultBusinessTag,
    defaultLocationTag,
    readOnly,
  } = props;
  let history = useHistory();
  let { isAuthenticated } = useAuth();
  let { isDesktop } = useViewport();
  /**
   * State for mobile viewport.
   * focus true: search bar mobile will be set to open/focus mode (vertical search bar)
   * focus false: search bar mobile will be set to close mode (horizontal search bar)
   */
  let [isFocus, setIsFocus] = useState(false);

  useEffect(() => {
    let handleScroll = () => {
      if (isFocus) {
        // Should change the search bar to not focus (close) mode when scrolling
        setIsFocus(false);
      }
    };
    window.addEventListener('scroll', handleScroll);
    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, [isFocus]);

  return (
    <Container mode={mode}>
      {mode === 'logoOnly' ? (
        <TouchableOpacity
          onPress={() => {
            history.push('/');
          }}
          href="/"
          style={{ paddingTop: 24, paddingBottom: 8 }}
        >
          <InsembleLogo color="purple" size="medium" />
        </TouchableOpacity>
      ) : (
        <>
          {readOnly && <ReadOnlyBanner />}
          <Row>
            <TouchableOpacity
              onPress={() => {
                history.push('/');
              }}
              href="/"
            >
              <InsembleLogo color="purple" />
            </TouchableOpacity>
            {showSearchBar && isDesktop ? (
              <SearchContainer flex>
                <SearchFilterBar
                  onSearchPress={onSearchPress}
                  defaultReviewTag={defaultReviewTag}
                  defaultBusinessTag={defaultBusinessTag}
                  defaultLocationTag={defaultLocationTag}
                />
              </SearchContainer>
            ) : (
              // Reserving the space even when search bar is not shown.
              <View flex />
            )}
            {/* Show profile info if user is logged in. else show sign in & contact button */}
            {isAuthenticated ? (
              <RowEnd>
                <TerminalButton
                  mode="transparent"
                  text="Terminals"
                  textProps={{ style: { color: DARK_TEXT_COLOR } }}
                  onPress={() => {
                    history.push('/terminals');
                  }}
                  href="/terminals"
                />
                <ProfileMenuDropdown />
              </RowEnd>
            ) : (
              <RowEnd>
                <Button
                  shape="round"
                  mode="secondary"
                  text="Sign in"
                  onPress={() => {
                    history.push('/login');
                  }}
                />
                <SignUpButton
                  shape="round"
                  text="Contact us"
                  onPress={() => {
                    history.push('/contact-us');
                  }}
                />
              </RowEnd>
            )}
          </Row>
          {showSearchBar && !isDesktop && (
            <SearchBarMobileContainer
              onClick={(e) => {
                e.stopPropagation();
                setIsFocus(true);
              }}
            >
              <ClickAway
                onClickAway={() => {
                  setIsFocus(false);
                }}
              >
                <SearchFilterBarMobile
                  focus={isFocus}
                  onSearchPress={(value) => {
                    if (onSearchPress) {
                      onSearchPress(value);
                      setIsFocus(false);
                    }
                  }}
                  defaultReviewTag={defaultReviewTag}
                  defaultBusinessTag={defaultBusinessTag}
                  defaultLocationTag={defaultLocationTag}
                />
              </ClickAway>
            </SearchBarMobileContainer>
          )}
        </>
      )}
    </Container>
  );
}

type ContainerProps = ViewProps & {
  mode: HeaderMode;
};

const Container = styled(View)<ContainerProps>`
  width: 100vw;
  ${(props) =>
    props.mode === 'default'
      ? css`
          background-color: ${WHITE};
          box-shadow: 0px 1px 1px 0px ${HEADER_SHADOW_COLOR};
        `
      : props.mode === 'logoOnly' || props.mode === 'lightPurple'
      ? css`
          background-color: ${LIGHT_PURPLE};
        `
      : css`
          background-color: transparent;
        `}
  position: sticky;
  top: 0px;
  z-index: 99;
`;

const RowEnd = styled(View)`
  flex-direction: row;
  align-items: center;
  justify-content: flex-end;
`;

const SignUpButton = styled(Button)`
  margin-left: 8px;
`;

const TerminalButton = styled(Button)`
  margin-right: 8px;
`;

const SearchContainer = styled(View)`
  margin: 0 64px;
`;

const Row = styled(View)`
  flex-direction: row;
  align-items: center;
  padding: 12px 32px;
`;

const SearchBarMobileContainer = styled(View)`
  padding: 20px 12px;
  background-color: ${WHITE};
`;
