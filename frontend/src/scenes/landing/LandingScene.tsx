import React from 'react';

import { View, Divider } from '../../core-ui';
import { GREY_DIVIDER } from '../../constants/colors';

import ResultsSection from './ResultsSection';
import TerminalSection from './TerminalSection';
import ContactUsSection from './ContactUsSection';

export default function LandingScene() {
  return (
    <View>
      <ResultsSection />
      <TerminalSection />
      <Divider color={GREY_DIVIDER} />
      <ContactUsSection />
    </View>
  );
}
