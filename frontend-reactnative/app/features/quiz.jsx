import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, Modal, ScrollView, Alert } from 'react-native';
import { getAllQuizzes, getQuizById, submitQuiz } from '../../src/services/quizService'; // Đảm bảo đường dẫn đúng

const QuizScreen = () => {
    const [quizzes, setQuizzes] = useState([]);
    const [currentQuiz, setCurrentQuiz] = useState(null); // Quiz đang làm
    const [answers, setAnswers] = useState({}); // Lưu câu trả lời { questionId: answerId }
    const [modalVisible, setModalVisible] = useState(false);

    useEffect(() => {
        loadQuizzes();
    }, []);

    const loadQuizzes = async () => {
        try {
            const data = await getAllQuizzes();
            setQuizzes(data);
        } catch (error) {
            console.error(error);
        }
    };

    const startQuiz = async (quizId) => {
        try {
            const data = await getQuizById(quizId);
            setCurrentQuiz(data);
            setAnswers({});
            setModalVisible(true);
        } catch (error) {
            Alert.alert("Lỗi", "Không thể tải bài quiz này.");
        }
    };

    const handleSelectAnswer = (questionId, answerId) => {
        setAnswers(prev => ({ ...prev, [questionId]: answerId }));
    };

    const handleSubmit = async () => {
        try {
            // Chuyển đổi format answers để gửi lên server
            const answersArray = Object.keys(answers).map(qId => ({
                questionId: qId,
                answerId: answers[qId]
            }));

            const result = await submitQuiz(currentQuiz.id, answersArray);
            
            Alert.alert(
                "Kết quả", 
                `Bạn đạt ${result.score} điểm!`,
                [{ text: "OK", onPress: () => setModalVisible(false) }]
            );
        } catch (error) {
            Alert.alert("Lỗi", "Nộp bài thất bại.");
        }
    };

    return (
        <View style={styles.container}>
            <Text style={styles.header}>Danh sách bài Quiz</Text>
            <FlatList
                data={quizzes}
                keyExtractor={(item) => item.id.toString()}
                renderItem={({ item }) => (
                    <TouchableOpacity style={styles.quizItem} onPress={() => startQuiz(item.id)}>
                        <Text style={styles.quizTitle}>{item.title}</Text>
                        <Text style={styles.quizDesc}>{item.description || 'Chạm để bắt đầu'}</Text>
                    </TouchableOpacity>
                )}
            />

            {/* Modal làm bài Quiz */}
            <Modal visible={modalVisible} animationType="slide">
                <View style={styles.modalContainer}>
                    <View style={styles.modalHeader}>
                        <Text style={styles.modalTitle}>{currentQuiz?.title}</Text>
                        <TouchableOpacity onPress={() => setModalVisible(false)}>
                            <Text style={styles.closeBtn}>Đóng</Text>
                        </TouchableOpacity>
                    </View>
                    
                    <ScrollView contentContainerStyle={styles.questionsContainer}>
                        {currentQuiz?.questions?.map((q, index) => (
                            <View key={q.id} style={styles.questionBlock}>
                                <Text style={styles.questionText}>Câu {index + 1}: {q.content}</Text>
                                {q.answers?.map(ans => (
                                    <TouchableOpacity 
                                        key={ans.id} 
                                        style={[
                                            styles.answerBtn, 
                                            answers[q.id] === ans.id && styles.answerBtnSelected
                                        ]}
                                        onPress={() => handleSelectAnswer(q.id, ans.id)}
                                    >
                                        <Text style={[
                                            styles.answerText,
                                            answers[q.id] === ans.id && styles.answerTextSelected
                                        ]}>{ans.content}</Text>
                                    </TouchableOpacity>
                                ))}
                            </View>
                        ))}
                    </ScrollView>

                    <TouchableOpacity style={styles.submitBtn} onPress={handleSubmit}>
                        <Text style={styles.submitBtnText}>Nộp bài</Text>
                    </TouchableOpacity>
                </View>
            </Modal>
        </View>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#fff', padding: 16 },
    header: { fontSize: 20, fontWeight: 'bold', marginBottom: 16 },
    quizItem: { backgroundColor: '#f9f9f9', padding: 16, borderRadius: 8, marginBottom: 12, borderWidth: 1, borderColor: '#eee' },
    quizTitle: { fontSize: 16, fontWeight: 'bold' },
    quizDesc: { color: '#666', marginTop: 4 },
    
    // Modal Styles
    modalContainer: { flex: 1, backgroundColor: '#fff', paddingTop: 20 },
    modalHeader: { flexDirection: 'row', justifyContent: 'space-between', padding: 16, borderBottomWidth: 1, borderColor: '#eee' },
    modalTitle: { fontSize: 18, fontWeight: 'bold' },
    closeBtn: { color: 'red', fontWeight: 'bold' },
    questionsContainer: { padding: 16 },
    questionBlock: { marginBottom: 24 },
    questionText: { fontSize: 16, fontWeight: '600', marginBottom: 12 },
    answerBtn: { padding: 12, borderRadius: 6, borderWidth: 1, borderColor: '#ddd', marginBottom: 8 },
    answerBtnSelected: { backgroundColor: '#E8F5E9', borderColor: '#4CAF50' },
    answerText: { color: '#333' },
    answerTextSelected: { color: '#2E7D32', fontWeight: 'bold' },
    submitBtn: { margin: 16, backgroundColor: '#4CAF50', padding: 15, borderRadius: 8, alignItems: 'center' },
    submitBtnText: { color: '#fff', fontSize: 16, fontWeight: 'bold' }
});

export default QuizScreen;