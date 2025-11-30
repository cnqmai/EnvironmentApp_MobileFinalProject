import React from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { useNavigation } from "@react-navigation/native";

export default function HomeScreen() {
  const navigation = useNavigation();

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Trang chủ</Text>

      <TouchableOpacity
        style={styles.button}
        onPress={() => navigation.navigate("RewardPoints" as never)}
      >
        <Text style={styles.buttonText}>Điểm thưởng</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.button}
        onPress={() => navigation.navigate("Badges" as never)}
      >
        <Text style={styles.buttonText}>Huy hiệu</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.button}
        onPress={() => navigation.navigate("Redeem" as never)}
      >
        <Text style={styles.buttonText}>Đổi quà</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  title: {
    fontSize: 26,
    fontWeight: "bold",
    marginBottom: 40,
  },
  button: {
    width: "80%",
    paddingVertical: 15,
    borderRadius: 10,
    backgroundColor: "#4CAF50",
    marginVertical: 10,
  },
  buttonText: {
    color: "#fff",
    fontSize: 18,
    textAlign: "center",
  },
});
