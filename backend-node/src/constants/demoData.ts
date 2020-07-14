import {
  PerformanceDataCreateInput,
  ComparePerformanceDataCreateInput,
  ActivityDataCreateInput,
  CompareActivityDataCreateInput,
  MapDataCreateInput,
  CompareMapDataCreateInput,
  NewsDataCreateInput,
  OwnershipContactDataCreateInput,
  OwnershipInfoDataCreateInput,
} from '@prisma/client';

export const PerformanceDemoBasicOverallData: Array<PerformanceDataCreateInput> = [
  {
    avgRating: '4.1',
    name: 'Starbucks (Los Angeles)',
    numLocation: 149,
    numReview: 321,
    customerVolumeIndex: 131,
    localCategoryIndex: 118,
    localRetailIndex: 125,
    nationalIndex: 106,
    numNearby: null,
  },
];

export const PerformanceDemoBasicAddressData: Array<PerformanceDataCreateInput> = [
  {
    avgRating: '3.8',
    name: '1401 Alameda St, Los Angeles, CA 90021 (Starbucks)',
    numLocation: null,
    numReview: 953,
    customerVolumeIndex: 336,
    localCategoryIndex: 321,
    localRetailIndex: 332,
    nationalIndex: 272,
    numNearby: 1,
  },
  {
    avgRating: '4.1',
    name: '2735 S Figueroa St, Los Angeles, CA 90007 (Starbucks)',
    numLocation: null,
    numReview: 1573,
    customerVolumeIndex: 308,
    localCategoryIndex: 275,
    localRetailIndex: 256,
    nationalIndex: 249,
    numNearby: null,
  },
  {
    avgRating: '4.2',
    name: '1106 Cornwell St, Los Angeles, CA 90033 (Starbucks)',
    numLocation: null,
    numReview: 965,
    customerVolumeIndex: 275,
    localCategoryIndex: 260,
    localRetailIndex: 264,
    nationalIndex: 222,
    numNearby: null,
  },
  {
    avgRating: '4.3',
    name: '1250 South La Brea Ave, Los Angeles, CA 90019 (Starbucks)',
    numLocation: null,
    numReview: 357,
    customerVolumeIndex: 243,
    localCategoryIndex: 228,
    localRetailIndex: 224,
    nationalIndex: 197,
    numNearby: 1,
  },
  {
    avgRating: '4.1',
    name: '3853 E 3rd St E, Los Angeles, CA 90063 (Starbucks)',
    numLocation: null,
    numReview: 870,
    customerVolumeIndex: 236,
    localCategoryIndex: 194,
    localRetailIndex: 215,
    nationalIndex: 191,
    numNearby: null,
  },
  {
    avgRating: '4.3',
    name: '3061 Sawtelle Blvd, Los Angeles, CA 90066 (Starbucks)',
    numLocation: null,
    numReview: 86,
    customerVolumeIndex: 229,
    localCategoryIndex: 193,
    localRetailIndex: 209,
    nationalIndex: 185,
    numNearby: null,
  },
  {
    avgRating: '4.1',
    name: '1742 S La Cienega Blvd, Los Angeles, CA 90035 (Starbucks)',
    numLocation: null,
    numReview: 606,
    customerVolumeIndex: 219,
    localCategoryIndex: 204,
    localRetailIndex: 218,
    nationalIndex: 177,
    numNearby: 1,
  },
  {
    avgRating: '4.1',
    name: '11361 National Blvd, Los Angeles, CA 90064 (Starbucks)',
    numLocation: null,
    numReview: 81,
    customerVolumeIndex: 217,
    localCategoryIndex: 183,
    localRetailIndex: 205,
    nationalIndex: 175,
    numNearby: 1,
  },
  {
    avgRating: '3.9',
    name: '6240 York Blvd, Los Angeles, CA 90042 (Starbucks)',
    numLocation: null,
    numReview: 377,
    customerVolumeIndex: 196,
    localCategoryIndex: 187,
    localRetailIndex: 178,
    nationalIndex: 158,
    numNearby: 1,
  },
  {
    avgRating: '4.3',
    name: '1730 W Manchester Ave, Los Angeles, CA 90047 (Starbucks)',
    numLocation: null,
    numReview: 728,
    customerVolumeIndex: 194,
    localCategoryIndex: 107,
    localRetailIndex: 158,
    nationalIndex: 157,
    numNearby: 1,
  },
  {
    avgRating: '4.3',
    name: '7724 Telegraph Rd, Los Angeles, CA 90040 (Starbucks)',
    numLocation: null,
    numReview: 504,
    customerVolumeIndex: 181,
    localCategoryIndex: 131,
    localRetailIndex: 148,
    nationalIndex: 147,
    numNearby: 2,
  },
  {
    avgRating: '4.2',
    name: '534 S Occidental Blvd, Los Angeles, CA 90057 (Starbucks)',
    numLocation: null,
    numReview: 587,
    customerVolumeIndex: 180,
    localCategoryIndex: 171,
    localRetailIndex: 161,
    nationalIndex: 145,
    numNearby: 1,
  },
  {
    name: '801 S Olive St Suite A, Los Angeles, CA 90014 (Starbucks)',
    numLocation: null,
    numReview: 84,
    customerVolumeIndex: 170,
    localCategoryIndex: 158,
    localRetailIndex: 184,
    nationalIndex: 138,
    numNearby: 2,
  },
  {
    name: '12313 Jefferson Blvd, Los Angeles, CA 90230 (Starbucks)',
    numLocation: null,
    numReview: 437,
    customerVolumeIndex: 161,
    localCategoryIndex: 133,
    localRetailIndex: 148,
    nationalIndex: 130,
    numNearby: 1,
  },
  {
    avgRating: '3.9',
    name: '8701 Lincoln Blvd, Los Angeles, CA 90045 (Starbucks)',
    numLocation: null,
    numReview: 41,
    customerVolumeIndex: 160,
    localCategoryIndex: 138,
    localRetailIndex: 138,
    nationalIndex: 129,
    numNearby: 1,
  },
  {
    avgRating: '4',
    name: '10955 Weyburn Ave, Los Angeles, CA 90024 (Starbucks)',
    numLocation: null,
    numReview: 601,
    customerVolumeIndex: 158,
    localCategoryIndex: 134,
    localRetailIndex: 151,
    nationalIndex: 128,
    numNearby: null,
  },
  {
    avgRating: '4.3',
    name: '735 S Figueroa St #308, Los Angeles, CA 90017 (Starbucks)',
    numLocation: null,
    numReview: 350,
    customerVolumeIndex: 144,
    localCategoryIndex: 133,
    localRetailIndex: 149,
    nationalIndex: 116,
    numNearby: 7,
  },
  {
    avgRating: '4.3',
    name: '735 S Figueroa St, Los Angeles, CA 90017 (Starbucks)',
    numLocation: null,
    numReview: 351,
    customerVolumeIndex: 144,
    localCategoryIndex: 133,
    localRetailIndex: 149,
    nationalIndex: 116,
    numNearby: 7,
  },
  {
    avgRating: '4.6',
    name: '2134 Sunset Blvd G, Los Angeles, CA 90026 (Starbucks Reserve)',
    numLocation: null,
    numReview: 386,
    customerVolumeIndex: 141,
    localCategoryIndex: 135,
    localRetailIndex: 136,
    nationalIndex: 128,
    numNearby: 4,
  },
  {
    avgRating: '4.3',
    name: '11707 San Vicente Blvd, Los Angeles, CA 90049 (Starbucks)',
    numLocation: null,
    numReview: 297,
    customerVolumeIndex: 141,
    localCategoryIndex: 119,
    localRetailIndex: 143,
    nationalIndex: 114,
    numNearby: null,
  },
  {
    avgRating: '2.6',
    name: '9616 W Pico Blvd, Los Angeles, CA 90035 (Starbucks)',
    numLocation: null,
    numReview: 8,
    customerVolumeIndex: 140,
    localCategoryIndex: 134,
    localRetailIndex: 150,
    nationalIndex: 113,
    numNearby: null,
  },
  {
    avgRating: '3.8',
    name: '7257 Sunset Blvd, Los Angeles, CA 90046 (Starbucks)',
    numLocation: null,
    numReview: 42,
    customerVolumeIndex: 139,
    localCategoryIndex: 134,
    localRetailIndex: 125,
    nationalIndex: 112,
    numNearby: 2,
  },
  {
    avgRating: '4.3',
    name: '2560 Glendale Blvd, Los Angeles, CA 90039 (Starbucks)',
    numLocation: null,
    numReview: 313,
    customerVolumeIndex: 137,
    localCategoryIndex: 132,
    localRetailIndex: 129,
    nationalIndex: 110,
    numNearby: null,
  },
  {
    avgRating: '4.2',
    name: '12404 W, Venice Blvd Suite A, Los Angeles, CA 90066 (Starbucks)',
    numLocation: null,
    numReview: 436,
    customerVolumeIndex: 136,
    localCategoryIndex: 113,
    localRetailIndex: 132,
    nationalIndex: 110,
    numNearby: 2,
  },
  {
    avgRating: '4.1',
    name: '5601 Wilshire Blvd, Los Angeles, CA 90036 (Starbucks)',
    numLocation: null,
    numReview: 69,
    customerVolumeIndex: 136,
    localCategoryIndex: 131,
    localRetailIndex: 134,
    nationalIndex: 110,
    numNearby: 2,
  },
  {
    avgRating: '3.9',
    name: '620 S Virgil Ave, Los Angeles, CA 90020 (Starbucks)',
    numLocation: null,
    numReview: 41,
    customerVolumeIndex: 135,
    localCategoryIndex: 127,
    localRetailIndex: 121,
    nationalIndex: 109,
    numNearby: null,
  },
];

export const PerformanceDemoCompareData: Array<ComparePerformanceDataCreateInput> = [
  {
    avgRating: '4.3',
    name: 'The Cheesecake Factory (Los Angeles)',
    numLocation: 1,
    numReview: 2412,
    compareId: 'ckcebhe6z0000jn45krqazcos',
    customerVolumeIndex: 150,
    localCategoryIndex: 172,
    localRetailIndex: 161,
    nationalIndex: 150,
    numNearby: null,
  },
];

export const ActivityDemoData: Array<ActivityDataCreateInput> = [
  {
    activityData:
      '[{"name":"4AM","business":"Starbucks (Los Angeles, CA, USA)","amount":1},{"name":"5AM","business":"Starbucks (Los Angeles, CA, USA)","amount":8},{"name":"6AM","business":"Starbucks (Los Angeles, CA, USA)","amount":27},{"name":"7AM","business":"Starbucks (Los Angeles, CA, USA)","amount":47},{"name":"8AM","business":"Starbucks (Los Angeles, CA, USA)","amount":57},{"name":"9AM","business":"Starbucks (Los Angeles, CA, USA)","amount":57},{"name":"10AM","business":"Starbucks (Los Angeles, CA, USA)","amount":54},{"name":"11AM","business":"Starbucks (Los Angeles, CA, USA)","amount":52},{"name":"12PM","business":"Starbucks (Los Angeles, CA, USA)","amount":50},{"name":"1PM","business":"Starbucks (Los Angeles, CA, USA)","amount":49},{"name":"2PM","business":"Starbucks (Los Angeles, CA, USA)","amount":47},{"name":"3PM","business":"Starbucks (Los Angeles, CA, USA)","amount":42},{"name":"4PM","business":"Starbucks (Los Angeles, CA, USA)","amount":37},{"name":"5PM","business":"Starbucks (Los Angeles, CA, USA)","amount":31},{"name":"6PM","business":"Starbucks (Los Angeles, CA, USA)","amount":21},{"name":"7PM","business":"Starbucks (Los Angeles, CA, USA)","amount":16},{"name":"8PM","business":"Starbucks (Los Angeles, CA, USA)","amount":11},{"name":"9PM","business":"Starbucks (Los Angeles, CA, USA)","amount":7},{"name":"10PM","business":"Starbucks (Los Angeles, CA, USA)","amount":3},{"name":"11PM","business":"Starbucks (Los Angeles, CA, USA)","amount":1},{"name":"12AM","business":"Starbucks (Los Angeles, CA, USA)","amount":0},{"name":"1AM","business":"Starbucks (Los Angeles, CA, USA)","amount":0},{"name":"2AM","business":"Starbucks (Los Angeles, CA, USA)","amount":0},{"name":"3AM","business":"Starbucks (Los Angeles, CA, USA)","amount":0}]',
    location: 'Los Angeles, CA, USA',
    name: 'Starbucks',
  },
];

export const ActivityDemoCompareData: Array<CompareActivityDataCreateInput> = [
  {
    activityData:
      '[{"name":"4AM","business":"Starbucks (Santa Monica, CA, USA)","amount":0},{"name":"5AM","business":"Starbucks (Santa Monica, CA, USA)","amount":6},{"name":"6AM","business":"Starbucks (Santa Monica, CA, USA)","amount":31},{"name":"7AM","business":"Starbucks (Santa Monica, CA, USA)","amount":51},{"name":"8AM","business":"Starbucks (Santa Monica, CA, USA)","amount":61},{"name":"9AM","business":"Starbucks (Santa Monica, CA, USA)","amount":59},{"name":"10AM","business":"Starbucks (Santa Monica, CA, USA)","amount":50},{"name":"11AM","business":"Starbucks (Santa Monica, CA, USA)","amount":43},{"name":"12PM","business":"Starbucks (Santa Monica, CA, USA)","amount":42},{"name":"1PM","business":"Starbucks (Santa Monica, CA, USA)","amount":41},{"name":"2PM","business":"Starbucks (Santa Monica, CA, USA)","amount":40},{"name":"3PM","business":"Starbucks (Santa Monica, CA, USA)","amount":36},{"name":"4PM","business":"Starbucks (Santa Monica, CA, USA)","amount":31},{"name":"5PM","business":"Starbucks (Santa Monica, CA, USA)","amount":25},{"name":"6PM","business":"Starbucks (Santa Monica, CA, USA)","amount":14},{"name":"7PM","business":"Starbucks (Santa Monica, CA, USA)","amount":8},{"name":"8PM","business":"Starbucks (Santa Monica, CA, USA)","amount":4},{"name":"9PM","business":"Starbucks (Santa Monica, CA, USA)","amount":2},{"name":"10PM","business":"Starbucks (Santa Monica, CA, USA)","amount":1},{"name":"11PM","business":"Starbucks (Santa Monica, CA, USA)","amount":0},{"name":"12AM","business":"Starbucks (Santa Monica, CA, USA)","amount":0},{"name":"1AM","business":"Starbucks (Santa Monica, CA, USA)","amount":0},{"name":"2AM","business":"Starbucks (Santa Monica, CA, USA)","amount":0},{"name":"3AM","business":"Starbucks (Santa Monica, CA, USA)","amount":0}]',
    location: 'Santa Monica, CA, USA',
    name: 'Starbucks',
    compareId: 'ckclfm82f0478xr45ja3uff01',
  },
];

export const MapDemoData: Array<MapDataCreateInput> = [
  {
    coverageData:
      '[{"businessName":"Starbucks","numLocations":"149","locations":[{"lat":33.949511,"lng":-118.394124,"name":"Starbucks","rating":null,"address":"1 World Way, Airport, Los Angeles, CA 90045","numReviews":null},{"lat":34.068413,"lng":-118.407098,"name":"Starbucks","rating":null,"address":"1500 Westwood Blvd, Los Angeles, CA 90024","numReviews":null},{"lat":34.062635,"lng":-118.350966,"name":"Starbucks","rating":4.1,"address":"5601 Wilshire Blvd, Los Angeles, CA 90036","numReviews":71},{"lat":34.054955,"lng":-118.39073,"name":"Starbucks","rating":2.8,"address":"9616 W Pico Blvd, Los Angeles, CA 90035","numReviews":9},{"lat":34.068511,"lng":-118.343882,"name":"Starbucks","rating":3.7,"address":"260 South La Brea Ave, Los Angeles, CA 90036","numReviews":6},{"lat":34.05284,"lng":-118.255676,"name":"Starbucks","rating":4.1,"address":"404 S Figueroa St, Los Angeles, CA 90071","numReviews":19},{"lat":33.94651,"lng":-118.228907,"name":"Starbucks","rating":null,"address":"2449 E Century Blvd, Los Angeles, CA 90002","numReviews":null},{"lat":33.946299,"lng":-118.384399,"name":"Starbucks","rating":3.3,"address":"5855 W Century Blvd, Los Angeles, CA 90045","numReviews":157},{"lat":33.958385,"lng":-118.418457,"name":"Starbucks","rating":3.9,"address":"8701 Lincoln Blvd, Los Angeles, CA 90045","numReviews":42},{"lat":34.024741,"lng":-118.220183,"name":"Starbucks","rating":4.2,"address":"2675 E Olympic Blvd, Los Angeles, CA 90023","numReviews":1060},{"lat":34.068412,"lng":-118.169031,"name":"Starbucks","rating":3.6,"address":"5151 State University Dr, Los Angeles, CA 90032","numReviews":161},{"lat":34.020443,"lng":-118.354611,"name":"Starbucks","rating":4.1,"address":"5080 Obama Blvd, Los Angeles, CA 90016","numReviews":103},{"lat":33.97894,"lng":-118.37158,"name":"Starbucks","rating":null,"address":"5245 W Centinela Ave, Los Angeles, CA 90045","numReviews":null},{"lat":33.956332,"lng":-118.397775,"name":"Starbucks","rating":4.2,"address":"8825 S Sepulveda Blvd, Los Angeles, CA 90045","numReviews":5},{"lat":33.982304,"lng":-118.249014,"name":"Starbucks","rating":4.1,"address":"1437 E Gage Ave, Los Angeles, CA 90001","numReviews":875},{"lat":34.060799,"lng":-118.205715,"name":"Starbucks","rating":3.9,"address":"1969 Zonal Ave, Los Angeles, CA 90033","numReviews":88},{"lat":34.021676,"lng":-118.282182,"name":"Starbucks","rating":3.9,"address":"642 W 34th St, Los Angeles, CA 90007","numReviews":78},{"lat":34.069731,"lng":-118.290745,"name":"Starbucks","rating":3.7,"address":"3461 W 3rd St, Los Angeles, CA 90020","numReviews":140},{"lat":33.946196,"lng":-118.387633,"name":"Starbucks","rating":3.9,"address":"5933 W Century Blvd, Los Angeles, CA 90045","numReviews":17},{"lat":34.056241,"lng":-118.23651,"name":"Starbucks","rating":4.1,"address":"800 N Alameda St S2, Los Angeles, CA 90012","numReviews":456},{"lat":34.02466,"lng":-118.28805,"name":"Starbucks","rating":4.3,"address":"1025 WEST 34TH ST KINGS, HALL 1ST FLOOR, Los Angeles, CA 90089","numReviews":113},{"lat":33.95928,"lng":-118.307983,"name":"Starbucks","rating":4.3,"address":"1730 W Manchester Ave, Los Angeles, CA 90047","numReviews":728},{"lat":34.05944,"lng":-118.444752,"name":"Starbucks","rating":4.1,"address":"1161 Westwood Blvd, Los Angeles, CA 90024","numReviews":201},{"lat":34.064476,"lng":-118.469406,"name":"Starbucks","rating":4.2,"address":"11700 Barrington Ct, Los Angeles, CA 90049","numReviews":150},{"lat":34.019164,"lng":-118.334757,"name":"Starbucks","rating":4.2,"address":"3722 Crenshaw Blvd, Los Angeles, CA 90016","numReviews":661},{"lat":34.022749,"lng":-118.438987,"name":"Starbucks","rating":4.2,"address":"11705 National Blvd, Los Angeles, CA 90064","numReviews":190},{"lat":34.025806,"lng":-118.433386,"name":"Starbucks","rating":4.1,"address":"11361 National Blvd, Los Angeles, CA 90064","numReviews":81},{"lat":34.09043,"lng":-118.326277,"name":"Starbucks","rating":4.3,"address":"6260 Santa Monica Blvd, Los Angeles, CA 90038","numReviews":112},{"lat":33.987966,"lng":-118.25715,"name":"Starbucks","rating":4.2,"address":"5857 S Central Ave, Los Angeles, CA 90001","numReviews":721},{"lat":34.025795,"lng":-118.308686,"name":"Starbucks","rating":4,"address":"1789 W Jefferson Blvd, Los Angeles, CA 90018","numReviews":661},{"lat":34.086473,"lng":-118.219553,"name":"Starbucks","rating":4.2,"address":"3241 N Figueroa St, Los Angeles, CA 90065","numReviews":325},{"lat":34.055755,"lng":-118.204549,"name":"Starbucks","rating":4.2,"address":"1106 Cornwell St, Los Angeles, CA 90033","numReviews":978},{"lat":33.946358,"lng":-118.390868,"name":"Starbucks","rating":3.2,"address":"6101 W Century Blvd, Los Angeles, CA 90045","numReviews":49},{"lat":33.94446,"lng":-118.404676,"name":"Starbucks","rating":null,"address":"3 World Way, Los Angeles, CA 90045","numReviews":null},{"lat":34.046118,"lng":-118.376114,"name":"Starbucks","rating":4.1,"address":"1742 S La Cienega Blvd, Los Angeles, CA 90035","numReviews":610},{"lat":33.970721,"lng":-118.41903,"name":"Starbucks","rating":3.6,"address":"1 Loyola Marymount University Dr, Los Angeles, CA 90045","numReviews":49},{"lat":34.104063,"lng":-118.258994,"name":"Starbucks","rating":4.3,"address":"2560 Glendale Blvd, Los Angeles, CA 90039","numReviews":313},{"lat":34.09722,"lng":-118.288155,"name":"Starbucks","rating":4.1,"address":"4520 Sunset Blvd, Los Angeles, CA 90028","numReviews":254},{"lat":34.062529,"lng":-118.447346,"name":"Starbucks","rating":4,"address":"10955 Weyburn Ave, Los Angeles, CA 90024","numReviews":601},{"lat":33.956712,"lng":-118.396921,"name":"Starbucks","rating":3.8,"address":"8817 S Sepulveda Blvd, Los Angeles, CA 90045","numReviews":1128},{"lat":33.961763,"lng":-118.420066,"name":"Starbucks","rating":4.2,"address":"8400 Lincoln Blvd, Los Angeles, CA 90045","numReviews":252},{"lat":34.053737,"lng":-118.466101,"name":"Starbucks","rating":4.3,"address":"11707 San Vicente Blvd, Los Angeles, CA 90049","numReviews":297},{"lat":33.988903,"lng":-118.309883,"name":"Starbucks","rating":3.9,"address":"1850 W Slauson Ave, Los Angeles, CA 90047","numReviews":882},{"lat":34.111157,"lng":-118.287225,"name":"Starbucks","rating":4.5,"address":"2138 Hillhurst Ave, Los Angeles, CA 90027","numReviews":398},{"lat":34.033281,"lng":-118.365362,"name":"Starbucks","rating":3.7,"address":"3535 S La Cienega Blvd, Los Angeles, CA 90016","numReviews":134},{"lat":33.975326,"lng":-118.124305,"name":"Starbucks","rating":4.3,"address":"7724 Telegraph Rd, Los Angeles, CA 90040","numReviews":509},{"lat":34.054901,"lng":-118.383531,"name":"Starbucks","rating":4.1,"address":"8783 W Pico Blvd, Los Angeles, CA 90035","numReviews":285},{"lat":34.033673,"lng":-118.184236,"name":"Starbucks","rating":4.1,"address":"3853 E 3rd St E, Los Angeles, CA 90063","numReviews":877},{"lat":34.040164,"lng":-118.330504,"name":"Starbucks","rating":4.1,"address":"4177 W Washington Blvd, Los Angeles, CA 90018","numReviews":848},{"lat":34.08437,"lng":-118.326993,"name":"Starbucks","rating":4,"address":"727 N, Vine St, Los Angeles, CA 90038","numReviews":168},{"lat":34.031081,"lng":-118.401007,"name":"Starbucks","rating":4.4,"address":"9824 National Blvd, Los Angeles, CA 90034","numReviews":272},{"lat":34.083514,"lng":-118.356131,"name":"Starbucks","rating":4.2,"address":"7624 Melrose Ave, Los Angeles, CA 90046","numReviews":489},{"lat":34.077165,"lng":-118.26474,"name":"Starbucks Reserve","rating":4.6,"address":"2134 Sunset Blvd G, Los Angeles, CA 90026","numReviews":390},{"lat":34.003209,"lng":-118.433664,"name":"Starbucks","rating":4.2,"address":"12404 W, Venice Blvd Suite A, Los Angeles, CA 90066","numReviews":436},{"lat":34.062686,"lng":-118.444064,"name":"Starbucks","rating":3.2,"address":"10861 Weyburn Ave, Los Angeles, CA 90024","numReviews":34},{"lat":34.114864,"lng":-118.183328,"name":"Starbucks","rating":3.9,"address":"6240 York Blvd, Los Angeles, CA 90042","numReviews":377},{"lat":34.127808,"lng":-118.444005,"name":"Starbucks","rating":4.2,"address":"2952 Beverly Glen Cir, Los Angeles, CA 90077","numReviews":129},{"lat":34.026828,"lng":-118.371898,"name":"Starbucks","rating":4.3,"address":"3344 S La Cienega Blvd, Los Angeles, CA 90016","numReviews":489},{"lat":34.025532,"lng":-118.431235,"name":"Starbucks","rating":4.3,"address":"3061 Sawtelle Blvd, Los Angeles, CA 90066","numReviews":86},{"lat":34.107659,"lng":-118.273132,"name":"Starbucks","rating":4.4,"address":"2720 Griffith Park Blvd, Los Angeles, CA 90027","numReviews":82},{"lat":34.04315,"lng":-118.431594,"name":"Starbucks","rating":4,"address":"2215 Westwood Blvd, Los Angeles, CA 90064","numReviews":115},{"lat":34.061923,"lng":-118.338919,"name":"Starbucks","rating":4.2,"address":"5020 Wilshire Blvd, Los Angeles, CA 90036","numReviews":251},{"lat":34.098207,"lng":-118.343544,"name":"Starbucks","rating":4.2,"address":"7055 Sunset Blvd, Los Angeles, CA 90028","numReviews":451},{"lat":34.067005,"lng":-118.344262,"name":"Starbucks Reserve","rating":4.5,"address":"359 South La Brea Ave, Los Angeles, CA 90036","numReviews":598},{"lat":33.942309,"lng":-118.402045,"name":"Starbucks","rating":3.8,"address":"600 World Way, Los Angeles, CA 90045","numReviews":552},{"lat":34.104189,"lng":-118.298133,"name":"Starbucks","rating":4.8,"address":"4700 Sunset Blvd, Los Angeles, CA 90027","numReviews":6},{"lat":34.042355,"lng":-118.458761,"name":"Starbucks","rating":4.2,"address":"11840 Santa Monica Blvd, Los Angeles, CA 90025","numReviews":9},{"lat":33.981598,"lng":-118.408946,"name":"Starbucks","rating":4.2,"address":"12313 Jefferson Blvd, Los Angeles, CA 90230","numReviews":437},{"lat":34.039149,"lng":-118.264412,"name":"Starbucks","rating":4.4,"address":"1251 S Grand Ave, Los Angeles, CA 90015","numReviews":219},{"lat":34.129606,"lng":-118.348568,"name":"Starbucks","rating":4.3,"address":"3242 West, Cahuenga Blvd, Los Angeles, CA 90068","numReviews":271},{"lat":34.098537,"lng":-118.348487,"name":"Starbucks","rating":3.8,"address":"7257 Sunset Blvd, Los Angeles, CA 90046","numReviews":42},{"lat":34.061461,"lng":-118.306365,"name":"Starbucks","rating":4,"address":"3680 Wilshire Blvd Meeting Room, Los Angeles, CA 90010","numReviews":496},{"lat":34.097707,"lng":-118.365178,"name":"Starbucks","rating":4.2,"address":"8000 Sunset Blvd b110, Los Angeles, CA 90046","numReviews":119},{"lat":34.025297,"lng":-118.239702,"name":"Starbucks","rating":3.8,"address":"1401 Alameda St, Los Angeles, CA 90021","numReviews":965},{"lat":34.101938,"lng":-118.291421,"name":"Starbucks","rating":4.2,"address":"1700 N Vermont Ave, Los Angeles, CA 90027","numReviews":833},{"lat":34.048559,"lng":-118.337175,"name":"Starbucks","rating":4.3,"address":"4700 W Pico Blvd, Los Angeles, CA 90019","numReviews":460},{"lat":34.050997,"lng":-118.34404,"name":"Starbucks","rating":4.3,"address":"1250 South La Brea Ave, Los Angeles, CA 90019","numReviews":357},{"lat":34.123687,"lng":-118.219618,"name":"Starbucks","rating":4.1,"address":"4430 York Blvd, Los Angeles, CA 90041","numReviews":405},{"lat":34.07501,"lng":-118.380545,"name":"Starbucks","rating":4.1,"address":"8700 Beverly Blvd, Los Angeles, CA 90048","numReviews":59},{"lat":34.101831,"lng":-118.341444,"name":"Starbucks","rating":4.2,"address":"6933 Hollywood Blvd A, Los Angeles, CA 90028","numReviews":765},{"lat":34.062441,"lng":-118.345319,"name":"Starbucks","rating":4.2,"address":"5353 Wilshire Blvd, Los Angeles, CA 90036","numReviews":168},{"lat":34.076003,"lng":-118.345017,"name":"Starbucks","rating":4.4,"address":"7122 Beverly Blvd, Los Angeles, CA 90036","numReviews":169},{"lat":34.061465,"lng":-118.299744,"name":"Starbucks","rating":4.2,"address":"3450 Wilshire Blvd, Los Angeles, CA 90010","numReviews":531},{"lat":34.070694,"lng":-118.292007,"name":"Starbucks","rating":4.4,"address":"181 S Vermont Ave, Los Angeles, CA 90004","numReviews":122},{"lat":34.031809,"lng":-118.29082,"name":"Starbucks","rating":null,"address":"2600 S Vermont Ave, Los Angeles, CA 90007","numReviews":null},{"lat":34.0484,"lng":-118.33959,"name":"Starbucks","rating":4.5,"address":"4760 W Pico Blvd, Los Angeles, CA 90019","numReviews":13},{"lat":34.026473,"lng":-118.277502,"name":"Starbucks","rating":4.1,"address":"2735 S Figueroa St, Los Angeles, CA 90007","numReviews":1578},{"lat":34.086914,"lng":-118.33887,"name":"Starbucks","rating":4.2,"address":"859 N Highland Ave, Los Angeles, CA 90038","numReviews":459},{"lat":34.034875,"lng":-118.448916,"name":"Starbucks","rating":3.9,"address":"11727 W Olympic Blvd, Los Angeles, CA 90064","numReviews":71},{"lat":34.038126,"lng":-118.440949,"name":"Starbucks","rating":3.9,"address":"11280 W Olympic Blvd, Los Angeles, CA 90064","numReviews":224},{"lat":34.026076,"lng":-118.284665,"name":"Starbucks","rating":null,"address":"3131 S Hoover St, Los Angeles, CA 90007","numReviews":null},{"lat":34.039606,"lng":-118.429989,"name":"Starbucks","rating":4.2,"address":"10911 W Pico Blvd, Los Angeles, CA 90064","numReviews":149},{"lat":34.094586,"lng":-118.309489,"name":"Starbucks","rating":4.2,"address":"1277 N Western Ave, Los Angeles, CA 90029","numReviews":517},{"lat":34.122808,"lng":-118.225231,"name":"Starbucks","rating":4.1,"address":"4211 Eagle Rock Blvd, Los Angeles, CA 90065","numReviews":9},{"lat":34.027239,"lng":-118.427726,"name":"Starbucks","rating":4.1,"address":"3006 S Sepulveda Blvd, Los Angeles, CA 90034","numReviews":101},{"lat":34.048026,"lng":-118.239122,"name":"Starbucks","rating":4.1,"address":"138 S Central Ave, Los Angeles, CA 90012","numReviews":705},{"lat":34.141463,"lng":-118.224311,"name":"Starbucks","rating":3.9,"address":"2626 Colorado Blvd, Los Angeles, CA 90041","numReviews":84},{"lat":34.139101,"lng":-118.21521,"name":"Starbucks","rating":4.4,"address":"2218 Colorado Blvd, Los Angeles, CA 90041","numReviews":334},{"lat":34.136349,"lng":-118.189358,"name":"Starbucks","rating":4.2,"address":"7311 N Figueroa St, Los Angeles, CA 90041","numReviews":84},{"lat":34.067001,"lng":-118.351298,"name":"Starbucks","rating":4.3,"address":"5757 Wilshire Blvd UNIT 106, Los Angeles, CA 90036","numReviews":185},{"lat":34.057999,"lng":-118.363678,"name":"Starbucks","rating":4.2,"address":"6066 W Olympic Blvd, Los Angeles, CA 90036","numReviews":315},{"lat":34.055697,"lng":-118.270322,"name":"Starbucks","rating":4.1,"address":"1601 Wilshire Blvd, Los Angeles, CA 90017","numReviews":854},{"lat":34.063546,"lng":-118.285856,"name":"Starbucks","rating":3.9,"address":"620 S Virgil Ave, Los Angeles, CA 90020","numReviews":41},{"lat":34.056161,"lng":-118.247017,"name":"Starbucks","rating":4.1,"address":"217 N Hill St, Los Angeles, CA 90012","numReviews":293},{"lat":34.06381,"lng":-118.284002,"name":"Starbucks","rating":4.2,"address":"534 S Occidental Blvd, Los Angeles, CA 90057","numReviews":588},{"lat":34.024183,"lng":-118.278326,"name":"Starbucks","rating":3.9,"address":"3026 S Figueroa St, Los Angeles, CA 90007","numReviews":281},{"lat":34.10192,"lng":-118.309041,"name":"Starbucks","rating":4,"address":"5453 Hollywood Blvd D, Los Angeles, CA 90027","numReviews":557},{"lat":34.097413,"lng":-118.322506,"name":"Starbucks","rating":4.1,"address":"6102 Sunset Blvd Unit 6102, Los Angeles, CA 90028","numReviews":328},{"lat":34.058894,"lng":-118.240378,"name":"Starbucks","rating":4.2,"address":"639 N Broadway, Los Angeles, CA 90012","numReviews":597},{"lat":34.039889,"lng":-118.253384,"name":"Starbucks","rating":4.3,"address":"300 E 9th St, Los Angeles, CA 90015","numReviews":452},{"lat":34.041582,"lng":-118.262237,"name":"Starbucks","rating":4.2,"address":"1111 S Grand Ave, Los Angeles, CA 90015","numReviews":262},{"lat":34.052086,"lng":-118.263282,"name":"Starbucks","rating":4.2,"address":"1090 Wilshire Blvd, Los Angeles, CA 90017","numReviews":300},{"lat":34.068547,"lng":-118.290462,"name":"Starbucks","rating":4.1,"address":"3410 W 3rd St, Los Angeles, CA 90020","numReviews":36},{"lat":33.94394,"lng":-118.40452,"name":"Starbucks","rating":3.8,"address":"201 World Way, Los Angeles, CA 90045","numReviews":549},{"lat":34.050112,"lng":-118.253269,"name":"Starbucks","rating":4.3,"address":"555 West 5th Street CC56, Los Angeles, CA 90013","numReviews":157},{"lat":34.061493,"lng":-118.29127,"name":"Starbucks","rating":4.2,"address":"3150 Wilshire Blvd, Los Angeles, CA 90010","numReviews":630},{"lat":34.053615,"lng":-118.253272,"name":"Starbucks","rating":4.3,"address":"333 S Hope St, Los Angeles, CA 90071","numReviews":61},{"lat":34.048754,"lng":-118.255081,"name":"Starbucks","rating":4.3,"address":"523 W 6th St, Los Angeles, CA 90014","numReviews":461},{"lat":34.07491,"lng":-118.323485,"name":"Starbucks","rating":4.2,"address":"206 N Larchmont Blvd, Los Angeles, CA 90004","numReviews":175},{"lat":34.047605,"lng":-118.26069,"name":"Starbucks","rating":5,"address":"5144009089, Los Angeles, CA 90017","numReviews":null},{"lat":33.942051,"lng":-118.406828,"name":"Starbucks","rating":null,"address":"1 World Way, Los Angeles, CA 90045","numReviews":null},{"lat":34.063071,"lng":-118.272341,"name":"Starbucks","rating":4,"address":"230 S Alvarado St, Los Angeles, CA 90057","numReviews":322},{"lat":34.045957,"lng":-118.25122,"name":"Starbucks","rating":4,"address":"603 S Spring St, Los Angeles, CA 90014","numReviews":715},{"lat":34.026478,"lng":-118.427113,"name":"Starbucks","rating":3.9,"address":"3118 S Sepulveda Blvd, Los Angeles, CA 90034","numReviews":48},{"lat":34.044995,"lng":-118.257574,"name":"Starbucks","rating":4.6,"address":"801 S Olive St A, Los Angeles, CA 90014","numReviews":84},{"lat":34.049354,"lng":-118.24214,"name":"Starbucks","rating":4.2,"address":"232 E 2nd St, Los Angeles, CA 90012","numReviews":313},{"lat":34.049187,"lng":-118.260563,"name":"Starbucks","rating":4.3,"address":"735 S Figueroa St, Los Angeles, CA 90017","numReviews":351},{"lat":34.071723,"lng":-118.360826,"name":"Starbucks","rating":4.3,"address":"6333 W 3rd St, Los Angeles, CA 90036","numReviews":285},{"lat":34.074949,"lng":-118.375428,"name":"Starbucks","rating":3.1,"address":"8480 Beverly Blvd, Los Angeles, CA 90048","numReviews":25},{"lat":34.043932,"lng":-118.258854,"name":"Starbucks","rating":4.5,"address":"400 W Olympic Blvd, Los Angeles, CA 90015","numReviews":104},{"lat":34.0272,"lng":-118.392835,"name":"Starbucks","rating":4,"address":"8985 Venice Blvd Ste CB-2, Los Angeles, CA 90034","numReviews":306},{"lat":34.044678,"lng":-118.266127,"name":"Starbucks","rating":4.3,"address":"800 W Olympic Blvd #102, Los Angeles, CA 90015","numReviews":688},{"lat":34.039199,"lng":-118.260966,"name":"Starbucks","rating":4.3,"address":"1149 S Hill St H-120, Los Angeles, CA 90015","numReviews":158},{"lat":34.05421,"lng":-118.262922,"name":"Starbucks","rating":4.5,"address":"1120 W 6th St #102, Los Angeles, CA 90017","numReviews":242},{"lat":34.05287,"lng":-118.257073,"name":"Starbucks","rating":4.1,"address":"445 S Figueroa St #205, Los Angeles, CA 90071","numReviews":49},{"lat":34.050984,"lng":-118.242338,"name":"Starbucks","rating":4.1,"address":"120 S Los Angeles St #110, Los Angeles, CA 90012","numReviews":236},{"lat":33.977731,"lng":-118.39187,"name":"Starbucks","rating":4.3,"address":"6081 Center Dr #108, Los Angeles, CA 90045","numReviews":177},{"lat":34.154377,"lng":-118.4478,"name":"Starbucks","rating":4.3,"address":"4550 Van Nuys Blvd Suite K, Los Angeles, CA 91403","numReviews":187},{"lat":34.126618,"lng":-118.263554,"name":"Starbucks","rating":4.3,"address":"2919 Los Feliz Blvd #6, Los Angeles, CA 90039","numReviews":350},{"lat":34.051517,"lng":-118.251286,"name":"Starbucks","rating":4.1,"address":"350 South Grand Avenue Suite #B-5, Los Angeles, CA 90071","numReviews":91},{"lat":34.024533,"lng":-118.284377,"name":"Starbucks","rating":4.4,"address":"3201 S Hoover St #1820, Los Angeles, CA 90089","numReviews":226},{"lat":34.018554,"lng":-118.281895,"name":"Starbucks","rating":4.3,"address":"3584 S Figueroa St #1B, Los Angeles, CA 90007","numReviews":575},{"lat":34.044995,"lng":-118.257574,"name":"Starbucks","rating":4.6,"address":"801 S Olive St Suite A, Los Angeles, CA 90014","numReviews":87},{"lat":34.045512,"lng":-118.261441,"name":"Starbucks","rating":4.2,"address":"600 W 9th St STE 135, Los Angeles, CA 90015","numReviews":259},{"lat":34.051438,"lng":-118.255335,"name":"Starbucks","rating":4,"address":"444 Flower St Suite #170, Los Angeles, CA 90071","numReviews":53},{"lat":34.049208,"lng":-118.260527,"name":"Starbucks","rating":4.3,"address":"735 S Figueroa St #308, Los Angeles, CA 90017","numReviews":352},{"lat":34.097707,"lng":-118.365178,"name":"Starbucks","rating":4.2,"address":"8000 Sunset Blvd B110, Los Angeles, CA 90046","numReviews":120},{"lat":33.184116,"lng":-117.32988,"name":"Starbucks","rating":3.3,"address":"2255 Camino Real, Los Angeles, CA 90065","numReviews":3},{"lat":34.062656,"lng":-118.353948,"name":"Starbucks","rating":4.3,"address":"5757 Wilshire Blvd #106, Los Angeles, CA 90036","numReviews":185}]}]',
    location: 'Los Angeles, CA, USA',
    name: 'Starbucks',
    numLocations: '149',
  },
];

export const MapDemoCompareData: Array<CompareMapDataCreateInput> = [
  {
    compareId: 'ckclfswt50489xr45d9ay7teq',
    coverageData:
      '[{"businessName":"Subway","numLocations":"67","locations":[{"lat":33.982283,"lng":-118.250135,"name":"Subway","rating":4.3,"address":"1401 E Gage Ave, Los Angeles, CA 90001","numReviews":117},{"lat":33.945077,"lng":-118.372443,"name":"Subway","rating":4.2,"address":"5300 W Century Blvd, Los Angeles, CA 90045","numReviews":390},{"lat":34.068273,"lng":-118.442247,"name":"Subway","rating":4.1,"address":"617 Charles Young Drive East Court of Sciences Student Cntr, Los Angeles, CA 90095","numReviews":82},{"lat":34.066525,"lng":-118.446503,"name":"Subway","rating":4.2,"address":"757 Westwood Plaza, Los Angeles, CA 90095","numReviews":84},{"lat":33.925385,"lng":-118.238789,"name":"Subway","rating":4.4,"address":"11812 Wilmington Ave Suite 5C, Los Angeles, CA 90059","numReviews":60},{"lat":33.990608,"lng":-118.256901,"name":"Subway","rating":4.1,"address":"5701 S Central Ave Suite A, Los Angeles, CA 90011","numReviews":165},{"lat":33.959789,"lng":-118.255985,"name":"Subway","rating":4.1,"address":"8600 S Central Ave, Los Angeles, CA 90002","numReviews":84},{"lat":33.987952,"lng":-118.291189,"name":"Subway","rating":4.1,"address":"5864 Vermont Ave, Los Angeles, CA 90044","numReviews":217},{"lat":34.116415,"lng":-118.262103,"name":"Subway","rating":4.1,"address":"3112 N Glendale Blvd, Los Angeles, CA 90039","numReviews":63},{"lat":33.988771,"lng":-118.330026,"name":"Subway","rating":3.9,"address":"3274 W Slauson Ave, Los Angeles, CA 90043","numReviews":100},{"lat":34.026115,"lng":-118.278048,"name":"Subway","rating":4.4,"address":"2805 S Figueroa St, Los Angeles, CA 90007","numReviews":350},{"lat":34.088727,"lng":-118.276929,"name":"Subway","rating":4.4,"address":"3504 Sunset Blvd, Los Angeles, CA 90026","numReviews":57},{"lat":33.93047,"lng":-118.287409,"name":"Subway","rating":4,"address":"700 W Imperial Hwy Unit 107, Los Angeles, CA 90044","numReviews":165},{"lat":34.047334,"lng":-118.316413,"name":"Subway","rating":4.1,"address":"3323 W Pico Blvd, Los Angeles, CA 90019","numReviews":94},{"lat":34.043363,"lng":-118.283753,"name":"Subway","rating":4.2,"address":"1600 S Hoover St, Los Angeles, CA 90006","numReviews":88},{"lat":34.0278,"lng":-118.219925,"name":"Subway","rating":4.1,"address":"1209 S Soto St, Los Angeles, CA 90023","numReviews":112},{"lat":33.96177,"lng":-118.419946,"name":"Subway","rating":3.6,"address":"8406 Lincoln Blvd, Los Angeles, CA 90045","numReviews":73},{"lat":34.057005,"lng":-118.257995,"name":"Subway","rating":4.1,"address":"1205 W 3rd St, Los Angeles, CA 90017","numReviews":59},{"lat":33.957567,"lng":-118.296735,"name":"Subway","rating":4.1,"address":"Unnamed Road, Los Angeles, CA 90047","numReviews":186},{"lat":33.946126,"lng":-118.392781,"name":"Subway","rating":4.2,"address":"6151 W Century Blvd Suite 104, Los Angeles, CA 90045","numReviews":76},{"lat":33.988124,"lng":-118.309968,"name":"Subway","rating":4.1,"address":"1810 W Slauson Ave Unit D, Los Angeles, CA 90047","numReviews":186},{"lat":34.053689,"lng":-118.375965,"name":"Subway","rating":3.9,"address":"1270 S La Cienega Blvd, Los Angeles, CA 90035","numReviews":191},{"lat":34.056474,"lng":-118.208333,"name":"Subway","rating":4.1,"address":"2000 Marengo St Unit B, Los Angeles, CA 90033","numReviews":144},{"lat":33.987865,"lng":-118.364503,"name":"Subway","rating":3.9,"address":"4949 W Slauson Ave, Los Angeles, CA 90056","numReviews":73},{"lat":34.06417,"lng":-118.469978,"name":"Subway","rating":4.4,"address":"11733 Barrington Ct, Los Angeles, CA 90049","numReviews":32},{"lat":34.022872,"lng":-118.371934,"name":"Subway","rating":4.2,"address":"3560 S La Cienega Blvd Suite C, Los Angeles, CA 90016","numReviews":43},{"lat":34.011114,"lng":-118.309641,"name":"Subway","rating":3.8,"address":"3991 S Western Ave Unit 3, Los Angeles, CA 90062","numReviews":56},{"lat":34.018932,"lng":-118.15132,"name":"Subway","rating":4.2,"address":"5536 E Whittier Blvd, Los Angeles, CA 90022","numReviews":97},{"lat":34.105674,"lng":-118.337083,"name":"Subway","rating":3.9,"address":"1900 N Highland Ave, Los Angeles, CA 90068","numReviews":118},{"lat":33.943509,"lng":-118.24465,"name":"Subway","rating":4.1,"address":"1657 E 103rd St, Los Angeles, CA 90002","numReviews":167},{"lat":34.073473,"lng":-118.209471,"name":"Subway","rating":4.3,"address":"3024 N Broadway, Los Angeles, CA 90031","numReviews":191},{"lat":33.959508,"lng":-118.394739,"name":"Subway","rating":4.3,"address":"6238 W Manchester Ave, Los Angeles, CA 90045","numReviews":236},{"lat":34.119717,"lng":-118.227185,"name":"Subway","rating":4.2,"address":"3756 W Ave 40 Suite D, Los Angeles, CA 90065","numReviews":44},{"lat":34.095796,"lng":-118.208136,"name":"Subway","rating":3.9,"address":"4419 N Figueroa St, Los Angeles, CA 90065","numReviews":61},{"lat":34.013468,"lng":-118.256315,"name":"Subway","rating":4.1,"address":"3300 S Central Ave Unit B, Los Angeles, CA 90011","numReviews":165},{"lat":34.040232,"lng":-118.162067,"name":"Subway","rating":4.5,"address":"4770 E, East Cesar E Chavez Avenue Unit A, Los Angeles, CA 90022","numReviews":131},{"lat":34.041982,"lng":-118.308349,"name":"Subway","rating":4.1,"address":"1728 S Western Ave, Los Angeles, CA 90006","numReviews":240},{"lat":34.136214,"lng":-118.352655,"name":"Subway","rating":4,"address":"1000 Universal Center Dr V 201, Los Angeles, CA 91608","numReviews":32},{"lat":33.978951,"lng":-118.373096,"name":"Subway","rating":3.9,"address":"5339 A W Centinela Ave, Los Angeles, CA 90045","numReviews":144},{"lat":33.960218,"lng":-118.378078,"name":"Subway","rating":4.4,"address":"5545 W Manchester Ave, Los Angeles, CA 90045","numReviews":47},{"lat":34.026302,"lng":-118.426881,"name":"Subway","rating":4,"address":"3122 S Sepulveda Blvd, Los Angeles, CA 90034","numReviews":72},{"lat":34.084792,"lng":-118.326409,"name":"Subway","rating":4.1,"address":"750 Vine St, Los Angeles, CA 90038","numReviews":63},{"lat":33.975386,"lng":-118.248062,"name":"Subway","rating":4.5,"address":"1457 E Florence Ave Unit 112, Los Angeles, CA 90001","numReviews":45},{"lat":34.031424,"lng":-118.445311,"name":"Subway","rating":4.2,"address":"2408 S Barrington Ave, Los Angeles, CA 90064","numReviews":66},{"lat":33.942371,"lng":-118.265648,"name":"Subway","rating":3.8,"address":"10317 S Avalon Blvd, Los Angeles, CA 90003","numReviews":57},{"lat":33.837744,"lng":-118.348336,"name":"Subway","rating":4.1,"address":"3535 Torrance Blvd Suite 1 & 2, Los Angeles, CA 90503","numReviews":112},{"lat":34.110641,"lng":-118.191851,"name":"Subway","rating":4.3,"address":"5805 N Figueroa St, Los Angeles, CA 90042","numReviews":79},{"lat":34.053646,"lng":-118.251174,"name":"Subway","rating":4.1,"address":"255 S Grand Ave Suite 101, Los Angeles, CA 90012","numReviews":105},{"lat":34.090268,"lng":-118.291533,"name":"Subway","rating":4.1,"address":"1018 N Vermont Ave, Los Angeles, CA 90029","numReviews":147},{"lat":34.03253,"lng":-118.153702,"name":"Subway","rating":4,"address":"289 S Atlantic Blvd, Los Angeles, CA 90022","numReviews":179},{"lat":33.962772,"lng":-118.291409,"name":"Subway","rating":3.7,"address":"8310 Vermont Ave, Los Angeles, CA 90044","numReviews":99},{"lat":34.035555,"lng":-118.378253,"name":"Subway","rating":4,"address":"8511 Venice Blvd, Los Angeles, CA 90034","numReviews":156},{"lat":34.024964,"lng":-118.252492,"name":"Subway","rating":3.9,"address":"1000 E Washington Blvd Suite 118, Los Angeles, CA 90021","numReviews":80},{"lat":34.091157,"lng":-118.32261,"name":"Subway","rating":4.1,"address":"6115 Santa Monica Blvd Unit D, Los Angeles, CA 90038","numReviews":52},{"lat":34.053427,"lng":-118.266419,"name":"Subway","rating":4.1,"address":"1234 Wilshire Blvd, Los Angeles, CA 90017","numReviews":113},{"lat":34.056547,"lng":-118.277464,"name":"Subway","rating":3.8,"address":"2112 W 7th St, Los Angeles, CA 90057","numReviews":43},{"lat":34.026407,"lng":-118.199022,"name":"Subway","rating":3.9,"address":"3476 Whittier Blvd Unit 110, Los Angeles, CA 90023","numReviews":106},{"lat":34.07592,"lng":-118.300776,"name":"Subway","rating":4,"address":"4206 W Beverly Blvd, Los Angeles, CA 90004","numReviews":53},{"lat":34.020479,"lng":-118.356063,"name":"Subway","rating":3.9,"address":"3627 South La Brea Ave, Los Angeles, CA 90016","numReviews":93},{"lat":34.043166,"lng":-118.261868,"name":"Subway","rating":4,"address":"1000 S Hope St # C, Los Angeles, CA 90015","numReviews":115},{"lat":33.916836,"lng":-118.282478,"name":"Subway","rating":4.2,"address":"12730 S Figueroa St #102, Los Angeles, CA 90061","numReviews":88},{"lat":34.095512,"lng":-118.158432,"name":"Subway","rating":4.1,"address":"5593 E Huntington Dr N #3, Los Angeles, CA 90032","numReviews":81},{"lat":33.960335,"lng":-118.278636,"name":"Subway","rating":3.9,"address":"8565-2 S Broadway, Los Angeles, CA 90003","numReviews":139},{"lat":34.070527,"lng":-118.291217,"name":"Subway","rating":4.2,"address":"198 S Vermont Ave, Los Angeles, CA 90004","numReviews":211},{"lat":34.046784,"lng":-118.448068,"name":"Subway","rating":4.1,"address":"11275 Santa Monica Blvd, Los Angeles, CA 90025","numReviews":168},{"lat":34.083748,"lng":-118.350166,"name":"Subway","rating":4.1,"address":"7353 Melrose Ave Suite D, Los Angeles, CA 90046","numReviews":22},{"lat":34.043708,"lng":-118.422008,"name":"Subway","rating":3.9,"address":"10597 W Pico Blvd, Los Angeles, CA 90064","numReviews":56}]},{"businessName":"The Carving Board Hollywood","numLocations":"1","locations":[{"lat":34.097454,"lng":-118.349939,"name":"The Carving Board Hollywood","rating":4.5,"address":"7300 Sunset Blvd i, Los Angeles, CA 90046","numReviews":248}]},{"businessName":"Jersey Mike\'s Subs","numLocations":"5","locations":[{"lat":33.946048,"lng":-118.387167,"name":"Jersey Mike\'s Subs","rating":3.7,"address":"5933 W Century Blvd, Los Angeles, CA 90045","numReviews":96},{"lat":34.061698,"lng":-118.444084,"name":"Jersey Mike\'s Subs","rating":4.3,"address":"1020 Glendon Ave, Los Angeles, CA 90024","numReviews":120},{"lat":33.946255,"lng":-118.404268,"name":"Jersey Mike\'s Subs","rating":2.3,"address":"2, 1 World Way #233, Los Angeles, CA 90045","numReviews":28},{"lat":34.044406,"lng":-118.378369,"name":"Jersey Mike\'s Subs","rating":4.6,"address":"1831 S La Cienega Blvd Suite A, Los Angeles, CA 90035","numReviews":12},{"lat":34.048449,"lng":-118.337419,"name":"Jersey Mike\'s Subs","rating":4.2,"address":"4700 W Pico Blvd Suite D, Los Angeles, CA 90019","numReviews":171}]},{"businessName":"Mendocino Farms","numLocations":"4","locations":[{"lat":34.071794,"lng":-118.361766,"name":"Mendocino Farms","rating":4.4,"address":"175 S Fairfax Ave, Los Angeles, CA 90036","numReviews":285},{"lat":34.053141,"lng":-118.469736,"name":"Mendocino Farms","rating":4.7,"address":"11911 San Vicente Blvd, Los Angeles, CA 90049","numReviews":207},{"lat":34.051621,"lng":-118.250791,"name":"Mendocino Farms","rating":4.5,"address":"300 S Grand Ave, Los Angeles, CA 90071","numReviews":145},{"lat":34.051887,"lng":-118.255043,"name":"Mendocino Farms","rating":4.5,"address":"444 Flower St, Los Angeles, CA 90071","numReviews":159}]},{"businessName":"Submariners","numLocations":"1","locations":[{"lat":33.991815,"lng":-118.421727,"name":"Submariners","rating":4.7,"address":"4562 S Centinela Ave, Los Angeles, CA 90066","numReviews":247}]},{"businessName":"S Philly Cheesesteaks - Silverlake","numLocations":"1","locations":[{"lat":34.095846,"lng":-118.287095,"name":"s Philly Cheesesteaks - Silverlake","rating":4.6,"address":"4501 Fountain Ave, Los Angeles, CA 90029","numReviews":841}]},{"businessName":"Attari Sandwich Shop","numLocations":"1","locations":[{"lat":34.055566,"lng":-118.441373,"name":"Attari Sandwich Shop","rating":4.3,"address":"1388 Westwood Blvd, Los Angeles, CA 90024","numReviews":495}]},{"businessName":"Monte 52","numLocations":"1","locations":[{"lat":34.108447,"lng":-118.200867,"name":"Monte 52","rating":4.5,"address":"5200 Monte Vista St, Los Angeles, CA 90042","numReviews":125}]},{"businessName":"Pret A Manger","numLocations":"1","locations":[{"lat":33.943113,"lng":-118.409201,"name":"Pret A Manger","rating":4.8,"address":"380 World Way, Los Angeles, CA 90045","numReviews":16}]},{"businessName":"Locali","numLocations":"2","locations":[{"lat":34.105551,"lng":-118.316553,"name":"Locali","rating":4.3,"address":"5825 Franklin Ave, Los Angeles, CA 90028","numReviews":148},{"lat":34.041673,"lng":-118.253008,"name":"Locali","rating":4.2,"address":"The Academy Award Clothing Building, 817 South Los Angeles Street, 1st Lobby, Los Angeles, CA 90014","numReviews":132}]},{"businessName":"Trencher","numLocations":"1","locations":[{"lat":34.075875,"lng":-118.254363,"name":"Trencher","rating":4.6,"address":"1305 Portia St, Los Angeles, CA 90026","numReviews":184}]},{"businessName":"Corner Bakery Cafe","numLocations":"4","locations":[{"lat":34.074314,"lng":-118.376206,"name":"Corner Bakery Cafe","rating":4,"address":"100 N La Cienega Blvd, Los Angeles, CA 90048","numReviews":287},{"lat":34.062177,"lng":-118.445677,"name":"Corner Bakery Cafe","rating":4.1,"address":"1019 S Westwood Blvd, Los Angeles, CA 90024","numReviews":594},{"lat":34.052382,"lng":-118.251386,"name":"Corner Bakery Cafe","rating":4.2,"address":"300 South Grand Avenue LP 150, Los Angeles, CA 90071","numReviews":110},{"lat":34.04786,"lng":-118.261785,"name":"Corner Bakery Cafe","rating":4.2,"address":"801 S Figueroa St #150, Los Angeles, CA 90017","numReviews":340}]},{"businessName":"Marie\'s Coffee & Deli","numLocations":"1","locations":[{"lat":34.048682,"lng":-118.258394,"name":"Marie\'s Coffee & Deli","rating":4.5,"address":"731 W 7th St, Los Angeles, CA 90017","numReviews":160}]},{"businessName":"Orange Tree Cafe","numLocations":"1","locations":[{"lat":34.06314,"lng":-118.2986,"name":"Orange Tree Cafe","rating":4.3,"address":"3500 W 6th St, Los Angeles, CA 90010","numReviews":20}]},{"businessName":"Homeboy","numLocations":"1","locations":[{"lat":33.94185,"lng":-118.406831,"name":"Homeboy","rating":3.5,"address":"400 World Way, Los Angeles, CA 90045","numReviews":43}]},{"businessName":"Fat Sal\'s Deli","numLocations":"1","locations":[{"lat":34.094532,"lng":-118.33811,"name":"Fat Sal\'s Deli","rating":4.5,"address":"1300 N Highland Ave, Los Angeles, CA 90028","numReviews":2095}]},{"businessName":"V Cafe","numLocations":"1","locations":[{"lat":34.083606,"lng":-118.367512,"name":"V Cafe","rating":4.4,"address":"8164 Melrose Ave #7013, Los Angeles, CA 90046","numReviews":34}]},{"businessName":"Cole\'s French Dip","numLocations":"1","locations":[{"lat":34.04479,"lng":-118.249499,"name":"Cole\'s French Dip","rating":4.5,"address":"118 E 6th St, Los Angeles, CA 90014","numReviews":1236}]},{"businessName":"The Larder","numLocations":"1","locations":[{"lat":33.941923,"lng":-118.40696,"name":"The Larder","rating":1.5,"address":"1 World Way, Los Angeles, CA 90045","numReviews":21}]},{"businessName":"The Original Rinaldi\'s Deli And Cafe","numLocations":"1","locations":[{"lat":33.945894,"lng":-118.393553,"name":"The Original Rinaldi\'s Deli and Cafe","rating":4.5,"address":"6171 W Century Blvd #168, Los Angeles, CA 90045","numReviews":155}]},{"businessName":"E Stretto","numLocations":"1","locations":[{"lat":34.049986,"lng":-118.24935,"name":"e stretto","rating":4.8,"address":"351 S Broadway, Los Angeles, CA 90013","numReviews":28}]},{"businessName":"Quiznos","numLocations":"1","locations":[{"lat":34.017081,"lng":-118.282503,"name":"Quiznos","rating":4.2,"address":"3738 S Figueroa St, Los Angeles, CA 90007","numReviews":58}]},{"businessName":"Tuscan Son","numLocations":"1","locations":[{"lat":34.051469,"lng":-118.432201,"name":"Tuscan Son","rating":4.4,"address":"10700 Santa Monica Blvd #150, Los Angeles, CA 90025","numReviews":65}]},{"businessName":"Lokal Sandwich Shop","numLocations":"1","locations":[{"lat":34.029024,"lng":-118.411828,"name":"Lokal Sandwich Shop","rating":4.6,"address":"10433 National Blvd #1A, Los Angeles, CA 90034","numReviews":99}]},{"businessName":"Giamela\'s","numLocations":"1","locations":[{"lat":34.123497,"lng":-118.268148,"name":"Giamela\'s","rating":4.6,"address":"3178 Los Feliz Blvd, Los Angeles, CA 90039","numReviews":574}]},{"businessName":"Earl Of Sandwich","numLocations":"1","locations":[{"lat":33.943606,"lng":-118.409373,"name":"Earl of Sandwich","rating":3.7,"address":"380 World Way, Los Angeles, CA 90045","numReviews":78}]}]',
    location: '_',
    name: 'Sandwich',
    numLocations: '103',
  },
];

export const NewsDemoData: Array<NewsDataCreateInput> = [
  {
    description:
      'A Dayton-area Starbucks coffee shop on State Route 725 and Lyons Road has reopened after shutting down temporarily after an employee tested positive for ...',
    link:
      'https://www.dayton.com/news/local/confirmed-local-starbucks-closes-temporarily-due-employee-testing-positive-for-covid/EsxyoenwOtveM3EIgHuAsN/',
    published: '2020-07-10T14:37:30Z',
    relevance: 742.7000000000001,
    source: 'dayton.com',
    title:
      'JUST IN: Local Starbucks reopens after closing temporarily due to employee testing positive for COVID-19',
  },
  {
    description:
      'BAKERSFIELD, Calif. (KGET) — An employee at a local Starbucks location recently tested positive for COVID-19. A Starbucks representative confirmed an ...',
    link:
      'https://www.thehartwellsun.com/local/starbucks-could-come-old-enmarket-station',
    published: '2020-07-03T07:00:00Z',
    relevance: 543.8,
    source: 'KGET 17',
    title: 'Central Bakersfield Starbucks employee tests positive for COVID-19',
  },
  {
    description:
      "There is home; there is work; and then there is Starbucks, the third place. How can Starbucks recapture the brand's heritage in the new marketing, ...",
    link:
      'https://www.cnbc.com/2020/07/09/starbucks-will-require-customers-wear-facial-coverings.html',
    published: '2020-05-28T07:00:00Z',
    relevance: 495.5,
    source: 'Forbes',
    title: 'How Can Starbucks Be Starbucks In A Post-Corona World?',
  },
  {
    description:
      "My favorite Starbucks closed. That was the one in Claremont at 665 E. Foothill Blvd. at Claremont Boulevard. It's been closed since mid-March and a letter ...",
    link:
      'https://www.dailybulletin.com/claremont-starbucks-a-favorite-hangout-closes-for-good',
    published: '2020-05-17T07:00:00Z',
    relevance: 483.6,
    source: 'Inland Valley Daily Bulletin',
    title: 'Claremont Starbucks, a favorite hangout, closes for good',
  },
  {
    description:
      'Starbucks has opened the first drive-thru in India at Zirakpur in Punjab. As a part of the launch offer, Starbucks customers will get 15% off on their drive-thru.',
    link:
      'https://www.businessinsider.in/business/news/tata-starbucks-open-its-first-drive-thru-restaurant-in-india/articleshow/76874002.cms',
    published: '2020-07-09T11:22:00Z',
    relevance: 478.0,
    source: 'Business Insider India',
    title: 'Tata Starbucks open its first drive-thru restaurant in India',
  },
  {
    description:
      "With all the fun activities planned on Halloween, you're definitely going to be in need of some coffee from Starbucks. But is Starbucks even open on Halloween?",
    link:
      'https://www.wsj.com/articles/starbucks-to-require-customers-wear-masks-starting-july-15-11594327302',
    published: '2020-06-26T07:00:00Z',
    relevance: 472.0,
    source: 'Country Living',
    title:
      "Is Starbucks Open on Halloween 2020? Here's What You Need to Know About Their Holiday Hours",
  },
  {
    description:
      'Murrieta Starbucks Temporarily Closed After Coronavirus Scare - Murrieta, CA - According to the company, no one at the store has tested positive for the virus ...',
    link:
      'https://patch.com/california/murrieta/murrieta-starbucks-temporarily-closed-after-coronavirus-scare',
    published: '2020-07-11T01:01:02Z',
    relevance: 450.5,
    source: 'Murrieta, CA Patch',
    title: 'Murrieta Starbucks Temporarily Closed After Coronavirus Scare',
  },
  {
    description:
      'Police worked Saturday morning to disperse crowds in downtown Los Angeles as multiple businesses were looted following demonstrations against police ...',
    link:
      'https://www.10news.com/news/national-news/officers-injured-businesses-looted-in-downtown-los-angeles-demonstrations',
    published: '2020-05-30T07:00:00Z',
    relevance: 432.6,
    source: '10News',
    title:
      'Officers injured, businesses looted in Downtown Los Angeles demonstrations',
  },
  {
    description:
      'Starbucks in Gastonia and Belmont remain closed after employees at both locations exhibited symptoms of COVID-19.Rumors that employees at the popular ...',
    link:
      'https://www.gastongazette.com/news/20200707/gastonia-belmont-starbucks-remain-closed-despite-no-covid-19-cases',
    published: '2020-07-07T16:37:00Z',
    relevance: 423.9,
    source: 'Gaston Gazette',
    title:
      'Gastonia, Belmont Starbucks remain closed despite no COVID-19 cases',
  },
  {
    description:
      'San Diego bumps up its police spending, despite protests calling for the contrary. Police union leadership is white, OK, but why does that matter? And stay for ...',
    link:
      'https://www.latimes.com/california/story/2020-05-29/protesters-outraged-over-george-floyd-death-shut-down-101-freeway-in-san-jose',
    published: '2020-06-10T07:00:00Z',
    relevance: 415.5,
    source: 'USA TODAY',
    title:
      'In CA: Disneyland sets reopening date; Coachella and Stagecoach called off for 2020',
  },
  {
    description:
      'Restless coffee addicts emerging from lockdowns are doubtlessly cheering the return of some normalcy, after Starbucks said it would be reopening almost 90...',
    link:
      'https://www.nbclosangeles.com/news/coronavirus/as-starbucks-locations-reopen-workers-question-risking-their-life-for-coffee/2369547/',
    published: '2020-05-27T07:00:00Z',
    relevance: 413.4,
    source: 'NBC Southern California',
    title:
      'As Starbucks Locations Reopen, Workers Question Risking Their Life for Coffee',
  },
  {
    description:
      'Starbucks, the Seattle-based coffee giant, announced last week that they would be permanently closing up to 400 locations in the United States and Canada ...',
    link:
      'https://www.mashed.com/217712/the-big-change-starbucks-is-about-to-make/',
    published: '2020-06-15T07:00:00Z',
    relevance: 404.0,
    source: 'Mashed',
    title: 'The big change Starbucks is about to make',
  },
  {
    description:
      'APPLE VALLEY, Calif. (VVNG.com) — The all-new Starbucks Drive-Thru across the street from St. Joseph Health, St. Mary Medical Center will open to the public ...',
    link:
      'https://www.usatoday.com/story/money/food/2020/07/09/starbucks-happy-hour-free-drinks-bogo-espresso-frappuccino/5401890002/',
    published: '2020-07-09T05:21:46Z',
    relevance: 401.5,
    source: 'VVNG.com',
    title: 'New Apple Valley Starbucks along Highway 18 opening July 9th',
  },
  {
    description:
      "More Bozeman area businesses have temporarily closed because of exposure to COVID-19 as Montana's new case counts and death toll continue to rise.",
    link:
      'https://www.bozemandailychronicle.com/coronavirus/bozemans-rocking-r-bar-main-street-starbucks-closed-by-virus/article_b8ea25e9-b6cd-576e-b2b3-1a135ba8a922.html',
    published: '2020-07-10T23:00:00Z',
    relevance: 387.4,
    source: 'The Bozeman Daily Chronicle',
    title: "Bozeman's Rocking R Bar, Main Street Starbucks closed by virus",
  },
  {
    description:
      "Los Angeles County Sheriff's Department is investigating whether a tampon was served to an off-duty police officer at a Starbucks in California.",
    link:
      'https://www.newsweek.com/police-officer-finds-tampon-inside-his-starbucks-coffee-probe-launched-1512696',
    published: '2020-06-23T07:00:00Z',
    relevance: 353.5,
    source: 'Newsweek',
    title:
      "Police Officer 'Finds Tampon' Inside His Starbucks Coffee, Probe Launched",
  },
  {
    description:
      "The Starbucks coffee shop at Dundas and Richmond streets in downtown London has been 'temporarily closed,' leaving most of the storefronts in the core ...",
    link:
      'https://www.cbc.ca/news/canada/london/downtown-starbucks-temporarily-closed-leaving-dundas-and-richmond-intersection-almost-empty-1.5640509',
    published: '2020-07-07T17:00:00Z',
    relevance: 351.8,
    source: 'CBC.ca',
    title:
      "Downtown Starbucks 'temporarily closed,' leaving Dundas and Richmond intersection almost empty",
  },
  {
    description:
      'Protesters demonstrating against the killing of George Floyd clashed for hours with police on the streets of downtown Los Angeles, blocking the 110 Freeway, ...',
    link:
      'https://www.latimes.com/california/story/2020-05-29/protesters-outraged-over-george-floyd-death-shut-down-101-freeway-in-san-jose',
    published: '2020-05-29T07:00:00Z',
    relevance: 345.6,
    source: 'Los Angeles Times',
    title: 'Protesters shut down 110 Freeway in downtown L.A.',
  },
  {
    description:
      'Starbucks is pivoting hundreds of North American stores away from the cafe model it helped make ubiquitous and will expand its pickup-only and to-go business ...',
    link:
      'https://www.cnn.com/2020/06/10/business/starbucks-closing-400-stores/index.html',
    published: '2020-06-11T07:00:00Z',
    relevance: 340.4,
    source: 'CNN',
    title:
      'Starbucks is closing up to 400 stores and expanding takeout options',
  },
  {
    description:
      'Starbucks (NASDAQ:SBUX) has seen its stock hit hard this year. Longtime investors may feel a sense of deja vu, as the store closures and high unemployment ...',
    link:
      'https://www.oregonlive.com/business/2020/07/starbucks-will-require-customers-to-wear-masks-in-all-of-its-coffee-shops.html',
    published: '2020-06-24T07:00:00Z',
    relevance: 338.1,
    source: 'Motley Fool',
    title: 'Is Starbucks Stock a Buy?',
  },
  {
    description:
      "SAN DIEGO — A San Diego woman's social media post shaming a Starbucks barista for telling her to wear a mask has backfired. As of Tuesday night, the post ...",
    link:
      'https://www.usatoday.com/story/money/2020/07/09/starbucks-require-face-masks-customers-starting-july-15/5406037002/',
    published: '2020-06-23T07:00:00Z',
    relevance: 329.8,
    source: 'CBS News 8',
    title:
      'San Diego Starbucks barista receives global support after woman shames him for telling her to wear a mask',
  },
  {
    description:
      'On Thursday, July 9th, Starbucks announced that face masks would be required at all company-owned stores in the United States. The order, according to the ...',
    link:
      'https://sprudge.com/starbucks-new-mask-policy-is-the-closest-thing-we-have-to-a-national-mandate-166698.html',
    published: '2020-07-10T18:56:15Z',
    relevance: 327.0,
    source: 'Sprudge',
    title:
      "Starbucks' New Mask Policy Is The Closest Thing We Have To A National Mandate",
  },
  {
    description:
      'Starbucks India has opened its first drive-thru store in Singhpura, Zirakpur, a two-storey destination adjacent to a major highway.',
    link:
      'https://insideretail.asia/2020/07/13/starbucks-india-opens-first-drive-thru-store/',
    published: '2020-07-13T02:38:13Z',
    relevance: 309.1,
    source: 'Inside Retail Asia',
    title: 'Starbucks India opens first drive-thru store',
  },
  {
    description:
      "Unless you're a Starbucks regular, ordering from this coffee chain can be a bit, well, intimidating. It's hard enough to remember all the details for your drink—and ...",
    link:
      'https://www.oregonlive.com/business/2020/07/starbucks-will-require-customers-to-wear-masks-in-all-of-its-coffee-shops.html',
    published: '2020-06-30T07:00:00Z',
    relevance: 302.8,
    source: 'MSN Money',
    title: 'This Is How to Order at Starbucks Like a Regular',
  },
  {
    description:
      'Public support of Black Lives Matter has spiked in the wake of mass protests over the police killing of George Floyd, and marketers have quickly chimed in, with ...',
    link:
      'https://www.marketingdive.com/news/starbucks-stumble-black-lives-matter-rising-stakes-race/580131/',
    published: '2020-06-22T07:00:00Z',
    relevance: 297.5,
    source: 'Marketing Dive',
    title:
      "Starbucks' stumble on Black Lives Matter shows rising stakes for brands in addressing race",
  },
  {
    description:
      'Starbucks plans to reopen 85 percent of its U.S. coffee shops by the end of this week, with an emphasis on mobile ordering, contactless pickup and cashless ...',
    link:
      'https://www.washingtonpost.com/business/2020/05/05/starbucks-coffee-reopen-coronavirus/',
    published: '2020-05-05T07:00:00Z',
    relevance: 293.2,
    source: 'The Washington Post',
    title:
      'Starbucks will reopen 85 percent of its coffee shops, but with new protocols',
  },
  {
    description:
      "Otlob, Egypt's leading online food delivery platform added &quot;Starbucks&quot; to it's app to be the first and only delivery *service* for their products in Egypt. This comes as ...",
    link:
      'https://www.zawya.com/mena/en/press-releases/story/Otlob_added_Starbucks_to_its_online_platform_to_deliver_their_products_for_the_first_time_in_Egypt-ZAWYA20200712120527/',
    published: '2020-07-12T12:12:23Z',
    relevance: 274.4,
    source: 'ZAWYA',
    title:
      'Otlob added Starbucks to its online platform to deliver their products for the first time in Egypt',
  },
  {
    description:
      "Here's a look at Black-owned coffee shops in Los Angeles, inspired in part by barista LaNisa Williams and her #BlackinBrew social media campaign.",
    link:
      'https://www.latimes.com/lifestyle/story/2020-06-12/heres-a-list-of-black-owned-coffee-shops-in-la',
    published: '2020-06-12T07:00:00Z',
    relevance: 273.5,
    source: 'Los Angeles Times',
    title: 'L.A. Black-owned coffee shops to visit instead of Starbucks',
  },
  {
    description:
      'A former Starbucks barista reveals how to order Starbucks like a pro by decoding common drink orders, terms, letters written on cups, and more.',
    link:
      'https://www.insider.com/starbucks-terms-you-should-know-how-to-order-like-a-pro',
    published: '2020-06-23T07:00:00Z',
    relevance: 265.6,
    source: 'INSIDER',
    title:
      "A former barista explains 14 common Starbucks terms that'll help you order like a pro - Insider",
  },
  {
    description:
      'Taking a look at valuation rankings for Starbucks Corporation (NasdaqGS:SBUX), we see that the stock has a Value Composite score of 54. Developed by ...',
    link:
      'https://www.wsj.com/articles/starbucks-to-require-customers-wear-masks-starting-july-15-11594327302',
    published: '2020-07-12T20:27:26Z',
    relevance: 265.0,
    source: 'Pineville',
    title:
      'Erratic Behavior Ahead? Stock Update on Starbucks Corporation (NasdaqGS:SBUX)',
  },
  {
    description:
      'GALLUP. The Starbucks corporate jet descended onto the Gallup Municipal Airport Friday afternoon and on board were care packages for the Navajo Nation ...',
    link:
      'https://navajotimes.com/biz/starbucks-gives-a-helping-hand-to-navajo-police/',
    published: '2020-07-12T21:18:37Z',
    relevance: 262.0,
    source: 'Navajo Times',
    title: 'Starbucks gives a helping hand to Navajo Police',
  },
];

export const ContactDemoData: Array<OwnershipContactDataCreateInput> = [
  {
    email: 'mcurtis@thecheescakefactory.com',
    name: 'Melvin Curtis',
    phone: '(818) 871-3000',
    title: 'Manager',
  },
  {
    email: 'pcummings@epsteen.com',
    name: 'Peter Cummings',
    phone: '(818) 871-3000',
    title: 'Broker',
  },
];

export const InfoDemoData: OwnershipInfoDataCreateInput = {
  headquarters: 'Calabasas, CA',
  lastUpdate: '2020-05-06T06:19:30.659554',
  parentCompany: 'The Cheesecake Factory',
  phone: '(818) 871-3000',
  website: 'thecheesecakefactory.com',
};
