import { View, Text } from 'react-native'
import React from 'react'
import BasicGroomingIcon from '../components/svgs/home/services/BasicGroomingIcon';
import StandardGroomingIcon from '../components/svgs/home/services/StandardGrooming';
import PremiumGroomingIcon from '../components/svgs/home/services/PremiumGrooming';
import HealthWellnessIcon from '../components/svgs/home/services/HealthWellnessIcon';
import FoodFeedingEssentialsIcon from '../components/svgs/home/services/FoodFeedingEssentialsIcon';
import AccessoriesIcon from '../components/svgs/home/services/AccessoriesIcon';
import BathBlowDryIcon from '../components/svgs/grooming-inclusions/BathBlowDryIcon';
import HairTrimmingIcon from '../components/svgs/grooming-inclusions/HairTrimmingIcon';
import CatIcon from '../components/svgs/signUp/CatIcon';
import DogIcon from '../components/svgs/signUp/DogIcon';
import PayPalIcon from '../components/svgs/payments/PayPalIcon';
import PayOnServiceIcon from '../components/svgs/payments/PayOnServiceIcon';
import MaleIcon from '../components/svgs/personal/MaleIcon';
import FemaleIcon from '../components/svgs/personal/FemaleIcon';

type Props = {
    svgIcon: string;
    color: string;
    width: number;
    height: number;
}

const SvgValue = (props: Props) => {
    let toReturnData;

    switch (props.svgIcon) {
        case 'basic-grooming':
            toReturnData = <BasicGroomingIcon color={props.color} height={props.height} width={props.width} props />;
            break;
        case 'standard-grooming':
            toReturnData = <StandardGroomingIcon color={props.color} height={props.height} width={props.width} props />;
            break;
        case 'premium-grooming':
            toReturnData = <PremiumGroomingIcon color={props.color} height={props.height} width={props.width} props />;
            break;
        case 'health-wellness':
            toReturnData = <HealthWellnessIcon color={props.color} height={props.height} width={props.width} props />;
            break;
        case 'food-feeding-essentials':
            toReturnData = <FoodFeedingEssentialsIcon color={props.color} height={props.height} width={props.width} props />;
            break;
        case 'accessories':
            toReturnData = <AccessoriesIcon color={props.color} height={props.height} width={props.width} props />;
            break;
        case 'bath-blow-dry':
            toReturnData = <BathBlowDryIcon color={props.color} height={props.height} width={props.width} props />;
            break;
        case 'hair-trimming':
            toReturnData = <HairTrimmingIcon color={props.color} height={props.height} width={props.width} props />;
            break;
        case 'dog':
            toReturnData = <DogIcon color={props.color} height={props.height} width={props.width} props />;
            break;
        case 'cat':
            toReturnData = <CatIcon color={props.color} height={props.height} width={props.width} props />;
            break;
        case 'paypal':
            toReturnData = <PayPalIcon color={props.color} height={props.height} width={props.width} props />;
            break;
        case 'pay-on-service':
            toReturnData = <PayOnServiceIcon color={props.color} height={props.height} width={props.width} props />;
            break;
        case 'male':
            toReturnData = <MaleIcon color={props.color} height={props.height} width={props.width} props />;
            break;
        case 'female':
            toReturnData = <FemaleIcon color={props.color} height={props.height} width={props.width} props />;
            break;
        default:
            toReturnData = null;
            break;
    }

    return toReturnData;
};


export default SvgValue;