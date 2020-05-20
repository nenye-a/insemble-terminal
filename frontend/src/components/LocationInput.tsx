import React, {
  useEffect,
  useRef,
  useState,
  useCallback,
  ComponentProps,
  RefObject,
  CSSProperties,
} from 'react';

import { TextInput } from '../core-ui';
import { useGoogleMaps } from '../helpers';
import { DEFAULT_BORDER_RADIUS } from '../constants/theme';
import { THEME_COLOR, WHITE } from '../constants/colors';

type PlaceResult = google.maps.places.PlaceResult;
type InputProps = ComponentProps<'input'>;

export type SelectedLocation = {
  id: string;
  name: string;
  address: string;
  placeType: Array<string>;
};

type Props = Omit<InputProps, 'onSubmit' | 'ref'> & {
  icon?: boolean;
  label?: string;
  placeholder?: string;
  ref?: RefObject<HTMLInputElement> | null;
  onPlaceSelected?: (place: SelectedLocation) => void;
  containerStyle?: CSSProperties;
};

export default function LocationInput(props: Props) {
  let { isLoading } = useGoogleMaps();
  let {
    placeholder,
    onPlaceSelected,
    label,
    containerStyle,
    icon,
    ...otherProps
  } = props;
  let [isFocused, setFocused] = useState(false);
  let inputRef = useRef<HTMLInputElement | null>(null);
  let selectedPlace = useRef<PlaceResult | null>(null);
  let options = {
    // TODO: restrict to only city and address
    componentRestrictions: { country: 'us' },
  };
  let submitHandler = useCallback(() => {
    if (selectedPlace.current) {
      let {
        formatted_address: formattedAddress = '',
        name,
        id = '',
        types: placeType = [],
      } = selectedPlace.current;
      onPlaceSelected &&
        onPlaceSelected({
          id,
          name,
          address: formattedAddress,
          placeType,
        });
    }
  }, [onPlaceSelected]);

  useEffect(() => {
    if (inputRef.current && !isLoading && isFocused) {
      let autocomplete = new window.google.maps.places.Autocomplete(
        inputRef.current,
        options,
      );
      let listener = autocomplete.addListener('place_changed', () => {
        let place = autocomplete.getPlace();
        selectedPlace.current = place;
        submitHandler();
      });
      return () => {
        listener.remove();
      };
    }
  }, [submitHandler, isLoading, options, isFocused]);

  if (isLoading) {
    return null;
  }
  return (
    <TextInput
      ref={inputRef}
      placeholder={placeholder}
      onSubmit={submitHandler}
      label={label}
      onFocus={() => setFocused(true)}
      onBlur={() => setFocused(false)}
      containerStyle={{
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
      }}
      style={
        icon
          ? { paddingRight: 36 }
          : selectedPlace.current?.formatted_address
          ? {
              textAlign: 'center',
              minWidth: 40,
              maxWidth: 200,
              backgroundColor: THEME_COLOR,
              padding: 8,
              borderRadius: DEFAULT_BORDER_RADIUS,
              color: WHITE,
              caretColor: 'transparent',
              height: 28,
            }
          : undefined
      }
      {...otherProps}
    />
  );
}
