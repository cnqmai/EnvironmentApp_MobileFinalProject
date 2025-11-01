import React, { useState } from "react";
import { View, StyleSheet, Text, Alert, TouchableOpacity } from "react-native";
import typography from "../../styles/typography";
import { Button } from "react-native-paper";
import Slider from "@react-native-community/slider";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { SafeAreaView } from "react-native-safe-area-context";

const AQIThresholdSettingsScreen = () => {
  const router = useRouter();
  const [aqiThreshold, setAqiThreshold] = useState(100);
  const [sliderWidth, setSliderWidth] = useState(0);
  const SLIDER_MIN = 0;
  const SLIDER_MAX = 300;
  const THUMB_SIZE = 36;

  const handleSaveSettings = () => {
    console.log("Lưu cài đặt ngưỡng cảnh báo: " + aqiThreshold);
    Alert.alert(
      "Thành công",
      "Ngưỡng cảnh báo AQI đã được lưu: " + aqiThreshold
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        {/*Nút quay lại*/}
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <Ionicons name="chevron-back" size={24} color="#222" />
        </TouchableOpacity>

        {/*Tiêu đề*/}
        <Text style={[typography.h1, styles.screenTitle]}>
          Cài đặt ngưỡng cảnh báo AQI
        </Text>

        {/*Phần cài đặt ngưỡng AQI*/}
        <View style={styles.settingCard}>
          <Text style={[typography.h3, styles.label]}>Ngưỡng cảnh báo AQI</Text>
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
                  top: -30,
                  width: 40,
                  alignItems: "center",
                  zIndex: 2,
                }}
              >
                <Text style={[typography.body, styles.thresholdValue]}>
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
              minimumTrackTintColor="#2196F3"
              maximumTrackTintColor="#ccc"
              thumbTintColor="#2196F3"
            />
          </View>
        </View>
        <Text style={[typography.small, styles.infoText]}>
          Bạn sẽ nhận thông báo khi AQI vượt quá ngưỡng đã chọn
        </Text>

        {/*Nút lưu cài đặt*/}
        <Button
          mode="contained"
          onPress={handleSaveSettings}
          style={styles.saveButton}
          contentStyle={styles.saveButtonLabel}
          labelStyle={[typography.body, { color: "#fff", fontWeight: "bold" }]}
        >
          Lưu cài đặt
        </Button>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F5F5F5",
    fontFamily: "System",
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
  thresholdValue: {
    marginTop: 10,
    alignSelf: "center",
  },
  infoText: {
    color: "#666",
    marginBottom: 20,
    marginStart: 10,
    alignSelf: "flex-start",
  },
  saveButton: {
    width: "100%",
    marginTop: 8,
    borderRadius: 20,
    paddingVertical: 4,
    backgroundColor: "#2196F3",
  },
  saveButtonLabel: {
    // Đã dùng labelStyle cho Button
  },
});

export default AQIThresholdSettingsScreen;
