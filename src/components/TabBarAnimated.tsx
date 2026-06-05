import React, { useEffect, useState } from 'react';
import { View, StyleSheet, TouchableOpacity, Text } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withSpring,
  Easing,
  interpolate,
  Extrapolate,
} from 'react-native-reanimated';
import { ANIMATIONS } from '../constants/animations';
import { FONT } from '../constants/theme';

interface TabBarAnimatedProps {
  activeIndex: number;
  tabs: { label: string; icon: string }[];
  onTabPress: (index: number) => void;
  color?: string;
  backgroundColor?: string;
}

export const TabBarAnimated: React.FC<TabBarAnimatedProps> = ({
  activeIndex,
  tabs,
  onTabPress,
  color = '#A78BFA',
  backgroundColor = 'rgba(22, 25, 30, 0.95)',
}) => {
  const indicatorPosition = useSharedValue(0);
  const [prevIndex, setPrevIndex] = useState(0);

  useEffect(() => {
    const totalWidth = 100;
    const tabWidth = totalWidth / tabs.length;
    indicatorPosition.value = withSpring(
      activeIndex * tabWidth,
      ANIMATIONS.timingConfigs.tabAnimation
    );
    setPrevIndex(activeIndex);
  }, [activeIndex]);

  const indicatorStyle = useAnimatedStyle(() => ({
    left: `${indicatorPosition.value}%`,
  }));

  return (
    <View style={[styles.container, { backgroundColor }]}>
      {/* Animated indicator */}
      <Animated.View
        style={[
          styles.indicator,
          { backgroundColor: color, width: `${100 / tabs.length}%` },
          indicatorStyle,
        ]}
      />

      {/* Tab buttons */}
      {tabs.map((tab, index) => (
        <TouchableOpacity
          key={index}
          onPress={() => onTabPress(index)}
          style={styles.tab}
          activeOpacity={0.7}
        >
          <Text
            style={[
              styles.tabIcon,
              {
                fontSize: activeIndex === index ? 24 : 20,
                opacity: activeIndex === index ? 1 : 0.5,
              },
            ]}
          >
            {tab.icon}
          </Text>
          <Text
            style={[
              styles.tabLabel,
              {
                color: activeIndex === index ? color : '#94A3B8',
                opacity: activeIndex === index ? 1 : 0.6,
              },
            ]}
          >
            {tab.label}
          </Text>
        </TouchableOpacity>
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.1)',
    paddingTop: 10,
    paddingBottom: 15,
  },
  indicator: {
    position: 'absolute',
    bottom: 0,
    height: 3,
    backgroundColor: '#A78BFA',
    borderRadius: 1.5,
  },
  tab: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
  },
  tabIcon: {
    marginBottom: 4,
  },
  tabLabel: {
    fontFamily: FONT.semiBold,
    fontSize: 11,
  },
});
