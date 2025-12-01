import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Alert, ActivityIndicator } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';

// [SỬA LỖI QUAN TRỌNG]: Tách đường dẫn import ra làm 2 dòng riêng biệt
import { API_BASE_URL } from '../../src/constants/api';      // Lấy URL từ constants
import { fetchWithAuth } from '../../src/utils/apiHelper';    // Lấy hàm fetch từ utils

const QuizScreen = () => {
  const [quizzes, setQuizzes] = useState([]);
  const [currentQuiz, setCurrentQuiz] = useState(null);
  const [answers, setAnswers] = useState({});
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadQuizzes();
  }, []);

  const loadQuizzes = async () => {
    try {
      setLoading(true);
      // Gọi API lấy danh sách Quiz
      const res = await fetchWithAuth(`${API_BASE_URL}/quizzes`, { method: 'GET' });
      if (res.ok) {
        const data = await res.json();
        setQuizzes(data);
      } else {
        console.warn("Quiz API Error:", res.status);
      }
    } catch (e) {
      console.error("Lỗi tải Quiz:", e);
    } finally {
      setLoading(false);
    }
  };

  const startQuiz = (quiz) => {
    setCurrentQuiz(quiz);
    setAnswers({});
    setResult(null);
  };

  const selectOption = (qId, idx) => {
    setAnswers({ ...answers, [qId]: idx });
  };

  const submitQuiz = async () => {
    try {
      setLoading(true);
      const payload = { answers: answers };
      // Gọi API nộp bài
      const res = await fetchWithAuth(`${API_BASE_URL}/quizzes/${currentQuiz.id}/submit`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (res.ok) {
        const data = await res.json();
        setResult(data);
      } else {
        Alert.alert("Lỗi", "Không thể nộp bài. Vui lòng thử lại.");
      }
    } catch (e) {
      Alert.alert("Lỗi mạng", "Kiểm tra kết nối internet.");
    } finally {
      setLoading(false);
    }
  };

  const goBack = () => {
    setCurrentQuiz(null);
    setResult(null);
    loadQuizzes();
  };

  // --- 1. MÀN HÌNH DANH SÁCH QUIZ ---
  if (!currentQuiz) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
           <Text style={styles.headerTitle}>Thử thách kiến thức</Text>
        </View>
        
        {loading ? (
          <ActivityIndicator size="large" color="#2E7D32" style={{marginTop: 40}} />
        ) : (
          <ScrollView contentContainerStyle={styles.list}>
            {quizzes.length > 0 ? quizzes.map((q) => (
              <TouchableOpacity key={q.id} style={styles.quizCard} onPress={() => startQuiz(q)}>
                <View style={styles.iconBox}>
                   <MaterialCommunityIcons name="help-circle-outline" size={30} color="#FFF" />
                </View>
                <View style={{flex: 1}}>
                   <Text style={styles.quizTitle}>{q.title}</Text>
                   <Text style={styles.quizDesc}>{q.description || "Bài trắc nghiệm về môi trường"}</Text>
                </View>
                <MaterialCommunityIcons name="chevron-right" size={24} color="#CCC" />
              </TouchableOpacity>
            )) : (
              <Text style={styles.emptyText}>Chưa có bài trắc nghiệm nào.</Text>
            )}
          </ScrollView>
        )}
      </View>
    );
  }

  // --- 2. MÀN HÌNH KẾT QUẢ ---
  if (result) {
    return (
      <View style={[styles.container, styles.center]}>
        <MaterialCommunityIcons name="trophy" size={80} color="#FFD700" />
        <Text style={styles.resultTitle}>Hoàn thành!</Text>
        <Text style={styles.resultText}>Bạn trả lời đúng {result.correctCount}/{result.totalQuestions} câu</Text>
        <Text style={styles.pointsText}>+{result.pointsEarned} điểm xanh</Text>
        
        <TouchableOpacity style={styles.btnPrimary} onPress={goBack}>
          <Text style={styles.btnText}>Quay lại danh sách</Text>
        </TouchableOpacity>
      </View>
    );
  }

  // --- 3. MÀN HÌNH LÀM BÀI ---
  return (
    <View style={styles.container}>
      <View style={styles.header}>
         <TouchableOpacity onPress={goBack}><MaterialCommunityIcons name="close" size={24} color="#333"/></TouchableOpacity>
         <Text style={styles.headerTitle} numberOfLines={1}>{currentQuiz.title}</Text>
         <View style={{width: 24}}/>
      </View>
      
      <ScrollView contentContainerStyle={{padding: 20}}>
        {currentQuiz.questions && currentQuiz.questions.map((q, idx) => (
          <View key={q.id} style={styles.questionBox}>
            <Text style={styles.qText}>Câu {idx + 1}: {q.questionText}</Text>
            
            {/* Render các đáp án */}
            {q.options && q.options.map((opt, optIdx) => (
              <TouchableOpacity 
                key={optIdx} 
                style={[styles.optionBtn, answers[q.id] === optIdx && styles.optionSelected]}
                onPress={() => selectOption(q.id, optIdx)}
              >
                <Text style={[styles.optionText, answers[q.id] === optIdx && {color: '#FFF'}]}>{opt}</Text>
              </TouchableOpacity>
            ))}
          </View>
        ))}
        
        <TouchableOpacity style={styles.btnSubmit} onPress={submitQuiz}>
           {loading ? <ActivityIndicator color="#FFF" /> : <Text style={styles.btnText}>Nộp bài</Text>}
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F9F9F9' },
  center: { justifyContent: 'center', alignItems: 'center', padding: 20, flex: 1 },
  list: { padding: 16 },
  header: { flexDirection: 'row', padding: 16, backgroundColor: '#FFF', alignItems: 'center', justifyContent: 'space-between', elevation: 2 },
  headerTitle: { fontSize: 18, fontWeight: 'bold', color: '#333' },
  
  quizCard: { flexDirection: 'row', backgroundColor: '#FFF', padding: 16, borderRadius: 16, marginBottom: 12, alignItems: 'center', elevation: 2 },
  iconBox: { width: 50, height: 50, borderRadius: 25, backgroundColor: '#4CAF50', justifyContent: 'center', alignItems: 'center', marginRight: 12 },
  quizTitle: { fontSize: 16, fontWeight: 'bold', color: '#333' },
  quizDesc: { fontSize: 13, color: '#666' },
  emptyText: { textAlign: 'center', marginTop: 50, color: '#888' },

  questionBox: { marginBottom: 24 },
  qText: { fontSize: 16, fontWeight: 'bold', marginBottom: 12, color: '#333' },
  optionBtn: { padding: 14, backgroundColor: '#FFF', borderRadius: 8, marginBottom: 8, borderWidth: 1, borderColor: '#DDD' },
  optionSelected: { backgroundColor: '#2E7D32', borderColor: '#2E7D32' },
  optionText: { fontSize: 14, color: '#333' },

  btnSubmit: { backgroundColor: '#2E7D32', padding: 16, borderRadius: 12, alignItems: 'center', marginTop: 20 },
  btnPrimary: { backgroundColor: '#2E7D32', paddingHorizontal: 30, paddingVertical: 12, borderRadius: 24, marginTop: 30 },
  btnText: { color: '#FFF', fontWeight: 'bold', fontSize: 16 },
  
  resultTitle: { fontSize: 28, fontWeight: 'bold', color: '#333', marginTop: 20 },
  resultText: { fontSize: 18, color: '#666', marginTop: 8 },
  pointsText: { fontSize: 24, fontWeight: 'bold', color: '#2E7D32', marginTop: 12 },
});

export default QuizScreen;