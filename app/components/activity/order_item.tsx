import { StyleSheet, Text, View } from "react-native";
import React from "react";
import SvgValue from "../../hooks/fetchSvg";
import dimensions from "../../utils/sizing";
import { Ionicons } from "@expo/vector-icons";
import moment from "moment";
import Price from "../general/price";

type OrderItemProps = {
  item: {
    id: string;
    date: string;
    status: string;
    note: string;
    type: "order";
    category: string;
    ordered_items: any[];
    price: any;
  };
};

const OrderItem = ({ item }: OrderItemProps) => {
  
  return (
    <View style={styles.container}>
      <View style={styles.iconCont}>
        <Ionicons
          name="cart"
          size={dimensions.screenWidth * 0.07}
          color="#fff"
        />
      </View>
      <View style={{ width: '55%' }}>
        <Text numberOfLines={1} style={styles.titleBooking}>Order Placed</Text>
        <Text style={styles.subtitleBooking}>
          Total items: {item.ordered_items.length}
        </Text>
        <Text style={styles.noteText}>
          Date Ordered: {moment(item.date).format("MMM DD, YYYY")}
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
          value={item.price ?? 0} 
          color="#fff" 
          fontFamily="Poppins-SemiBold" 
          fontSize={dimensions.screenWidth * 0.03}
          lineHeight={dimensions.screenWidth * 0.045} 
        />
      </View>
    </View>
  );
};

export default OrderItem;

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
    padding: dimensions.screenWidth * 0.028,
    maxHeight: dimensions.screenHeight * 0.06,
    borderRadius: 10,
    marginRight: dimensions.screenWidth * 0.035,
  },
  dateStatus: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 4,
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
