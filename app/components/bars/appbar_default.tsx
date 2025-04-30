import { StyleSheet, Text, View, TouchableOpacity } from 'react-native';
import React from 'react';
import { Ionicons } from '@expo/vector-icons';
import dimensions from '../../utils/sizing';
import { useRouter } from 'expo-router';
import { Session } from '@supabase/supabase-js';

const AppbarDefault = ({
  session,
  title,
  subtitle,
  leadFunction,
  showBack = true,
  showLeading = false,
  leadingChildren = null,
  titleSize = dimensions.screenWidth * 0.05,
  subtitleSize = dimensions.screenWidth * 0.035,
  paddingTop = dimensions.screenHeight * 0.07,
  paddingBottom = dimensions.screenHeight * 0.02,
  subtitleFont,
  zIndex = 1,
  containerHeight,
  children
}: {
  session: Session | null;
  title?: string;
  subtitle?: string;
  leadFunction?: () => void;
  showBack?: boolean;
  showLeading: boolean;
  leadingChildren: any;
  titleSize: number;
  subtitleSize?: number;
  paddingTop?: number;
  paddingBottom?: number;
  subtitleFont?: string;
  containerHeight?: number;
  zIndex?: number;
  children?: React.ReactNode;
}) => {
  const router = useRouter();

  const handleBackPress = () => {
    if (typeof leadFunction === 'function') {
      leadFunction();
    } else {
      router.back();
    }
  };

  return (
    <View
      style={[
        styles.container,
        {
          height: containerHeight ?? undefined,
          paddingBottom: paddingBottom,
          paddingTop: paddingTop,
          zIndex: zIndex
        },
      ]}
    >
      <View style={styles.topRow}>
        {showBack ? (
          <TouchableOpacity onPress={handleBackPress} style={styles.backButton}>
            <Ionicons name="arrow-back" size={dimensions.screenWidth * 0.06} color="#000" />
          </TouchableOpacity>
        ) : (
          <View style={{ flex: 1 }} />
        )}

        {title ? (
          <View style={styles.titleContainer}>
            <Text numberOfLines={1} style={[styles.title, { fontSize: titleSize }]}>
              {title}
            </Text>
            {subtitle && (
              <Text
                numberOfLines={1}
                style={[
                  styles.subtitle,
                  { fontSize: subtitleSize, fontFamily: subtitleFont },
                ]}
              >
                {subtitle}
              </Text>
            )}
          </View>
        ) : (
          <View style={{ flex: 3 }} />
        )}

        {showLeading ? leadingChildren : <View style={{ flex: 1 }} />}
      </View>

      {children && <View style={styles.toolbar}>{children}</View>}
    </View>
  );
};

export default AppbarDefault;

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#fff',
    paddingTop: dimensions.screenHeight * 0.07,
    paddingBottom: dimensions.screenHeight * 0.02,
    paddingHorizontal: 16,
    borderBottomLeftRadius: 0,
    borderBottomRightRadius: 0,
    zIndex: 1
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  backButton: {
    flex: 1,
  },
  titleContainer: {
    flex: 3,
    alignItems: 'center',
  },
  title: {
    fontFamily: 'Poppins-SemiBold',
    lineHeight: dimensions.screenWidth * 0.06,
  },
  subtitle: {
    fontFamily: 'Poppins-SemiBold',
    color: '#808080',
    lineHeight: dimensions.screenWidth * 0.04,
  },
  toolbar: {
    marginTop: 10,
  },
});
