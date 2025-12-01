<<<<<<< HEAD
// file: frontend-reactnative/app/features/quiz.jsx
import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert, ActivityIndicator, ScrollView } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { getAllQuizzes, getQuizById, submitQuiz } from '../../src/services/quizService';

const QuizScreen = () => {
  const [loading, setLoading] = useState(true);
  const [quizDetail, setQuizDetail] = useState(null); // Chi tiết 1 bài quiz (kèm câu hỏi)
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  
  // Lưu đáp án: { questionId: "A" hoặc "B"... }
  const [answers, setAnswers] = useState({}); 
  const [scoreData, setScoreData] = useState(null);

  useEffect(() => {
    initializeQuiz();
  }, []);

  const initializeQuiz = async () => {
    try {
      // B1: Lấy danh sách quiz
      const quizzes = await getAllQuizzes();
      if (quizzes && quizzes.length > 0) {
        // B2: Lấy chi tiết quiz đầu tiên để làm (Demo chọn cái đầu tiên)
        const firstQuizId = quizzes[0].id;
        const detail = await getQuizById(firstQuizId);
        setQuizDetail(detail);
      }
    } catch (error) {
      Alert.alert("Lỗi", "Không thể tải bài kiểm tra.");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <View style={styles.centered}><ActivityIndicator size="large" color="#2E7D32" /></View>;
  if (!quizDetail || !quizDetail.questions || quizDetail.questions.length === 0) {
    return <View style={styles.centered}><Text>Hiện chưa có câu hỏi nào.</Text></View>;
  }

  const questions = quizDetail.questions;
  const currentQuestion = questions[currentQuestionIndex];
  const progress = ((currentQuestionIndex + 1) / questions.length) * 100;

  // Backend trả về optionA, optionB... ta chuyển thành mảng để dễ render
  const optionsArray = [
    { id: 'A', content: currentQuestion.optionA },
    { id: 'B', content: currentQuestion.optionB },
    { id: 'C', content: currentQuestion.optionC },
    { id: 'D', content: currentQuestion.optionD },
  ].filter(opt => opt.content); // Lọc bỏ nếu null

  const handleSelectOption = (optionId) => {
    // Lưu đáp án cho câu hỏi hiện tại
    setAnswers(prev => ({ ...prev, [currentQuestion.id]: optionId }));
  };

  const handleNext = () => {
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    } else {
      handleSubmit();
    }
  };

  const handleSubmit = async () => {
    try {
      setLoading(true);
      // Format đúng chuẩn Backend yêu cầu: Map<UUID, String> answers
      const payloadAnswers = {};
      Object.keys(answers).forEach(qId => {
          payloadAnswers[qId] = answers[qId];
      });

      // Gửi request
      // Backend: submitQuiz(User, QuizSubmitRequest)
      // QuizSubmitRequest { quizId, answers: Map, timeTakenSeconds }
      const result = await submitQuiz(quizDetail.id, {
          ...payloadAnswers // Service sẽ wrap lại đúng format
      });
      
      setScoreData(result);
    } catch (error) {
      Alert.alert("Lỗi", "Không thể nộp bài. " + error.message);
    } finally {
      setLoading(false);
    }
  };

  const resetQuiz = () => {
    setAnswers({});
    setScoreData(null);
    setCurrentQuestionIndex(0);
    // Có thể gọi initializeQuiz() lại nếu muốn lấy quiz mới
  };

  // Màn hình kết quả
  if (scoreData) {
    return (
        <View style={[styles.container, styles.centered]}>
            <MaterialCommunityIcons name="trophy" size={80} color="#FFD700" />
            <Text style={styles.scoreTitle}>Xin chúc mừng!</Text>
            <Text style={styles.scoreText}>Điểm số: {scoreData.score}/{scoreData.totalQuestions}</Text>
            <Text style={[styles.scoreText, {fontSize: 16, color: '#2E7D32'}]}>
                (+{Math.round(scoreData.percentage)}% chính xác)
            </Text>
            <TouchableOpacity style={styles.nextBtn} onPress={resetQuiz}>
                <Text style={styles.nextBtnText}>Làm lại</Text>
            </TouchableOpacity>
        </View>
    )
  }

=======
import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';

const QuizScreen = () => {
  const [selectedId, setSelectedId] = useState(null);

  const questionData = {
    current: 1,
    total: 2,
    points: 10,
    question: "Chai nhựa thuộc loại rác nào?",
    options: [
      { id: 'a', label: 'Rác hữu cơ' },
      { id: 'b', label: 'Rác tái chế' }, // Đáp án đúng giả định
      { id: 'c', label: 'Rác nguy hại' },
      { id: 'd', label: 'Rác thải thông thường' },
    ]
  };

  const handleNext = () => {
    if (!selectedId) return;
    Alert.alert("Kết quả", selectedId === 'b' ? "Chính xác! +10 điểm" : "Sai rồi, thử lại nhé!");
  };

>>>>>>> test-merge
  return (
    <View style={styles.container}>
      
      {/* Progress Section */}
      <View style={styles.progressContainer}>
        <View style={styles.progressHeader}>
<<<<<<< HEAD
           <Text style={styles.progressText}>Câu {currentQuestionIndex + 1}/{questions.length}</Text>
           <View style={styles.pointsBadge}>
              <Text style={styles.pointsText}>{quizDetail.title}</Text>
           </View>
        </View>
        <View style={styles.track}>
           <View style={[styles.bar, { width: `${progress}%` }]} />
=======
           <Text style={styles.progressText}>Câu {questionData.current}/{questionData.total}</Text>
           <View style={styles.pointsBadge}>
              <Text style={styles.pointsText}>+{questionData.points} điểm</Text>
           </View>
        </View>
        {/* Progress Bar */}
        <View style={styles.track}>
           <View style={[styles.bar, { width: '50%' }]} />
>>>>>>> test-merge
        </View>
      </View>

      {/* Question */}
<<<<<<< HEAD
      <ScrollView style={styles.content}>
        <Text style={styles.questionText}>{currentQuestion.questionText}</Text>

        <View style={styles.optionsList}>
          {optionsArray.map((opt) => {
            const isSelected = answers[currentQuestion.id] === opt.id;
=======
      <View style={styles.content}>
        <Text style={styles.questionText}>{questionData.question}</Text>

        <View style={styles.optionsList}>
          {questionData.options.map((opt) => {
            const isSelected = selectedId === opt.id;
>>>>>>> test-merge
            return (
              <TouchableOpacity 
                key={opt.id}
                style={[styles.optionCard, isSelected && styles.optionSelected]}
<<<<<<< HEAD
                onPress={() => handleSelectOption(opt.id)}
=======
                onPress={() => setSelectedId(opt.id)}
>>>>>>> test-merge
                activeOpacity={0.9}
              >
                <View style={[styles.radio, isSelected && styles.radioSelected]}>
                    {isSelected && <View style={styles.radioDot} />}
<<<<<<< HEAD
                    {!isSelected && <Text style={{fontSize: 12, color: '#999'}}>{opt.id}</Text>}
                </View>
                <Text style={[styles.optionText, isSelected && styles.textSelected]}>
                    {opt.content}
=======
                </View>
                <Text style={[styles.optionText, isSelected && styles.textSelected]}>
                    {opt.label}
>>>>>>> test-merge
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>
<<<<<<< HEAD
      </ScrollView>
=======
      </View>
>>>>>>> test-merge

      {/* Footer Button */}
      <View style={styles.footer}>
        <TouchableOpacity 
<<<<<<< HEAD
          style={[styles.nextBtn, !answers[currentQuestion.id] && styles.nextBtnDisabled]}
          disabled={!answers[currentQuestion.id]}
          onPress={handleNext}
        >
          <Text style={styles.nextBtnText}>
            {currentQuestionIndex === questions.length - 1 ? "Nộp bài" : "Câu tiếp theo"}
          </Text>
=======
          style={[styles.nextBtn, !selectedId && styles.nextBtnDisabled]}
          disabled={!selectedId}
          onPress={handleNext}
        >
          <Text style={styles.nextBtnText}>Câu tiếp theo</Text>
>>>>>>> test-merge
        </TouchableOpacity>
      </View>

    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FFF' },
<<<<<<< HEAD
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 },
  progressContainer: { padding: 24, paddingBottom: 0 },
  progressHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 12 },
  progressText: { fontSize: 16, color: '#666', fontWeight: '500' },
  pointsBadge: { backgroundColor: '#E8F5E9', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 10 },
  pointsText: { color: '#2E7D32', fontSize: 12, fontWeight: 'bold' },
  track: { height: 8, backgroundColor: '#F0F0F0', borderRadius: 4, width: '100%' },
  bar: { height: 8, backgroundColor: '#2E7D32', borderRadius: 4 },
  content: { flex: 1, padding: 24 },
  questionText: { fontSize: 20, fontWeight: 'bold', color: '#111', marginBottom: 30, marginTop: 10 },
  optionsList: { gap: 16, paddingBottom: 40 },
  optionCard: { flexDirection: 'row', alignItems: 'center', padding: 18, borderRadius: 16, backgroundColor: '#FFF', borderWidth: 1, borderColor: '#EEE', elevation: 1, shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 2 },
  optionSelected: { borderColor: '#4CAF50', backgroundColor: '#F1F8E9' },
  radio: { width: 24, height: 24, borderRadius: 12, borderWidth: 2, borderColor: '#CCC', marginRight: 16, justifyContent: 'center', alignItems: 'center' },
  radioSelected: { borderColor: '#4CAF50' },
  radioDot: { width: 12, height: 12, borderRadius: 6, backgroundColor: '#4CAF50' },
  optionText: { fontSize: 16, color: '#333', flex: 1 },
  textSelected: { fontWeight: '600', color: '#1B5E20' },
=======
  
  progressContainer: { padding: 24, paddingBottom: 0 },
  progressHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 12 },
  progressText: { fontSize: 16, color: '#666', fontWeight: '500' },
  pointsBadge: { backgroundColor: '#4CAF50', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 10 },
  pointsText: { color: '#FFF', fontSize: 12, fontWeight: 'bold' },
  track: { height: 8, backgroundColor: '#F0F0F0', borderRadius: 4, width: '100%' },
  bar: { height: 8, backgroundColor: '#111', borderRadius: 4 },

  content: { flex: 1, padding: 24 },
  questionText: { fontSize: 20, fontWeight: 'bold', color: '#111', marginBottom: 30, marginTop: 10 },
  
  optionsList: { gap: 16 },
  optionCard: {
    flexDirection: 'row', alignItems: 'center',
    padding: 18, borderRadius: 16,
    backgroundColor: '#FFF',
    borderWidth: 1, borderColor: '#EEE',
    elevation: 1, shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 2
  },
  optionSelected: { borderColor: '#4CAF50', backgroundColor: '#F1F8E9' },
  
  radio: { width: 24, height: 24, borderRadius: 12, borderWidth: 2, borderColor: '#CCC', marginRight: 16, justifyContent: 'center', alignItems: 'center' },
  radioSelected: { borderColor: '#4CAF50' },
  radioDot: { width: 12, height: 12, borderRadius: 6, backgroundColor: '#4CAF50' },
  
  optionText: { fontSize: 16, color: '#333' },
  textSelected: { fontWeight: '600', color: '#1B5E20' },

>>>>>>> test-merge
  footer: { padding: 24, borderTopWidth: 1, borderTopColor: '#F0F0F0' },
  nextBtn: { backgroundColor: '#111', padding: 16, borderRadius: 14, alignItems: 'center' },
  nextBtnDisabled: { backgroundColor: '#CCC' },
  nextBtnText: { color: '#FFF', fontSize: 16, fontWeight: 'bold' },
<<<<<<< HEAD
  scoreTitle: { fontSize: 24, fontWeight: 'bold', marginTop: 20, marginBottom: 10 },
  scoreText: { fontSize: 18, color: '#666', marginBottom: 10 }
=======
>>>>>>> test-merge
});

export default QuizScreen;