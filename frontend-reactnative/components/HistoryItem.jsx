import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Text } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import typography from '../styles/typography';

const HistoryItem = ({ 
  title = "Giao dịch", 
  date = "Vừa xong", 
  points = 0, 
  type = "earn" // 'earn' (cộng) hoặc 'redeem' (trừ)
}) => {
  // Xác định điểm dương hay âm để đổi màu
  const isPositive = points > 0;
  
  return (
    <View style={styles.container}>
      <View style={styles.leftSection}>
        {/* Icon tròn bên trái */}
        <View style={[
          styles.iconBox, 
          { backgroundColor: isPositive ? '#E8F5E9' : '#FFEBEE' } // Xanh lá nhạt hoặc Đỏ nhạt
        ]}>
          <MaterialCommunityIcons 
            name={isPositive ? "arrow-down-left" : "gift-outline"} 
            size={24} 
            color={isPositive ? "#4CAF50" : "#F44336"} 
          />
        </View>
        
        {/* Thông tin Text */}
        <View style={styles.info}>
          <Text style={[typography.body, styles.title]} numberOfLines={1}>
            {title}
          </Text>
          <Text style={[typography.small, styles.date]}>
            {date}
          </Text>
        </View>
      </View>
      
      {/* Số điểm (+100 hoặc -500) */}
      <Text style={[
        styles.points, 
        { color: isPositive ? "#4CAF50" : "#F44336" }
      ]}>
        {isPositive ? "+" : ""}{points}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  leftSection: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  iconBox: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  info: {
    flex: 1,
  },
  title: {
    fontWeight: '600',
    color: '#333',
    marginBottom: 2,
  },
  date: {
    color: '#999',
    fontSize: 12,
  },
  points: {
    fontWeight: 'bold',
    fontSize: 16,
  }
});

export default HistoryItem;