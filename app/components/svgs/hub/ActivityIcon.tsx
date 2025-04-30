import * as React from "react";
import Svg, { G, Path, Circle } from "react-native-svg";

interface ActivityProps {
    color: string;
    width: number;
    height: number;
    props: any;
}

const ActivityIcon: React.FC<ActivityProps> = ({ color, width, height, props }) => (
  <Svg
    width={width}
    height={height}
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    stroke={color}
    strokeWidth={1}
    {...props}
  >
 <G id="SVGRepo_bgCarrier" strokeWidth={0} />
    <G
      id="SVGRepo_tracerCarrier"
      strokeLinecap="round"
      strokeLinejoin="round"
      stroke={color}
      strokeWidth={1.9}
    />
    <G id="SVGRepo_iconCarrier">
      <Path
        d="M22 10.5V12C22 16.714 22 19.0711 20.5355 20.5355C19.0711 22 16.714 22 12 22C7.28595 22 4.92893 22 3.46447 20.5355C2 19.0711 2 16.714 2 12C2 7.28595 2 4.92893 3.46447 3.46447C4.92893 2 7.28595 2 12 2H13.5"
        stroke={color}
        strokeWidth={1.9}
        strokeLinecap="round"
      />
      <Circle cx={19} cy={5} r={3} stroke={color} strokeWidth={1.344} />
      <Path
        d="M7 14H16"
        stroke={color}
        strokeWidth={1.9}
        strokeLinecap="round"
      />
      <Path
        d="M7 17.5H13"
        stroke={color}
        strokeWidth={1.9}
        strokeLinecap="round"
      />
    </G>
  </Svg>
);
export default ActivityIcon;
