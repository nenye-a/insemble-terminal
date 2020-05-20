import React, {
  ReactNode,
  DetailedHTMLProps,
  FormHTMLAttributes,
  FormEvent,
} from 'react';
import styled from 'styled-components';

type Props = ViewProps &
  Omit<
    DetailedHTMLProps<FormHTMLAttributes<HTMLFormElement>, HTMLFormElement>,
    'onSubmit'
  > & {
    children: ReactNode;
    onSubmit?: () => void;
  };

export default function Form(props: Props) {
  let { children, onSubmit, ...otherProps } = props;
  return (
    <Container
      onSubmit={(e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        onSubmit && onSubmit();
      }}
      {...otherProps}
    >
      {children}
    </Container>
  );
}

const Container = styled.form`
  display: flex;
  flex-direction: column;
`;
