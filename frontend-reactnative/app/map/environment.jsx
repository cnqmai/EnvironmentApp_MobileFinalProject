import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { MaterialCommunityIcons, FontAwesome5, Feather } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';

const EnvironmentDataScreen = () => {
  const router = useRouter();

  return (
    <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
      {/* Header with Back Button */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <MaterialCommunityIcons name="arrow-left" size={28} color="#000" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Dữ liệu môi trường</Text>
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {/* Main AQI Card */}
        <View style={styles.mainCard}>
          <Text style={styles.mainTitle}>Chỉ số AQI tại vị trí của bạn</Text>
          <Text style={styles.mainValue}>75</Text>
          <View style={styles.statusBadge}>
              <Text style={styles.statusText}>Chất lượng không khí: Tốt</Text>
          </View>
          {/* Background Decoration */}
          <MaterialCommunityIcons name="cloud-outline" size={150} color="rgba(255,255,255,0.1)" style={styles.bgIcon} />
        </View>

        {/* Small Stats Cards */}
        <View style={styles.statsRow}>
          <View style={styles.statCard}>
              <Text style={styles.statLabel}>Nhiệt độ</Text>
              <Text style={styles.statValue}>28°C</Text>
          </View>
          <View style={styles.statCard}>
              <MaterialCommunityIcons name="water-drop" size={20} color="#000" style={{marginBottom: 5}}/>
              <Text style={styles.statLabel}>Độ ẩm</Text>
              <Text style={styles.statValue}>75%</Text>
          </View>
          <View style={styles.statCard}>
              <Text style={styles.statLabel}>Gió</Text>
              <Text style={styles.statValue}>12{'\n'}km/h</Text>
          </View>
        </View>

        {/* List by Area */}
        <Text style={styles.sectionTitle}>Chỉ số theo khu vực</Text>

        <TouchableOpacity style={styles.areaCard}>
          <View style={styles.areaInfo}>
              <Text style={styles.areaName}>Gò Vấp,{'\n'}TP. Hồ Chí Minh</Text>
              <Text style={styles.areaStatus}>Bụi mịn thấp</Text>
          </View>
          <View style={styles.aqiBox}>
              <Text style={styles.aqiSmallVal}>50</Text>
              <Text style={styles.aqiLabel}>AQI</Text>
          </View>
        </TouchableOpacity>

        <TouchableOpacity style={styles.areaCard}>
          <View style={styles.areaInfo}>
              <Text style={styles.areaName}>Quận 1,{'\n'}TP. Hồ Chí Minh</Text>
              <Text style={styles.areaStatus}>Bụi mịn thấp</Text>
          </View>
          <View style={styles.aqiBox}>
              <Text style={styles.aqiSmallVal}>50</Text>
              <Text style={styles.aqiLabel}>AQI</Text>
          </View>
        </TouchableOpacity>

      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FFF' },
  
  // Header Styles
  header: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    paddingHorizontal: 20, 
    paddingTop: 10, 
    paddingBottom: 10 
  },
  backBtn: { marginRight: 15 },
  headerTitle: { fontSize: 24, fontWeight: '500', color: '#000', flex: 1 },

  content: { padding: 24 },

  // Main Card
  mainCard: { 
    backgroundColor: '#00C853', borderRadius: 16, padding: 24, height: 180, 
    justifyContent: 'space-between', marginBottom: 24, position: 'relative', overflow: 'hidden' 
  },
  mainTitle: { fontSize: 18, color: '#FFF', opacity: 0.9 },
  mainValue: { fontSize: 48, color: '#FFF', fontWeight: 'bold' },
  statusBadge: { backgroundColor: 'rgba(255,255,255,0.2)', alignSelf: 'flex-start', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 8 },
  statusText: { color: '#FFF', fontSize: 12, fontWeight: '600' },
  bgIcon: { position: 'absolute', right: -20, bottom: -20 },

  // Stats Row
  statsRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 30 },
  statCard: { 
    width: '30%', backgroundColor: '#F9F9F9', borderRadius: 12, paddingVertical: 20, 
    alignItems: 'center', justifyContent: 'center' 
  },
  statLabel: { fontSize: 12, color: '#666', marginBottom: 8 },
  statValue: { fontSize: 18, color: '#000', fontWeight: '500', textAlign: 'center' },

  // Area List
  sectionTitle: { fontSize: 20, fontWeight: '500', color: '#000', marginBottom: 16 },
  areaCard: { 
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', 
    borderWidth: 1, borderColor: '#999', borderRadius: 16, padding: 20, marginBottom: 16 
  },
  areaName: { fontSize: 18, fontWeight: 'bold', color: '#000', marginBottom: 6 },
  areaStatus: { fontSize: 13, color: '#00C853', fontStyle: 'italic' },
  
  aqiBox: { 
    width: 70, height: 70, borderRadius: 16, borderWidth: 1, borderColor: '#000', 
    justifyContent: 'center', alignItems: 'center' 
  },
  aqiSmallVal: { fontSize: 20, fontWeight: 'bold', color: '#00C853' },
  aqiLabel: { fontSize: 10, fontWeight: 'bold', color: '#000' },
});

export default EnvironmentDataScreen;