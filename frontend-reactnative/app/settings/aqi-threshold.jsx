import React, { useState, useEffect } from "react";
import {
  View,
  StyleSheet,
  Text,
  Alert,
  TouchableOpacity,
  ActivityIndicator,
} from "react-native";
import typography from "../../styles/typography";
import { Button } from "react-native-paper";
import Slider from "@react-native-community/slider";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { SafeAreaView } from "react-native-safe-area-context";
import notificationService from "../../src/services/notificationService";

const AQIThresholdSettingsScreen = () => {
  const router = useRouter();
  const [aqiThreshold, setAqiThreshold] = useState(100); // Giá trị mặc định
  const [loading, setLoading] = useState(true); // Trạng thái tải dữ liệu
  const [saving, setSaving] = useState(false); // Trạng thái đang lưu
  const [fullSettings, setFullSettings] = useState({}); // Lưu toàn bộ settings để merge khi update

  const [sliderWidth, setSliderWidth] = useState(0);
  const SLIDER_MIN = 0;
  const SLIDER_MAX = 300;
  const THUMB_SIZE = 36;

  // 1. Tải cài đặt từ Server khi mở màn hình
  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      setLoading(true);
      const data = await notificationService.getSettings();
      if (data) {
        setFullSettings(data);
        // Nếu server trả về null (lần đầu), dùng mặc định 100
        setAqiThreshold(data.aqiThreshold ?? 100);
      }
    } catch (error) {
      console.error("Failed to load settings", error);
      Alert.alert("Lỗi", "Không thể tải cài đặt hiện tại.");
    } finally {
      setLoading(false);
    }
  };

  // 2. Lưu cài đặt lên Server
  const handleSaveSettings = async () => {
    try {
      setSaving(true);
      
      // Tạo object request mới, giữ nguyên các setting cũ, chỉ sửa threshold và enable alert
      const updateRequest = {
        ...fullSettings,
        aqiAlertEnabled: true, // Luôn bật cảnh báo khi người dùng đã vào đây chỉnh sửa
        aqiThreshold: aqiThreshold,
      };

      await notificationService.updateSettings(updateRequest);

      Alert.alert(
        "Thành công",
        `Đã lưu ngưỡng cảnh báo AQI: ${aqiThreshold}. Bạn sẽ nhận thông báo khi chỉ số thực tế vượt mức này.`
      );
    } catch (error) {
      console.error(error);
      Alert.alert("Thất bại", "Có lỗi xảy ra khi lưu cài đặt.");
    } finally {
      setSaving(false);
    }
  };

  // Hàm xác định màu sắc dựa trên ngưỡng chọn
  const getThresholdColor = (value) => {
      if (value <= 50) return "#4CAF50"; // Green
      if (value <= 100) return "#FFC107"; // Yellow
      if (value <= 150) return "#FF9800"; // Orange
      if (value <= 200) return "#F44336"; // Red
      return "#9C27B0"; // Purple
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        {/* Nút quay lại */}
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <Ionicons name="chevron-back" size={24} color="#222" />
        </TouchableOpacity>

        {/* Tiêu đề */}
        <Text style={[typography.h1, styles.screenTitle]}>
          Cài đặt ngưỡng cảnh báo AQI
        </Text>

        {loading ? (
          <ActivityIndicator size="large" color="#2196F3" style={{ marginTop: 50 }} />
        ) : (
          <>
            {/* Phần điều chỉnh */}
            <View style={styles.settingCard}>
              <Text style={[typography.h3, styles.label]}>
                Ngưỡng cảnh báo: <Text style={{color: getThresholdColor(aqiThreshold)}}>{aqiThreshold}</Text>
              </Text>
              
              <View
                style={{ width: "100%", alignSelf: "center", marginTop: 30 }}
                onLayout={(e) => setSliderWidth(e.nativeEvent.layout.width)}
              >
                {sliderWidth > 0 && (
                  <View
                    style={{
                      position: "absolute",
                      left:
                        ((aqiThreshold - SLIDER_MIN) / (SLIDER_MAX - SLIDER_MIN)) *
                        (sliderWidth - THUMB_SIZE),
                      top: -35,
                      width: 40,
                      alignItems: "center",
                      zIndex: 2,
                    }}
                  >
                    <Text style={[typography.body, styles.thresholdBubble]}>
                      {aqiThreshold}
                    </Text>
                  </View>
                )}
                <Slider
                  style={styles.slider}
                  minimumValue={SLIDER_MIN}
                  maximumValue={SLIDER_MAX}
                  step={5}
                  value={aqiThreshold}
                  onValueChange={(value) => setAqiThreshold(Math.round(value))}
                  minimumTrackTintColor={getThresholdColor(aqiThreshold)}
                  maximumTrackTintColor="#e0e0e0"
                  thumbTintColor={getThresholdColor(aqiThreshold)}
                />
              </View>
              
              <View style={styles.scaleLabels}>
                <Text style={styles.scaleText}>0 (Tốt)</Text>
                <Text style={styles.scaleText}>300 (Nguy hại)</Text>
              </View>
            </View>

            <Text style={[typography.small, styles.infoText]}>
              Hệ thống sẽ gửi thông báo đẩy cho bạn khi chỉ số AQI (theo chuẩn US EPA) tại vị trí của bạn vượt quá con số {aqiThreshold}.
            </Text>

            {/* Nút lưu */}
            <Button
              mode="contained"
              onPress={handleSaveSettings}
              loading={saving}
              disabled={saving}
              style={[styles.saveButton, {backgroundColor: getThresholdColor(aqiThreshold)}]}
              labelStyle={[typography.body, { color: "#fff", fontWeight: "bold" }]}
            >
              Lưu cài đặt
            </Button>
          </>
        )}
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F5F5F5",
  },
  content: {
    padding: 20,
    flex: 1,
  },
  backButton: {
    padding: 8,
    borderRadius: 20,
    alignSelf: "flex-start",
    backgroundColor: "#fff",
    zIndex: 10,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  screenTitle: {
    marginTop: 20,
    marginStart: 10,
    marginBottom: 20,
    fontWeight: "normal",
  },
  settingCard: {
    width: "100%",
    backgroundColor: "#fff",
    borderRadius: 20,
    padding: 20,
    marginBottom: 20,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  label: {
    marginBottom: 10,
    alignSelf: "flex-start",
  },
  slider: {
    width: "100%",
    height: 40,
  },
  thresholdBubble: {
    fontWeight: "bold",
    color: "#555",
    fontSize: 12
  },
  scaleLabels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    marginTop: -5
  },
  scaleText: {
    fontSize: 10,
    color: '#999'
  },
  infoText: {
    color: "#666",
    marginBottom: 20,
    marginStart: 10,
    alignSelf: "flex-start",
    lineHeight: 20
  },
  saveButton: {
    width: "100%",
    marginTop: 8,
    borderRadius: 20,
    paddingVertical: 6,
    elevation: 2
  },
});

export default AQIThresholdSettingsScreen;