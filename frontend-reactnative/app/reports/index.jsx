import React, { useState, useCallback } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, ActivityIndicator } from 'react-native';
import { useRouter, useFocusEffect } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialCommunityIcons } from '@expo/vector-icons'; // 1. Import Icon
import { getMyReports } from '../../src/services/reportService';

const ReportList = () => {
  const router = useRouter();
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);

  // Load lại danh sách mỗi khi quay lại màn hình này
  useFocusEffect(
    useCallback(() => {
      fetchReports();
    }, [])
  );

  const fetchReports = async () => {
    try {
      const data = await getMyReports();
      setReports(data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const normalizeStatus = (status) => {
    if (!status) return null;
    const statusStr = String(status).toUpperCase();
    switch (statusStr) {
      case 'RECEIVED':
        return 'RECEIVED';
      case 'IN_PROGRESS':
      case 'PROCESSING':
        return 'IN_PROGRESS';
      case 'RESOLVED':
      case 'COMPLETED':
        return 'RESOLVED';
      case 'REJECTED':
        return 'REJECTED';
      default:
        return statusStr;
    }
  };

  const getStatusColor = (status) => {
    switch (normalizeStatus(status)) {
      case 'RECEIVED': return '#757575';
      case 'IN_PROGRESS': return '#2196F3';
      case 'RESOLVED': return '#4CAF50';
      case 'REJECTED': return '#F44336';
      default: return '#757575';
    }
  };

  const getStatusText = (status) => {
    switch (normalizeStatus(status)) {
      case 'RECEIVED': return 'Đã gửi';
      case 'IN_PROGRESS': return 'Đang xử lý';
      case 'RESOLVED': return 'Hoàn thành';
      case 'REJECTED': return 'Đã từ chối';
      default: return 'Không xác định';
    }
  };

  const formatTime = (timeString) => {
    return new Date(timeString).toLocaleString('vi-VN', { 
      hour: '2-digit', minute: '2-digit', day: '2-digit', month: '2-digit', year: 'numeric' 
    });
  };

  const renderItem = ({ item }) => (
    <TouchableOpacity 
      style={styles.card} 
      onPress={() => router.push({
        pathname: `/reports/${item.id}`,
        params: { reportData: JSON.stringify(item) } 
      })}
    >
      <View style={styles.cardHeader}>
        <Text style={styles.cardTitle}>Báo cáo #{item.id}</Text>
        <Text style={[styles.statusText, { color: getStatusColor(item.status) }]}>
          {getStatusText(item.status)}
        </Text>
      </View>
      <Text style={styles.cardDescription} numberOfLines={1}>{item.description}</Text>
      <View style={styles.cardFooter}>
        <Text style={styles.detailLink}>Chi tiết</Text>
        <Text style={styles.dateText}>{formatTime(item.createdAt)}</Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      
      {/* 2. CẬP NHẬT HEADER: Thêm nút Back */}
      <View style={styles.header}>
        {/* Nút Back */}
        <TouchableOpacity 
          style={styles.backButton} 
          onPress={() => router.back()}
        >
          <MaterialCommunityIcons name="chevron-left" size={28} color="#000" />
        </TouchableOpacity>

        {/* Tiêu đề */}
        <Text style={styles.headerTitle}>Danh sách báo cáo</Text>

        {/* Nút Tạo Mới */}
        <TouchableOpacity 
          style={styles.createButton} 
          onPress={() => router.push('/reports/create')}
        >
          <Text style={styles.createButtonText}>+ Mới</Text>
        </TouchableOpacity>
      </View>

      {loading ? (
        <ActivityIndicator size="large" color="#4CAF50" style={{marginTop: 20}} />
      ) : (
        <FlatList
          data={reports}
          renderItem={renderItem}
          keyExtractor={item => item.id.toString()}
          contentContainerStyle={styles.listContent}
          ListEmptyComponent={<Text style={{textAlign: 'center', marginTop: 20}}>Chưa có báo cáo nào</Text>}
        />
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F5F5F5' },
  
  // Header Style mới
  header: { 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    alignItems: 'center', 
    paddingHorizontal: 20, 
    paddingVertical: 15,
    backgroundColor: '#F5F5F5' 
  },
  
  // Style nút Back (tròn trắng giống các màn khác)
  backButton: { 
    width: 40, 
    height: 40, 
    backgroundColor: '#fff', 
    borderRadius: 20, 
    justifyContent: 'center', 
    alignItems: 'center',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },

  headerTitle: { 
    fontSize: 20, // Giảm size chút để vừa với nút back
    fontWeight: 'bold',
    flex: 1, // Để tiêu đề chiếm khoảng trống giữa
    textAlign: 'center' 
  },

  createButton: { 
    backgroundColor: '#fff', 
    paddingHorizontal: 15, 
    paddingVertical: 8, 
    borderRadius: 20, 
    borderWidth: 1, 
    borderColor: '#4CAF50',
    justifyContent: 'center',
    alignItems: 'center',
    minWidth: 70,
  },

  createButtonText: { 
    color: '#4CAF50', 
    fontWeight: 'bold' 
  },
  
  listContent: { 
    paddingHorizontal: 20, 
    paddingBottom: 20 
  },

  card: { 
    backgroundColor: '#fff', 
    borderRadius: 12, 
    padding: 15, 
    marginBottom: 15, 
    elevation: 2 },

  cardHeader: { flexDirection: 'row', 
    justifyContent: 'space-between', 
    marginBottom: 5
  },

  cardTitle: { 
    fontSize: 16, 
    fontWeight: 'bold' 
  },

  statusText: { 
    fontSize: 14, 
    fontWeight: '600' },

  cardDescription: { 
    fontSize: 14, 
    color: '#333',
    marginBottom: 15 },

  cardFooter: { 
    flexDirection: 'row', 
    justifyContent: 'space-between' },

  detailLink: { 
    fontWeight: 'bold' 
  },

  dateText: { 
    fontSize: 12, 
    color: '#999' 
  }
  
});

export default ReportList;