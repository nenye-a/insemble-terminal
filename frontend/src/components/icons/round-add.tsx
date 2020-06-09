import React, { SVGProps } from 'react';

const SvgRoundAdd = ({ fill, ...props }: SVGProps<SVGSVGElement>) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="15.26"
    height="15.261"
    viewBox="0 0 15.26 15.261"
    {...props}
  >
    <g id="noun_add_3325646" transform="translate(10.94 -176.06)">
      <g
        id="Group_992"
        data-name="Group 992"
        transform="translate(-10.94 176.06)"
      >
        <path
          id="Path_3938"
          data-name="Path 3938"
          d="M10.69,3.06a7.63,7.63,0,1,0,7.63,7.63,7.63,7.63,0,0,0-7.63-7.63Zm3.253,8.157H11.217v2.726a.527.527,0,0,1-1.055,0V11.217H7.437a.527.527,0,1,1,0-1.055h2.726V7.437a.527.527,0,1,1,1.055,0v2.726h2.726a.527.527,0,0,1,0,1.055Z"
          transform="translate(-3.06 -3.06)"
          fill={fill || '#674ca7'}
        />
      </g>
    </g>
  </svg>
);

export default SvgRoundAdd;
