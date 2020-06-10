import React from 'react';
import { Redirect } from 'react-router-dom';

import { useAuth } from '../../context/AuthContext';

export default function AuthScene() {
  let { isAuthenticated, user } = useAuth();

  if (isAuthenticated && user && user.license) {
    return <Redirect to="/results" />;
  }
  if (isAuthenticated && user && !user.license) {
    return <Redirect to="/activation" />;
  }
  return <Redirect to="/login" />;
}
