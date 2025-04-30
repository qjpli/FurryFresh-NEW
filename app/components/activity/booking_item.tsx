import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import React from "react";
import { usePet } from "../../context/pet_context";
import { useGrooming } from "../../context/grooming_context";
import { useSubcategory } from "../../context/subcategory_context";
import SvgValue from "../../hooks/fetchSvg";
import dimensions from "../../utils/sizing";
import moment from "moment";
import Price from "../general/price";
import { router } from "expo-router";

type BookingItemProps = {
  item: {
    id: string;
    pet_ids: string[];
    sharraine_id: string;
    date: string;
    time: string;
    status: string;
    note: string;
    amount: number;
    type: "booking";
    category: string;
  };
};

const BookingItem = ({ item }: BookingItemProps) => {
  const { pets } = usePet();
  const { subcategories } = useSubcategory();
  // const { payments } = usePayments();
  const filteredPets = pets.filter((pet) => item.pet_ids.includes(pet.id));
  const currentGrooming = subcategories.find(
    (sub) => sub.id == item.sharraine_id
  );

  return (
    <View style={styles.container}>
      <View style={styles.iconCont}>
        <SvgValue
          svgIcon={currentGrooming?.svg_icon ?? ""}
          width={dimensions.screenWidth * 0.08}
          height={dimensions.screenWidth * 0.08}
          color="#fff"
        />
      </View>
      <View>
        <Text style={styles.titleBooking}>{currentGrooming?.title}</Text>
        <Text style={styles.subtitleBooking}>
          For pets ({filteredPets.map((pet) => pet.name).join(", ")})
        </Text>
        <Text style={styles.noteText}>
          Scheduled for {moment(item.date).format("MMM DD, YYYY")} -{" "}
          {moment(item.time, "HH:mm").format("h:mm A")}
        </Text>
      </View>
      <View style={{
        position: 'absolute',
        top: dimensions.screenHeight * 0.015,
        right: dimensions.screenWidth * 0.02,
        backgroundColor: item.status != 'completed' ? '#ED7964' : 'green',
        paddingHorizontal: dimensions.screenWidth * 0.03,
        paddingVertical: dimensions.screenHeight * 0.001,
        borderRadius: 30
      }}>
        <Price
          value={item.amount ?? 0}
          color="#fff" fontFamily="Poppins-SemiBold"
          fontSize={dimensions.screenWidth * 0.03}
          lineHeight={dimensions.screenWidth * 0.045}
        />
      </View>
    </View>
  );
};

export default BookingItem;

const styles = StyleSheet.create({
  container: {
    marginBottom: 12,
    backgroundColor: "#FFF",
    borderRadius: 10,
    padding: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
    display: "flex",
    flexDirection: "row",
    position: "relative",
  },
  iconCont: {
    backgroundColor: "#466AA2",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: dimensions.screenWidth * 0.023,
    paddingVertical: dimensions.screenHeight * 0.005,
    maxHeight: dimensions.screenHeight * 0.06,
    borderRadius: 10,
    marginRight: dimensions.screenWidth * 0.035,
  },
  titleBooking: {
    fontSize: dimensions.screenWidth * 0.045,
    lineHeight: dimensions.screenWidth * 0.06,
    fontFamily: "Poppins-SemiBold",
    color: "#466AA2",
    marginBottom: -dimensions.screenHeight * 0.003,
  },
  subtitleBooking: {
    fontSize: dimensions.screenWidth * 0.031,
    lineHeight: dimensions.screenWidth * 0.05,
    fontFamily: "Poppins-Regular",
    color: "#808080",
    marginBottom: 4,
  },
  noteText: {
    fontSize: dimensions.screenWidth * 0.031,
    fontFamily: "Poppins-Regular",
    lineHeight: dimensions.screenWidth * 0.05,
    color: "#808080",
  },
});
