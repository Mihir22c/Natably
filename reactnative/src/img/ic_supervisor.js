import React from "react";
import Svg, { Path } from "react-native-svg";

const IcSupervisor = props => {
  const { color, size, ...otherProps } = props;
  return (
    <Svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill={color}
      {...otherProps}
    >
      <Path fill="#1B3230" d="M15.9,13.2L15.9,13.2c-0.1,0-0.1-0.1-0.2-0.1C17.2,12,18,10.3,18,8.4c0-0.2,0-0.4,0-0.6c0,0,0-0.1,0-0.1l0.3-2.4c0.2-1.6-0.9-3-2.4-3.3L15,1.8C13,1.5,11,1.5,9,1.8L8.2,2C6.6,2.3,5.5,3.7,5.7,5.3L6,7.7c0,0,0,0.1,0,0.1C6,8,6,8.2,6,8.4c0,1.8,0.8,3.6,2.3,4.7c-0.1,0-0.1,0.1-0.2,0.1l0,0c-3.3,1.4-5.6,4.5-6,8.1c-0.1,0.5,0.3,1,0.9,1.1c0.6,0.1,17.5,0,18,0c0,0,0.1,0,0.1,0c0.5-0.1,0.9-0.6,0.9-1.1C21.5,17.7,19.2,14.6,15.9,13.2z M12,16.3l-1.7-1.7c1.1-0.2,2.2-0.2,3.3,0L12,16.3z M12,12.4c-2.2,0-3.9-1.7-4-3.9h8C15.9,10.7,14.2,12.4,12,12.4z"/>
    </Svg>
  );
};

export default IcSupervisor;