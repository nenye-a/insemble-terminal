import React, { SVGProps } from 'react';

const SvgMenu = ({ fill, ...props }: SVGProps<SVGSVGElement>) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    height="24"
    viewBox="0 0 24 24"
    width="24"
    {...props}
  >
    <path d="M0 0h24v24H0V0z" fill="none" />
    <path
      d="M3 18h18v-2H3v2zm0-5h18v-2H3v2zm0-7v2h18V6H3z"
      fill="currentColor"
    />
  </svg>
);

export default SvgMenu;
