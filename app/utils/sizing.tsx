import { Dimensions } from 'react-native';

const { width, height } = Dimensions.get('window');

const screenWidth = width;
const screenHeight = height;
const screenSize = width + height;

export default { screenWidth, screenHeight, screenSize };
