import * as React from "react";
import Svg, { G, Path } from "react-native-svg";
interface MaleProps {
    color: string;
    width: number;
    height: number;
    props: any;
}

const MaleIcon: React.FC<MaleProps> = ({ color, width, height, props }) => (
  <Svg
    fill={color}
    width={width}
    height={height}
    viewBox="-2.24 -2.24 36.48 36.48"
    xmlns="http://www.w3.org/2000/svg"
    stroke={color}
    strokeWidth={0.992}
    {...props}
  >
    <G id="SVGRepo_bgCarrier" strokeWidth={0} />
    <G
      id="SVGRepo_tracerCarrier"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <G id="SVGRepo_iconCarrier">
      <Path d="M31.978 0.708c0.005-0.203-0.043-0.384-0.175-0.514-0.13-0.131-0.311-0.21-0.512-0.204l-0.366 0.009c-0.007 0-0.012 0.003-0.020 0.004l-9.172-0.032c-0.404 0.009-0.738 0.344-0.747 0.748l-0.001 0.514c0.061 0.476 0.436 0.755 0.84 0.746l6.726 0.014-8.005 7.956c-2.172-1.82-4.969-2.918-8.024-2.918-6.904 0-12.5 5.596-12.5 12.5s5.596 12.5 12.5 12.5c6.903 0 12.5-5.596 12.5-12.5 0-3.128-1.152-5.986-3.052-8.178l8.028-7.979-0.029 6.848c-0.009 0.404 0.311 0.755 0.715 0.746l0.513-0.001c0.405-0.009 0.739-0.25 0.747-0.654l0.021-9.219c0-0.008-0.027-0.012-0.027-0.020zM23.038 19.529c0 5.808-4.709 10.517-10.517 10.517s-10.517-4.709-10.517-10.517 4.708-10.517 10.517-10.517c5.808-0.001 10.517 4.708 10.517 10.517z" />
    </G>
  </Svg>
);
export default MaleIcon;
