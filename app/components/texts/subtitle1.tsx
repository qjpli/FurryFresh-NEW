import React, { useState, useRef, useMemo } from 'react';
import { Text, StyleSheet, TextStyle, View, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import dimensions from '../../utils/sizing';
import BottomSheet, { BottomSheetView } from '@gorhom/bottom-sheet';
import { Portal } from '@gorhom/portal';

interface SubtitleProps {
  text: string;
  style?: TextStyle;
  fontFamily?: string;
  fontSize?: number;
  color?: string;
  opacity?: number;
  marginTop?: number;
  textAlign?: TextStyle['textAlign'];
  lineHeight?: number;
  tooltip?: boolean;
  tooltipWidget?: any;
  tooltipSnapPoints?: [];
  tooltipCustomHandler?: () => void;
}

const Subtitle1: React.FC<SubtitleProps> = ({
  text,
  style,
  fontFamily,
  fontSize,
  color = '#808080',
  opacity = 1,
  marginTop = 0,
  textAlign = 'center',
  lineHeight,
  tooltip = false,
  tooltipWidget = null,
  tooltipSnapPoints = ["50"],
  tooltipCustomHandler
}) => {
  const sheetRef = useRef<BottomSheet>(null);

  // Only generate tooltipContent when tooltip is true
  const tooltipContent = useMemo(() => {
    if (!tooltip || !tooltipWidget) return null;
    return tooltipWidget({ closeSheet: () => sheetRef.current?.close() });
  }, [tooltip, tooltipWidget]);

  const handleOpenSheet = () => {
    if (tooltipCustomHandler) {
      tooltipCustomHandler();
    } else {
      sheetRef.current?.expand();
    }
  };

  return (
    <View style={[styles.container, { justifyContent: textAlign === 'center' ? 'center' : 'flex-start' }]}>
      <Text
        style={[
          styles.Subtitle,
          fontFamily ? { fontFamily } : {},
          fontSize ? { fontSize } : {},
          color ? { color } : {},
          opacity !== undefined ? { opacity } : {},
          marginTop ? { marginTop } : {},
          textAlign ? { textAlign } : {},
          lineHeight ? { lineHeight } : {},
          style,
        ]}
      >
        {text}
      </Text>

      {tooltip && (
        <>
          <TouchableOpacity onPress={handleOpenSheet} style={{ marginLeft: 5 }}>
            <Ionicons name="information-circle-outline" size={dimensions.screenWidth * 0.045} color={color} />
          </TouchableOpacity>

          <Portal>
            <BottomSheet
              ref={sheetRef}
              index={-1}
              snapPoints={tooltipSnapPoints}
              enablePanDownToClose
              handleComponent={null}
              backgroundStyle={{ backgroundColor: '#FFF' }}
            >
              <BottomSheetView>{tooltipContent}</BottomSheetView>
            </BottomSheet>
          </Portal>
        </>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  Subtitle: {
    fontSize: dimensions.screenWidth * 0.027,
    fontFamily: 'Poppins-SemiBold',
    color: '#808080',
    letterSpacing: 0.8,
    textAlign: 'center',
    margin: 0,
    padding: 0,
  },
});

export default Subtitle1;
