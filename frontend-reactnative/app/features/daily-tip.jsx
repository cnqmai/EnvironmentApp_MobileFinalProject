import React, { useState, useEffect, useContext } from 'react'; 
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator, Alert } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';

// BƯỚC 1: XÓA IMPORT BỊ LỖI
// import { AuthContext } from '../../src/utils/auth-context'; // ĐÃ XÓA
import { API_BASE_URL } from '../../src/constants/api';
import { fetchWithAuth } from '../../src/utils/apiHelper';
import { claimDailyTipReward } from '../../src/services/dailyTipService'; // Import service function

const DailyTipScreen = () => {
  // BƯỚC 2: MOCK USER CHO MỤC ĐÍCH TEST API
  // Vui lòng thay thế 'MOCK_USER_ID_FOR_TEST' bằng ID thực của người dùng khi đã có AuthContext
  const user = { 
    id: 'd9b048d0-60a3-4876-92c9-a9a7d3c0b111', // Dùng một UUID hợp lệ, giả lập người dùng đã đăng nhập
    // Nếu bạn muốn test với một user cụ thể, hãy thay thế UUID này.
    // Đã xóa: const { user } = useContext(AuthContext);
  };
  
  const [tip, setTip] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isDone, setIsDone] = useState(false);

  useEffect(() => {
    loadTip();
  }, [user.id]); // Re-load khi User ID thay đổi (nếu có AuthContext thật)

  const loadTip = async () => {
    const url = `${API_BASE_URL}/daily-tips/today`;
    
    try {
      setLoading(true);
      const response = await fetchWithAuth(url, { method: 'GET' });
      
      if (response.status === 404 || response.status === 204) {
        setTip(null);
        return;
      }

      if (response.ok) {
        const data = await response.json();
        setTip(data);
        
        // Kiểm tra xem người dùng đã claim phần thưởng chưa (gọi endpoint claim với method POST)
        // Đây là cách duy nhất để xác định trạng thái hoàn thành trong logic mới
        if (user.id) {
            try {
                // Thử claim ngay lập tức (nếu thất bại với 403, tức là đã hoàn thành)
                await claimDailyTipReward(user.id);
                // Nếu thành công (không ném lỗi 403), tức là chưa hoàn thành.
                setIsDone(false);
            } catch (error) {
                // Nếu lỗi là 403 (Forbidden), tức là đã hoàn thành hôm nay.
                if (error.message.includes("already been claimed")) {
                    setIsDone(true);
                } else {
                    // Lỗi khác (ví dụ: lỗi mạng), coi là chưa hoàn thành.
                    setIsDone(false);
                }
            }
        }
        
      } else {
        console.warn("API Error:", response.status);
      }
    } catch (error) {
      console.error("❌ Error loading tip:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleDone = async () => {
    // Đảm bảo có ID người dùng để gửi yêu cầu
    if (isDone || !tip?.id || !user?.id) {
        Alert.alert("Lỗi", "Không có thông tin người dùng hoặc mẹo.");
        return;
    }

    try {
      // GỌI HÀM CLAIM MỚI VÀ DÙNG USER ID
      const rewardResult = await claimDailyTipReward(user.id); 

      // Nếu không có lỗi ném ra, việc claim thành công
      setIsDone(true);
      Alert.alert("Tuyệt vời!", `Bạn đã nhận được +${rewardResult.pointsReward || 10} điểm xanh!`);

    } catch (error) {
      console.error(error);
      // Xử lý lỗi 403 (Đã claim)
      Alert.alert("Thông báo", error.message || "Vui lòng kiểm tra kết nối internet."); 
      // Nếu lỗi là đã claim, cập nhật trạng thái UI
      if (error.message.includes("already been claimed")) {
          setIsDone(true);
      }
    }
  };

  if (loading) return (
    <View style={[styles.container, styles.centered]}>
        <ActivityIndicator size="large" color="#2E7D32" />
        <Text style={{marginTop: 10, color: '#666'}}>Đang tìm mẹo hay...</Text>
    </View>
  );
  
  if (!tip) return (
    <View style={[styles.container, styles.centered]}>
        <MaterialCommunityIcons name="leaf-off" size={50} color="#CCC" />
        <Text style={{color: '#666', marginTop: 16, fontSize: 16}}>Hôm nay chưa có gợi ý nào mới!</Text>
        <TouchableOpacity onPress={loadTip} style={{marginTop: 20, padding: 10}}>
            <Text style={{color: '#2E7D32', fontWeight: 'bold'}}>Thử lại</Text>
        </TouchableOpacity>
    </View>
  );

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.scrollContent}>
      <View style={styles.headerCenter}>
        <View style={styles.iconCircle}>
           <MaterialCommunityIcons name="lightbulb-on" size={32} color="#FFD600" />
        </View>
        <Text style={styles.dateText}>Gợi ý hôm nay</Text>
      </View>

      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <View style={styles.tagContainer}>
             <Text style={styles.tagText}>{tip.category || 'MÔI TRƯỜNG'}</Text>
          </View>
          <View style={styles.pointsTag}>
             <Text style={styles.pointsTagText}>+{tip.pointsReward || 10} điểm</Text>
          </View>
        </View>

        <Text style={styles.cardTitle}>{tip.title}</Text>
        <Text style={styles.cardDesc}>{tip.description}</Text>

        <TouchableOpacity 
          style={[styles.actionBtn, isDone && styles.actionBtnDone]}
          onPress={handleDone}
          disabled={isDone}
        >
          <MaterialCommunityIcons 
            name={isDone ? "check-circle" : "checkbox-blank-circle-outline"} 
            size={24} color="#FFF" style={{ marginRight: 8 }} 
          />
          <Text style={styles.actionBtnText}>
            {isDone ? "Đã nhận điểm" : tip.actionText || "Đánh dấu đã làm"}
          </Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F0EFED' },
  scrollContent: { padding: 20 },
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  headerCenter: { alignItems: 'center', marginBottom: 20 },
  iconCircle: { width: 60, height: 60, borderRadius: 30, backgroundColor: '#FFF', justifyContent: 'center', alignItems: 'center', marginBottom: 10, elevation: 2 },
  dateText: { fontSize: 16, color: '#666', fontWeight: '500' },
  card: { backgroundColor: '#FFF', borderRadius: 24, padding: 24, elevation: 4 },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 16 },
  tagContainer: { backgroundColor: '#E8F5E9', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 8 },
  tagText: { fontSize: 12, fontWeight: 'bold', color: '#2E7D32', textTransform: 'uppercase' },
  pointsTag: { backgroundColor: '#FFF3E0', paddingHorizontal: 10, paddingVertical: 6, borderRadius: 8 },
  pointsTagText: { fontSize: 12, fontWeight: 'bold', color: '#EF6C00' },
  cardTitle: { fontSize: 22, fontWeight: 'bold', color: '#111', marginBottom: 12 },
  cardDesc: { fontSize: 16, color: '#444', lineHeight: 24, marginBottom: 24 },
  actionBtn: { backgroundColor: '#111', flexDirection: 'row', justifyContent: 'center', alignItems: 'center', paddingVertical: 16, borderRadius: 16 },
  actionBtnDone: { backgroundColor: '#2E7D32' },
  actionBtnText: { color: '#FFF', fontSize: 16, fontWeight: 'bold' },
});

export default DailyTipScreen;