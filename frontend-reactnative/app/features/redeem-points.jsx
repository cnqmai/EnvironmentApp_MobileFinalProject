import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Image, Alert, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { getAllRewards, redeemReward } from '../../src/services/rewardService';
import { getMyStatistics } from '../../src/services/userService';

const RedeemPointsScreen = () => {
  const router = useRouter();
  const [rewards, setRewards] = useState([]);
  const [points, setPoints] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      // Lấy danh sách quà và điểm hiện tại của user song song
      const [rewardsData, statsData] = await Promise.all([
        getAllRewards(),
        getMyStatistics()
      ]);
      
      setRewards(rewardsData || []);
      setPoints(statsData.currentPoints || 0);
    } catch (error) {
      console.error("Lỗi tải dữ liệu đổi quà:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleRedeem = (item) => {
    if (points < item.pointsCost) {
      Alert.alert("Không đủ điểm", "Bạn cần thêm điểm để đổi quà này.");
      return;
    }

    Alert.alert(
      "Xác nhận đổi quà",
      `Bạn muốn dùng ${item.pointsCost} điểm để đổi "${item.name}"?`,
      [
        { text: "Hủy", style: "cancel" },
        { 
          text: "Đồng ý", 
          onPress: async () => {
            try {
              await redeemReward(item.id);
              Alert.alert("Thành công", "Đổi quà thành công! Hãy kiểm tra kho quà.");
              loadData(); // Tải lại điểm
            } catch (error) {
              Alert.alert("Lỗi", error.message || "Đổi quà thất bại");
            }
          } 
        }
      ]
    );
  };

  const renderItem = ({ item }) => (
    <View style={styles.card}>
      <View style={styles.cardImageContainer}>
         {/* Placeholder icon nếu không có ảnh */}
         <MaterialCommunityIcons name="gift-outline" size={40} color="#EF6C00" />
      </View>
      <View style={styles.cardContent}>
        <Text style={styles.cardTitle}>{item.name}</Text>
        <Text style={styles.cardDesc} numberOfLines={2}>{item.description}</Text>
        <Text style={styles.cardCost}>{item.pointsCost} điểm</Text>
      </View>
      <TouchableOpacity 
        style={[styles.redeemBtn, points < item.pointsCost && styles.disabledBtn]}
        onPress={() => handleRedeem(item)}
        disabled={points < item.pointsCost}
      >
        <Text style={styles.redeemBtnText}>Đổi</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      {/* Header Points */}
      <View style={styles.header}>
        <View>
            <Text style={styles.headerLabel}>Điểm hiện tại của bạn</Text>
            <Text style={styles.pointsValue}>{points} ☘️</Text>
        </View>
        <TouchableOpacity style={styles.historyBtn} onPress={() => router.push('/features/reward-history')}>
            <MaterialCommunityIcons name="history" size={24} color="#FFF" />
        </TouchableOpacity>
      </View>

      <View style={styles.body}>
        <Text style={styles.sectionTitle}>Danh sách quà tặng</Text>
        {loading ? (
            <ActivityIndicator size="large" color="#2E7D32" style={{marginTop: 20}} />
        ) : (
            <FlatList
            data={rewards}
            renderItem={renderItem}
            keyExtractor={(item) => item.id.toString()}
            contentContainerStyle={{ paddingBottom: 20 }}
            ListEmptyComponent={<Text style={{textAlign: 'center', marginTop: 20, color: '#888'}}>Hiện chưa có quà tặng nào.</Text>}
            />
        )}
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F5F5F5' },
  header: { 
    backgroundColor: '#2E7D32', padding: 20, 
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    borderBottomLeftRadius: 20, borderBottomRightRadius: 20
  },
  headerLabel: { color: '#E8F5E9', fontSize: 14 },
  pointsValue: { color: '#FFF', fontSize: 28, fontWeight: 'bold', marginTop: 5 },
  historyBtn: { padding: 8, backgroundColor: 'rgba(255,255,255,0.2)', borderRadius: 8 },
  
  body: { flex: 1, padding: 16 },
  sectionTitle: { fontSize: 18, fontWeight: 'bold', color: '#333', marginBottom: 16 },
  
  card: { 
    backgroundColor: '#FFF', borderRadius: 12, padding: 12, marginBottom: 12,
    flexDirection: 'row', alignItems: 'center',
    elevation: 2, shadowColor: '#000', shadowOpacity: 0.1, shadowRadius: 4, shadowOffset: {width:0, height:2}
  },
  cardImageContainer: { 
    width: 60, height: 60, backgroundColor: '#FFF3E0', 
    borderRadius: 8, justifyContent: 'center', alignItems: 'center', marginRight: 12 
  },
  cardContent: { flex: 1 },
  cardTitle: { fontSize: 16, fontWeight: 'bold', color: '#333' },
  cardDesc: { fontSize: 12, color: '#666', marginTop: 2 },
  cardCost: { fontSize: 14, fontWeight: 'bold', color: '#EF6C00', marginTop: 4 },
  
  redeemBtn: { backgroundColor: '#2E7D32', paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20 },
  disabledBtn: { backgroundColor: '#CCC' },
  redeemBtnText: { color: '#FFF', fontWeight: 'bold', fontSize: 12 },
});

export default RedeemPointsScreen;