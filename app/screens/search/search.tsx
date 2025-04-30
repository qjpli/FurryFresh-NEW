import { StyleSheet, Text, View, FlatList, TouchableOpacity } from 'react-native';
import React, { useState } from 'react';
import dimensions from '../../utils/sizing';
import PlainTextInput from '../../components/inputs/custom_text_input2';
import MainContPaw from '../../components/general/background_paw';
import AppbarDefault from '../../components/bars/appbar_default';
import { useSession } from '../../context/sessions_context';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import Spacer from '../../components/general/spacer';

type SearchProps = {};

const Search = ({ }: SearchProps) => {
    const { session } = useSession();
    const [query, setQuery] = useState('');
    const [results, setResults] = useState<string[]>([]);

    const handleSearch = (text: string) => {
        setQuery(text);
        const dummyResults = ['Grooming', 'Pet Food', 'Vet Check', 'Accessories'];
        const filtered = dummyResults.filter(item =>
            item.toLowerCase().includes(text.toLowerCase())
        );
        setResults(filtered);
    };

    return (
        <View style={{ height: '100%', flex: 1 }}>
            {
                <AppbarDefault
                    title={""}
                    session={session}
                    showBack={false}
                    showLeading={false}
                    leadingChildren={null}
                    titleSize={dimensions.screenWidth * 0.045}
                    paddingBottom={dimensions.screenHeight * 0.01}
                    paddingTop={dimensions.screenHeight * 0.055}
                >
                    <View
                        style={{
                            display: 'flex',
                            flexDirection: 'row',
                            alignItems: 'center'
                        }}
                    >
                        <TouchableOpacity onPress={() => router.back()}>
                            <Ionicons name='arrow-back' size={dimensions.screenWidth * 0.06} />
                        </TouchableOpacity>
                        <Spacer width={dimensions.screenWidth * 0.03} />
                        <PlainTextInput
                            value={query}
                            onChangeText={handleSearch}
                            placeholder="Search services..."
                            type="search"
                            allowClear
                            borderColor="#ccc"
                            marginBottom={0}
                            marginTop={0}
                            backgroundColor="#fff"
                            height={dimensions.screenHeight * 0.06}
                        />
                    </View>
                </AppbarDefault>
            }
            <MainContPaw>
                <View style={styles.container}>
                    <FlatList
                        data={results}
                        keyExtractor={(item, index) => index.toString()}
                        scrollEnabled={false}
                        renderItem={({ item }) => (
                            <View style={styles.resultItem}>
                                <Text style={styles.resultText}>{item}</Text>
                            </View>
                        )}
                        ListEmptyComponent={
                            query.length > 0 ? (
                                <Text style={styles.emptyText}>No results found</Text>
                            ) : null
                        }
                        contentContainerStyle={{ flexGrow: 1 }}
                    />
                </View>
            </MainContPaw>
        </View>
    );
};

export default Search;

const styles = StyleSheet.create({
    container: {
        flex: 1,
        paddingHorizontal: dimensions.screenWidth * 0.06,
        paddingTop: dimensions.screenHeight * 0.04,
    },
    title: {
        fontSize: dimensions.screenWidth * 0.06,
        fontFamily: 'Poppins-SemiBold',
        marginBottom: 16,
        color: '#333',
    },
    resultItem: {
        paddingVertical: 14,
        borderBottomColor: '#eee',
        borderBottomWidth: 1,
    },
    resultText: {
        fontSize: 16,
        color: '#333',
        fontFamily: 'Poppins-Regular',
    },
    emptyText: {
        textAlign: 'center',
        marginTop: 40,
        color: '#999',
        fontFamily: 'Poppins-Regular',
    },
});
