const MAPS_API_KEY = process.env.REACT_APP_GOOGLE_KEY || '';

export const API_URI = process.env.REACT_APP_API || 'http://localhost:4000';

export const MAPS_URI = `https://maps.googleapis.com/maps/api/js?key=${MAPS_API_KEY}&v=3.exp&libraries=geometry,drawing,places,visualization`;
