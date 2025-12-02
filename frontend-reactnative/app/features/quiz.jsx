import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Alert, ActivityIndicator, Animated } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useRouter, Stack } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';

import { getQuizzes, getQuizById, submitQuiz } from '../../src/services/quizService';
import { getMyProfile } from '../../src/services/userService';

// Helper: Tạo key lưu trạng thái Quiz theo user ID và ngày
const getCompletedQuizzesKey = (userId) => `COMPLETED_QUIZZES_${userId}_DAILY`;

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
	const [timeRemaining, setTimeRemaining] = useState(null); // Thời gian còn lại (giây)
	const [startTime, setStartTime] = useState(null); // Thời gian bắt đầu làm bài
	const [currentUserId, setCurrentUserId] = useState(null); // User ID hiện tại
	const timerRef = useRef(null); 

	useEffect(() => {
		const initData = async () => {
			setLoading(true);
			// Lấy user ID trước
			await loadCurrentUser();
			await fetchQuizzes(); 			// Load danh sách sau
			setLoading(false);
		};
		initData();
	}, []);

	// Load trạng thái khi có user ID
	useEffect(() => {
		if (currentUserId) {
			checkAndLoadQuizStatus();
		} else {
			setCompletedQuizzes(new Set());
		}
	}, [currentUserId]);

	// Load user ID hiện tại
	const loadCurrentUser = async () => {
		try {
			const profile = await getMyProfile();
			if (profile && profile.id) {
				setCurrentUserId(profile.id);
			}
		} catch (error) {
			console.error("Lỗi lấy thông tin user:", error);
			// Nếu không lấy được user, vẫn cho phép làm quiz (nhưng không lưu trạng thái)
		}
	};

	// Helper: Lấy ngày YYYY-MM-DD
	const getTodayString = () => new Date().toISOString().split('T')[0];

	// [3] Logic Kiểm tra & Reset trạng thái theo ngày và user ID
	const checkAndLoadQuizStatus = async () => {
		if (!currentUserId) {
			// Nếu chưa có user ID, không load trạng thái
			setCompletedQuizzes(new Set());
			// Xóa key cũ (không có user ID) nếu có
			try {
				await AsyncStorage.removeItem('COMPLETED_QUIZZES_DAILY');
			} catch (e) {
				// Ignore
			}
			return;
		}

		try {
			// Xóa key cũ (không có user ID) nếu có
			try {
				await AsyncStorage.removeItem('COMPLETED_QUIZZES_DAILY');
			} catch (e) {
				// Ignore
			}

			const storageKey = getCompletedQuizzesKey(currentUserId);
			const jsonValue = await AsyncStorage.getItem(storageKey);
			const today = getTodayString();

			if (jsonValue != null) {
				const data = JSON.parse(jsonValue);
				// Nếu đúng là dữ liệu của hôm nay và đúng user -> Load lên
				if (data.date === today && data.userId === currentUserId) {
					setCompletedQuizzes(new Set(data.ids));
				} else {
					// Ngày mới hoặc user khác -> Reset (Xóa storage cũ)
					await AsyncStorage.removeItem(storageKey);
					setCompletedQuizzes(new Set());
				}
			} else {
				setCompletedQuizzes(new Set());
			}
		} catch(e) {
			console.error("Lỗi đọc trạng thái Quiz:", e);
			setCompletedQuizzes(new Set());
		}
	};

	const fetchQuizzes = async () => {
		try {
			const data = await getQuizzes();
			setQuizzes(data);
		} catch (error) {
			console.error("Lỗi tải danh sách quiz:", error);
			Alert.alert("Lỗi", "Không thể tải danh sách bài kiểm tra.");
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
			const data = await getQuizById(quizId);
			setCurrentQuiz(data);
			setCurrentQuestionIndex(0);
			setUserAnswers({});
			setScoreResult(null);
			setStartTime(Date.now());
			
			// Khởi động timer nếu có time limit
			if (data.timeLimitMinutes) {
				const totalSeconds = data.timeLimitMinutes * 60;
				setTimeRemaining(totalSeconds);
				startTimer(totalSeconds);
			} else {
				setTimeRemaining(null);
			}
		} catch (error) {
			console.error("Lỗi tải quiz:", error);
			Alert.alert("Lỗi", "Không thể tải bài kiểm tra.");
		} finally {
			setLoading(false);
		}
	};

	// Timer function
	const startTimer = (initialSeconds) => {
		if (timerRef.current) {
			clearInterval(timerRef.current);
		}
		
		timerRef.current = setInterval(() => {
			setTimeRemaining((prev) => {
				if (prev <= 1) {
					clearInterval(timerRef.current);
					// Tự động nộp bài khi hết thời gian
					handleSubmit(true);
					return 0;
				}
				return prev - 1;
			});
		}, 1000);
	};

	// Cleanup timer khi component unmount hoặc quiz kết thúc
	useEffect(() => {
		return () => {
			if (timerRef.current) {
				clearInterval(timerRef.current);
			}
		};
	}, []);

	const handleSelectOption = (questionId, optionIndex) => {
		setUserAnswers(prev => ({ ...prev, [questionId]: optionIndex }));
	};

	const handleSubmit = async (isTimeUp = false) => {
		if (!currentQuiz) return;
		
		// Dừng timer
		if (timerRef.current) {
			clearInterval(timerRef.current);
			timerRef.current = null;
		}

		// Tính thời gian đã làm
		const timeTakenSeconds = startTime ? Math.floor((Date.now() - startTime) / 1000) : 0;

		if (isTimeUp) {
			Alert.alert("Hết thời gian!", "Thời gian làm bài đã hết. Hệ thống sẽ tự động nộp bài của bạn.");
		}

		setLoading(true);
		try {
			const result = await submitQuiz(currentQuiz.id, userAnswers, timeTakenSeconds);
			setScoreResult(result);

			// Lưu trạng thái hoàn thành vào bộ nhớ (theo user ID)
			if (currentUserId) {
				setCompletedQuizzes(prev => {
					const newSet = new Set(prev);
					newSet.add(currentQuiz.id);
					
					const storageKey = getCompletedQuizzesKey(currentUserId);
					const storageData = {
						userId: currentUserId,
						date: getTodayString(),
						ids: Array.from(newSet)
					};
					AsyncStorage.setItem(storageKey, JSON.stringify(storageData));
					return newSet;
				});
			}

		} catch (error) {
			console.error("Lỗi nộp bài:", error);
			Alert.alert("Lỗi", error.message || "Nộp bài thất bại. Vui lòng thử lại.");
		} finally {
			setLoading(false);
			setTimeRemaining(null);
			setStartTime(null);
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
		const percentage = scoreResult.percentage || 0;
		const isExcellent = percentage >= 80;
		const isGood = percentage >= 60;
		
		return (
			<SafeAreaView style={styles.container}>
				<Stack.Screen options={{ headerShown: false }} />
				<ScrollView contentContainerStyle={styles.resultContainer}>
					<View style={[styles.resultIconContainer, isExcellent && styles.resultIconExcellent, isGood && !isExcellent && styles.resultIconGood]}>
						<MaterialCommunityIcons 
							name={isExcellent ? "trophy" : isGood ? "medal" : "school"} 
							size={80} 
							color={isExcellent ? "#FFD700" : isGood ? "#4CAF50" : "#9E9E9E"} 
						/>
					</View>
					<Text style={styles.resultTitle}>Kết quả bài kiểm tra</Text>
					<Text style={styles.resultScore}>{scoreResult.correctCount} / {scoreResult.totalQuestions}</Text>
					<Text style={styles.resultText}>Câu trả lời đúng</Text>
					
					<View style={styles.percentageContainer}>
						<Text style={styles.percentageText}>{percentage.toFixed(0)}%</Text>
					</View>
					
					<View style={styles.pointsBadge}>
						<MaterialCommunityIcons name="star" size={20} color="#F57F17" />
						<Text style={styles.pointsText}>+{scoreResult.pointsEarned} Điểm xanh</Text>
					</View>

					{scoreResult.timeTakenSeconds && (
						<View style={styles.timeInfo}>
							<MaterialCommunityIcons name="clock-outline" size={16} color="#666" />
							<Text style={styles.timeText}>
								Thời gian: {Math.floor(scoreResult.timeTakenSeconds / 60)} phút {scoreResult.timeTakenSeconds % 60} giây
							</Text>
						</View>
					)}

					<TouchableOpacity 
						style={styles.btnPrimary} 
						onPress={() => {
							setScoreResult(null);
							setCurrentQuiz(null);
							setTimeRemaining(null);
							setStartTime(null);
						}}
					>
						<Text style={styles.btnText}>Quay lại danh sách</Text>
					</TouchableOpacity>
				</ScrollView>
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
	const isLastQuestion = currentQuestionIndex === currentQuiz.questions.length - 1;

	// Format thời gian còn lại
	const formatTime = (seconds) => {
		if (seconds === null) return null;
		const mins = Math.floor(seconds / 60);
		const secs = seconds % 60;
		return `${mins}:${secs.toString().padStart(2, '0')}`;
	};

	return (
		<SafeAreaView style={styles.container}>
			<Stack.Screen options={{ headerShown: false }} />
			
			{/* Header Progress */}
			<View style={styles.gameHeader}>
				<TouchableOpacity onPress={() => {
					Alert.alert(
						"Xác nhận",
						"Bạn có chắc muốn thoát? Tiến trình làm bài sẽ không được lưu.",
						[
							{ text: "Hủy", style: "cancel" },
							{ 
								text: "Thoát", 
								style: "destructive",
								onPress: () => {
									if (timerRef.current) clearInterval(timerRef.current);
									setCurrentQuiz(null);
									setTimeRemaining(null);
									setStartTime(null);
								}
							}
						]
					);
				}}>
					<MaterialCommunityIcons name="close" size={24} color="#333" />
				</TouchableOpacity>
				<View style={styles.progressBar}>
					<View style={[styles.progressFill, { width: `${((currentQuestionIndex + 1) / currentQuiz.questions.length) * 100}%` }]} />
				</View>
				<View style={styles.headerRight}>
					{timeRemaining !== null && (
						<View style={[styles.timerBadge, timeRemaining <= 60 && styles.timerBadgeWarning]}>
							<MaterialCommunityIcons name="clock-outline" size={14} color={timeRemaining <= 60 ? "#D32F2F" : "#666"} />
							<Text style={[styles.timerText, timeRemaining <= 60 && styles.timerTextWarning]}>
								{formatTime(timeRemaining)}
							</Text>
						</View>
					)}
					<Text style={styles.progressText}>{currentQuestionIndex + 1}/{currentQuiz.questions.length}</Text>
				</View>
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
				{currentQuestionIndex > 0 && (
					<TouchableOpacity 
						style={styles.btnBack} 
						onPress={() => setCurrentQuestionIndex(prev => prev - 1)}
					>
						<MaterialCommunityIcons name="chevron-left" size={20} color="#666" />
						<Text style={styles.btnBackText}>Câu trước</Text>
					</TouchableOpacity>
				)}
				{isLastQuestion ? (
					<TouchableOpacity 
						style={[styles.btnSubmit, userAnswers[question.id] === undefined && styles.btnSubmitDisabled]} 
						onPress={() => handleSubmit(false)}
						disabled={userAnswers[question.id] === undefined}
					>
						<Text style={styles.btnText}>Nộp bài</Text>
					</TouchableOpacity>
				) : (
					<TouchableOpacity 
						style={[styles.btnNext, userAnswers[question.id] === undefined && styles.btnNextDisabled]} 
						onPress={() => setCurrentQuestionIndex(prev => prev + 1)}
						disabled={userAnswers[question.id] === undefined}
					>
						<Text style={styles.btnText}>Câu tiếp theo</Text>
						<MaterialCommunityIcons name="chevron-right" size={20} color="#fff" />
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
	resultContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20, minHeight: '100%' },
	resultIconContainer: { 
		width: 120, 
		height: 120, 
		borderRadius: 60, 
		backgroundColor: '#FFF8E1', 
		justifyContent: 'center', 
		alignItems: 'center',
		marginBottom: 20
	},
	resultIconExcellent: { backgroundColor: '#FFF8E1' },
	resultIconGood: { backgroundColor: '#E8F5E9' },
	resultTitle: { fontSize: 24, fontWeight: 'bold', color: '#333', marginTop: 10 },
	resultScore: { fontSize: 48, fontWeight: 'bold', color: '#2E7D32', marginVertical: 10 },
	resultText: { fontSize: 16, color: '#666', marginBottom: 10 },
	percentageContainer: {
		backgroundColor: '#E3F2FD',
		paddingHorizontal: 24,
		paddingVertical: 12,
		borderRadius: 20,
		marginVertical: 10
	},
	percentageText: { fontSize: 32, fontWeight: 'bold', color: '#1976D2' },
	pointsBadge: { 
		flexDirection: 'row',
		alignItems: 'center',
		backgroundColor: '#FFF8E1', 
		paddingHorizontal: 20, 
		paddingVertical: 12, 
		borderRadius: 20, 
		marginVertical: 20,
		gap: 8
	},
	pointsText: { color: '#F57F17', fontWeight: 'bold', fontSize: 18 },
	timeInfo: {
		flexDirection: 'row',
		alignItems: 'center',
		gap: 6,
		marginBottom: 20
	},
	timeText: { fontSize: 14, color: '#666' },
	btnPrimary: { backgroundColor: '#2E7D32', paddingHorizontal: 40, paddingVertical: 15, borderRadius: 30, width: '100%', alignItems: 'center' },
	
	// Timer styles
	headerRight: { flexDirection: 'row', alignItems: 'center', gap: 8 },
	timerBadge: { 
		flexDirection: 'row', 
		alignItems: 'center', 
		backgroundColor: '#F5F5F5', 
		paddingHorizontal: 10, 
		paddingVertical: 4, 
		borderRadius: 12,
		gap: 4
	},
	timerBadgeWarning: { backgroundColor: '#FFEBEE' },
	timerText: { fontSize: 12, fontWeight: 'bold', color: '#666' },
	timerTextWarning: { color: '#D32F2F' },
	
	// Button styles
	btnBack: { 
		flexDirection: 'row', 
		alignItems: 'center', 
		paddingVertical: 15, 
		paddingHorizontal: 20,
		marginRight: 10
	},
	btnBackText: { color: '#666', fontWeight: '600', fontSize: 16, marginLeft: 4 },
	btnNext: { 
		flex: 1, 
		flexDirection: 'row', 
		alignItems: 'center', 
		justifyContent: 'center',
		backgroundColor: '#1976D2', 
		padding: 15, 
		borderRadius: 12
	},
	btnNextDisabled: { backgroundColor: '#BDBDBD', opacity: 0.6 },
	btnSubmitDisabled: { backgroundColor: '#BDBDBD', opacity: 0.6 }
});