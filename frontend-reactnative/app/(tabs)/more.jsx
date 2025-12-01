import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { MaterialCommunityIcons } from '@expo/vector-icons';

const MoreScreen = () => {
  const router = useRouter();

  const menuItems = [
    { 
      title: 'Thư viện xanh', 
      icon: 'book-open-page-variant', 
      color: '#4CAF50', 
      route: '/features/knowledge' // Đường dẫn đúng
    },
    { 
      title: 'Thử thách kiến thức', 
      icon: 'brain', 
      color: '#FF9800', 
      route: '/features/quiz' 
    },
    { 
      title: 'Hành động mỗi ngày', 
      icon: 'calendar-check', 
      color: '#2196F3', 
      route: '/features/daily-tip' 
    },
    { 
      title: 'Đổi điểm thưởng', 
      icon: 'gift-outline', 
      color: '#E91E63', 
      route: '/features/redeem-points' 
    },
    {
      title: 'Huy hiệu của tôi',
      icon: 'medal-outline',
      color: '#FFD700',
      route: '/features/badges'
    },
    {
      title: 'Đăng xuất',
      icon: 'logout',
      color: '#F44336',
      route: '/login', // Hoặc gọi hàm logout
      isLogout: true
    }
  ];

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.headerTitle}>Tiện ích mở rộng</Text>
      
      <View style={styles.grid}>
        {menuItems.map((item, index) => (
          <TouchableOpacity 
            key={index} 
            style={styles.card}
            onPress={() => {
                if (item.isLogout) {
                    // Xử lý logout
                    router.replace('/login');
                } else {
                    router.push(item.route);
                }
            }}
          >
            <View style={[styles.iconContainer, { backgroundColor: item.color + '20' }]}>
              <MaterialCommunityIcons name={item.icon} size={32} color={item.color} />
            </View>
            <Text style={styles.cardText}>{item.title}</Text>
          </TouchableOpacity>
        ))}
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8F9FA', padding: 20 },
  headerTitle: { fontSize: 24, fontWeight: 'bold', marginBottom: 20, color: '#111', marginTop: 40 },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 15, justifyContent: 'space-between' },
  card: { 
    width: '47%', 
    backgroundColor: '#FFF', 
    padding: 20, 
    borderRadius: 20, 
    alignItems: 'center',
    marginBottom: 15,
    elevation: 2,
    shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 5
  },
  iconContainer: { width: 60, height: 60, borderRadius: 30, justifyContent: 'center', alignItems: 'center', marginBottom: 12 },
  cardText: { fontSize: 14, fontWeight: '600', color: '#333', textAlign: 'center' }
});

export default MoreScreen;