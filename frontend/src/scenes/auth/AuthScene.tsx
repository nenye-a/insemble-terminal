import React from 'react';
import { Redirect } from 'react-router-dom';

import { useAuth } from '../../context/AuthContext';

export default function AuthScene() {
  let { isAuthenticated } = useAuth();

  if (isAuthenticated) {
    return <Redirect to="/results" />;
  }
  return <Redirect to="/login" />;
}
