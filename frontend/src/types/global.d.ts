import { ComponentProps } from 'react';

import { View, Text } from '../core-ui';

declare global {
  type ViewProps = ComponentProps<typeof View>;
  type TextProps = ComponentProps<typeof Text>;
  type ImageProps = ComponentProps<'img'>;

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  type ObjectKey<T = any> = { [key: string]: T };

  export { ViewProps, TextProps, ImageProps, ObjectKey };
}
export {};
