import { StyleSheet, Text, View } from 'react-native'
import React from 'react'
import VoucherDefaultIcon from '../svgs/vouchers/VoucherDefaultIcon'
import dimensions from '../../utils/sizing'
import { Ionicons } from '@expo/vector-icons'


interface Voucher {
    id: string;
    title: string;
    description: string;
    discountValue: number;
    discountType: 'percentage' | 'fixed';
    icon?: any;
    forFirstTime: boolean;
    code: string;
    expiryDate?: string;
    isActive: boolean;
    usageLimit?: number;
    usedCount?: number;
    minOrderValue?: number;
    applicableCategories?: string[];
  }

const VoucherTemp1 = ({ voucher }: { voucher: Voucher }) => {

    const icon = voucher.icon ??
        <VoucherDefaultIcon
            color='#fff'
            width={dimensions.screenWidth * 0.12}
            height={dimensions.screenWidth * 0.12}
            props
        />

    return (
        <View style={styles.container}>
            <View style={styles.iconBG}>
                {icon}
            </View>
            <View style={styles.voucherDetails}>
                <Text style={styles.voucherTitle}>{voucher.title}</Text>
                <Text style={styles.voucherDescription}>{voucher.description}</Text>
            </View>
            <View style={styles.endButton}>
                <Ionicons name='arrow-forward' color="#fff" size={dimensions.screenWidth * 0.04} />
            </View>
        </View>
    )
}

export default VoucherTemp1

const styles = StyleSheet.create({
    container: {
        backgroundColor: '#dae0f0',
        display: 'flex',
        flexDirection: 'row',
        paddingHorizontal: dimensions.screenWidth * 0.03,
        paddingVertical: dimensions.screenHeight * 0.015,
        marginTop: dimensions.screenHeight * 0.02,
        marginHorizontal: dimensions.screenWidth * 0.02,
        borderRadius: 10,
        gap: dimensions.screenWidth * 0.025
    },
    iconBG: {
        backgroundColor: '#466AA2',
        alignItems: 'center',
        display: 'flex',
        justifyContent: 'center',
        borderRadius: 100,
        width: dimensions.screenWidth * 0.17,
        height: dimensions.screenWidth * 0.17,
        padding: dimensions.screenWidth * 0.02,
    },
    voucherDetails: {
        flex: 1,
        display: 'flex',
        justifyContent: 'center',
    },
    voucherTitle: {
        fontFamily: 'Poppins-Bold',
        fontSize: dimensions.screenWidth * 0.04,
        lineHeight: dimensions.screenWidth * 0.05,
        color: '#466AA2'
    },
    voucherDescription: {
        fontFamily: 'Poppins-Regular',
        fontSize: dimensions.screenWidth * 0.03,
        lineHeight: dimensions.screenWidth * 0.04,
        color: '#466AA2'
    },
    endButton: {
        backgroundColor: '#466AA2',
        alignItems: 'center',
        display: 'flex',
        justifyContent: 'center',
        borderRadius: 6,
        paddingHorizontal: dimensions.screenWidth * 0.006
    }
})