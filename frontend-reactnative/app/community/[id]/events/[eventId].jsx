// File: app/community/[id]/events/[eventId].jsx (Đã chỉnh sửa để fetch data)

import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useState, useEffect } from "react"; 
import {
  ScrollView,
  Share,
  StyleSheet,
  TouchableOpacity,
  View,
  Alert, 
  ActivityIndicator, 
} from "react-native";
import { Text } from "react-native-paper";
import { SafeAreaView } from "react-native-safe-area-context";
import typography from "../../../../styles/typography";
// CẬP NHẬT IMPORT: Thêm fetchEventDetail
import { registerForCampaign, fetchEventDetail } from "../../../../src/services/campaignService"; 

// Helper function để format ngày giờ từ OffsetDateTime (giả định)
const formatDateTime = (offsetDateTime) => {
    if (!offsetDateTime) return { date: 'N/A', time: 'N/A' };
    try {
        const dateObj = new Date(offsetDateTime);
        const date = dateObj.toLocaleDateString('vi-VN');
        const time = dateObj.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' });
        return { date, time };
    } catch (e) {
        return { date: 'N/A', time: 'N/A' };
    }
};

const EventDetailScreen = () => {
  const router = useRouter();
  const { eventId } = useLocalSearchParams();
  
  const [event, setEvent] = useState(null); // Thay bằng null để fetch
  const [isRegistered, setIsRegistered] = useState(false);
  const [loading, setLoading] = useState(true); // Bắt đầu bằng loading
  const [isRegistering, setIsRegistering] = useState(false); // State cho nút đăng ký

  // --- LOGIC FETCH EVENT DETAIL ---
  useEffect(() => {
    const loadEvent = async () => {
        if (!eventId) return;

        try {
            // Giả định fetchEventDetail trả về CampaignResponse
            const campaign = await fetchEventDetail(eventId); 
            
            // Ánh xạ DTO sang Frontend State
            const { date, time } = formatDateTime(campaign.eventDate);
            
            let participants = 0;
            let maxParticipants = 0;
            const participantParts = campaign.participantInfo.split('/');
            if (participantParts.length === 2) {
                participants = parseInt(participantParts[0]);
                maxParticipants = parseInt(participantParts[1]);
            }
            
            setEvent({
                id: campaign.id,
                title: campaign.title,
                description: campaign.description || '',
                date: date,
                time: time,
                location: campaign.location || 'Chưa xác định', // Giả định location có trong CampaignResponse
                participants: participants,
                maxParticipants: maxParticipants,
                status: campaign.status,
                image: campaign.iconCode,
                communityId: campaign.communityId,
                isUserRegistered: campaign.isUserRegistered || false, // Giả định trường này có trong DTO
            });
            setIsRegistered(campaign.isUserRegistered || false);
        } catch (error) {
            console.error("Lỗi tải chi tiết sự kiện:", error);
            Alert.alert("Lỗi", "Không thể tải chi tiết sự kiện.");
        } finally {
            setLoading(false);
        }
    };
    loadEvent();
  }, [eventId]);

  // --- LOGIC ĐĂNG KÝ VÀ CỘNG ĐIỂM ---
  const handleRegister = async () => {
    if (isRegistering || isRegistered || event.status !== "upcoming") return;

    setIsRegistering(true);
    try {
      // 1. GỌI API ĐĂNG KÝ
      await registerForCampaign(event.id);
      
      // 2. THÀNH CÔNG: Cập nhật UI và thông báo
      setIsRegistered(true);
      setEvent(prev => ({...prev, participants: prev.participants + 1})); 
      
      Alert.alert(
        "Thành công! 🎉",
        "Bạn đã đăng ký tham gia chiến dịch thành công và nhận được 100 điểm thưởng!"
      );

    } catch (error) {
      console.error("Lỗi đăng ký chiến dịch:", error.message);
      Alert.alert(
        "Lỗi đăng ký",
        error.message || "Không thể đăng ký tham gia chiến dịch. Vui lòng thử lại sau."
      );
    } finally {
      setIsRegistering(false);
    }
  };

  const handleShare = async () => { /* ... */ };
  
  if (loading || !event) {
     return (
        <SafeAreaView style={styles.container} edges={["top", "bottom"]}>
            <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
                <ActivityIndicator size="large" color="#4CAF50" />
                <Text style={{ marginTop: 10, color: '#666' }}>Đang tải chi tiết sự kiện...</Text>
            </View>
        </SafeAreaView>
    );
  }


  // --- RENDER ---
  const participantsInfo = `${event.participants}/${event.maxParticipants} người đã đăng ký`;
  
  return (
    <SafeAreaView style={styles.container} edges={["top", "bottom"]}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Header/Back Button */}
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <MaterialCommunityIcons name="arrow-left" size={24} color="#0A0A0A" />
        </TouchableOpacity>
        
        {/* Event Image (Giả định) */}
        <View style={styles.imagePlaceholder} />
        
        <View style={styles.detailCard}>
            <Text style={styles.eventTitle}>{event.title}</Text>
            
            <View style={styles.infoRow}>
                <MaterialCommunityIcons name="calendar-clock" size={20} color="#4CAF50" />
                <Text style={styles.infoText}>{event.date} ({event.time})</Text>
            </View>
            <View style={styles.infoRow}>
                <MaterialCommunityIcons name="map-marker" size={20} color="#4CAF50" />
                <Text style={styles.infoText}>{event.location}</Text>
            </View>
            
            <Text style={styles.sectionTitle}>Mô tả chi tiết</Text>
            <Text style={styles.descriptionText}>{event.description}</Text>
            
            <TouchableOpacity style={styles.shareButton} onPress={handleShare}>
                 <MaterialCommunityIcons name="share-variant" size={18} color="#1976D2" />
                 <Text style={styles.shareButtonText}>Chia sẻ sự kiện</Text>
            </TouchableOpacity>
        </View>
        
      </ScrollView>
      
      {/* Thanh Bottom Bar */}
      <View style={styles.bottomBar}>
        <View style={styles.participantsInfo}>
            <Text style={styles.participantsText}>{participantsInfo}</Text>
        </View>
        
        {/* Nút Đăng ký */}
        <TouchableOpacity
          style={isRegistered ? styles.registeredButton : styles.registerButton}
          onPress={handleRegister} 
          disabled={isRegistering || isRegistered || event.status !== "upcoming"}
        >
          {isRegistering ? (
            <ActivityIndicator color="#FFFFFF" />
          ) : (
            <Text style={styles.registerButtonText}>
              {isRegistered ? "Đã đăng ký" : "Đăng ký tham gia"}
            </Text>
          )}
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: "#F0EFED" },
    scrollContent: { paddingBottom: 100 },
    backButton: { position: 'absolute', top: 20, left: 20, zIndex: 10, width: 40, height: 40, borderRadius: 20, backgroundColor: "#FFFFFF", alignItems: "center", justifyContent: "center", elevation: 3 },
    imagePlaceholder: { height: 250, backgroundColor: "#BBDEFB", borderBottomLeftRadius: 20, borderBottomRightRadius: 20, marginBottom: 20 },
    detailCard: { paddingHorizontal: 24 },
    eventTitle: { fontSize: 24, fontWeight: "bold", color: "#0A0A0A", marginBottom: 16 },
    infoRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 10, gap: 8 },
    infoText: { fontSize: 16, color: "#333" },
    sectionTitle: { fontSize: 18, fontWeight: "600", color: "#0A0A0A", marginTop: 20, marginBottom: 10 },
    descriptionText: { fontSize: 15, color: "#555", lineHeight: 22 },
    shareButton: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', padding: 10, borderRadius: 10, borderWidth: 1, borderColor: '#1976D2', marginTop: 20, gap: 8 },
    shareButtonText: { fontSize: 15, fontWeight: '600', color: '#1976D2' },
    bottomBar: { position: 'absolute', bottom: 0, left: 0, right: 0, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', backgroundColor: "#FFFFFF", paddingHorizontal: 24, paddingVertical: 15, borderTopWidth: 1, borderTopColor: "#E0E0E0", elevation: 10 },
    participantsInfo: { flex: 1, marginRight: 15 },
    participantsText: { fontSize: 14, color: "#666", fontWeight: "600" },
    registerButton: {
      backgroundColor: "#4CAF50", 
      paddingVertical: 14,
      paddingHorizontal: 24,
      borderRadius: 12,
      minWidth: 150,
      alignItems: "center",
      elevation: 2,
    },
    registeredButton: { 
      backgroundColor: "#9E9E9E", 
      paddingVertical: 14,
      paddingHorizontal: 24,
      borderRadius: 12,
      minWidth: 150,
      alignItems: "center",
    },
    registerButtonText: {
      color: "#FFFFFF",
      fontWeight: "700",
    },
});

export default EventDetailScreen;