import * as React from "react";
import Svg, { G, Rect } from "react-native-svg";
interface DefaulListProps {
    color: string;
    width: number;
    height: number;
    props: any;
}

const DefaultListIcon: React.FC<DefaulListProps> = ({ color, width, height, props }) =>(
  <Svg
    fill={color}
    id="Capa_1"
    xmlns="http://www.w3.org/2000/svg"
    xmlnsXlink="http://www.w3.org/1999/xlink"
    width={width}
    height={height}
    viewBox="0 0 161.935 161.935"
    xmlSpace="preserve"
    {...props}
  >
    <G>
      <G>
        <G>
          <Rect x={22.426} y={18.748} width={127.203} height={27.648} />
          <Rect x={22.426} y={67.142} width={91.265} height={27.63} />
          <Rect x={22.426} y={115.511} width={103.905} height={27.663} />
        </G>
        <G>
          <Rect x={12.306} width={4.056} height={161.935} />
        </G>
      </G>
    </G>
  </Svg>
);
export default DefaultListIcon;
