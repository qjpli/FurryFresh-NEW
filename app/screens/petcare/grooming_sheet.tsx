import { StyleSheet, Text, View } from 'react-native'
import React, { useRef, useState } from 'react'
import BottomSheet, { BottomSheetView } from '@gorhom/bottom-sheet';


const GroomingSheet = () => {
    const sheetRef = useRef<BottomSheet>(null);
    const [isOpen, setIsOpen] = useState(true);

    const snapPoints = ["20%"];

    return (
        <View style={styles.container}>
            <Text>GroomingSheet</Text>
            <BottomSheet
                ref={sheetRef}
                snapPoints={snapPoints}
            >
                <BottomSheetView>
                    <Text>GroomingSheet</Text>
                </BottomSheetView>
            </BottomSheet>
        </View>
    )
}

export default GroomingSheet

const styles = StyleSheet.create({
    container: {

    }
})