import React, { useState, useRef, useEffect } from "react";
import { View, StyleSheet, TouchableOpacity, Animated } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Text, IconButton } from "react-native-paper";
import { useRouter } from "expo-router";
import typography from "../../styles/typography";

const VoiceChat = () => {
  const router = useRouter();
  const [listening, setListening] = useState(false);
  const pulse = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    let loop;
    if (listening) {
      loop = Animated.loop(
        Animated.sequence([
          Animated.timing(pulse, {
            toValue: 1.12,
            duration: 700,
            useNativeDriver: true,
          }),
          Animated.timing(pulse, {
            toValue: 1,
            duration: 700,
            useNativeDriver: true,
          }),
        ])
      );
      loop.start();
    } else {
      pulse.stopAnimation();
    }
    return () => loop && loop.stop();
  }, [listening, pulse]);

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backWrap}>
          <Text style={styles.backText}>‹</Text>
        </TouchableOpacity>
        <Text style={styles.title}>Chatbot môi trường</Text>
        <IconButton
          icon="microphone"
          size={22}
          color="#fff"
          onPress={() => {}}
          style={styles.iconWrap}
        />
      </View>

      <View style={styles.centerArea}>
        <Animated.View
          style={[
            styles.micOuter,
            listening && { transform: [{ scale: pulse }] },
          ]}
        >
          <TouchableOpacity
            onPress={() => setListening((s) => !s)}
            style={styles.micInner}
          >
            <Text style={styles.micIcon}>{listening ? "●" : "♪"}</Text>
          </TouchableOpacity>
        </Animated.View>

        <View style={styles.hintArea}>
          <Text style={styles.hintText}>
            {listening ? "Đang lắng nghe..." : "Nhấn để bắt đầu trò chuyện"}
          </Text>
        </View>

        {listening ? (
          <View style={styles.responseCard}>
            <Text style={styles.responseText}>
              AQI tại Quận 7 hiện tại là 132, không tốt cho nhóm nhạy cảm. Bạn
              nên hạn chế vận động ngoài trời.
            </Text>
          </View>
        ) : null}
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#0EA5F5" },
  header: {
    height: 72,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    backgroundColor: "#0EA5F5",
  },
  backWrap: { padding: 8 },
  backText: { ...typography.h3, color: "#fff", fontWeight: "700" },
  title: { ...typography.h2, color: "#fff", fontWeight: "700" },
  centerArea: { flex: 1, justifyContent: "center", alignItems: "center" },
  micOuter: {
    width: 210,
    height: 210,
    borderRadius: 105,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(255,255,255,0.1)",
    shadowColor: "#000",
    shadowOpacity: 0.12,
    shadowOffset: { width: 0, height: 8 },
    shadowRadius: 20,
  },
  micInner: {
    width: 140,
    height: 140,
    borderRadius: 70,
    backgroundColor: "#fff",
    alignItems: "center",
    justifyContent: "center",
  },
  micIcon: { fontSize: 34, color: "#111", fontWeight: "800" },
  hintArea: { marginTop: 20 },
  hintText: { ...typography.body, color: "#fff", fontWeight: "600" },
  responseCard: { marginTop: 36, paddingHorizontal: 28, paddingVertical: 14 },
  responseText: { ...typography.body, color: "#fff", textAlign: "center" },
});

export default VoiceChat;
