import React, { useEffect, useRef, ReactNode } from 'react';

import View from './View';

type Props = ViewProps & {
  onClickAway: () => void;
  children: ReactNode;
};

export default function ClickAway(props: Props) {
  let { children, onClickAway, ...otherProps } = props;
  let node = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let handler = (event: MouseEvent) => {
      if (node.current && node.current.contains(event.target as Node)) {
        return;
      }
      onClickAway();
    };

    document.addEventListener('mousedown', handler);

    return () => {
      document.removeEventListener('mousedown', handler);
    };
  });

  return (
    <View ref={node} {...otherProps}>
      {children}
    </View>
  );
}
