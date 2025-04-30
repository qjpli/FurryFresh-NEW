import { StyleSheet, Text, View, FlatList, TouchableOpacity } from 'react-native';
import React from 'react';
import dimensions from '../../utils/sizing';

type Service = {
  id: number | string;
  icon?: React.ElementType | null;
  title: string;
};

type Props = {
  services: Service[];
  activeService: number | string;
  setActiveService: (id: number | string) => void;
  onServiceClick?: (item: Service) => void; // 👈 add this
  activeColor?: string | null;
  inactiveColor?: string | null;
  paddingHorizontal?: number | null;
  marginLeft?: number | null,
  marginTop?: number | null
};

const HorizontalButtonList = ({
  services,
  activeService,
  setActiveService,
  activeColor,
  inactiveColor,
  paddingHorizontal,
  marginLeft = dimensions.screenWidth * 0.03,
  marginTop = 20,
  onServiceClick
}: Props) => {
  const defaultActiveColor = activeColor ?? '#ED7964';
  const defaultInactiveColor = inactiveColor ?? '#808080';
  const defaultPaddingHorizontal = paddingHorizontal ?? 20;

  const renderItem = ({ item, index }: { item: Service; index: number }) => {
    const isActive = item.id === activeService;
    const IconComponent = item.icon;
    const iconColor = isActive ? '#fff' : defaultInactiveColor;

    return (
      <TouchableOpacity
        style={[
          styles.button,
          { paddingHorizontal: defaultPaddingHorizontal },
          isActive && { backgroundColor: defaultActiveColor },
          { marginLeft: index === 0 ? marginLeft : 0,
            marginTop: marginTop
           },
        ]}
        onPress={() => {
          setActiveService(item.id);
          if (onServiceClick) {
            onServiceClick(item); // 🔥 let parent know which was clicked
          }
        }}
        
      >
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
          {IconComponent && (
            <IconComponent
              color={iconColor}
              width={dimensions.screenWidth * 0.05}
              height={dimensions.screenWidth * 0.05}
            />
          )}
          <Text
            style={[
              styles.buttonText,
              { color: isActive ? '#fff' : defaultInactiveColor },
            ]}
          >
            {item.title}
          </Text>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <FlatList
      data={services}
      renderItem={renderItem}
      keyExtractor={(item) => item.id.toString()}
      horizontal
      showsHorizontalScrollIndicator={false}
    />
  );
};

export default HorizontalButtonList;

const styles = StyleSheet.create({
  button: {
    backgroundColor: '#E0E0E0',
    paddingVertical: dimensions.screenHeight * 0.01,
    borderRadius: 10,
    marginRight: 10,
    marginTop: 20,
    display: 'flex',
    flexDirection: 'row',
  },
  buttonText: {
    fontFamily: 'Poppins-SemiBold',
    fontSize: dimensions.screenWidth * 0.035,
  },
});
