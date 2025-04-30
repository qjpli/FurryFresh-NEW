import React from "react";
import { TextInput, StyleSheet, View, TouchableWithoutFeedback, Keyboard } from "react-native";
import { MaterialCommunityIcons } from '@expo/vector-icons';
import dimensions from '../../utils/sizing';

interface PlainTextInputProps {
    value: string;
    onChangeText: (text: string) => void;
    placeholder: string;
    keyboardType?: "default" | "numeric" | "email-address" | "phone-pad";
    secureTextEntry?: boolean;
    autoCapitalize?: "none" | "sentences" | "words" | "characters";
    autoCorrect?: boolean;
    marginBottom?: number;
    marginTop?: number;
    allowClear?: boolean;
    type?: "normal" | "search";
    backgroundColor?: string;
    borderColor?: string;
    paddingVertical?: number;
    paddingHorizontal?: number;
    height?: number;
}

const PlainTextInput: React.FC<PlainTextInputProps> = ({
    value,
    onChangeText,
    placeholder,
    keyboardType = "default",
    secureTextEntry = false,
    autoCapitalize = "none",
    autoCorrect = true,
    marginTop = 0,
    marginBottom = dimensions.screenHeight * 0.04,
    allowClear = false,
    type = "normal",
    backgroundColor = "#f0f0f0",
    borderColor,
    paddingVertical = 0,
    paddingHorizontal = dimensions.screenWidth * 0.05,
    height = dimensions.screenHeight * 0.074,
}) => {
    const [isFocused, setIsFocused] = React.useState(false);
    const inputRef = React.useRef<TextInput>(null);

    const handleFocus = () => setIsFocused(true);
    const handleBlur = () => !value && setIsFocused(false);
    const handleClear = () => onChangeText("");
    const showClearIcon = allowClear && value.length > 0;

    return (
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
            <View style={[styles.container, { marginTop, marginBottom }]}>
                <TouchableWithoutFeedback onPress={() => inputRef.current?.focus()}>
                    <View
                        style={[
                            styles.inputContainer,
                            {
                                backgroundColor,
                                paddingVertical,
                                paddingHorizontal,
                                height,
                            },
                            borderColor ? { borderWidth: 1, borderColor } : {},
                        ]}
                    >
                        <TextInput
                            ref={inputRef}
                            style={styles.input}
                            value={value}
                            onChangeText={onChangeText}
                            placeholder={placeholder}
                            keyboardType={keyboardType}
                            placeholderTextColor="#bbb"
                            secureTextEntry={secureTextEntry}
                            autoCapitalize={autoCapitalize}
                            autoCorrect={autoCorrect}
                            onFocus={handleFocus}
                            onBlur={handleBlur}
                        />
                        {showClearIcon && (
                            <TouchableWithoutFeedback onPress={handleClear}>
                                <MaterialCommunityIcons
                                    name="close-circle"
                                    size={20}
                                    color="#888"
                                    style={styles.clearIcon}
                                />
                            </TouchableWithoutFeedback>
                        )}
                    </View>
                </TouchableWithoutFeedback>
            </View>
        </TouchableWithoutFeedback>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1
    },
    inputContainer: {
        flexDirection: "row",
        alignItems: "center",
        borderRadius: 15,
        position: "relative",
    },
    input: {
        flex: 1,
        fontSize: dimensions.screenWidth * 0.035,
        fontFamily: "Poppins-Regular",
        color: "#333",
        paddingVertical: 1,
    },
    clearIcon: {
        position: "absolute",
        right: 10,
    },
});

export default PlainTextInput;
