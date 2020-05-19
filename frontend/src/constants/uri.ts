const MAPS_API_KEY = process.env.REACT_APP_GOOGLE_KEY || '';

export const MAPS_URI = `https://maps.googleapis.com/maps/api/js?key=${MAPS_API_KEY}&libraries=places`;
