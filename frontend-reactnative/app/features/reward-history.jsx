import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
// Import đúng đường dẫn
import { getRewardHistory } from '../../src/services/rewardService';

const RewardHistoryScreen = () => {
  const router = useRouter();
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadHistory();
  }, []);

  const loadHistory = async () => {
    try {
      const data = await getRewardHistory();
      setHistory(data || []);
    } catch (error) {
      console.error("Lỗi tải lịch sử:", error);
    } finally {
      setLoading(false);
    }
  };

  const renderItem = ({ item }) => (
    <View style={styles.card}>
      <View style={[styles.iconBox, item.status === 'PENDING' ? styles.pending : styles.success]}>
        <MaterialCommunityIcons 
            name={item.status === 'PENDING' ? "clock-outline" : "check-circle-outline"} 
            size={24} 
            color="#FFF" 
        />
      </View>
      <View style={styles.info}>
        {/* Xử lý null safety cho reward */}
        <Text style={styles.rewardName}>{item.reward ? item.reward.name : 'Phần thưởng'}</Text>
        <Text style={styles.date}>
            {new Date(item.redeemedAt).toLocaleDateString('vi-VN')}
        </Text>
        <Text style={styles.cost}>-{item.reward ? item.reward.pointsCost : 0} điểm</Text>
      </View>
      <View style={styles.statusTag}>
        <Text style={styles.statusText}>
            {item.status === 'PENDING' ? 'Chờ duyệt' : 'Thành công'}
        </Text>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      {/* Header đơn giản có nút Back */}
      <View style={styles.header}>
        <MaterialCommunityIcons 
            name="arrow-left" size={24} color="#333" 
            onPress={() => router.back()} 
            style={{position: 'absolute', left: 16}}
        />
        <Text style={styles.headerTitle}>Lịch sử đổi quà</Text>
      </View>

      {loading ? (
        <ActivityIndicator size="large" color="#2E7D32" style={{ marginTop: 20 }} />
      ) : (
        <FlatList
          data={history}
          renderItem={renderItem}
          keyExtractor={(item) => item.id.toString()}
          contentContainerStyle={{ padding: 16 }}
          ListEmptyComponent={
            <Text style={styles.emptyText}>Bạn chưa đổi quà nào.</Text>
          }
        />
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F5F5F5' },
  header: { 
    padding: 16, backgroundColor: '#FFF', alignItems: 'center', justifyContent: 'center',
    borderBottomWidth: 1, borderBottomColor: '#E0E0E0', flexDirection: 'row'
  },
  headerTitle: { fontSize: 18, fontWeight: 'bold', color: '#333' },
  
  card: { flexDirection: 'row', backgroundColor: '#FFF', padding: 16, borderRadius: 12, marginBottom: 12, alignItems: 'center' },
  iconBox: { width: 48, height: 48, borderRadius: 24, justifyContent: 'center', alignItems: 'center', marginRight: 16 },
  pending: { backgroundColor: '#FF9800' },
  success: { backgroundColor: '#4CAF50' },
  
  info: { flex: 1 },
  rewardName: { fontSize: 16, fontWeight: 'bold', color: '#333' },
  date: { fontSize: 12, color: '#888', marginTop: 4 },
  cost: { fontSize: 14, color: '#E53935', fontWeight: 'bold', marginTop: 4 },
  
  statusTag: { paddingHorizontal: 8, paddingVertical: 4, backgroundColor: '#F0F0F0', borderRadius: 4 },
  statusText: { fontSize: 10, color: '#666', fontWeight: 'bold' },
  emptyText: { textAlign: 'center', marginTop: 30, color: '#999' }
});

export default RewardHistoryScreen;