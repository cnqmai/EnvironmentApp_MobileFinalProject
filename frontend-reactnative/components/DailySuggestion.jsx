import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, Alert, ActivityIndicator } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { getRandomTip, completeTip } from '../src/services/dailyTipService';

const DailySuggestion = ({ onRefreshStats }) => {
  const [tip, setTip] = useState(null);
  const [loading, setLoading] = useState(true);
  const [completed, setCompleted] = useState(false);

  useEffect(() => {
    loadTip();
  }, []);

  const loadTip = async () => {
    try {
      setLoading(true);
      const data = await getRandomTip();
      setTip(data);
      setCompleted(false); // Reset trạng thái khi load tip mới
    } catch (error) {
      console.log("Error loading tip:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleComplete = async () => {
    if (!tip) return;
    try {
      await completeTip(tip.id);
      setCompleted(true);
      Alert.alert("Tuyệt vời! 🎉", "Bạn đã nhận được 10 điểm xanh.");
      
      // Gọi callback để refresh điểm số ở màn hình cha (nếu có)
      if (onRefreshStats) onRefreshStats(); 
      
    } catch (error) {
      Alert.alert("Lỗi", "Không thể ghi nhận điểm. Thử lại sau nhé!");
    }
  };

  if (loading) return <ActivityIndicator size="small" color="#4CAF50" />;
  if (!tip) return null;

  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <MaterialCommunityIcons name="lightbulb-on-outline" size={24} color="#FBC02D" />
        <Text style={styles.title}>Gợi ý hôm nay</Text>
      </View>
      
      <Text style={styles.tipTitle}>{tip.title}</Text>
      <Text style={styles.tipContent}>{tip.content}</Text>

      {completed ? (
        <View style={styles.completedBox}>
          <MaterialCommunityIcons name="check-circle" size={20} color="#4CAF50" />
          <Text style={styles.completedText}>Đã thực hiện (+10 điểm)</Text>
        </View>
      ) : (
        <View style={styles.actions}>
           <TouchableOpacity onPress={loadTip} style={styles.skipBtn}>
            <Text style={styles.skipText}>Gợi ý khác</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={handleComplete} style={styles.doneBtn}>
            <Text style={styles.doneText}>Tôi đã làm!</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#E8F5E9',
    borderRadius: 16,
    padding: 16,
    marginVertical: 10,
    borderWidth: 1,
    borderColor: '#C8E6C9'
  },
  header: { flexDirection: 'row', alignItems: 'center', marginBottom: 8 },
  title: { fontSize: 14, fontWeight: 'bold', color: '#2E7D32', marginLeft: 8 },
  tipTitle: { fontSize: 16, fontWeight: 'bold', color: '#333', marginBottom: 4 },
  tipContent: { fontSize: 14, color: '#555', lineHeight: 20, marginBottom: 12 },
  actions: { flexDirection: 'row', justifyContent: 'flex-end', gap: 10 },
  skipBtn: { paddingVertical: 8, paddingHorizontal: 12 },
  skipText: { color: '#757575', fontSize: 13 },
  doneBtn: { 
    backgroundColor: '#2E7D32', 
    paddingVertical: 8, 
    paddingHorizontal: 16, 
    borderRadius: 20,
    elevation: 2 
  },
  doneText: { color: '#fff', fontWeight: 'bold', fontSize: 13 },
  completedBox: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    justifyContent: 'center',
    backgroundColor: '#FFF',
    padding: 8,
    borderRadius: 8,
    alignSelf: 'flex-start'
  },
  completedText: { color: '#4CAF50', fontWeight: 'bold', marginLeft: 6 }
});

export default DailySuggestion;