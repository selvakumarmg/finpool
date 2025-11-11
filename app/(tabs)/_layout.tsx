import { Tabs, useRouter, useSegments } from 'expo-router';
import { BarChart3, FileText, Home, Plus, User } from 'lucide-react-native';
import { Platform, TouchableOpacity, View } from 'react-native';

export default function TabsLayout() {
  const router = useRouter();
  const segments = useSegments();
  
  // Get the current active route
  const currentRoute = segments[1] || 'index';
  
  const handleAddPress = () => {
    // Navigate based on current screen
    if (currentRoute === 'loans') {
      router.push('/(tabs)/addLoan');
    } else {
      // Default to add transaction for home and other screens
      router.push('/(tabs)/addTransaction');
    }
  };
  
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: '#7C3AED',
        tabBarInactiveTintColor: '#6B7280',
        tabBarStyle: {
          position: 'absolute',
          bottom: 0,
          left: 0,
          right: 0,
          height: Platform.OS === 'ios' ? 88 : 70,
          paddingBottom: Platform.OS === 'ios' ? 28 : 12,
          paddingTop: 8,
          backgroundColor: '#1F1B2E',
          borderTopWidth: 0,
          elevation: 0,
          shadowOpacity: 0,
        },
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: '500',
          marginTop: 4,
        },
        tabBarBackground: () => (
          <View style={{
            flex: 1,
            backgroundColor: '#1F1B2E',
            borderTopWidth: 1,
            borderTopColor: 'rgba(124, 58, 237, 0.2)',
          }} />
        ),
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Home',
          tabBarIcon: ({ color, focused }) => (
            <View style={{
              alignItems: 'center',
              justifyContent: 'center',
            }}>
              <Home 
                size={24} 
                color={color}
                fill={focused ? color : 'none'}
              />
            </View>
          ),
        }}
      />
      <Tabs.Screen
        name="loans"
        options={{
          title: 'Loans',
          tabBarIcon: ({ color, focused }) => (
            <View style={{
              alignItems: 'center',
              justifyContent: 'center',
            }}>
              <BarChart3 
                size={24} 
                color={color}
              />
            </View>
          ),
        }}
      />
      <Tabs.Screen
        name="addTransaction"
        options={{
          title: 'Add',
          tabBarButton: () => (
            <TouchableOpacity
              onPress={handleAddPress}
              style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}
              activeOpacity={0.7}
            >
              <View style={{
                width: 60,
                height: 60,
                borderRadius: 30,
                backgroundColor: '#7C3AED',
                justifyContent: 'center',
                alignItems: 'center',
                marginTop: -30,
                shadowColor: '#7C3AED',
                shadowOffset: { width: 0, height: 4 },
                shadowOpacity: 0.5,
                shadowRadius: 8,
                elevation: 8,
                borderWidth: 4,
                borderColor: '#1F1B2E',
              }}>
                <Plus size={28} color="#FFFFFF" strokeWidth={3} />
              </View>
            </TouchableOpacity>
          ),
          tabBarLabel: () => null,
          tabBarStyle: { display: 'none' },
        }}
      />
      <Tabs.Screen
        name="notifications"
        options={{
          href: null, // Hide from tab bar
          tabBarStyle: { display: 'none' },
        }}
      />
      <Tabs.Screen
        name="add"
        options={{
          href: null, // Hide old add screen
        }}
      />
      <Tabs.Screen
        name="reminder"
        options={{
          title: 'Activity',
          tabBarIcon: ({ color, focused }) => (
            <View style={{
              alignItems: 'center',
              justifyContent: 'center',
            }}>
              <FileText
                size={24}
                color={color}
              />
            </View>
          ),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Profile',
          tabBarIcon: ({ color, focused }) => (
            <View style={{
              alignItems: 'center',
              justifyContent: 'center',
            }}>
              <User
                size={24}
                color={color}
                fill={focused ? color : 'none'}
              />
            </View>
          ),
        }}
      />
      <Tabs.Screen
        name="account"
        options={{
          href: null, // Hide old account screen
        }}
      />
      <Tabs.Screen
        name="subscription"
        options={{
          href: null, // Hide old subscription screen
        }}
      />
      <Tabs.Screen
        name="addLoan"
        options={{
          href: null, // Hide from tab bar
          tabBarStyle: { display: 'none' },
        }}
      />
    </Tabs>
  );
}

