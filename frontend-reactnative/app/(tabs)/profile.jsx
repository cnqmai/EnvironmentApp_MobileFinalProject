// File: frontend-reactnative/app/(tabs)/profile.jsx
import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity, ScrollView, RefreshControl, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useRouter, useFocusEffect } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Import services
import { getCurrentUser } from '../../src/services/authService';
import { getUserStatistics } from '../../src/services/userService'; 

export default function ProfileScreen() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  
  // State lưu thống kê
  const [stats, setStats] = useState({
    totalReports: 0,
    currentPoints: 0,
    savedLocationsCount: 0,
    wasteClassificationsCount: 0,
    reportsCompleted: 0
  });
  
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // useFocusEffect giúp load lại dữ liệu mỗi khi quay lại màn hình này
  useFocusEffect(
    useCallback(() => {
      fetchData();
    }, [])
  );

  const fetchData = async () => {
    try {
      // 1. Lấy user từ token/storage
      const currentUser = await getCurrentUser();
      setUser(currentUser);

      // 2. Gọi API lấy thống kê
      if (currentUser?.userId) {
        const data = await getUserStatistics(currentUser.userId);
        if (data) {
          setStats(data);
        }
      }
    } catch (error) {
      console.error("Failed to load profile data:", error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    fetchData();
  };

  const handleLogout = async () => {
    try {
        await AsyncStorage.removeItem('userToken');
        await AsyncStorage.removeItem('userData');
        router.replace('/login');
    } catch (e) {
        console.error("Logout error:", e);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView 
        contentContainerStyle={styles.scrollContent}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      >
        
        {/* HEADER PROFILE */}
        <View style={styles.header}>
          <View style={styles.avatarContainer}>
             <Image 
                source={user?.avatarUrl ? { uri: user.avatarUrl } : require('../../assets/images/react-logo.png')} 
                style={styles.avatar} 
                resizeMode="cover"
             />
             <View style={styles.badgeIcon}>
                <MaterialCommunityIcons name="check-decagram" size={20} color="#2196F3" />
             </View>
          </View>
          
          <Text style={styles.name}>{user?.fullName || 'Người dùng'}</Text>
          <Text style={styles.email}>{user?.email || 'email@example.com'}</Text>
          
          <TouchableOpacity style={styles.editBtn} onPress={() => router.push('/edit-profile')}>
            <Text style={styles.editBtnText}>Chỉnh sửa hồ sơ</Text>
          </TouchableOpacity>
        </View>

        {/* THỐNG KÊ (STATS GRID) */}
        <View style={styles.statsContainer}>
          {/* Điểm xanh */}
          <View style={styles.statItem}>
            <MaterialCommunityIcons name="leaf" size={24} color="#2E7D32" style={{marginBottom: 4}} />
            <Text style={styles.statNumber}>{stats.currentPoints}</Text>
            <Text style={styles.statLabel}>Điểm xanh</Text>
          </View>
          
          {/* Đường kẻ dọc */}
          <View style={styles.divider} />

          {/* Báo cáo đã xử lý */}
          <View style={styles.statItem}>
            <MaterialCommunityIcons name="file-document-check-outline" size={24} color="#1565C0" style={{marginBottom: 4}} />
            <Text style={styles.statNumber}>{stats.reportsCompleted}/{stats.totalReports}</Text>
            <Text style={styles.statLabel}>Báo cáo xong</Text>
          </View>
          
          <View style={styles.divider} />

          {/* Phân loại rác */}
          <View style={styles.statItem}>
            <MaterialCommunityIcons name="recycle" size={24} color="#EF6C00" style={{marginBottom: 4}} />
            <Text style={styles.statNumber}>{stats.wasteClassificationsCount}</Text>
            <Text style={styles.statLabel}>Phân loại</Text>
          </View>
        </View>

        {/* MENU CHỨC NĂNG */}
        <View style={styles.menuContainer}>
          <Text style={styles.sectionTitle}>Tài khoản</Text>
          
          <MenuItem 
            icon="medal-outline" 
            label="Huy hiệu & Thành tích" 
            onPress={() => router.push('/features/badges')} 
            color="#FFD700"
          />
          <MenuItem 
            icon="gift-outline" 
            label="Đổi quà tặng" 
            onPress={() => router.push('/features/redeem-points')} 
            color="#FF4081"
          />
          <MenuItem 
            icon="history" 
            label="Lịch sử báo cáo" 
            onPress={() => router.push('/settings/history')} 
          />
          
          <Text style={[styles.sectionTitle, {marginTop: 20}]}>Cài đặt</Text>
          
          <MenuItem 
            icon="bell-outline" 
            label="Cài đặt thông báo" 
            onPress={() => router.push('/settings/notification-settings')} 
          />
          <MenuItem 
            icon="shield-account-outline" 
            label="Quyền riêng tư" 
            onPress={() => router.push('/settings/privacy')} 
          />
          <MenuItem 
            icon="help-circle-outline" 
            label="Trợ giúp & Hỗ trợ" 
            onPress={() => router.push('/settings/help')} 
          />
          
          <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout}>
             <MaterialCommunityIcons name="logout" size={24} color="#FF3B30" />
             <Text style={styles.logoutText}>Đăng xuất</Text>
          </TouchableOpacity>
        </View>

      </ScrollView>
    </SafeAreaView>
  );
}

// Component phụ cho Menu Item
const MenuItem = ({ icon, label, onPress, color = '#555' }) => (
  <TouchableOpacity style={styles.menuItem} onPress={onPress}>
    <View style={[styles.menuIconBox, { backgroundColor: color + '15' }]}>
      <MaterialCommunityIcons name={icon} size={22} color={color} />
    </View>
    <Text style={styles.menuText}>{label}</Text>
    <MaterialCommunityIcons name="chevron-right" size={20} color="#CCC" />
  </TouchableOpacity>
);

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F5F7FA' },
  scrollContent: { paddingBottom: 40 },
  
  header: { 
    alignItems: 'center', 
    padding: 24, 
    backgroundColor: '#FFF', 
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 3,
    marginBottom: 16
  },
  avatarContainer: { position: 'relative', marginBottom: 12 },
  avatar: { width: 100, height: 100, borderRadius: 50, backgroundColor: '#E1E1E1' },
  badgeIcon: { 
    position: 'absolute', bottom: 0, right: 0, 
    backgroundColor: '#FFF', borderRadius: 12, padding: 2 
  },
  name: { fontSize: 20, fontWeight: 'bold', color: '#111', marginBottom: 4 },
  email: { fontSize: 14, color: '#666', marginBottom: 16 },
  editBtn: { 
    paddingHorizontal: 20, paddingVertical: 8, 
    borderRadius: 20, borderWidth: 1, borderColor: '#E0E0E0',
    backgroundColor: '#FAFAFA'
  },
  editBtnText: { fontSize: 13, fontWeight: '600', color: '#333' },
  
  statsContainer: { 
    flexDirection: 'row', 
    backgroundColor: '#FFF', 
    marginHorizontal: 16, 
    paddingVertical: 20, 
    borderRadius: 16,
    marginBottom: 20,
    shadowColor: "#000", shadowOffset: {width: 0, height: 2}, shadowOpacity: 0.05, shadowRadius: 8, elevation: 2,
    justifyContent: 'space-evenly'
  },
  statItem: { alignItems: 'center', flex: 1 },
  statNumber: { fontSize: 18, fontWeight: 'bold', color: '#333', marginBottom: 2 },
  statLabel: { fontSize: 12, color: '#888' },
  divider: { width: 1, height: '60%', backgroundColor: '#F0F0F0', alignSelf: 'center' },

  menuContainer: { paddingHorizontal: 16 },
  sectionTitle: { fontSize: 14, fontWeight: 'bold', color: '#888', marginBottom: 10, marginLeft: 4, textTransform: 'uppercase' },
  menuItem: { 
    flexDirection: 'row', alignItems: 'center', 
    backgroundColor: '#FFF', padding: 16, 
    borderRadius: 12, marginBottom: 10 
  },
  menuIconBox: { width: 36, height: 36, borderRadius: 18, justifyContent: 'center', alignItems: 'center', marginRight: 14 },
  menuText: { flex: 1, fontSize: 15, fontWeight: '500', color: '#333' },
  
  logoutBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    marginTop: 20, padding: 16,
    backgroundColor: '#FFF', borderRadius: 12
  },
  logoutText: { marginLeft: 8, color: '#FF3B30', fontWeight: 'bold', fontSize: 15 }
});