import * as React from "react";
import Svg, { Path } from "react-native-svg";

interface ExploreProps {
  color: string;
  width: number;
  height: number;
  props: any;
}

const ExploreIcon: React.FC<ExploreProps> = ({ color, width, height, props }) => (
  <Svg
    width={width}
    height={height}
    viewBox="2.3 2.3 19 19"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    xmlnsXlink="http://www.w3.org/1999/xlink"
    {...props}
  >
    <Path
      d="M9.733 10.46a1 1 0 0 1 0.728 -0.727l3.458 -0.864a1 1 0 0 1 1.212 1.212l-0.864 3.458a1 1 0 0 1 -0.728 0.728l-3.458 0.864A1 1 0 0 1 8.87 13.92z"
      stroke={color}
      strokeWidth={1.6}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <Path
      d="M12 3.5c-6.5 0 -8.5 2 -8.5 8.5s2 8.5 8.5 8.5 8.5 -2 8.5 -8.5 -2 -8.5 -8.5 -8.5"
      stroke={color}
      strokeWidth={1.6}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Svg>
);
export default ExploreIcon;
