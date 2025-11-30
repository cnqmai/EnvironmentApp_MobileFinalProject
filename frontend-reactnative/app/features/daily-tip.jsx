import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';

const DailyTipScreen = () => {
  const [isDone, setIsDone] = useState(false);

  const handleDone = () => {
    setIsDone(!isDone);
    // Có thể gọi API cộng điểm ở đây
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.scrollContent}>
      
      {/* Header Info */}
      <View style={styles.headerCenter}>
        <View style={styles.iconCircle}>
           <MaterialCommunityIcons name="lightbulb-on" size={32} color="#FFD600" />
        </View>
        <Text style={styles.dateText}>Thứ Tư, 15 Tháng 10, 2025</Text>
      </View>

      {/* Main Card */}
      <View style={styles.card}>
        <View style={styles.cardHeader}>
          {/* Tag */}
          <View style={styles.tagContainer}>
             <Text style={styles.tagText}>MUA SẮM</Text>
          </View>
        </View>

        <Text style={styles.cardTitle}>Mang túi vải đi chợ</Text>
        
        <Text style={styles.cardDesc}>
          Giảm sử dụng túi ni lông là cách đơn giản nhất để bảo vệ môi trường. 
          Mỗi năm, hàng triệu túi ni lông bị vứt bỏ, gây ô nhiễm đất và đại dương.
        </Text>

        {/* Impact Section */}
        <View style={styles.impactBox}>
          <Text style={styles.impactLabel}>Tác động tích cực:</Text>
          
          <View style={styles.impactItem}>
            <MaterialCommunityIcons name="leaf" size={20} color="#388E3C" />
            <Text style={styles.impactText}>Giảm 1000 túi ni lông/năm</Text>
          </View>
          
          <View style={styles.impactItem}>
            <MaterialCommunityIcons name="piggy-bank" size={20} color="#388E3C" />
            <Text style={styles.impactText}>Tiết kiệm chi phí mua túi</Text>
          </View>
          
          <View style={styles.impactItem}>
            <MaterialCommunityIcons name="waves" size={20} color="#388E3C" />
            <Text style={styles.impactText}>Bảo vệ sinh vật biển</Text>
          </View>
        </View>

        {/* Action Button */}
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
            {isDone ? "Đã thực hiện hôm nay" : "Đánh dấu đã làm"}
          </Text>
        </TouchableOpacity>
      </View>

      {/* Footer / Other tips */}
      <Text style={styles.sectionTitle}>Các mẹo khác</Text>
      <View style={styles.otherTipCard}>
        <View style={[styles.miniIcon, { backgroundColor: '#E3F2FD' }]}>
           <MaterialCommunityIcons name="water-off" size={20} color="#1976D2" />
        </View>
        <View style={{flex: 1}}>
           <Text style={styles.otherTipTitle}>Tắt vòi nước khi đánh răng</Text>
           <Text style={styles.otherTipSub}>Tiết kiệm nước</Text>
        </View>
        <MaterialCommunityIcons name="chevron-right" size={24} color="#999" />
      </View>

    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F0EFED' },
  scrollContent: { padding: 20, paddingBottom: 40 },
  
  headerCenter: { alignItems: 'center', marginBottom: 20 },
  iconCircle: { width: 60, height: 60, borderRadius: 30, backgroundColor: '#FFF', justifyContent: 'center', alignItems: 'center', marginBottom: 10, elevation: 2 },
  dateText: { fontSize: 14, color: '#666', fontWeight: '500' },

  card: { backgroundColor: '#FFF', borderRadius: 24, padding: 24, marginBottom: 30, elevation: 4, shadowColor: '#000', shadowOpacity: 0.1, shadowRadius: 10 },
  cardHeader: { flexDirection: 'row', justifyContent: 'flex-start', marginBottom: 16 },
  tagContainer: { backgroundColor: '#E8F5E9', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 8 },
  tagText: { fontSize: 12, fontWeight: 'bold', color: '#2E7D32' },
  
  cardTitle: { fontSize: 22, fontWeight: 'bold', color: '#111', marginBottom: 12 },
  cardDesc: { fontSize: 16, color: '#444', lineHeight: 24, marginBottom: 24 },

  impactBox: { backgroundColor: '#F9F9F9', borderRadius: 16, padding: 16, marginBottom: 24 },
  impactLabel: { fontSize: 14, fontWeight: 'bold', color: '#333', marginBottom: 12 },
  impactItem: { flexDirection: 'row', alignItems: 'center', marginBottom: 10 },
  impactText: { marginLeft: 10, fontSize: 14, color: '#333' },

  actionBtn: { backgroundColor: '#111', flexDirection: 'row', justifyContent: 'center', alignItems: 'center', paddingVertical: 16, borderRadius: 16 },
  actionBtnDone: { backgroundColor: '#2E7D32' },
  actionBtnText: { color: '#FFF', fontSize: 16, fontWeight: 'bold' },

  sectionTitle: { fontSize: 18, fontWeight: 'bold', color: '#111', marginBottom: 15 },
  otherTipCard: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#FFF', padding: 16, borderRadius: 16, elevation: 1 },
  miniIcon: { width: 40, height: 40, borderRadius: 20, justifyContent: 'center', alignItems: 'center', marginRight: 16 },
  otherTipTitle: { fontSize: 16, fontWeight: '600', color: '#111' },
  otherTipSub: { fontSize: 13, color: '#666' },
});

export default DailyTipScreen;