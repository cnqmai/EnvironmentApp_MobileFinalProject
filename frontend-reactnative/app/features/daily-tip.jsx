import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator, Alert } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';

// Import đúng đường dẫn
import { API_BASE_URL } from '../../src/constants/api';
import { fetchWithAuth } from '../../src/utils/apiHelper';

const DailyTipScreen = () => {
  const [tip, setTip] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isDone, setIsDone] = useState(false);

  useEffect(() => {
    loadTip();
  }, []);

  const loadTip = async () => {
    const url = `${API_BASE_URL}/daily-tips/today`;
    console.log("▶️ Đang tải Daily Tip từ:", url); // [DEBUG] Kiểm tra URL trong log

    try {
      setLoading(true);
      const response = await fetchWithAuth(url, { method: 'GET' });
      
      console.log("▶️ Daily Tip Status:", response.status); // [DEBUG]

      if (response.status === 204) {
        // 204 No Content: Không có dữ liệu nhưng không phải lỗi
        setTip(null);
        return;
      }

      if (response.ok) {
        const data = await response.json();
        setTip(data);
      } else {
        console.warn("API Error:", response.status);
      }
    } catch (error) {
      console.error("❌ Error loading tip:", error);
      // Không Alert lỗi mạng để tránh spam nếu user offline, chỉ log
    } finally {
      setLoading(false);
    }
  };

  const handleDone = async () => {
    if (isDone || !tip?.id) return;

    try {
      const response = await fetchWithAuth(`${API_BASE_URL}/daily-tips/${tip.id}/complete`, {
        method: 'POST'
      });

      if (response.ok) {
        setIsDone(true);
        Alert.alert("Tuyệt vời!", `Bạn đã nhận được +${tip.pointsReward || 10} điểm xanh!`);
      } else {
        Alert.alert("Lỗi", "Không thể ghi nhận hành động.");
      }
    } catch (error) {
      console.error(error);
      Alert.alert("Lỗi mạng", "Vui lòng kiểm tra kết nối internet.");
    }
  };

  if (loading) return (
    <View style={[styles.container, styles.centered]}>
        <ActivityIndicator size="large" color="#2E7D32" />
        <Text style={{marginTop: 10, color: '#666'}}>Đang tìm mẹo hay...</Text>
    </View>
  );
  
  if (!tip) return (
    <View style={[styles.container, styles.centered]}>
        <MaterialCommunityIcons name="leaf-off" size={50} color="#CCC" />
        <Text style={{color: '#666', marginTop: 16, fontSize: 16}}>Hôm nay chưa có gợi ý nào mới!</Text>
        <TouchableOpacity onPress={loadTip} style={{marginTop: 20, padding: 10}}>
            <Text style={{color: '#2E7D32', fontWeight: 'bold'}}>Thử lại</Text>
        </TouchableOpacity>
    </View>
  );

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.scrollContent}>
      <View style={styles.headerCenter}>
        <View style={styles.iconCircle}>
           <MaterialCommunityIcons name="lightbulb-on" size={32} color="#FFD600" />
        </View>
        <Text style={styles.dateText}>Gợi ý hôm nay</Text>
      </View>

      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <View style={styles.tagContainer}>
             <Text style={styles.tagText}>{tip.category || 'MÔI TRƯỜNG'}</Text>
          </View>
          <View style={styles.pointsTag}>
             <Text style={styles.pointsTagText}>+{tip.pointsReward || 10} điểm</Text>
          </View>
        </View>

        <Text style={styles.cardTitle}>{tip.title}</Text>
        <Text style={styles.cardDesc}>{tip.description}</Text>

        <TouchableOpacity 
          style={[styles.actionBtn, isDone && styles.actionBtnDone]}
          onPress={handleDone}
          disabled={isDone}
        >
          <MaterialCommunityIcons 
            name={isDone ? "check-circle" : "checkbox-blank-circle-outline"} 
            size={24} color="#FFF" style={{ marginRight: 8 }} 
          />
          <Text style={styles.actionBtnText}>
            {isDone ? "Đã nhận điểm" : "Đánh dấu đã làm"}
          </Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F0EFED' },
  scrollContent: { padding: 20 },
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  headerCenter: { alignItems: 'center', marginBottom: 20 },
  iconCircle: { width: 60, height: 60, borderRadius: 30, backgroundColor: '#FFF', justifyContent: 'center', alignItems: 'center', marginBottom: 10, elevation: 2 },
  dateText: { fontSize: 16, color: '#666', fontWeight: '500' },
  card: { backgroundColor: '#FFF', borderRadius: 24, padding: 24, elevation: 4 },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 16 },
  tagContainer: { backgroundColor: '#E8F5E9', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 8 },
  tagText: { fontSize: 12, fontWeight: 'bold', color: '#2E7D32', textTransform: 'uppercase' },
  pointsTag: { backgroundColor: '#FFF3E0', paddingHorizontal: 10, paddingVertical: 6, borderRadius: 8 },
  pointsTagText: { fontSize: 12, fontWeight: 'bold', color: '#EF6C00' },
  cardTitle: { fontSize: 22, fontWeight: 'bold', color: '#111', marginBottom: 12 },
  cardDesc: { fontSize: 16, color: '#444', lineHeight: 24, marginBottom: 24 },
  actionBtn: { backgroundColor: '#111', flexDirection: 'row', justifyContent: 'center', alignItems: 'center', paddingVertical: 16, borderRadius: 16 },
  actionBtnDone: { backgroundColor: '#2E7D32' },
  actionBtnText: { color: '#FFF', fontSize: 16, fontWeight: 'bold' },
});

export default DailyTipScreen;