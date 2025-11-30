import React from "react";
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from "react-native";

interface Gift {
  name: string;
  left: number;
  point: number;
}

export default function RedeemScreen() {
  const gifts: Gift[] = [
    { name: "Voucher Eco 50k", left: 45, point: 100 },
    { name: "Túi vải TC", left: 23, point: 200 },
    { name: "Bình nước inox", left: 12, point: 350 },
    { name: "Voucher Coffee 30k", left: 67, point: 80 },
  ];

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Đổi quà</Text>

      <View style={styles.pointCard}>
        <Text style={styles.pointLabel}>Điểm hiện tại</Text>
        <Text style={styles.pointValue}>1,245</Text>
      </View>

      {gifts.map((g, i) => (
        <View key={i} style={styles.giftBox}>
          <Text style={styles.giftName}>{g.name}</Text>
          <Text>Còn {g.left}</Text>
          <Text style={styles.price}>Giá: ⭐ {g.point}</Text>

          <TouchableOpacity style={styles.button}>
            <Text style={styles.buttonText}>Đổi ngay</Text>
          </TouchableOpacity>
        </View>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { padding: 20, backgroundColor: "#fff", flex: 1 },
  title: { fontSize: 24, fontWeight: "bold", marginBottom: 20 },

  pointCard: {
    backgroundColor: "#cc2dd6",
    padding: 20,
    borderRadius: 15,
    marginBottom: 20,
  },
  pointLabel: { color: "#fff" },
  pointValue: { color: "#fff", fontSize: 26, fontWeight: "bold" },

  giftBox: {
    backgroundColor: "#f8f8f8",
    padding: 15,
    borderRadius: 12,
    marginBottom: 12,
  },

  giftName: { fontSize: 16, fontWeight: "bold" },
  price: { marginTop: 4, fontWeight: "600" },

  button: {
    marginTop: 10,
    backgroundColor: "#000",
    paddingVertical: 10,
    borderRadius: 10,
  },
  buttonText: { color: "#fff", textAlign: "center", fontWeight: "bold" },
});
