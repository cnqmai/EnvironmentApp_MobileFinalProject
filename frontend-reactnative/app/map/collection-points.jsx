import React from 'react';
import { View, Text, StyleSheet, TextInput, ScrollView, TouchableOpacity } from 'react-native';
import { MaterialCommunityIcons, FontAwesome5, Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';

const CollectionPointsScreen = () => {
  const router = useRouter();

  const locations = [
    {
      id: 1,
      name: 'Trung tâm tái chế xanh',
      address: '123 Nguyễn Văn Linh, Q.7',
      distance: '1,2 km',
      type: 'Tất cả loại rác',
      phone: '0779137498',
      hours: '7:00 - 18:00',
      rating: 4.5,
    },
    {
      id: 2,
      name: 'Điểm thu gom EcoMart',
      address: '456 Lê Văn Việt, Q.9',
      distance: '2,5 km',
      type: 'Rác tái chế',
      phone: '0779137498',
      hours: '8:00 - 20:00',
      rating: 4.8,
    },
  ];

  return (
    <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
      {/* Header Title with Back Button */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <MaterialCommunityIcons name="arrow-left" size={28} color="#000" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Điểm thu gom gần bạn</Text>
      </View>

      {/* Search & Filter Bar */}
      <View style={styles.searchContainer}>
        <View style={styles.searchBox}>
          <Ionicons name="search" size={20} color="#999" style={{ marginLeft: 10 }} />
          <TextInput 
            style={styles.searchInput}
            placeholder="Tìm kiếm..."
            placeholderTextColor="#999"
          />
        </View>
        <TouchableOpacity style={styles.iconBtn} onPress={() => router.push('/map/filter')}>
           <MaterialCommunityIcons name="filter-variant" size={24} color="#333" />
        </TouchableOpacity>
        <TouchableOpacity style={styles.iconBtn}>
           <FontAwesome5 name="location-arrow" size={20} color="#333" />
        </TouchableOpacity>
      </View>

      {/* List */}
      <ScrollView contentContainerStyle={styles.listContent} showsVerticalScrollIndicator={false}>
        {locations.map((loc) => (
          <View key={loc.id} style={styles.card}>
            {/* Top Row: Icon + Name + Distance */}
            <View style={styles.cardTop}>
                <View style={styles.iconContainer}>
                    <MaterialCommunityIcons name="map-marker-outline" size={28} color="#00C853" />
                </View>
                <View style={styles.infoContainer}>
                    <Text style={styles.locName}>{loc.name}</Text>
                    <Text style={styles.locAddress}>{loc.address}</Text>
                </View>
                <View style={styles.distBadge}>
                    <Text style={styles.distText}>{loc.distance}</Text>
                </View>
            </View>

            {/* Tag */}
            <View style={styles.tagWrapper}>
                <Text style={styles.tagText}>{loc.type}</Text>
            </View>

            {/* Details */}
            <View style={styles.details}>
                <View style={styles.detailRow}>
                    <MaterialCommunityIcons name="phone-outline" size={18} color="#666" />
                    <Text style={styles.detailText}>{loc.phone}</Text>
                </View>
                <View style={styles.detailRow}>
                    <MaterialCommunityIcons name="clock-time-four-outline" size={18} color="#666" />
                    <Text style={styles.detailText}>{loc.hours}</Text>
                </View>
                <View style={styles.detailRow}>
                    <MaterialCommunityIcons name="star-outline" size={18} color="#666" />
                    <Text style={styles.detailText}>{loc.rating}/5</Text>
                </View>
            </View>

            {/* Buttons */}
            <View style={styles.btnRow}>
                <TouchableOpacity style={styles.btnBlack}>
                    <Text style={styles.btnBlackText}>Chỉ đường</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.btnOutline}>
                    <Text style={styles.btnOutlineText}>Gọi điện</Text>
                </TouchableOpacity>
            </View>
          </View>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FFF' },
  header: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    paddingHorizontal: 20, 
    paddingTop: 10, 
    paddingBottom: 10 
  }, 
  backBtn: { marginRight: 15 },
  headerTitle: { fontSize: 24, fontWeight: 'bold', color: '#000', flex: 1 },
  
  searchContainer: { flexDirection: 'row', paddingHorizontal: 20, gap: 10, marginBottom: 20 },
  searchBox: { flex: 1, flexDirection: 'row', alignItems: 'center', backgroundColor: '#F5F5F5', borderRadius: 8, height: 44 },
  searchInput: { flex: 1, marginLeft: 10, fontSize: 16 },
  iconBtn: { width: 44, height: 44, borderRadius: 8, borderWidth: 1, borderColor: '#EEE', justifyContent: 'center', alignItems: 'center' },

  listContent: { paddingHorizontal: 20, paddingBottom: 40 },
  card: {
    backgroundColor: '#FFF', borderRadius: 16, padding: 16, marginBottom: 20,
    borderWidth: 1, borderColor: '#F0F0F0',
    elevation: 2, shadowColor: '#000', shadowOffset: {width:0, height:2}, shadowOpacity: 0.05, shadowRadius: 4
  },
  cardTop: { flexDirection: 'row', alignItems: 'flex-start' },
  iconContainer: { marginRight: 12, marginTop: 4 },
  infoContainer: { flex: 1 },
  locName: { fontSize: 18, fontWeight: '600', color: '#000', marginBottom: 4 },
  locAddress: { fontSize: 14, color: '#666' },
  distBadge: { backgroundColor: '#E0F2F1', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 6 },
  distText: { color: '#00C853', fontSize: 12, fontWeight: 'bold' },

  tagWrapper: { alignSelf: 'flex-start', marginLeft: 40, marginTop: 8, borderWidth: 1, borderColor: '#EEE', borderRadius: 20, paddingHorizontal: 12, paddingVertical: 4 },
  tagText: { fontSize: 12, color: '#333' },

  details: { marginLeft: 40, marginTop: 12, gap: 8 },
  detailRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  detailText: { fontSize: 15, color: '#555' },

  btnRow: { flexDirection: 'row', marginTop: 20, gap: 12 },
  btnBlack: { flex: 1, backgroundColor: '#0A0A0A', height: 44, borderRadius: 8, justifyContent: 'center', alignItems: 'center' },
  btnBlackText: { color: '#FFF', fontWeight: '600', fontSize: 16 },
  btnOutline: { flex: 1, backgroundColor: '#FFF', height: 44, borderRadius: 8, justifyContent: 'center', alignItems: 'center', borderWidth: 1, borderColor: '#333' },
  btnOutlineText: { color: '#0A0A0A', fontWeight: '600', fontSize: 16 },
});

export default CollectionPointsScreen;