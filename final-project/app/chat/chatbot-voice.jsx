import React, { useState, useEffect, useRef } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  Animated,
  StyleSheet,
  ActivityIndicator,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { MaterialIcons } from "@expo/vector-icons";
import { useRouter } from "expo-router";

export default function VoiceChat() {
  const router = useRouter();
  const [status, setStatus] = useState("idle"); // idle | listening | processing | responding
  const [userSpeech, setUserSpeech] = useState("");
  const [botReply, setBotReply] = useState("");
  const pulse = useRef(new Animated.Value(1)).current;
  const timerRef = useRef(null);

  // Hiệu ứng nhịp thở vòng tròn khi nghe
  useEffect(() => {
    let loop;
    if (status === "listening") {
      loop = Animated.loop(
        Animated.sequence([
          Animated.timing(pulse, {
            toValue: 1.2,
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
      pulse.setValue(1);
    }
    return () => loop && loop.stop();
  }, [status]);

  // Bắt đầu nghe (giả lập)
  const handleMicPress = () => {
    if (status === "idle") {
      setBotReply("");
      setUserSpeech("");
      setStatus("listening");

      // Giả lập người nói sau 2s
      timerRef.current = setTimeout(() => {
        setUserSpeech("Hôm nay AQI là bao nhiêu?");
        setStatus("processing");

        // Giả lập chờ gửi & nhận phản hồi
        setTimeout(() => {
          setBotReply(
            "AQI tại Quận 7 hiện tại là 132, không tốt cho nhóm nhạy cảm. Bạn nên hạn chế vận động ngoài trời."
          );
          setStatus("responding");
        }, 1800);
      }, 2000);
    } else if (status === "responding") {
      // Reset về trạng thái ban đầu
      setStatus("idle");
      setBotReply("");
      setUserSpeech("");
    }
  };

  useEffect(() => {
    return () => timerRef.current && clearTimeout(timerRef.current);
  }, []);

  const getHintText = () => {
    switch (status) {
      case "listening":
        return "Đang nghe...";
      case "processing":
        return "Đang xử lý câu hỏi...";
      case "responding":
        return "Phản hồi:";
      default:
        return "Nhấn để bắt đầu trò chuyện";
    }
  };

  const micColor =
    status === "listening"
      ? "#0EA5F5"
      : status === "processing"
      ? "#ccc"
      : "#000";

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backWrap}>
          <Text style={styles.backText}>‹</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Chatbot môi trường</Text>
      </View>

      <View style={styles.body}>
        <Animated.View
          style={[
            styles.micOuter,
            { transform: [{ scale: pulse }] },
            status === "processing" && { opacity: 0.7 },
          ]}
        >
          <TouchableOpacity
            onPress={handleMicPress}
            disabled={status === "processing"}
          >
            <View style={styles.micInner}>
              {status === "processing" ? (
                <ActivityIndicator size="large" color="#0EA5F5" />
              ) : (
                <MaterialIcons name="mic" size={40} color={micColor} />
              )}
            </View>
          </TouchableOpacity>
        </Animated.View>

        <Text style={styles.hintText}>{getHintText()}</Text>

        {userSpeech !== "" && status !== "idle" && (
          <View style={styles.userBubble}>
            <Text style={styles.userText}>{userSpeech}</Text>
          </View>
        )}

        {botReply !== "" && (
          <View style={styles.botBubble}>
            <Text style={styles.botText}>{botReply}</Text>
          </View>
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#0EA5F5" },
  header: {
    height: 72,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
  },
  backWrap: { padding: 6 },
  backText: { fontSize: 28, color: "#fff", fontWeight: "700" },
  headerTitle: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "700",
    marginLeft: 8,
  },
  body: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 24,
  },
  micOuter: {
    width: 200,
    height: 200,
    borderRadius: 100,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(255,255,255,0.15)",
  },
  micInner: {
    width: 130,
    height: 130,
    borderRadius: 65,
    backgroundColor: "#fff",
    alignItems: "center",
    justifyContent: "center",
    elevation: 6,
  },
  hintText: {
    color: "#fff",
    fontSize: 16,
    marginTop: 20,
    fontWeight: "600",
  },
  userBubble: {
    backgroundColor: "#fff",
    borderRadius: 18,
    marginTop: 32,
    paddingVertical: 10,
    paddingHorizontal: 18,
    maxWidth: "90%",
  },
  userText: { color: "#000", fontSize: 15, textAlign: "center" },
  botBubble: {
    backgroundColor: "rgba(255,255,255,0.15)",
    borderRadius: 18,
    marginTop: 18,
    paddingVertical: 12,
    paddingHorizontal: 20,
  },
  botText: { color: "#fff", fontSize: 15, lineHeight: 22, textAlign: "center" },
});
