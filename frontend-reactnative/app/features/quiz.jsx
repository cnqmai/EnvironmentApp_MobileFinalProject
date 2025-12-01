import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Alert, ActivityIndicator, Animated } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useRouter, Stack } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage'; // [1] Import Storage

import { API_BASE_URL } from '../../src/constants/api';
import { fetchWithAuth } from '../../src/utils/apiHelper';

// Key lưu trạng thái Quiz theo ngày
const COMPLETED_QUIZZES_KEY = 'COMPLETED_QUIZZES_DAILY';

export default function QuizScreen() {
	const router = useRouter();
	const [loading, setLoading] = useState(true);
	const [quizzes, setQuizzes] = useState([]); 
	const [currentQuiz, setCurrentQuiz] = useState(null); 
	
	// [2] State lưu danh sách ID quiz đã làm hôm nay
	const [completedQuizzes, setCompletedQuizzes] = useState(new Set());

	// Game States
	const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
	const [userAnswers, setUserAnswers] = useState({}); 
	const [scoreResult, setScoreResult] = useState(null); 

	useEffect(() => {
		const initData = async () => {
			setLoading(true);
			await checkAndLoadQuizStatus(); // Load trạng thái trước
			await fetchQuizzes(); 			// Load danh sách sau
			setLoading(false);
		};
		initData();
	}, []);

	// Helper: Lấy ngày YYYY-MM-DD
	const getTodayString = () => new Date().toISOString().split('T')[0];

	// [3] Logic Kiểm tra & Reset trạng thái theo ngày
	const checkAndLoadQuizStatus = async () => {
		try {
			const jsonValue = await AsyncStorage.getItem(COMPLETED_QUIZZES_KEY);
			const today = getTodayString();

			if (jsonValue != null) {
				const data = JSON.parse(jsonValue);
				// Nếu đúng là dữ liệu của hôm nay -> Load lên
				if (data.date === today) {
					setCompletedQuizzes(new Set(data.ids));
				} else {
					// Ngày mới -> Reset (Xóa storage cũ)
					await AsyncStorage.removeItem(COMPLETED_QUIZZES_KEY);
					setCompletedQuizzes(new Set());
				}
			}
		} catch(e) {
			console.error("Lỗi đọc trạng thái Quiz:", e);
		}
	};

	const fetchQuizzes = async () => {
		try {
			const response = await fetchWithAuth(`${API_BASE_URL}/quizzes`, { method: 'GET' });
			if (response.ok) {
				const data = await response.json();
				setQuizzes(data);
			}
		} catch (error) {
			console.error(error);
		}
	};

	const startQuiz = async (quizId) => {
		// Chặn nếu đã làm rồi (phòng trường hợp bypass UI)
		if (completedQuizzes.has(quizId)) {
			Alert.alert("Thông báo", "Bạn đã hoàn thành bài này hôm nay. Hãy quay lại vào ngày mai nhé!");
			return;
		}

		setLoading(true);
		try {
			const response = await fetchWithAuth(`${API_BASE_URL}/quizzes/${quizId}`, { method: 'GET' });
			if (response.ok) {
				const data = await response.json();
				setCurrentQuiz(data);
				setCurrentQuestionIndex(0);
				setUserAnswers({});
				setScoreResult(null);
			}
		} catch (error) {
			Alert.alert("Lỗi", "Không thể tải bài kiểm tra.");
		} finally {
			setLoading(false);
		}
	};

	const handleSelectOption = (questionId, optionIndex) => {
		setUserAnswers(prev => ({ ...prev, [questionId]: optionIndex }));
	};

	const handleSubmit = async () => {
		if (!currentQuiz) return;
		
		setLoading(true);
		try {
			const payload = {
				answers: userAnswers,
				timeTakenSeconds: 300 
			};

			const response = await fetchWithAuth(`${API_BASE_URL}/quizzes/${currentQuiz.id}/submit`, {
				method: 'POST',
				body: JSON.stringify(payload)
			});

			if (response.ok) {
				const result = await response.json();
				setScoreResult(result);

				// [4] Lưu trạng thái hoàn thành vào bộ nhớ
				setCompletedQuizzes(prev => {
					const newSet = new Set(prev);
					newSet.add(currentQuiz.id);
					
					const storageData = {
						date: getTodayString(),
						ids: Array.from(newSet)
					};
					AsyncStorage.setItem(COMPLETED_QUIZZES_KEY, JSON.stringify(storageData));
					return newSet;
				});

			} else {
				Alert.alert("Lỗi", "Nộp bài thất bại.");
			}
		} catch (error) {
			console.error(error);
		} finally {
			setLoading(false);
		}
	};

	// --- RENDER: MÀN HÌNH DANH SÁCH QUIZ ---
	if (!currentQuiz) {
		return (
			<SafeAreaView style={styles.container}>
				<Stack.Screen options={{ headerShown: false }} />
				<View style={styles.header}>
					<TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
						<MaterialCommunityIcons name="arrow-left" size={24} color="#333" />
					</TouchableOpacity>
					<Text style={styles.headerTitle}>Thử thách Kiến thức</Text>
					<View style={{width: 40}} />
				</View>

				{loading ? <ActivityIndicator size="large" color="#2E7D32" style={{marginTop: 50}}/> : (
					<ScrollView contentContainerStyle={{padding: 20}}>
						<Text style={styles.subHeader}>Danh sách bài kiểm tra</Text>
						{quizzes.length === 0 ? (
							<Text style={{textAlign:'center', color:'#666', marginTop: 20}}>Chưa có bài kiểm tra nào.</Text>
						) : (
							quizzes.map((quiz) => {
								const isCompleted = completedQuizzes.has(quiz.id);

								return (
									<TouchableOpacity 
										key={quiz.id} 
										style={[styles.quizCard, isCompleted && styles.quizCardCompleted]}
										onPress={() => startQuiz(quiz.id)}
										disabled={isCompleted}
									>
										<View style={[styles.iconContainer, isCompleted && styles.iconContainerCompleted]}>
											<MaterialCommunityIcons 
												name={isCompleted ? "check-bold" : "brain"} 
												size={32} 
												color="#fff" 
											/>
										</View>
										<View style={{flex: 1}}>
											<Text style={[styles.quizTitle, isCompleted && styles.textCompleted]}>{quiz.title}</Text>
											
											{isCompleted ? (
												<Text style={{color: '#4CAF50', fontWeight: 'bold', fontSize: 13}}>
													Đã hoàn thành hôm nay
												</Text>
											) : (
												<>
													<Text style={styles.quizDesc}>{quiz.description}</Text>
													<View style={styles.metaRow}>
														<MaterialCommunityIcons name="clock-outline" size={14} color="#666" />
														<Text style={styles.metaText}>{quiz.timeLimitMinutes} phút</Text>
													</View>
												</>
											)}
										</View>
										{!isCompleted && (
											<MaterialCommunityIcons name="play-circle" size={32} color="#2E7D32" />
										)}
									</TouchableOpacity>
								);
							})
						)}
					</ScrollView>
				)}
			</SafeAreaView>
		);
	}

	// --- RENDER: MÀN HÌNH KẾT QUẢ ---
	if (scoreResult) {
		return (
			<SafeAreaView style={styles.container}>
				<Stack.Screen options={{ headerShown: false }} />
				<View style={styles.resultContainer}>
					<MaterialCommunityIcons name="trophy" size={80} color="#FFD700" />
					<Text style={styles.resultTitle}>Kết quả</Text>
					<Text style={styles.resultScore}>{scoreResult.correctCount} / {scoreResult.totalQuestions}</Text>
					<Text style={styles.resultText}>Câu trả lời đúng</Text>
					
					<View style={styles.pointsBadge}>
						<Text style={styles.pointsText}>+{scoreResult.pointsEarned} Điểm xanh</Text>
					</View>

					<TouchableOpacity style={styles.btnPrimary} onPress={() => setCurrentQuiz(null)}>
						<Text style={styles.btnText}>Quay lại danh sách</Text>
					</TouchableOpacity>
				</View>
			</SafeAreaView>
		);
	}

	// --- RENDER: MÀN HÌNH LÀM BÀI ---
	// SỬA LỖI: Thêm kiểm tra điều kiện an toàn (Guard Clause)
	if (!currentQuiz.questions || currentQuiz.questions.length === 0) {
		return (
			<SafeAreaView style={styles.container}>
				<Stack.Screen options={{ headerShown: false }} />
				<Text style={{textAlign: 'center', marginTop: 50}}>Lỗi: Không tìm thấy câu hỏi nào cho bài kiểm tra này.</Text>
			</SafeAreaView>
		);
	}

	const question = currentQuiz.questions[currentQuestionIndex];
	const isLastQuestion = currentQuiz.questions.length - 1;

	return (
		<SafeAreaView style={styles.container}>
			<Stack.Screen options={{ headerShown: false }} />
			
			{/* Header Progress */}
			<View style={styles.gameHeader}>
				<TouchableOpacity onPress={() => setCurrentQuiz(null)}>
					<MaterialCommunityIcons name="close" size={24} color="#333" />
				</TouchableOpacity>
				<View style={styles.progressBar}>
					<View style={[styles.progressFill, { width: `${((currentQuestionIndex + 1) / currentQuiz.questions.length) * 100}%` }]} />
				</View>
				<Text style={styles.progressText}>{currentQuestionIndex + 1}/{currentQuiz.questions.length}</Text>
			</View>

			<ScrollView contentContainerStyle={{padding: 20}}>
				<Text style={styles.questionText}>{question.questionText}</Text>

				{/* Danh sách đáp án */}
				{[question.optionA, question.optionB, question.optionC, question.optionD].map((opt, index) => {
					if (!opt) return null; 
					const isSelected = userAnswers[question.id] === index;
					return (
						<TouchableOpacity 
							key={index} 
							style={[styles.optionCard, isSelected && styles.optionSelected]}
							onPress={() => handleSelectOption(question.id, index)}
						>
							<View style={[styles.optionCircle, isSelected && styles.optionCircleSelected]}>
								{isSelected && <View style={styles.optionDot} />}
							</View>
							<Text style={[styles.optionText, isSelected && styles.optionTextSelected]}>{opt}</Text>
						</TouchableOpacity>
					);
				})}
			</ScrollView>

			<View style={styles.footer}>
				{isLastQuestion ? (
					<TouchableOpacity style={styles.btnSubmit} onPress={handleSubmit}>
						<Text style={styles.btnText}>Nộp bài</Text>
					</TouchableOpacity>
				) : (
					<TouchableOpacity 
						style={styles.btnNext} 
						onPress={() => setCurrentQuestionIndex(prev => prev + 1)}
					>
						<Text style={styles.btnText}>Câu tiếp theo</Text>
					</TouchableOpacity>
				)}
			</View>
		</SafeAreaView>
	);
}

const styles = StyleSheet.create({
	container: { flex: 1, backgroundColor: '#F5F5F5' },
	header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 16, backgroundColor: '#fff', elevation: 2 },
	backButton: { padding: 8, borderRadius: 20, backgroundColor: '#f0f0f0' },
	headerTitle: { fontSize: 18, fontWeight: 'bold', color: '#333' },
	subHeader: { fontSize: 16, fontWeight: 'bold', color: '#666', marginBottom: 10 },
	
	// Quiz List Item
	quizCard: { flexDirection: 'row', backgroundColor: '#fff', borderRadius: 12, padding: 15, marginBottom: 15, alignItems: 'center', elevation: 2 },
	
	// [Style mới] Khi hoàn thành
	quizCardCompleted: { opacity: 0.7, backgroundColor: '#FAFAFA', elevation: 0, borderWidth: 1, borderColor: '#EEE' },
	iconContainerCompleted: { backgroundColor: '#BDBDBD' }, // Đổi màu icon thành xám
	textCompleted: { color: '#888', textDecorationLine: 'line-through' }, // Gạch ngang tên quiz

	iconContainer: { width: 50, height: 50, borderRadius: 25, backgroundColor: '#4CAF50', justifyContent: 'center', alignItems: 'center', marginRight: 15 },
	quizTitle: { fontSize: 16, fontWeight: 'bold', color: '#333' },
	quizDesc: { fontSize: 13, color: '#666', marginBottom: 4 },
	metaRow: { flexDirection: 'row', alignItems: 'center' },
	metaText: { fontSize: 12, color: '#666', marginLeft: 4 },

	// Game UI
	gameHeader: { flexDirection: 'row', alignItems: 'center', padding: 16, backgroundColor: '#fff' },
	progressBar: { flex: 1, height: 8, backgroundColor: '#E0E0E0', borderRadius: 4, marginHorizontal: 15, overflow: 'hidden' },
	progressFill: { height: '100%', backgroundColor: '#2E7D32' },
	progressText: { fontWeight: 'bold', color: '#333' },
	
	questionText: { fontSize: 20, fontWeight: 'bold', color: '#333', marginBottom: 24, lineHeight: 28 },
	
	optionCard: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#fff', padding: 16, borderRadius: 12, marginBottom: 12, borderWidth: 1, borderColor: '#ddd' },
	optionSelected: { borderColor: '#2E7D32', backgroundColor: '#E8F5E9' },
	optionCircle: { width: 24, height: 24, borderRadius: 12, borderWidth: 2, borderColor: '#ccc', marginRight: 12, justifyContent: 'center', alignItems: 'center' },
	optionCircleSelected: { borderColor: '#2E7D32' },
	optionDot: { width: 12, height: 12, borderRadius: 6, backgroundColor: '#2E7D32' },
	optionText: { fontSize: 16, color: '#333', flex: 1 },
	optionTextSelected: { color: '#2E7D32', fontWeight: 'bold' },

	footer: { padding: 20, backgroundColor: '#fff', elevation: 10 },
	btnNext: { backgroundColor: '#1976D2', padding: 15, borderRadius: 12, alignItems: 'center' },
	btnSubmit: { backgroundColor: '#2E7D32', padding: 15, borderRadius: 12, alignItems: 'center' },
	btnText: { color: '#fff', fontWeight: 'bold', fontSize: 16 },

	// Result UI
	resultContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 },
	resultTitle: { fontSize: 24, fontWeight: 'bold', color: '#333', marginTop: 10 },
	resultScore: { fontSize: 48, fontWeight: 'bold', color: '#2E7D32', marginVertical: 10 },
	resultText: { fontSize: 16, color: '#666' },
	pointsBadge: { backgroundColor: '#FFF8E1', paddingHorizontal: 20, paddingVertical: 10, borderRadius: 20, marginVertical: 20 },
	pointsText: { color: '#F57F17', fontWeight: 'bold', fontSize: 18 },
	btnPrimary: { backgroundColor: '#2E7D32', paddingHorizontal: 40, paddingVertical: 15, borderRadius: 30 }
});