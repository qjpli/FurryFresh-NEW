import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import React, { useState } from 'react';
import MainContPaw from '../../components/general/background_paw';
import AppbarDefault from '../../components/bars/appbar_default';
import dimensions from '../../utils/sizing';
import { useSession } from '../../context/sessions_context';
import HorizontalButtonList from '../../components/list/horizontal_button_list';
import { useBooking } from '../../context/booking_context';
import { useOrder } from '../../context/order_context';
import BookingItem from '../../components/activity/booking_item';
import OrderItem from '../../components/activity/order_item';
import { router } from 'expo-router';

const Activity = () => {
  const [selectedTab, setSelectedTab] = useState<'ongoing' | 'completed'>('ongoing');
  const [selectedMenu, setSelectedMenu] = useState<'all' | 'pet-care' | 'pet-supplies'>('all');

  const { session } = useSession();
  const { bookings } = useBooking();
  const { orders, orderItems } = useOrder();

  const menus = [
    { id: 'all', title: 'All' },
    { id: 'pet-care', title: 'Pet Care' },
    { id: 'pet-supplies', title: 'Pet Supplies' },
  ];

  const bookingAsActivity = bookings.map((booking) => ({
    id: booking.id,
    pet_ids: booking.pet_ids,
    sharraine_id: booking.grooming_id,
    time: booking.time_start,
    date: booking.date,
    note: booking.note || 'No note',
    status: booking.status,
    amount: booking.amount ?? 0,
    type: 'booking' as const,
    category: 'pet-care',
  }));

  const orderAsActivity = orders.map((order) => ({
    id: order.id,
    date: new Date().toISOString().split('T')[0], // Use `order.created_at` if available
    note: order.note || 'No note',
    status: order.order_status,
    type: 'order' as const,
    category: 'pet-supplies',
    ordered_items: orderItems.filter((oi) => oi.order_id == order.id),
    price: order.amount
  }));

  const allActivities = [...bookingAsActivity, ...orderAsActivity];

  const filteredActivities = allActivities.filter((activity) => {
    const isCorrectStatus =
      selectedTab === 'ongoing' ? activity.status !== 'completed' : activity.status === 'completed';

    const isCorrectCategory =
      selectedMenu === 'all' || activity.category === selectedMenu;

    return isCorrectStatus && isCorrectCategory;
  });

  return (
    <View style={{ flex: 1, backgroundColor: '#F8F8FF' }}>
      <AppbarDefault
        title="Activity"
        session={session}
        showBack={false}
        showLeading={false}
        leadingChildren={null}
        titleSize={dimensions.screenWidth * 0.045}
        paddingBottom={dimensions.screenHeight * 0.01}
      >
        <View style={styles.tabContainer}>
          <TouchableOpacity style={styles.tab} onPress={() => setSelectedTab('ongoing')}>
            <Text style={[styles.tabText, selectedTab === 'ongoing' && styles.tabTextActive]}>
              Ongoing
            </Text>
            {selectedTab === 'ongoing' && <View style={styles.underline} />}
          </TouchableOpacity>

          <TouchableOpacity style={styles.tab} onPress={() => setSelectedTab('completed')}>
            <Text style={[styles.tabText, selectedTab === 'completed' && styles.tabTextActive]}>
              Completed
            </Text>
            {selectedTab === 'completed' && <View style={styles.underline} />}
          </TouchableOpacity>
        </View>
      </AppbarDefault>

      <MainContPaw>
        <HorizontalButtonList
          services={menus}
          activeService={selectedMenu}
          setActiveService={(id) => setSelectedMenu(id as any)}
          paddingHorizontal={dimensions.screenWidth * 0.06}
          marginTop={dimensions.screenHeight * 0.015}
        />

        <View style={{ paddingHorizontal: 24, paddingTop: 16, paddingBottom: dimensions.screenHeight * 0.13 }}>
          {filteredActivities.length === 0 ? (
            <Text style={{ textAlign: 'center', marginTop: 20, color: '#666' }}>
              No activities found.
            </Text>
          ) : (
            filteredActivities.map((item) => {
              if (item.type === 'booking') {
                return <TouchableOpacity 
                    key={item.id} 
                    onPress={() => router.push({
                      pathname: '../activity/preview_grooming',
                      params: {
                        booking: JSON.stringify(bookings.find((book) => book.id == item.id))
                      }
                    })}
                  >
                  <BookingItem item={item} />
                </TouchableOpacity>;
              } else {
                return <TouchableOpacity key={item.id} onPress={() => router.push('../activity/preview_grooming')}>
                  <OrderItem item={item} />
                </TouchableOpacity>;
              }
            })
          )}
        </View>
      </MainContPaw>
    </View>
  );
};

export default Activity;

const styles = StyleSheet.create({
  tabContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    width: '100%',
  },
  tab: {
    alignItems: 'center',
    flex: 1,
  },
  tabText: {
    fontSize: dimensions.screenWidth * 0.035,
    fontFamily: 'Poppins-Regular',
    color: '#A0A0A0',
  },
  tabTextActive: {
    color: '#466AA2',
    fontFamily: 'Poppins-SemiBold',
  },
  underline: {
    height: 2,
    width: '100%',
    backgroundColor: '#466AA2',
    marginTop: 4,
    borderRadius: 1,
  },
  activityItem: {
    marginBottom: 12,
    backgroundColor: '#FFF',
    borderRadius: 10,
    padding: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  dateStatus: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  noteText: {
    fontSize: 14,
    color: '#555',
  },
});
