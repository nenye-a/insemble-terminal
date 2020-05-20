export let axiosParamsSerializer = (params: {
  [key: string]: string;
}): string => {
  let queryString = Object.keys(params)
    .filter((key) => params[key])
    .map((key) => {
      const regexSquareBracketOpen = /%5B/gi;
      const regexSquareBracketClose = /%5D/gi;
      const regexComaSymbol = /%2C/gi;
      let encodeInput = encodeURIComponent(
        typeof params[key] === 'string'
          ? params[key]
          : JSON.stringify(params[key]),
      );
      let squareBracket = encodeInput
        .replace(regexSquareBracketOpen, '[')
        .replace(regexSquareBracketClose, ']')
        .replace(regexComaSymbol, ',');
      return encodeURI(key) + '=' + squareBracket;
    })
    .join('&');
  return queryString;
};
