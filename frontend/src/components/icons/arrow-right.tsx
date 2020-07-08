import React, { SVGProps, CSSProperties } from 'react';

const SvgArrowRight = ({
  strokeWidth,
  pathStyle,
  ...props
}: SVGProps<SVGSVGElement> & { pathStyle?: CSSProperties }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="12.7"
    height="12.7"
    viewBox="0 0 12.7 12.7"
    {...props}
  >
    <g id="arrow_back_ios-24px" transform="translate(12.7 12.7) rotate(180)">
      <path
        id="Path_3917"
        data-name="Path 3917"
        d="M0,0H12.7V12.7H0Z"
        fill="none"
        opacity="0.87"
      />
      <path
        id="Path_3918"
        data-name="Path 3918"
        d="M11.736,2.817a.661.661,0,0,0-.937,0l-4.4,4.4a.527.527,0,0,0,0,.746l4.4,4.4a.662.662,0,0,0,.937-.937L7.905,7.585l3.836-3.836A.66.66,0,0,0,11.736,2.817Z"
        transform="translate(-2.942 -1.235)"
        fill="currentColor"
        style={pathStyle}
      />
    </g>
  </svg>
);

export default SvgArrowRight;
