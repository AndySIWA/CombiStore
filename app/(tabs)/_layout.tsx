import { Tabs } from 'expo-router';
import { Text } from 'react-native';
import { useEffect } from 'react';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
} from 'react-native-reanimated';
import { useTheme } from '../../src/context/ThemeContext';
import { ANIMATIONS } from '../../src/constants/animations';

function TabIcon({ emoji, focused }: { emoji: string; focused: boolean }) {
  const scale = useSharedValue(1);

  // Update animation when focused state changes
  useEffect(() => {
    if (focused) {
      scale.value = withSpring(1.2, {
        damping: 10,
        stiffness: 100,
      });
    } else {
      scale.value = withSpring(1, {
        damping: 10,
        stiffness: 100,
      });
    }
  }, [focused]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  return (
    <Animated.View style={animatedStyle}>
      <Text style={{ fontSize: focused ? 24 : 20, opacity: focused ? 1 : 0.5 }}>
        {emoji}
      </Text>
    </Animated.View>
  );
}

export default function TabLayout() {
  const { theme, mode } = useTheme();

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          position: 'absolute',
          bottom: 0,
          left: 0,
          right: 0,
          backgroundColor: mode === 'dark' ? 'rgba(22, 25, 30, 0.95)' : 'rgba(255, 255, 255, 0.98)',
          height: 80,
          borderRadius: 0,
          borderTopWidth: 1,
          borderWidth: 0,
          borderColor: theme.border,
          elevation: 10,
          shadowColor: '#000',
          shadowOpacity: mode === 'dark' ? 0.4 : 0.1,
          shadowRadius: 15,
          shadowOffset: { width: 0, height: -4 },
          paddingBottom: 15,
          paddingTop: 10,
        },
        tabBarActiveTintColor: theme.accent,
        tabBarInactiveTintColor: theme.textMuted,
        tabBarShowLabel: true,
        tabBarLabelStyle: {
          fontFamily: 'Inter_600SemiBold',
          fontSize: 12,
          marginTop: 4,
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Explorer',
          tabBarIcon: ({ focused }) => <TabIcon emoji="🌐" focused={focused} />,
        }}
      />
      <Tabs.Screen
        name="categories"
        options={{
          title: 'Catégories',
          tabBarIcon: ({ focused }) => <TabIcon emoji="🗂️" focused={focused} />,
        }}
      />
      <Tabs.Screen
        name="manage"
        options={{
          title: 'Mes Apps',
          tabBarIcon: ({ focused }) => <TabIcon emoji="🛠️" focused={focused} />,
        }}
      />
    </Tabs>
  );
}
