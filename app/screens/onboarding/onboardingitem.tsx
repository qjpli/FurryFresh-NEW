import React from "react";
import { View, Image, StyleSheet, ImageSourcePropType } from "react-native";
import Title1 from "../../components/texts/title1";
import Subtitle1 from "../../components/texts/subtitle1";
import dimensions from "../../utils/sizing";

interface OnboardingItemProps {
    item: {
        id: string;
        title: string;
        description: string;
        image: ImageSourcePropType;
    };
}

const OnboardingItem: React.FC<OnboardingItemProps> = ({ item }) => {
    return (
        <View style={styles.container}>
            <Title1
                text={item.title}
                fontSize={dimensions.screenHeight * 0.035}
                lineHeight={dimensions.screenHeight * 0.042}
            />
            <Subtitle1
                text={item.description}
                fontSize={dimensions.screenHeight * 0.018}
                fontFamily="Poppins-Regular"
                opacity={0.8}
                marginTop={10}
            />
            <Image source={item.image} style={styles.image} resizeMode="contain" />
        </View>
    );
};

export default OnboardingItem;

const styles = StyleSheet.create({
    container: {
        width: dimensions.screenWidth, // ✅ Full width to make FlatList scroll like a carousel
        alignItems: "center",
        justifyContent: "center",
        paddingHorizontal: 20,
    },
    image: {
        width: dimensions.screenWidth * 0.8,
        height: dimensions.screenHeight * 0.4,
    }
});
