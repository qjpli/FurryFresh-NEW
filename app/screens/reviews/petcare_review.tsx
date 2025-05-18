import { StyleSheet, Text, View, Image, TouchableWithoutFeedback, Keyboard, KeyboardAvoidingView } from 'react-native'
import React, { useEffect, useState } from 'react'
import { useLocalSearchParams } from 'expo-router'
import Subcategories from '../../interfaces/subcategories'
import MainContCircle from '../../components/general/background_circle'
import dimensions from '../../utils/sizing'
import AppbarDefault from '../../components/bars/appbar_default'
import { useSession } from '../../context/sessions_context'
import { Ionicons } from '@expo/vector-icons'
import Spacer from '../../components/general/spacer'
import { FlatList } from 'react-native-gesture-handler'
import Profile from '../../interfaces/profile'
import supabase from '../../utils/supabase'
import moment from 'moment'

const PetCareReviews = () => {
    const [isInitializing, setInitializing] = useState(false);
    const { reviews, ratings, subcategory } = useLocalSearchParams()
    const { session } = useSession()

    const parsedReviews = reviews ? JSON.parse(reviews as string) : []
    const parsedRatings = ratings ? JSON.parse(ratings as string) : "0.0"
    const parsedSubcategory = subcategory ? JSON.parse(subcategory as string) as Subcategories : null
    const [reviewUsers, setReviewUsers] = useState<Profile[]>();

    useEffect(() => {
        console.log('test');
        console.log(parsedReviews);

        const fetchUsers = async () => {
            const userIds = parsedReviews.map((r: any) => r.user_id).filter(Boolean)

            if (userIds.length === 0) {
                console.log(0);

                return
            }

            const { data, error } = await supabase
                .from('profiles')
                .select('*')
                .in('id', userIds)

            if (error) {
                console.error('Error fetching users:', error)
                return
            }

            setReviewUsers(data as Profile[])

            console.log('Found data:', data);
        }

        if (!isInitializing) {
            setInitializing(true)
            fetchUsers()
        }
    }, [])

    const getRatingCounts = (): Record<1 | 2 | 3 | 4 | 5, number> => {
        const counts: Record<1 | 2 | 3 | 4 | 5, number> = {
            5: 0,
            4: 0,
            3: 0,
            2: 0,
            1: 0
        }

        parsedReviews.forEach((item: { rating: number }) => {
            const r = Math.round(item.rating) as 1 | 2 | 3 | 4 | 5
            if (r >= 1 && r <= 5) counts[r] += 1
        })

        return counts
    }


    const ratingCounts = getRatingCounts()
    const maxCount = Math.max(...Object.values(ratingCounts))

    return (
        <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
            <KeyboardAvoidingView style={{ flex: 1 }}>
                <View style={{ zIndex: 1 }}>
                    <AppbarDefault
                        title={parsedSubcategory?.title}
                        session={session}
                        showLeading={false}
                        leadingChildren={null}
                        titleSize={dimensions.screenWidth * 0.045}
                    />
                </View>
                <MainContCircle isScrolled={true}>
                    {
                        isInitializing ? <>
                            <View style={[styles.card, { justifyContent: 'space-between', flexDirection: 'row', alignItems: 'flex-start' }]}>
                                <View>
                                    <Text style={{ fontFamily: 'Poppins-SemiBold', color: '#808080' }}>Overall Rating</Text>
                                    <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                                        <Ionicons name='star' color="orange" size={dimensions.screenSize * 0.032} />
                                        <Spacer width={dimensions.screenWidth * 0.03} />
                                        <Text style={{
                                            fontFamily: 'Poppins-SemiBold',
                                            lineHeight: dimensions.screenSize * 0.04,
                                            fontSize: dimensions.screenSize * 0.03
                                        }}>{parsedRatings}</Text>
                                    </View>
                                </View>
                                <View style={{ justifyContent: 'center', alignItems: 'flex-end' }}>
                                    {([5, 4, 3, 2, 1] as const).map(rating => {
                                        const count = ratingCounts[rating]
                                        const progress = maxCount > 0 ? count / maxCount : 0
                                        return (
                                            <View key={rating} style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 4 }}>
                                                <Text style={{ fontFamily: 'Poppins-Medium' }}>{rating.toFixed(1)}</Text>
                                                <Spacer width={dimensions.screenWidth * 0.02} />
                                                <View style={{
                                                    backgroundColor: '#D1D1D1',
                                                    borderRadius: 30,
                                                    width: dimensions.screenWidth * 0.25,
                                                    height: dimensions.screenHeight * 0.01,
                                                    overflow: 'hidden'
                                                }}>
                                                    <View style={{
                                                        backgroundColor: 'orange',
                                                        width: `${progress * 100}%`,
                                                        height: '100%',
                                                        borderRadius: 30
                                                    }} />
                                                </View>
                                                <Spacer width={dimensions.screenWidth * 0.02} />
                                                <Text style={{ width: dimensions.screenWidth * 0.06, fontFamily: 'Poppins-Medium' }}>({count})</Text>
                                            </View>
                                        )
                                    })}
                                </View>
                            </View>
                            <FlatList
                                scrollEnabled={false}
                                data={parsedReviews}
                                style={[styles.card, { backgroundColor: 'transparent', paddingHorizontal: 0, marginTop: 0 }]}
                                renderItem={({ item, index }) => {
                                    const user = reviewUsers?.find((user) => user.id == item.user_id);
                                    const rating = item.rating ?? 0;

                                    const stars = Array.from({ length: rating }, (_, index) => (
                                        <Ionicons key={index} name="star" size={16} color="orange" />
                                    ));

                                    return (
                                        <View style={{
                                            flexDirection: 'column',
                                            backgroundColor: '#fff',
                                            paddingHorizontal: dimensions.screenWidth * 0.06,
                                            paddingVertical: dimensions.screenHeight * 0.017,
                                            marginTop: dimensions.screenHeight * 0.02,
                                            borderRadius: 16
                                        }}>
                                            <View style={{
                                                justifyContent: 'space-between',
                                                flexDirection: 'row'
                                            }}>
                                                <View style={{ flexDirection: 'row' }}>
                                                    {stars}
                                                    <Spacer width={dimensions.screenWidth * 0.02} />
                                                    <Text style={{
                                                        fontFamily: 'Poppins-Regular',
                                                        fontSize: dimensions.screenSize * 0.01,
                                                        color: '#808080'
                                                    }}>{rating.toFixed(1)}</Text>
                                                </View>
                                                <View>
                                                    <Text
                                                        style={{
                                                            fontFamily: 'Poppins-Regular',
                                                            fontSize: dimensions.screenSize * 0.01,
                                                            color: '#808080'
                                                        }}
                                                    >{moment(item.created_at).format("MMM DD, YYYY - h:mm A")}</Text>
                                                </View>
                                            </View>
                                            <Spacer height={dimensions.screenHeight * 0.015} />
                                            <View>
                                                <Text
                                                    style={{
                                                        fontFamily: 'Poppins-Regular',
                                                        fontSize: dimensions.screenSize * 0.011
                                                    }}>{item.review_text}</Text>
                                            </View>
                                            <Spacer height={dimensions.screenHeight * 0.015} />
                                            <View style={{ flexDirection: 'row' }}>
                                                <View style={styles.profileImageCont}>
                                                    {
                                                        user?.avatar_url == null ?
                                                            <Ionicons name='person' size={dimensions.screenSize * 0.013} color="#ED7964" /> :
                                                            <Image source={{ uri: user?.avatar_url }} style={styles.profileImage} />
                                                    }
                                                </View>
                                                <Spacer width={dimensions.screenWidth * 0.02} />
                                                <View style={{ flex: 1, marginTop: dimensions.screenHeight * 0.00, justifyContent: 'center' }}>
                                                    <Text
                                                        style={{
                                                            fontFamily: 'Poppins-Medium',
                                                            fontSize: dimensions.screenSize * 0.012
                                                        }}>{user?.first_name + ' ' + user?.last_name}</Text>
                                                </View>
                                            </View>
                                        </View>
                                    )
                                }}
                            >
                            </FlatList>
                        </> : <View>

                        </View>
                    }
                </MainContCircle>
            </KeyboardAvoidingView>
        </TouchableWithoutFeedback>
    )
}

export default PetCareReviews

const styles = StyleSheet.create({
    card: {
        backgroundColor: '#fff',
        paddingHorizontal: dimensions.screenWidth * 0.06,
        paddingVertical: dimensions.screenHeight * 0.015,
        borderRadius: 10,
        marginHorizontal: dimensions.screenWidth * 0.05,
        marginTop: dimensions.screenHeight * 0.02
    },
    profileImageCont: {
        backgroundColor: '#e7e7e7',
        borderRadius: 100,
        borderWidth: 1.5,
        borderColor: '#ED7964',
        alignItems: 'center',
        justifyContent: 'center',
        width: dimensions.screenSize * 0.033,
        height: dimensions.screenSize * 0.033
    },
    profileImage: {
        width: dimensions.screenSize * 0.033,
        height: dimensions.screenSize * 0.033,
        borderRadius: 100,
        borderWidth: 1.5,
        borderColor: '#D1D1D1',
    }
})
