import React, { useState, useEffect, useRef } from "react";
import {
  View,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Text, IconButton } from "react-native-paper";
import { useRouter, useLocalSearchParams } from "expo-router";
import typography from "../../styles/typography";

const sampleMessages = {
  1: {
    replies: [
      {
        keywords: ["pin", "pin thải", "pin bỏ", "pin đã dùng"],
        text: "Pin đã qua sử dụng cần được thu gom riêng. Bạn nên mang đến điểm thu gom rác thải điện tử hoặc các siêu thị có thu nhận pin. Không vứt pin vào thùng rác sinh hoạt.",
      },
      {
        keywords: ["điểm thu", "điểm thu gom", "thu gom"],
        text: "Các điểm thu gom thường là siêu thị lớn, trung tâm tái chế hoặc chương trình thu gom của quận. Bạn muốn mình tìm điểm thu gần bạn không?",
      },
      {
        keywords: ["cách xử lý", "xử lý", "rò rỉ"],
        text: "Nếu pin rò rỉ, đặt vào túi kín trước khi mang đến điểm thu và đeo găng tay nếu cần.",
      },
    ],
  },
  2: {
    replies: [
      {
        keywords: ["aqi", "chỉ số", "ô nhiễm"],
        text: "AQI tại Quận 7 hiện tại là 132 — mức kém. Nhóm nhạy cảm nên hạn chế hoạt động ngoài trời.",
      },
      {
        keywords: ["nên làm gì", "khuyến cáo"],
        text: "Đeo khẩu trang lọc hạt (N95), tránh vận động gắng sức ngoài trời và đóng cửa sổ nếu có thể.",
      },
    ],
  },
  3: {
    replies: [
      {
        keywords: ["phân loại", "nhựa", "rửa"],
        text: "Rửa và bóc nhãn trước khi tái chế nhựa. Kiểm tra ký hiệu tái chế (1-7) để xác định khả năng tái chế.",
      },
      {
        keywords: ["ký hiệu", "số"],
        text: "PET (1) và HDPE (2) thường dễ tái chế hơn; các loại khác có thể khó hơn.",
      },
    ],
  },
};

const ChatHistory = () => {
  const router = useRouter();
  const params = useLocalSearchParams();
  const threadId = params.threadId || "1";
  const title = params.title ? String(params.title) : "Hội thoại";

  const initialMessages = [];
  const [messages, setMessages] = useState(() => initialMessages);
  const [input, setInput] = useState("");

  const threadData = sampleMessages[threadId] || { replies: [] };
  const replyPool = threadData.replies || [];
  const replies = replyPool.map((r) => r.text);
  const replyIndexRef = React.useRef(0);

  const getReplyForInput = (text) => {
    const t = String(text || "").toLowerCase();

    for (const item of replyPool) {
      if (!item.keywords || item.keywords.length === 0) continue;
      for (const k of item.keywords) {
        if (t.includes(k)) return { text: item.text, fromFallback: false };
      }
    }

    const fallback = replies[replyIndexRef.current] || null;
    return { text: fallback, fromFallback: true };
  };

  const scrollRef = useRef(null);

  useEffect(() => {
    if (scrollRef.current && messages.length > 0) {
      scrollRef.current.scrollToEnd({ animated: true });
    }
  }, [messages]);

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backWrap}>
          <Text style={styles.backText}>‹</Text>
        </TouchableOpacity>
        <Text style={styles.title}>{decodeURIComponent(title)}</Text>
        <IconButton
          icon="microphone"
          size={22}
          onPress={() => router.push("/chat/chatbot-voice")}
          style={styles.iconWrap}
        />
      </View>

      <ScrollView ref={scrollRef} contentContainerStyle={styles.scrollOuter}>
        <View style={styles.card}>
          {messages.map((m) => (
            <View
              key={m.id}
              style={m.from === "bot" ? styles.botMessage : styles.userMessage}
            >
              <Text style={m.from === "bot" ? styles.botText : styles.userText}>
                {m.text}
              </Text>
            </View>
          ))}
        </View>
      </ScrollView>

      <View style={styles.inputOuter}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.suggestionsRow}
        >
          <TouchableOpacity
            style={styles.chip}
            activeOpacity={0.85}
            onPress={() => setInput("Phân loại nhựa")}
          >
            <Text style={styles.chipText}>Phân loại nhựa</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.chip}
            activeOpacity={0.85}
            onPress={() => setInput("AQI hôm nay")}
          >
            <Text style={styles.chipText}>AQI hôm nay</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.chip}
            activeOpacity={0.85}
            onPress={() => setInput("Luật môi trường")}
          >
            <Text style={styles.chipText}>Luật môi trường</Text>
          </TouchableOpacity>
        </ScrollView>

        <View style={styles.inputWrap}>
          <TextInput
            placeholder="Nhập tin nhắn"
            style={styles.input}
            value={input}
            onChangeText={setInput}
          />
          <TouchableOpacity
            style={styles.sendCircle}
            onPress={() => {
              if (!input.trim()) return;
              const userMsg = {
                id: `u-${Date.now()}`,
                from: "user",
                text: input,
              };
              setMessages((s) => [...s, userMsg]);
              setInput("");
              const { text: matchedReply, fromFallback } =
                getReplyForInput(input) || {};
              setTimeout(() => {
                const botText =
                  matchedReply || "Mình chưa hiểu, bạn có thể hỏi lại?";
                if (fromFallback) {
                  replyIndexRef.current = Math.min(
                    replyIndexRef.current + 1,
                    replies.length
                  );
                }
                const botMsg = {
                  id: `b-${Date.now()}`,
                  from: "bot",
                  text: botText,
                };
                setMessages((s) => [...s, botMsg]);
              }, 700);
            }}
          >
            <Text style={styles.sendIcon}>↑</Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F6F7F8" },
  header: {
    height: 72,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    backgroundColor: "#fff",
    borderBottomWidth: 1,
    borderBottomColor: "#F0F0F0",
  },
  backWrap: { padding: 8 },
  backText: { ...typography.h3, color: "#0A0A0A", fontWeight: "700" },
  title: { ...typography.h2, fontWeight: "800", color: "#0A0A0A" },
  iconWrap: { padding: 8 },
  iconText: { color: "#0A0A0A", fontSize: 18 },
  scrollOuter: { padding: 16, paddingBottom: 120 },
  card: {
    backgroundColor: "#fff",
    borderRadius: 20,
    padding: 18,
    elevation: 4,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 12,
  },
  botMessage: {
    paddingVertical: 8,
    paddingRight: 40,
    marginBottom: 18,
  },
  botText: { ...typography.body, color: "#222", lineHeight: 22 },
  userMessage: {
    backgroundColor: "#C8F5B7",
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 20,
    alignSelf: "flex-end",
    marginBottom: 18,
    maxWidth: "78%",
  },
  userText: {
    ...typography.body,
    color: "#0A3D2D",
    fontWeight: "700",
    lineHeight: 20,
  },
  quickActionsRow: {
    flexDirection: "row",
    marginTop: 6,
    justifyContent: "flex-start",
  },
  suggestionsRow: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 12,
  },
  chip: {
    borderWidth: 1.6,
    borderColor: "#34C759",
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 24,
    backgroundColor: "#fff",
    marginHorizontal: 8,
  },
  chipText: { color: "#0A0A0A", ...typography.body },
  inputOuter: {
    paddingHorizontal: 18,
    paddingVertical: 14,
    backgroundColor: "transparent",
    borderTopWidth: 0,
  },
  inputWrap: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#EBECEC",
    paddingVertical: 12,
    paddingHorizontal: 14,
    borderRadius: 28,
  },
  input: { flex: 1, paddingVertical: 0, ...typography.body, color: "#222" },
  sendCircle: {
    marginLeft: 12,
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "#fff",
    alignItems: "center",
    justifyContent: "center",
    elevation: 2,
  },
  sendIcon: { color: "#0A0A0A", fontWeight: "800" },
});

export default ChatHistory;
