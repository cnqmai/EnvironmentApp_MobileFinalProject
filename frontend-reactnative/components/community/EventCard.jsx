import React from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { Card, Text, Button } from 'react-native-paper';
import { useRouter } from 'expo-router';
// Import typography để đồng bộ font chữ với cả app
import typography from '../../styles/typography'; 

const EventCard = ({ event, onPress }) => {
  // Dữ liệu giả lập phòng trường hợp event bị null
  const { 
    title = "Tên sự kiện", 
    date = "Ngày giờ chưa xác định", 
    location = "Địa điểm", 
    imageUrl, 
    description 
  } = event || {};

  return (
    <Card style={styles.card} onPress={onPress}>
      {/* Nếu có ảnh thì hiển thị, không thì thôi hoặc dùng ảnh mặc định */}
      {imageUrl ? (
        <Card.Cover source={{ uri: imageUrl }} style={styles.image} />
      ) : (
        <Card.Cover source={{ uri: 'https://via.placeholder.com/300x150' }} style={styles.image} />
      )}
      
      <Card.Content style={styles.content}>
        <Text style={[typography.h3, styles.title]} numberOfLines={2}>
          {title}
        </Text>
        
        <View style={styles.infoRow}>
          <Text style={[typography.small, styles.date]}>{date}</Text>
        </View>
        
        <Text style={[typography.body, styles.location]} numberOfLines={1}>
          📍 {location}
        </Text>
        
        {description && (
          <Text style={[typography.small, styles.description]} numberOfLines={2}>
            {description}
          </Text>
        )}
      </Card.Content>

      <Card.Actions>
        <Button mode="text" onPress={onPress}>Chi tiết</Button>
      </Card.Actions>
    </Card>
  );
};

const styles = StyleSheet.create({
  card: {
    marginBottom: 16,
    borderRadius: 12,
    backgroundColor: '#fff',
    elevation: 3, // Bóng đổ cho Android
    shadowColor: '#000', // Bóng đổ cho iOS
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    overflow: 'hidden',
  },
  image: {
    height: 150,
  },
  content: {
    marginTop: 10,
  },
  title: {
    fontWeight: 'bold',
    marginBottom: 4,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  date: {
    color: '#666',
    fontWeight: '600',
  },
  location: {
    color: '#444',
    marginBottom: 8,
  },
  description: {
    color: '#777',
  },
});

export default EventCard;