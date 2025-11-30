import React from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { Text, Avatar, IconButton } from 'react-native-paper';
import typography from '../styles/typography';

const EarnItem = ({ 
  title = "Nhiệm vụ", 
  points = 0, 
  icon = "star", 
  description, 
  onPress, 
  completed = false 
}) => {
  return (
    <TouchableOpacity 
      style={[styles.container, completed && styles.completedContainer]} 
      onPress={onPress}
      disabled={completed}
    >
      <View style={styles.leftSection}>
        <View style={[styles.iconBox, completed && styles.completedIconBox]}>
          <Avatar.Icon 
            size={40} 
            icon={completed ? "check" : icon} 
            style={{ backgroundColor: 'transparent' }} 
            color={completed ? "#fff" : "#007bff"}
          />
        </View>
        <View style={styles.textSection}>
          <Text style={[typography.h3, styles.title, completed && styles.completedText]}>
            {title}
          </Text>
          {description && (
            <Text style={[typography.small, styles.description]}>
              {description}
            </Text>
          )}
        </View>
      </View>

      <View style={styles.rightSection}>
        <View style={[styles.pointBadge, completed && styles.completedBadge]}>
          <Text style={[styles.pointText, completed && styles.completedPointText]}>
            +{points}
          </Text>
        </View>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 12,
    backgroundColor: '#fff',
    borderRadius: 12,
    marginBottom: 10,
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
  },
  completedContainer: {
    backgroundColor: '#F5F5F5',
    elevation: 0,
  },
  leftSection: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  iconBox: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#E3F2FD', // Light Blue
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  completedIconBox: {
    backgroundColor: '#4CAF50', // Green
  },
  textSection: {
    flex: 1,
  },
  title: {
    fontWeight: 'bold',
    fontSize: 16,
    color: '#333',
  },
  completedText: {
    color: '#888',
    textDecorationLine: 'line-through',
  },
  description: {
    color: '#666',
    fontSize: 12,
    marginTop: 2,
  },
  rightSection: {
    marginLeft: 8,
  },
  pointBadge: {
    backgroundColor: '#FFF8E1', // Light Yellow
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#FFC107',
  },
  completedBadge: {
    backgroundColor: '#EEE',
    borderColor: '#CCC',
  },
  pointText: {
    color: '#FF8F00',
    fontWeight: 'bold',
    fontSize: 14,
  },
  completedPointText: {
    color: '#999',
  }
});

export default EarnItem;