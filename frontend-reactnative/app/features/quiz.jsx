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

  return (
    <View style={styles.container}>
      
      {/* Progress Section */}
      <View style={styles.progressContainer}>
        <View style={styles.progressHeader}>
           <Text style={styles.progressText}>Câu {questionData.current}/{questionData.total}</Text>
           <View style={styles.pointsBadge}>
              <Text style={styles.pointsText}>+{questionData.points} điểm</Text>
           </View>
        </View>
        {/* Progress Bar */}
        <View style={styles.track}>
           <View style={[styles.bar, { width: '50%' }]} />
        </View>
      </View>

      {/* Question */}
      <View style={styles.content}>
        <Text style={styles.questionText}>{questionData.question}</Text>

        <View style={styles.optionsList}>
          {questionData.options.map((opt) => {
            const isSelected = selectedId === opt.id;
            return (
              <TouchableOpacity 
                key={opt.id}
                style={[styles.optionCard, isSelected && styles.optionSelected]}
                onPress={() => setSelectedId(opt.id)}
                activeOpacity={0.9}
              >
                <View style={[styles.radio, isSelected && styles.radioSelected]}>
                    {isSelected && <View style={styles.radioDot} />}
                </View>
                <Text style={[styles.optionText, isSelected && styles.textSelected]}>
                    {opt.label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>
      </View>

      {/* Footer Button */}
      <View style={styles.footer}>
        <TouchableOpacity 
          style={[styles.nextBtn, !selectedId && styles.nextBtnDisabled]}
          disabled={!selectedId}
          onPress={handleNext}
        >
          <Text style={styles.nextBtnText}>Câu tiếp theo</Text>
        </TouchableOpacity>
      </View>

    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FFF' },
  
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

  footer: { padding: 24, borderTopWidth: 1, borderTopColor: '#F0F0F0' },
  nextBtn: { backgroundColor: '#111', padding: 16, borderRadius: 14, alignItems: 'center' },
  nextBtnDisabled: { backgroundColor: '#CCC' },
  nextBtnText: { color: '#FFF', fontSize: 16, fontWeight: 'bold' },
});

export default QuizScreen;