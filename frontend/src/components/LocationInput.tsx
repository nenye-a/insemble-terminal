import React, {
  useEffect,
  useRef,
  useCallback,
  useState,
  ComponentProps,
  RefObject,
  CSSProperties,
} from 'react';

import { TextInput } from '../core-ui';
import { useGoogleMaps } from '../helpers';
import { DEFAULT_BORDER_RADIUS } from '../constants/theme';
import { THEME_COLOR, WHITE, DISABLED_PILL_COLOR } from '../constants/colors';

type PlaceResult = google.maps.places.PlaceResult;
type InputProps = ComponentProps<'input'>;

export type SelectedLocation = {
  id: string;
  name: string;
  address: string;
  placeType: Array<string>;
} | null;

type Props = Omit<InputProps, 'onSubmit' | 'ref'> & {
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
    disabled,
    defaultValue,
    ...otherProps
  } = props;
  let [inputValue, setInputValue] = useState('');
  let inputRef = useRef<HTMLInputElement | null>(null);
  let selectedPlace = useRef<PlaceResult | null>(null);
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!isLoading && inputRef.current) {
      let options = {
        types: ['geocode'],
        componentRestrictions: { country: 'us' },
      };
      let autocomplete = new window.google.maps.places.Autocomplete(
        inputRef.current,
        options,
      );
      let listener = autocomplete.addListener('place_changed', () => {
        let place = autocomplete.getPlace();
        selectedPlace.current = place;
        setInputValue(place?.formatted_address || '');
        submitHandler();
      });
      return () => {
        listener.remove();
      };
    }
  }, [submitHandler, isLoading]);

  useEffect(() => {
    setInputValue(defaultValue?.toString() || '');
  }, [defaultValue]);

  if (isLoading) {
    return null;
  }
  return (
    <TextInput
      ref={inputRef}
      placeholder={placeholder}
      onSubmit={submitHandler}
      label={label}
      containerStyle={{
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
      }}
      disabled={disabled}
      style={
        selectedPlace.current?.formatted_address || defaultValue
          ? {
              textAlign: 'center',
              minWidth: 40,
              maxWidth: 200,
              backgroundColor: disabled ? DISABLED_PILL_COLOR : THEME_COLOR,
              padding: 8,
              borderRadius: DEFAULT_BORDER_RADIUS,
              color: WHITE,
              caretColor: 'transparent',
              height: 28,
            }
          : undefined
      }
      value={inputValue}
      onChange={(e) => {
        setInputValue(e.target.value);
      }}
      onKeyDown={(e) => {
        if (e.which === 8) {
          if (inputRef.current && selectedPlace.current) {
            inputRef.current.value = '';
          }
          onPlaceSelected && onPlaceSelected(null);
          selectedPlace.current = null;
        }
      }}
      {...otherProps}
    />
  );
}
