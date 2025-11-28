import React, { useState, useRef, useEffect } from 'react';
import { 
  View, Text, TextInput, TouchableOpacity, StyleSheet, 
  FlatList, KeyboardAvoidingView, Platform, ActivityIndicator 
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { sendMessageToBot } from '../../src/services/chatbotService';
import typography from '../../styles/typography';

const ChatbotScreen = () => {
  const router = useRouter();
  const flatListRef = useRef(null);
  
  // Tin nhắn chào mừng ban đầu
  const [messages, setMessages] = useState([
    { 
      id: 'welcome', 
      text: 'Xin chào! Tôi là trợ lý môi trường. Bạn cần giúp gì về phân loại rác hay chỉ số AQI?', 
      sender: 'bot' 
    }
  ]);
  const [inputText, setInputText] = useState('');
  const [loading, setLoading] = useState(false);

  // Hàm gửi tin nhắn
  const handleSend = async () => {
    if (!inputText.trim()) return;

    const userMessageText = inputText;
    setInputText(''); // Xóa ô nhập liệu ngay

    // 1. Hiển thị tin nhắn người dùng lên màn hình
    const userMsg = { 
      id: Date.now().toString(), 
      text: userMessageText, 
      sender: 'user' 
    };
    setMessages(prev => [...prev, userMsg]);
    setLoading(true);

    try {
      // 2. Gọi API gửi tin nhắn
      const data = await sendMessageToBot(userMessageText);
      
      // 3. Hiển thị phản hồi từ server
      const botMsg = {
        id: data.historyId || (Date.now() + 1).toString(),
        text: data.botResponse, // Lấy trường botResponse từ API
        sender: 'bot'
      };
      setMessages(prev => [...prev, botMsg]);

    } catch (error) {
      // Xử lý lỗi
      const errorMsg = {
        id: (Date.now() + 1).toString(),
        text: "Xin lỗi, tôi đang gặp sự cố kết nối. Vui lòng thử lại sau.",
        sender: 'bot',
        isError: true
      };
      setMessages(prev => [...prev, errorMsg]);
    } finally {
      setLoading(false);
    }
  };

  // Tự động cuộn xuống cuối khi có tin nhắn mới
  useEffect(() => {
    if(messages.length > 0) {
        setTimeout(() => flatListRef.current?.scrollToEnd({ animated: true }), 100);
    }
  }, [messages]);

  // Render từng tin nhắn
  const renderItem = ({ item }) => {
    const isUser = item.sender === 'user';
    return (
      <View style={[
        styles.messageBubble, 
        isUser ? styles.userBubble : styles.botBubble,
        item.isError && styles.errorBubble
      ]}>
        <Text style={[styles.messageText, isUser ? styles.userText : styles.botText]}>
          {item.text}
        </Text>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.iconButton}>
          <MaterialCommunityIcons name="arrow-left" size={24} color="#000" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Trợ lý Xanh</Text>
        
        {/* Nút xem lịch sử chat */}
        <TouchableOpacity onPress={() => router.push('/chat/chat-history')} style={styles.iconButton}>
          <MaterialCommunityIcons name="history" size={24} color="#000" />
        </TouchableOpacity>
      </View>

      {/* Danh sách tin nhắn */}
      <FlatList
        ref={flatListRef}
        data={messages}
        keyExtractor={item => item.id}
        renderItem={renderItem}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
      />

      {/* Loading khi bot đang trả lời */}
      {loading && (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="small" color="#4CAF50" />
          <Text style={styles.loadingText}>Đang trả lời...</Text>
        </View>
      )}

      {/* Khu vực nhập liệu */}
      <KeyboardAvoidingView 
        behavior={Platform.OS === "ios" ? "padding" : "height"} 
        keyboardVerticalOffset={Platform.OS === "ios" ? 10 : 0}
      >
        <View style={styles.inputContainer}>
          <TextInput
            style={styles.input}
            placeholder="Nhập câu hỏi..."
            value={inputText}
            onChangeText={setInputText}
            multiline
          />
          <TouchableOpacity 
            style={[styles.sendButton, !inputText.trim() && styles.disabledButton]} 
            onPress={handleSend}
            disabled={!inputText.trim() || loading}
          >
            <MaterialCommunityIcons name="send" size={24} color="#fff" />
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F5F5F5' },
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    padding: 16, backgroundColor: '#fff', borderBottomWidth: 1, borderBottomColor: '#eee',
  },
  headerTitle: { fontSize: 18, fontWeight: 'bold' },
  iconButton: { padding: 4 },
  listContent: { padding: 16, paddingBottom: 20 },
  messageBubble: { maxWidth: '80%', padding: 12, borderRadius: 20, marginBottom: 12 },
  userBubble: { alignSelf: 'flex-end', backgroundColor: '#4CAF50', borderBottomRightRadius: 4 },
  botBubble: { alignSelf: 'flex-start', backgroundColor: '#fff', borderBottomLeftRadius: 4, borderWidth: 1, borderColor: '#eee' },
  errorBubble: { backgroundColor: '#FFEBEE', borderColor: '#FFCDD2' },
  messageText: { fontSize: 16, lineHeight: 22 },
  userText: { color: '#fff' },
  botText: { color: '#333' },
  loadingContainer: { flexDirection: 'row', alignItems: 'center', marginLeft: 16, marginBottom: 10 },
  loadingText: { marginLeft: 8, color: '#666', fontStyle: 'italic' },
  inputContainer: {
    flexDirection: 'row', padding: 10, backgroundColor: '#fff', 
    alignItems: 'center', borderTopWidth: 1, borderTopColor: '#eee',
  },
  input: {
    flex: 1, backgroundColor: '#f0f0f0', borderRadius: 20, 
    paddingHorizontal: 16, paddingVertical: 10, maxHeight: 100, fontSize: 16, marginRight: 10,
  },
  sendButton: { width: 44, height: 44, borderRadius: 22, backgroundColor: '#4CAF50', alignItems: 'center', justifyContent: 'center' },
  disabledButton: { backgroundColor: '#ccc' },
});

export default ChatbotScreen;