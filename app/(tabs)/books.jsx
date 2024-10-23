import React, {useEffect, useState} from 'react';
import { StyleSheet, View, TouchableOpacity, Text, TextInput, Alert } from 'react-native';
import { SafeAreaView } from "react-native-safe-area-context"
import AsyncStorage from "@react-native-async-storage/async-storage";
import {WebView} from "react-native-webview";
import {useNavigation} from "@react-navigation/native";

export default function TokenForm() {
    const [token, setToken] = useState('');
    const [success, setSuccess] = useState(false);

    const navigation = useNavigation();

    const getToken = async () => {
        const storedToken = await AsyncStorage.getItem('token');
        if (storedToken !== null) {
            setToken(storedToken);
        } else {
        }
    }

    const open = (url) => {
        Alert.alert("Open Function", `URL to open: ${url}`);
        // Ici, vous pouvez traiter l'URL ou effectuer toute autre action nécessaire
    };

    const handleShouldStartLoadWithRequest = (request) => {
        const { url } = request;

        console.log(url);

        if (url.includes('open(')) {
            const extractedURL = url.match(/open\((.*)\)/)[1];

            navigation.navigate('index', { extractedURL });
            return false;
        }

        return true;
    };

    useEffect(() => {
        getToken()
    }, []);

    return (
        <SafeAreaView style={styles.safeArea}>
            <View style={styles.container}>
                <WebView
                    source={{ uri: `https://readmind.badyssblilita.fr/dashboard?token=${token}` }}
                    onShouldStartLoadWithRequest={handleShouldStartLoadWithRequest}
                />
            </View>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    safeArea: {
        flex: 1,
        backgroundColor: '#fff',
    },
    container: {
        flex: 1,
    },
    webview: {
        flex: 1,
    },
    progressBar: {
        position: 'absolute',
        top: 0,
        left: 0,
        height: 4,
        backgroundColor: '#0000ff',
        zIndex: 2,
    },
});
