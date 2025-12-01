// File: app/chat/chat-history.jsx
import React, { useState, useEffect, useRef } from "react";
import { View, StyleSheet, FlatList, TextInput, TouchableOpacity, KeyboardAvoidingView, Platform, ActivityIndicator, Animated } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Text, IconButton, Avatar } from "react-native-paper";
import { useRouter, useLocalSearchParams } from "expo-router";
import typography from "../../styles/typography";
import { sendChatbotMessage, getSessionMessages } from "../../src/services/chatbotService";

// --- COMPONENT: Typing Indicator (3 dấu chấm nhấp nháy) ---
const TypingIndicator = () => {
  const opacity1 = useRef(new Animated.Value(0)).current;
  const opacity2 = useRef(new Animated.Value(0)).current;
  const opacity3 = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const animate = (anim, delay) => {
      Animated.loop(
        Animated.sequence([
          Animated.timing(anim, { toValue: 1, duration: 400, useNativeDriver: true, delay }),
          Animated.timing(anim, { toValue: 0.3, duration: 400, useNativeDriver: true })
        ])
      ).start();
    };

    animate(opacity1, 0);
    animate(opacity2, 200);
    animate(opacity3, 400);
  }, []);

  return (
    <View style={styles.typingContainer}>
      <Animated.View style={[styles.dot, { opacity: opacity1 }]} />
      <Animated.View style={[styles.dot, { opacity: opacity2 }]} />
      <Animated.View style={[styles.dot, { opacity: opacity3 }]} />
    </View>
  );
};
// ----------------------------------------------------------

const ChatHistory = () => {
  const router = useRouter();
  const { sessionId, title, isNew } = useLocalSearchParams();
  
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(!isNew); 
  const [isTyping, setIsTyping] = useState(false); // State để hiện "..."
  const flatListRef = useRef(null);

  // Tải lịch sử chat
  useEffect(() => {
    if (isNew === "true" || !sessionId) return;

    const loadMessages = async () => {
      try {
        const data = await getSessionMessages(sessionId);
        const uiMessages = [];
        data.forEach((item, index) => {
            uiMessages.push({ id: `u-${index}`, text: item.userQuery, from: 'user' });
            uiMessages.push({ id: `b-${index}`, text: item.botResponse, from: 'bot' });
        });
        setMessages(uiMessages);
      } catch (error) {
        console.error("Lỗi load chat:", error);
      } finally {
        setLoading(false);
      }
    };
    loadMessages();
  }, [sessionId]);

  // Hàm tự động cuộn xuống cuối
  const scrollToBottom = () => {
    if (flatListRef.current) {
        setTimeout(() => flatListRef.current.scrollToEnd({ animated: true }), 100);
    }
  };

  // Scroll mỗi khi messages hoặc isTyping thay đổi
  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

  const handleSend = async () => {
    if (!input.trim()) return;
    const userText = input.trim();
    setInput(""); 

    // 1. Hiển thị tin nhắn User ngay lập tức
    const tempUserMsg = { id: `temp-${Date.now()}`, text: userText, from: 'user' };
    setMessages(prev => [...prev, tempUserMsg]);
    
    // 2. Bật trạng thái "AI đang gõ..."
    setIsTyping(true);

    try {
      // Gửi tin nhắn lên Backend
      const response = await sendChatbotMessage(userText, sessionId);
      
      // 3. Tắt trạng thái gõ & Hiển thị tin nhắn Bot
      setIsTyping(false);
      const botMsg = { id: `b-${Date.now()}`, text: response.botResponse, from: 'bot' };
      setMessages(prev => [...prev, botMsg]);
      
    } catch (error) {
      console.error(error);
      setIsTyping(false);
      // Thông báo lỗi nhẹ nhàng
      const errorMsg = { id: `err-${Date.now()}`, text: "Xin lỗi, tôi đang gặp sự cố kết nối.", from: 'bot' };
      setMessages(prev => [...prev, errorMsg]);
    }
  };

  const renderMessage = ({ item }) => {
    const isBot = item.from === "bot";
    return (
      <View style={[styles.msgRow, isBot ? styles.botRow : styles.userRow]}>
        {isBot && <Avatar.Icon size={32} icon="leaf" style={{backgroundColor: '#E8F5E9'}} color="#2E7D32" />}
        <View style={[styles.bubble, isBot ? styles.botBubble : styles.userBubble]}>
          <Text style={isBot ? styles.botText : styles.userText}>{item.text}</Text>
        </View>
      </View>
    );
  };

  // Render Footer: Hiển thị Typing Indicator khi đang chờ
  const renderFooter = () => {
    if (!isTyping) return <View style={{height: 10}} />; // Spacer nhỏ cuối list
    
    return (
      <View style={[styles.msgRow, styles.botRow]}>
        <Avatar.Icon size={32} icon="leaf" style={{backgroundColor: '#E8F5E9'}} color="#2E7D32" />
        <View style={[styles.bubble, styles.botBubble, { paddingVertical: 12 }]}>
           <TypingIndicator />
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}><IconButton icon="arrow-left" /></TouchableOpacity>
        <Text style={styles.title} numberOfLines={1}>
            {decodeURIComponent(title || "Hội thoại")}
        </Text>
        <View style={{width: 40}} />
      </View>

      {/* Message List */}
      <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : undefined} style={{flex: 1}}>
        {loading ? (
            <ActivityIndicator style={{marginTop: 20}} color="#4CAF50" />
        ) : (
            <FlatList
              ref={flatListRef}
              data={messages}
              renderItem={renderMessage}
              keyExtractor={item => item.id}
              contentContainerStyle={{padding: 16, paddingBottom: 10}}
              ListFooterComponent={renderFooter} // Thêm Footer để hiện ...
              onContentSizeChange={scrollToBottom}
              onLayout={scrollToBottom}
            />
        )}

        {/* Input Area */}
        <View style={styles.inputContainer}>
          <TextInput 
            style={styles.input} 
            value={input} 
            onChangeText={setInput} 
            placeholder="Nhập tin nhắn..." 
            onSubmitEditing={handleSend}
            editable={!isTyping} // Chặn nhập khi đang chờ trả lời (tùy chọn)
          />
          <TouchableOpacity onPress={handleSend} disabled={!input.trim() || isTyping}>
             <IconButton 
                icon={isTyping ? "dots-horizontal" : "send"} 
                iconColor={isTyping ? "#ccc" : "#4CAF50"} 
             />
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F6F7F8" },
  header: { height: 60, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', backgroundColor: 'white', borderBottomWidth: 1, borderColor: '#eee' },
  title: { fontWeight: 'bold', fontSize: 18, maxWidth: '70%' },
  msgRow: { flexDirection: 'row', marginBottom: 12, alignItems: 'flex-end' },
  botRow: { alignSelf: 'flex-start' },
  userRow: { alignSelf: 'flex-end', justifyContent: 'flex-end' },
  bubble: { padding: 12, borderRadius: 20, maxWidth: '80%' },
  botBubble: { backgroundColor: 'white', marginLeft: 8, borderBottomLeftRadius: 4 },
  userBubble: { backgroundColor: '#4CAF50', borderBottomRightRadius: 4 },
  botText: { color: 'black', fontSize: 15, lineHeight: 22 },
  userText: { color: 'white', fontSize: 15, lineHeight: 22 },
  inputContainer: { flexDirection: 'row', padding: 8, backgroundColor: 'white', alignItems: 'center', borderTopWidth: 1, borderTopColor: '#eee' },
  input: { flex: 1, backgroundColor: '#f0f0f0', borderRadius: 24, paddingHorizontal: 16, paddingVertical: 10, marginRight: 4, fontSize: 15 },
  
  // Typing Styles
  typingContainer: { flexDirection: 'row', alignItems: 'center', width: 40, justifyContent: 'space-between', paddingHorizontal: 4 },
  dot: { width: 8, height: 8, borderRadius: 4, backgroundColor: '#aaa' }
});

export default ChatHistory;