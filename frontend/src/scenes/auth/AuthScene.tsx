import React from 'react';
import { Redirect } from 'react-router-dom';

import { localStorage } from '../../helpers';

export default function AuthScene() {
  let token = localStorage.getToken();
  if (!!token) {
    return <Redirect to="/results" />;
  }
  return <Redirect to="/login" />;
}
