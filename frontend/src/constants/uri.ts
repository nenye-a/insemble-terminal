const MAPS_API_KEY = process.env.REACT_APP_GOOGLE_KEY || '';

export const API_URI = process.env.REACT_APP_API || 'http://localhost:4000';

export const MAPS_URI = `https://maps.googleapis.com/maps/api/js?key=${MAPS_API_KEY}&v=3.exp&libraries=geometry,drawing,places,visualization`;

export const SUPPORT_EMAIL = 'sales@insemblegroup.com';

export const PRIVACY_POLICY_PDF =
  'https://drive.google.com/open?id=1UpMXesh-LjN4xvMU1aSZDxlkGpW5ynpi';

export const TERMS_OF_SERVICE_PDF =
  'https://drive.google.com/file/d/1F5M5EBp_vaU_ejobrqh5RCvYG9akqEKx/view';

export const INSEMBLE_LEASING_URI = 'https://leasing.insemble.co/';
