// file: frontend-reactnative/app/features/daily-tip.jsx
import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator, Alert } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { getTodayTip, getAllDailyTips } from '../../src/services/dailyTipService';

const DailyTipScreen = () => {
  const [tip, setTip] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isDone, setIsDone] = useState(false);
  const [otherTips, setOtherTips] = useState([]);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      // Lấy tip hôm nay
      const todayData = await getTodayTip();
      setTip(todayData);

      // Lấy danh sách các tip khác
      const allData = await getAllDailyTips();
      // Lọc bỏ tip hiện tại
      const others = allData.filter(item => item.id !== todayData?.id).slice(0, 3);
      setOtherTips(others);

    } catch (error) {
      console.error("Lỗi tải Daily Tip:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleDone = () => {
    setIsDone(!isDone);
    if (!isDone) {
        // Backend có thể chưa có API POST /complete, hiển thị thông báo giả lập
        const points = tip?.pointsReward || 10;
        Alert.alert("Tuyệt vời!", `Bạn đã nhận được +${points} điểm xanh!`);
    }
  };

  const getCurrentDate = () => {
    const date = new Date();
    // Backend trả về displayDate dạng LocalDate (YYYY-MM-DD), có thể dùng để hiển thị nếu cần
    const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
    return date.toLocaleDateString('vi-VN', options);
  };

  if (loading) return <View style={[styles.container, styles.centered]}><ActivityIndicator size="large" color="#2E7D32" /></View>;
  if (!tip) return <View style={[styles.container, styles.centered]}><Text>Hôm nay chưa có gợi ý nào mới!</Text></View>;

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.scrollContent}>
      
      <View style={styles.headerCenter}>
        <View style={styles.iconCircle}>
           <MaterialCommunityIcons name="lightbulb-on" size={32} color="#FFD600" />
        </View>
        <Text style={styles.dateText}>{getCurrentDate()}</Text>
      </View>

      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <View style={styles.tagContainer}>
             <Text style={styles.tagText}>{tip.category || 'MÔI TRƯỜNG'}</Text>
          </View>
          {tip.pointsReward > 0 && (
             <View style={styles.pointsTag}>
                <Text style={styles.pointsTagText}>+{tip.pointsReward} điểm</Text>
             </View>
          )}
        </View>

        <Text style={styles.cardTitle}>{tip.title}</Text>
        
        {/* Backend dùng trường 'description' */}
        <Text style={styles.cardDesc}>
          {tip.description}
        </Text>

        <TouchableOpacity 
          style={[styles.actionBtn, isDone && styles.actionBtnDone]}
          onPress={handleDone}
          activeOpacity={0.8}
        >
          <MaterialCommunityIcons 
            name={isDone ? "check-circle" : "checkbox-blank-circle-outline"} 
            size={24} 
            color="#FFF" 
            style={{ marginRight: 8 }}
          />
          <Text style={styles.actionBtnText}>
            {isDone ? "Đã hoàn thành" : (tip.actionText || "Đánh dấu đã làm")}
          </Text>
        </TouchableOpacity>
      </View>

      {otherTips.length > 0 && (
          <>
            <Text style={styles.sectionTitle}>Các mẹo khác</Text>
            {otherTips.map((item) => (
                <View key={item.id} style={styles.otherTipCard}>
                    <View style={[styles.miniIcon, { backgroundColor: '#E3F2FD' }]}>
                        <MaterialCommunityIcons name="information-outline" size={20} color="#1976D2" />
                    </View>
                    <View style={{flex: 1}}>
                        <Text style={styles.otherTipTitle} numberOfLines={1}>{item.title}</Text>
                        <Text style={styles.otherTipSub} numberOfLines={1}>{item.category}</Text>
                    </View>
                </View>
            ))}
          </>
      )}

    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F0EFED' },
  scrollContent: { padding: 20, paddingBottom: 40 },
  centered: { justifyContent: 'center', alignItems: 'center', flex: 1 },
  headerCenter: { alignItems: 'center', marginBottom: 20 },
  iconCircle: { width: 60, height: 60, borderRadius: 30, backgroundColor: '#FFF', justifyContent: 'center', alignItems: 'center', marginBottom: 10, elevation: 2 },
  dateText: { fontSize: 14, color: '#666', fontWeight: '500', textTransform: 'capitalize' },
  card: { backgroundColor: '#FFF', borderRadius: 24, padding: 24, marginBottom: 30, elevation: 4 },
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
  sectionTitle: { fontSize: 18, fontWeight: 'bold', color: '#111', marginBottom: 15 },
  otherTipCard: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#FFF', padding: 16, borderRadius: 16, elevation: 1, marginBottom: 12 },
  miniIcon: { width: 40, height: 40, borderRadius: 20, justifyContent: 'center', alignItems: 'center', marginRight: 16 },
  otherTipTitle: { fontSize: 16, fontWeight: '600', color: '#111' },
  otherTipSub: { fontSize: 13, color: '#666' },
});

export default DailyTipScreen;