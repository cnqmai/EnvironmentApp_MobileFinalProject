import React, { useState, useEffect, useRef } from "react";
import {
  View,
  StyleSheet,
  FlatList,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Text, IconButton, Avatar } from "react-native-paper";
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

  const initialMessages = [
    {
      id: "welcome",
      from: "bot",
      text: "Xin chào! Tôi là trợ lý môi trường của bạn. Tôi có thể giúp bạn về phân loại rác, chất lượng không khí, và các thông tin môi trường khác. Bạn cần hỗ trợ gì?",
      timestamp: new Date().toISOString(),
    },
  ];

  const [messages, setMessages] = useState(initialMessages);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);

  const threadData = sampleMessages[threadId] || { replies: [] };
  const replyPool = threadData.replies || [];
  const replies = replyPool.map((r) => r.text);
  const replyIndexRef = useRef(0);
  const flatListRef = useRef(null);

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

  const quickSuggestions = [
    { id: 1, text: "Phân loại nhựa", icon: "♻️" },
    { id: 2, text: "AQI hôm nay", icon: "🌫️" },
    { id: 3, text: "Luật môi trường", icon: "📋" },
    { id: 4, text: "Điểm thu gom", icon: "📍" },
  ];

  const handleSend = () => {
    if (!input.trim()) return;

    const userMsg = {
      id: `u-${Date.now()}`,
      from: "user",
      text: input.trim(),
      timestamp: new Date().toISOString(),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setIsTyping(true);

    setTimeout(() => {
      const { text: matchedReply, fromFallback } =
        getReplyForInput(input) || {};
      const botText =
        matchedReply ||
        "Xin lỗi, tôi chưa hiểu câu hỏi của bạn. Bạn có thể diễn đạt lại hoặc chọn một trong các gợi ý bên dưới không?";

      if (fromFallback) {
        replyIndexRef.current = Math.min(
          replyIndexRef.current + 1,
          replies.length - 1
        );
      }

      const botMsg = {
        id: `b-${Date.now()}`,
        from: "bot",
        text: botText,
        timestamp: new Date().toISOString(),
      };

      setMessages((prev) => [...prev, botMsg]);
      setIsTyping(false);
    }, 800 + Math.random() * 400);
  };

  const handleSuggestionPress = (suggestionText) => {
    setInput(suggestionText);
  };

  useEffect(() => {
    if (messages.length > 0) {
      setTimeout(() => {
        flatListRef.current?.scrollToEnd({ animated: true });
      }, 100);
    }
  }, [messages]);

  const renderMessage = ({ item, index }) => {
    const isBot = item.from === "bot";
    const showAvatar =
      isBot && (index === 0 || messages[index - 1]?.from !== "bot");
    const isLastInGroup =
      index === messages.length - 1 || messages[index + 1]?.from !== item.from;

    return (
      <View
        style={[
          styles.messageContainer,
          isBot ? styles.botMessageContainer : styles.userMessageContainer,
        ]}
      >
        {isBot && (
          <View style={styles.botAvatarContainer}>
            {showAvatar ? (
              <Avatar.Icon
                size={32}
                icon="leaf"
                style={styles.botAvatar}
                color="#2E7D32"
              />
            ) : (
              <View style={{ width: 32 }} />
            )}
          </View>
        )}

        <View
          style={[
            styles.messageBubble,
            isBot ? styles.botBubble : styles.userBubble,
            !isLastInGroup && styles.bubbleGrouped,
          ]}
        >
          <Text style={isBot ? styles.botText : styles.userText}>
            {item.text}
          </Text>
        </View>
      </View>
    );
  };

  const renderTypingIndicator = () => {
    if (!isTyping) return null;

    return (
      <View style={[styles.messageContainer, styles.botMessageContainer]}>
        <View style={styles.botAvatarContainer}>
          <Avatar.Icon
            size={32}
            icon="leaf"
            style={styles.botAvatar}
            color="#2E7D32"
          />
        </View>
        <View
          style={[styles.messageBubble, styles.botBubble, styles.typingBubble]}
        >
          <View style={styles.typingDots}>
            <View style={[styles.dot, styles.dot1]} />
            <View style={[styles.dot, styles.dot2]} />
            <View style={[styles.dot, styles.dot3]} />
          </View>
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => router.back()}
          style={styles.backButton}
        >
          <IconButton icon="arrow-left" size={24} iconColor="#0A0A0A" />
        </TouchableOpacity>
        <View style={styles.headerCenter}>
          <Text style={styles.headerTitle} numberOfLines={1}>
            {decodeURIComponent(title)}
          </Text>
          <Text style={styles.headerSubtitle}>Trợ lý môi trường</Text>
        </View>
        <TouchableOpacity
          onPress={() => router.push("/chat/chatbot-voice")}
          style={styles.voiceButton}
        >
          <IconButton icon="microphone" size={22} iconColor="#4CAF50" />
        </TouchableOpacity>
      </View>

      <KeyboardAvoidingView
        style={styles.keyboardView}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        keyboardVerticalOffset={Platform.OS === "ios" ? 90 : 0}
      >
        <FlatList
          ref={flatListRef}
          data={messages}
          keyExtractor={(item) => item.id}
          renderItem={renderMessage}
          contentContainerStyle={styles.messagesList}
          showsVerticalScrollIndicator={false}
          ListFooterComponent={renderTypingIndicator}
          onContentSizeChange={() => {
            flatListRef.current?.scrollToEnd({ animated: true });
          }}
        />

        <View style={styles.inputOuter}>
          {messages.length <= 2 && (
            <View style={styles.suggestionsContainer}>
              <Text style={styles.suggestionsTitle}>Gợi ý cho bạn:</Text>
              <FlatList
                horizontal
                showsHorizontalScrollIndicator={false}
                data={quickSuggestions}
                keyExtractor={(item) => item.id.toString()}
                contentContainerStyle={styles.suggestionsRow}
                renderItem={({ item }) => (
                  <TouchableOpacity
                    style={styles.chip}
                    activeOpacity={0.7}
                    onPress={() => handleSuggestionPress(item.text)}
                  >
                    <Text style={styles.chipIcon}>{item.icon}</Text>
                    <Text style={styles.chipText}>{item.text}</Text>
                  </TouchableOpacity>
                )}
              />
            </View>
          )}

          <View style={styles.inputWrap}>
            <TouchableOpacity style={styles.attachButton}>
              <IconButton
                icon="plus-circle-outline"
                size={24}
                iconColor="#666"
              />
            </TouchableOpacity>

            <TextInput
              placeholder="Nhập tin nhắn..."
              placeholderTextColor="#999"
              style={styles.input}
              value={input}
              onChangeText={setInput}
              multiline
              maxLength={500}
              returnKeyType="send"
              onSubmitEditing={handleSend}
              blurOnSubmit={false}
            />

            <TouchableOpacity
              style={[
                styles.sendButton,
                input.trim() && styles.sendButtonActive,
              ]}
              onPress={handleSend}
              disabled={!input.trim()}
            >
              <IconButton
                icon="send"
                size={20}
                iconColor={input.trim() ? "#fff" : "#999"}
              />
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F6F7F8",
  },
  keyboardView: {
    flex: 1,
  },

  header: {
    height: 72,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 8,
    backgroundColor: "#fff",
    borderBottomWidth: 1,
    borderBottomColor: "#F0F0F0",
    elevation: 2,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
  },
  backButton: {
    width: 48,
  },
  headerCenter: {
    flex: 1,
    alignItems: "center",
  },
  headerTitle: {
    ...typography.h3,
    fontWeight: "700",
    color: "#0A0A0A",
    fontSize: 16,
  },
  headerSubtitle: {
    ...typography.small,
    color: "#666",
    fontSize: 12,
    marginTop: 2,
  },
  voiceButton: {
    width: 48,
  },

  messagesList: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 8,
  },
  messageContainer: {
    flexDirection: "row",
    marginBottom: 12,
    alignItems: "flex-end",
  },
  botMessageContainer: {
    justifyContent: "flex-start",
  },
  userMessageContainer: {
    justifyContent: "flex-end",
  },
  botAvatarContainer: {
    marginRight: 8,
    marginBottom: 4,
  },
  botAvatar: {
    backgroundColor: "#E8F5E9",
  },
  messageBubble: {
    maxWidth: "75%",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 20,
  },
  botBubble: {
    backgroundColor: "#fff",
    borderTopLeftRadius: 4,
    elevation: 1,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowOffset: { width: 0, height: 1 },
    shadowRadius: 2,
  },
  userBubble: {
    backgroundColor: "#4CAF50",
    borderTopRightRadius: 4,
    alignSelf: "flex-end",
  },
  bubbleGrouped: {
    marginBottom: 4,
  },
  botText: {
    ...typography.body,
    color: "#0A0A0A",
    lineHeight: 22,
    fontSize: 15,
  },
  userText: {
    ...typography.body,
    color: "#fff",
    fontWeight: "500",
    lineHeight: 22,
    fontSize: 15,
  },

  typingBubble: {
    paddingVertical: 16,
  },
  typingDots: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "#999",
  },

  inputOuter: {
    backgroundColor: "#fff",
    borderTopWidth: 1,
    borderTopColor: "#F0F0F0",
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  suggestionsContainer: {
    marginBottom: 12,
  },
  suggestionsTitle: {
    ...typography.small,
    color: "#666",
    marginBottom: 8,
    fontSize: 12,
    fontWeight: "600",
  },
  suggestionsRow: {
    gap: 8,
  },
  chip: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1.5,
    borderColor: "#4CAF50",
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: "#F1F8F4",
    gap: 6,
  },
  chipIcon: {
    fontSize: 16,
  },
  chipText: {
    ...typography.body,
    color: "#2E7D32",
    fontSize: 14,
    fontWeight: "500",
  },
  inputWrap: {
    flexDirection: "row",
    alignItems: "flex-end",
    backgroundColor: "#F6F7F8",
    borderRadius: 24,
    paddingHorizontal: 4,
    paddingVertical: 4,
    minHeight: 48,
  },
  attachButton: {
    marginBottom: 2,
    alignSelf: "center",
  },
  input: {
    flex: 1,
    ...typography.body,
    color: "#0A0A0A",
    fontSize: 15,
    maxHeight: 100,
    paddingHorizontal: 8,
    paddingVertical: 8,
    alignSelf: "center",
  },
  sendButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#E0E0E0",
    justifyContent: "center",
    alignItems: "center",
    alignSelf: "center",
    marginBottom: 2,
  },
  sendButtonActive: {
    backgroundColor: "#4CAF50",
    elevation: 2,
    shadowColor: "#4CAF50",
    shadowOpacity: 0.3,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
    alignSelf: "center",
  },
});

export default ChatHistory;
