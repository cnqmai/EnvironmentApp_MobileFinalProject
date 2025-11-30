// File: app/chat/chat-history.jsx
import React, { useState, useEffect, useRef } from "react";
import { View, StyleSheet, FlatList, TextInput, TouchableOpacity, KeyboardAvoidingView, Platform, ActivityIndicator } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Text, IconButton, Avatar } from "react-native-paper";
import { useRouter, useLocalSearchParams } from "expo-router";
import typography from "../../styles/typography";
import { sendChatbotMessage, getSessionMessages } from "../../src/services/chatbotService";

const ChatHistory = () => {
  const router = useRouter();
  const { sessionId, title, isNew } = useLocalSearchParams();
  
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(!isNew); // Nếu là chat mới thì không cần load
  const [sending, setSending] = useState(false);
  const flatListRef = useRef(null);

  // Tải lịch sử chat của session này
  useEffect(() => {
    if (isNew === "true" || !sessionId) return; // Chat mới chưa có lịch sử

    const loadMessages = async () => {
      try {
        const data = await getSessionMessages(sessionId);
        // Convert dữ liệu backend thành format hiển thị (User -> Bot)
        const uiMessages = [];
        data.forEach((item, index) => {
            // Tin nhắn User
            uiMessages.push({ id: `u-${index}`, text: item.userQuery, from: 'user' });
            // Tin nhắn Bot
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

  const handleSend = async () => {
    if (!input.trim()) return;
    const userText = input.trim();
    setInput(""); // Clear input ngay lập tức

    // Hiển thị tạm tin nhắn user
    const tempUserMsg = { id: `temp-${Date.now()}`, text: userText, from: 'user' };
    setMessages(prev => [...prev, tempUserMsg]);
    setSending(true);

    try {
      // Gửi tin nhắn lên Backend kèm sessionId
      const response = await sendChatbotMessage(userText, sessionId);
      
      // Nhận phản hồi và hiển thị
      const botMsg = { id: `b-${Date.now()}`, text: response.botResponse, from: 'bot' };
      setMessages(prev => [...prev, botMsg]);
    } catch (error) {
      console.error(error);
      // Có thể hiển thị thông báo lỗi hoặc nút thử lại
    } finally {
      setSending(false);
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

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}><IconButton icon="arrow-left" /></TouchableOpacity>
        <Text style={styles.title}>{decodeURIComponent(title || "Hội thoại")}</Text>
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
              contentContainerStyle={{padding: 16}}
              onContentSizeChange={() => flatListRef.current?.scrollToEnd()}
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
          />
          <TouchableOpacity onPress={handleSend} disabled={!input.trim() || sending}>
             <IconButton icon="send" iconColor="#4CAF50" />
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F6F7F8" },
  header: { height: 60, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', backgroundColor: 'white', borderBottomWidth: 1, borderColor: '#eee' },
  title: { fontWeight: 'bold', fontSize: 18 },
  msgRow: { flexDirection: 'row', marginBottom: 12, alignItems: 'flex-end' },
  botRow: { alignSelf: 'flex-start' },
  userRow: { alignSelf: 'flex-end', justifyContent: 'flex-end' },
  bubble: { padding: 12, borderRadius: 20, maxWidth: '80%' },
  botBubble: { backgroundColor: 'white', marginLeft: 8 },
  userBubble: { backgroundColor: '#4CAF50' },
  botText: { color: 'black' },
  userText: { color: 'white' },
  inputContainer: { flexDirection: 'row', padding: 8, backgroundColor: 'white', alignItems: 'center' },
  input: { flex: 1, backgroundColor: '#f0f0f0', borderRadius: 20, paddingHorizontal: 16, paddingVertical: 8, marginRight: 8 }
});

export default ChatHistory;