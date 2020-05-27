import React, {
  ReactNode,
  ComponentProps,
  CSSProperties,
  SVGProps,
} from 'react';
import ReactDOM from 'react-dom';
import styled from 'styled-components';

import { WHITE } from '../constants/colors';
import SvgClose from '../components/icons/close';

import View from './View';
import TouchableOpacity from './TouchableOpacity';

type Props = ComponentProps<typeof View> & {
  visible: boolean;
  children: ReactNode;
  onClose?: () => void;
  overlayStyle?: CSSProperties;
  svgCloseProps?: SVGProps<SVGSVGElement>;
  hideCloseButton?: boolean;
  backgroundColor?: string;
  iconContainerStyle?: CSSProperties;
};

export default function Modal({
  onClose,
  children,
  visible,
  overlayStyle,
  svgCloseProps,
  hideCloseButton,
  backgroundColor = WHITE,
  iconContainerStyle,
  ...otherProps
}: Props) {
  if (visible) {
    let onModalDialogClick = (e: Event) => {
      e.stopPropagation();
      otherProps?.onClick && otherProps.onClick();
    };
    return ReactDOM.createPortal(
      <Overlay style={overlayStyle} onClick={onClose}>
        <ModalDialog
          backgroundColor={backgroundColor}
          aria-modal
          role="dialog"
          {...otherProps}
          onClick={onModalDialogClick}
        >
          {!hideCloseButton && (
            <CloseIcon onPress={onClose} style={iconContainerStyle}>
              <SvgClose {...svgCloseProps} />
            </CloseIcon>
          )}
          {children}
        </ModalDialog>
      </Overlay>,
      document.body,
    );
  }
  return null;
}

const Overlay = styled(View)`
  background-color: rgba(0, 0, 0, 0.4);
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 99;
  align-items: center;
  justify-content: center;
`;

const ModalDialog = styled(View)<Props>`
  background-color: ${({ backgroundColor }) => backgroundColor};
  width: 960px;
  height: 100%;
`;

const CloseIcon = styled(TouchableOpacity)`
  position: absolute;
  right: 16px;
  top: 16px;
  z-index: 99;
`;
