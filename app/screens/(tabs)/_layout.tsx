import React, { useEffect, useState, useRef } from 'react';
import { StyleSheet, View, Animated } from 'react-native';
import { Session } from '@supabase/supabase-js';
import supabase from '../../utils/supabase';
import { BlurView } from 'expo-blur';
import dimensions from '../../utils/sizing';
import HomeIcon from '../../components/svgs/hub/HomeIcon';
import ActivityIcon from '../../components/svgs/hub/ActivityIcon';
import ProfileIcon from '../../components/svgs/hub/ProfileIcon';
import NavbarItem from '../../components/general/navbar_item';
import Home, { homeOptions } from './home';
import Profile from './profile';
import Activity from './activity';
import { NavigationContainer, useFocusEffect } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import Explore from './explore';
import ExploreIcon from '../../components/svgs/hub/ExploreIcon';
import { PortalProvider } from '@gorhom/portal';

const Tab = createBottomTabNavigator();

export default () => {
  const [session, setSession] = useState<Session | null>(null);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
    });
    supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });
  }, []);

  return (
    <PortalProvider>
      <NavigationContainer>
        <Tab.Navigator
          screenOptions={{
            tabBarShowLabel: false,
            tabBarActiveTintColor: '#466AA2',
            tabBarInactiveTintColor: '#8e8e8e',
            tabBarBackground: () => (
              <BlurView tint="light" intensity={100} style={StyleSheet.absoluteFill} />
            ),
            tabBarStyle: {
              backgroundColor: '#fff',
              position: 'absolute',
              elevation: 15,
              height: dimensions.screenHeight * 0.1,
              paddingTop: dimensions.screenHeight * 0.01,
              shadowColor: '#000',
              shadowOffset: { width: 0, height: -30 },
              shadowOpacity: 0.1,
              shadowRadius: 5,
              alignItems: 'center',
              alignContent: 'center',
            },
          }}
        >
          <Tab.Screen
            name="home"
            component={HomeWithAnimation}
            options={{
              tabBarIcon: ({ color }: { color: string }) => (
                <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
                  <NavbarItem
                    color={color}
                    title="Home"
                    icon={<HomeIcon color={color} width={dimensions.screenWidth * 0.07} height={dimensions.screenWidth * 0.07} props={undefined} />}
                  />
                </View>
              ),
              header: () => homeOptions.header(session),
              headerTransparent: true,
              headerShown: false
            }}
          />
          <Tab.Screen
            name="explore"
            component={ExploreWithAnimation}
            options={{
              tabBarIcon: ({ color }: { color: string }) => (
                <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
                  <NavbarItem
                    color={color}
                    title="Explore"
                    icon={<ExploreIcon color={color} width={dimensions.screenWidth * 0.07} height={dimensions.screenWidth * 0.07} props={undefined} />}
                  />
                </View>
              ),
              headerShown: false
            }}
          />
          <Tab.Screen
            name="activity"
            component={ActivityWithAnimation}
            options={{
              tabBarIcon: ({ color }: { color: string }) => (
                <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
                  <NavbarItem
                    color={color}
                    title="Activity"
                    icon={<ActivityIcon color={color} width={dimensions.screenWidth * 0.07} height={dimensions.screenWidth * 0.07} props={undefined} />}
                  />
                  
              
                </View>
              ),
              tabBarBadge: 10,
              headerShown: false
            }}
          />
          <Tab.Screen
            name="profile"
            component={ProfileWithAnimation}
            options={{
              tabBarIcon: ({ color }: { color: string }) => (
                <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
                  <NavbarItem
                    color={color}
                    title="Profile"
                    icon={<ProfileIcon color={color} width={dimensions.screenWidth * 0.07} height={dimensions.screenWidth * 0.07} props={undefined} />}
                  />
                </View>
              ),
              headerShown: false,
            }}
          />
        </Tab.Navigator>
      </NavigationContainer>
    </PortalProvider>
  );
};

const TabIcon = ({ icon }: { icon: React.ReactNode }) => {
  const scale = useRef(new Animated.Value(1)).current;

  useFocusEffect(
    React.useCallback(() => {
      Animated.spring(scale, {
        toValue: 1.3,
        useNativeDriver: true,
      }).start();
      return () => {
        Animated.spring(scale, {
          toValue: 1,
          useNativeDriver: true,
        }).start();
      };
    }, [scale])
  );

  return (
    <Animated.View style={{ transform: [{ scale }] }}>
      {icon}
    </Animated.View>
  );
};

const HomeWithAnimation = () => {
  const slideAnim = useRef(new Animated.Value(300)).current;

  useFocusEffect(
    React.useCallback(() => {
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }).start();

      return () => {
        Animated.timing(slideAnim, {
          toValue: 300,
          duration: 250,
          useNativeDriver: true,
        }).start();
      };
    }, [slideAnim])
  );

  return (
    <Animated.View style={{ flex: 1, transform: [{ translateX: slideAnim }] }}>
      <Home />
    </Animated.View>
  );
};

const ExploreWithAnimation = () => {
  const slideAnim = useRef(new Animated.Value(300)).current;

  useFocusEffect(
    React.useCallback(() => {
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }).start();

      return () => {
        Animated.timing(slideAnim, {
          toValue: 300,
          duration: 250,
          useNativeDriver: true,
        }).start();
      };
    }, [slideAnim])
  );

  return (
    <Animated.View style={{ flex: 1, transform: [{ translateX: slideAnim }] }}>
      <Explore />
    </Animated.View>
  );
};

const ActivityWithAnimation = () => {
  const slideAnim = useRef(new Animated.Value(300)).current;

  useFocusEffect(
    React.useCallback(() => {
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }).start();

      return () => {
        Animated.timing(slideAnim, {
          toValue: 300,
          duration: 250,
          useNativeDriver: true,
        }).start();
      };
    }, [slideAnim])
  );

  return (
    <Animated.View style={{ flex: 1, transform: [{ translateX: slideAnim }] }}>
      <Activity />
    </Animated.View>
  );
};

const ProfileWithAnimation = () => {
  const slideAnim = useRef(new Animated.Value(300)).current;

  useFocusEffect(
    React.useCallback(() => {
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }).start();

      return () => {
        Animated.timing(slideAnim, {
          toValue: 300,
          duration: 250,
          useNativeDriver: true,
        }).start();
      };
    }, [slideAnim])
  );

  return (
    <Animated.View style={{ flex: 1, transform: [{ translateX: slideAnim }] }}>
      <Profile />
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  tabLabel: {
    fontSize: 12,
    fontWeight: '600',
    fontFamily: 'Poppins-Regular',
    marginTop: dimensions.screenHeight * 0.005,
  },
  tabIcon: {
    marginBottom: dimensions.screenHeight * 0.003,
    flex: 1,
    width: 'auto',
  },
});
