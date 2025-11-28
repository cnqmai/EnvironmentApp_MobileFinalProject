import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Dimensions } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';

const { width } = Dimensions.get('window');
const ITEM_WIDTH = (width - 40 - 15) / 2;

const MapFilterScreen = () => {
  const router = useRouter();
  const [selectedTypes, setSelectedTypes] = useState(['all']);
  
  const wasteTypes = [
    { id: 'all', label: 'Tất cả', icon: 'check-all' }, // ID đặc biệt
    { id: 'organic', label: 'Rác hữu cơ', icon: 'food-apple-outline' },
    { id: 'recycle', label: 'Rác tái chế', icon: 'recycle' },
    { id: 'hazardous', label: 'Rác nguy hại', icon: 'alert-outline' },
    { id: 'electronic', label: 'Rác điện tử', icon: 'laptop' },
    { id: 'glass', label: 'Rác thủy tinh', icon: 'bottle-wine-outline' },
  ];

  const toggleType = (id) => {
    if (id === 'all') {
      setSelectedTypes(['all']);
      return;
    }

    let newTypes = [...selectedTypes];
    if (newTypes.includes('all')) {
        newTypes = []; // Bỏ 'all' nếu chọn cái khác
    }

    if (newTypes.includes(id)) {
      newTypes = newTypes.filter(t => t !== id);
    } else {
      newTypes.push(id);
    }

    // Nếu không chọn gì thì mặc định về 'all'
    if (newTypes.length === 0) newTypes = ['all'];
    
    setSelectedTypes(newTypes);
  };

  const handleApply = () => {
    // Truyền tham số filter về màn hình Map
    router.replace({
        pathname: '/map/map',
        params: { filter: JSON.stringify(selectedTypes) }
    });
  };

  return (
    <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <MaterialCommunityIcons name="close" size={28} color="#000" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Bộ lọc bản đồ</Text>
        <TouchableOpacity onPress={() => setSelectedTypes(['all'])}>
            <Text style={styles.resetText}>Đặt lại</Text>
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.sectionLabel}>Loại rác thu gom</Text>
        <View style={styles.gridContainer}>
          {wasteTypes.map((item) => {
              const isSelected = selectedTypes.includes(item.id);
              return (
                  <TouchableOpacity 
                      key={item.id} 
                      style={[styles.gridItem, isSelected && styles.gridItemActive]}
                      onPress={() => toggleType(item.id)}
                  >
                      {item.icon && (
                          <MaterialCommunityIcons 
                            name={item.icon} 
                            size={24} 
                            color={isSelected ? "#00C853" : "#666"} 
                            style={{ marginBottom: 8 }} 
                          />
                      )}
                      <Text style={[styles.itemLabel, isSelected && styles.itemLabelActive]}>
                        {item.label}
                      </Text>
                      {isSelected && (
                          <View style={styles.checkIcon}>
                              <MaterialCommunityIcons name="check-circle" size={20} color="#00C853" />
                          </View>
                      )}
                  </TouchableOpacity>
              )
          })}
        </View>
        
        {/* Section 2: Bán kính tìm kiếm */}
        <Text style={[styles.sectionLabel, { marginTop: 30 }]}>Bán kính tìm kiếm</Text>
        
        {/* Fake Slider Visualization */}
        <View style={styles.sliderContainer}>
          <View style={styles.sliderLabels}>
              <Text style={styles.sliderText}>1{'\n'}km</Text>
              <Text style={styles.sliderText}>5{'\n'}km</Text>
              <Text style={styles.sliderText}>10{'\n'}km</Text>
              <Text style={styles.sliderText}>20+{'\n'}km</Text>
          </View>
          <View style={styles.track}>
              <View style={[styles.trackFill, { width: '35%' }]} /> 
              <View style={[styles.thumb, { left: '35%' }]} />
          </View>
          <Text style={styles.currentRadius}>Bán kính: 5 km</Text>
        </View>

        {/* Section 3: Trạng thái */}
        <Text style={[styles.sectionLabel, { marginTop: 20 }]}>Trạng thái</Text>
        <View style={styles.rowStatus}>
          <TouchableOpacity style={[styles.statusCard, styles.statusActive]}>
               <View style={styles.checkboxBlack}>
                  <MaterialCommunityIcons name="check" size={14} color="#FFF" />
               </View>
               <Text style={styles.statusText}>Đang mở cửa</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.statusCard}>
               <View style={styles.checkboxEmpty} />
               <Text style={styles.statusText}>Mở cửa 24/7</Text>
          </TouchableOpacity>
        </View>

      </ScrollView>

      {/* Footer Button */}
      <View style={styles.footer}>
        <TouchableOpacity style={styles.applyBtn} onPress={handleApply}>
            <Text style={styles.applyBtnText}>Áp dụng ({selectedTypes.includes('all') ? 'Tất cả' : selectedTypes.length})</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FFF' },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 20, borderBottomWidth: 1, borderBottomColor: '#F0F0F0' },
  headerTitle: { fontSize: 20, fontWeight: 'bold' },
  resetText: { fontSize: 16, color: '#666' },
  content: { padding: 20 },
  sectionLabel: { fontSize: 16, fontWeight: 'bold', marginBottom: 15, color: '#333' },
  
  gridContainer: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', gap: 12 },
  gridItem: {
    width: ITEM_WIDTH, height: 90, alignItems: 'center', justifyContent: 'center',
    borderRadius: 16, borderWidth: 1.5, borderColor: '#F0F0F0', backgroundColor: '#FAFAFA',
    position: 'relative'
  },
  gridItemActive: { borderColor: '#00C853', backgroundColor: '#F1F8E9' },
  itemLabel: { fontSize: 14, color: '#666', fontWeight: '500' },
  itemLabelActive: { color: '#00C853', fontWeight: 'bold' },
  checkIcon: { position: 'absolute', top: 8, right: 8 },

  // Slider Styles
  sliderContainer: { marginBottom: 20 },
  sliderLabels: { flexDirection: 'row', justifyContent: 'space-between', paddingHorizontal: 5, marginBottom: 10 },
  sliderText: { fontSize: 12, color: '#666', textAlign: 'center' },
  track: { height: 6, backgroundColor: '#E0E0E0', borderRadius: 3, position: 'relative', marginHorizontal: 10 },
  trackFill: { height: 6, backgroundColor: '#007AFF', borderRadius: 3 },
  thumb: { width: 20, height: 20, borderRadius: 10, backgroundColor: '#333', position: 'absolute', top: -7, borderWidth: 2, borderColor: '#FFF' },
  currentRadius: { marginTop: 15, color: '#666' },

  // Status Styles
  rowStatus: { flexDirection: 'row', gap: 15 },
  statusCard: { flex: 1, height: 60, flexDirection: 'row', alignItems: 'center', paddingHorizontal: 15, borderRadius: 8, borderWidth: 1, borderColor: '#DDD' },
  statusActive: { borderColor: '#00C853', backgroundColor: '#E8F5E9' },
  statusText: { fontSize: 14, color: '#333' },
  checkboxEmpty: { width: 20, height: 20, borderRadius: 4, borderWidth: 1, borderColor: '#CCC', marginRight: 10 },
  checkboxBlack: { width: 20, height: 20, borderRadius: 4, backgroundColor: '#000', marginRight: 10, justifyContent: 'center', alignItems: 'center' },

  footer: { padding: 20, borderTopWidth: 1, borderTopColor: '#F0F0F0' },
  applyBtn: { backgroundColor: '#000', paddingVertical: 16, borderRadius: 30, alignItems: 'center' },
  applyBtnText: { color: '#FFF', fontSize: 16, fontWeight: 'bold' },
});

export default MapFilterScreen;