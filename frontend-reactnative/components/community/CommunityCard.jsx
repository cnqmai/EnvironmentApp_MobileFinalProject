import React from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { Card, Text, Button, Avatar, Chip } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import typography from '../../styles/typography';

const CommunityCard = ({ group, onPress }) => {
  // Dữ liệu giả lập phòng trường hợp group bị null
  const { 
    name = "Tên cộng đồng", 
    description = "Mô tả cộng đồng...", 
    memberCount = 0, 
    areaName = "Toàn quốc",
    imageUrl
  } = group || {};

  return (
    <Card style={styles.card} onPress={onPress}>
      <Card.Content>
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            {imageUrl ? (
              <Avatar.Image size={48} source={{ uri: imageUrl }} />
            ) : (
              <Avatar.Icon size={48} icon="account-group" style={{ backgroundColor: '#e0e0e0' }} />
            )}
            <View style={styles.headerText}>
              <Text style={[typography.h3, styles.title]} numberOfLines={1}>
                {name}
              </Text>
              <View style={styles.metaRow}>
                <MaterialCommunityIcons name="map-marker" size={14} color="#666" />
                <Text style={[typography.small, styles.metaText]}>{areaName}</Text>
                
                <View style={styles.dot} />
                
                <MaterialCommunityIcons name="account" size={14} color="#666" />
                <Text style={[typography.small, styles.metaText]}>{memberCount} thành viên</Text>
              </View>
            </View>
          </View>
        </View>

        {description ? (
          <Text style={[typography.body, styles.description]} numberOfLines={2}>
            {description}
          </Text>
        ) : null}
      </Card.Content>

      <Card.Actions style={styles.actions}>
        <Button 
          mode="contained" 
          onPress={onPress} 
          style={styles.joinButton}
          labelStyle={{ fontSize: 12 }}
          compact
        >
          Tham gia
        </Button>
      </Card.Actions>
    </Card>
  );
};

const styles = StyleSheet.create({
  card: {
    marginBottom: 12,
    borderRadius: 12,
    backgroundColor: '#fff',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  headerText: {
    marginLeft: 12,
    flex: 1,
  },
  title: {
    fontWeight: 'bold',
    marginBottom: 2,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  metaText: {
    color: '#666',
    marginLeft: 2,
    marginRight: 8,
    fontSize: 12,
  },
  dot: {
    width: 3,
    height: 3,
    borderRadius: 1.5,
    backgroundColor: '#999',
    marginRight: 8,
  },
  description: {
    color: '#555',
    marginTop: 4,
    fontSize: 13,
  },
  actions: {
    justifyContent: 'flex-end',
    paddingTop: 0,
    paddingBottom: 8,
    paddingRight: 16,
  },
  joinButton: {
    borderRadius: 20,
    backgroundColor: '#007bff', // Màu chủ đạo của app
  }
});

export default CommunityCard;