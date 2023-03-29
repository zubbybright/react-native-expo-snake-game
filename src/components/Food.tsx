import { StyleSheet, Text, View } from "react-native";
import { Coordinate } from "../types/types";


export default function Food({ x, y , emoji }: Coordinate): JSX.Element {
  return <Text style={[{ top: y * 10, left: x * 10 }, styles.food]}>{emoji}</Text>;
}

const styles = StyleSheet.create({
  food: {
    width: 20,
    height: 20,
    borderRadius: 7,
    position: "absolute",
  },
});
