import React, { SVGProps } from 'react';

const SvgCheck = (props: SVGProps<SVGSVGElement>) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    {...props}
  >
    <path
      d="M5.862,10.57,17.144-.007c.517-.47,1.316.282.846.8L6.473,14.848a.577.577,0,0,1-.893,0L.268,7.938a.587.587,0,0,1,.8-.846Z"
      transform="translate(2.867 4.155)"
      fill="#ffffff"
      fillRule="evenodd"
    />
  </svg>
);

export default SvgCheck;
