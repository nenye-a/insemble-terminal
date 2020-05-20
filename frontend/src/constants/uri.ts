const MAPS_API_KEY =
  process.env.REACT_APP_GOOGLE_KEY || 'AIzaSyCJjsXi3DbmlB1soI9kHzANRqVkiWj3P2U';

export const API_URI =
  process.env.REACT_APP_API || 'https://terminal-node-backend.herokuapp.com/';

export const API_URI = process.env.REACT_APP_API || 'http://localhost:4000';

export const MAPS_URI = `https://maps.googleapis.com/maps/api/js?key=${MAPS_API_KEY}&libraries=places`;
