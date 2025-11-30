import React from "react";
import { TextInput, StyleSheet, View, Text, TextInputProps } from "react-native";
import colors from "../theme/colors";
import spacing from "../theme/spacing";

interface Props extends TextInputProps {
  label?: string;
}

export default function Input({ label, ...props }: Props) {
  return (
    <View style={styles.container}>
      {label && <Text style={styles.label}>{label}</Text>}
      <TextInput style={styles.input} placeholderTextColor="#999" {...props} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { marginBottom: spacing.md },
  label: { marginBottom: 6, fontSize: 14, color: colors.textDark },
  input: {
    height: 48,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 10,
    paddingHorizontal: 12,
    fontSize: 16,
    backgroundColor: "#FFF",
  },
});
