import React from "react";
import Svg, { Path } from "react-native-svg";

const IcDiamond = props => {
  const { color, size, ...otherProps } = props;
  return (
    <Svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill={color}
      {...otherProps}
    >
    <Path d="M17.5779 0.5H11.3759L15.3223 5.76219L17.5779 0.5ZM4.42383 0.5L6.67945 5.76219L10.6259 0.5H4.42383Z" fill="#4EC5C1"/>
    <Path d="M11 2.50027L8 6.50012H14L11 2.50027ZM18.8258 1.39355L16.6372 6.50012H21.875L18.8258 1.39355ZM3.17422 1.39355L0.078125 6.50012H5.36281L3.17422 1.39355Z" fill="#4EC5C1"/>
    <Path d="M5.81672 8H0L10.5638 19H10.5889L5.81672 8ZM16.1833 8L11.4111 19H11.4362L22 8H16.1833ZM14.4797 8H7.5203L11 15.9444L14.4797 8Z" fill="#4EC5C1"/>
    </Svg>
  );
};

export default IcDiamond;
