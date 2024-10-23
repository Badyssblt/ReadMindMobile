import React, { useState, useRef, useEffect } from 'react';
import { StyleSheet, View, Animated } from 'react-native';
import { SafeAreaView } from "react-native-safe-area-context"
import { WebView } from 'react-native-webview';
import AsyncStorage from "@react-native-async-storage/async-storage";
import {useRoute} from "@react-navigation/native";

export default function HomeScreen() {
    const [loading, setLoading] = useState(false);
    const [currentChapter, setCurrentChapter] = useState(0);
    const progress = useRef(new Animated.Value(0)).current;
    const [slug, setSlug] = useState('');
    const [token, setToken] = useState('');
    const [url, setUrl] = useState('https://phenixscans.fr');
    const route = useRoute();
    const { extractedURL } = route.params || {};


    const handleNavigation = (event) => {
        return true;
    };

    const getToken = async () => {
        const storedToken = await AsyncStorage.getItem('token');
        if (storedToken !== null) {
            setToken(storedToken);
            console.log("Token récupéré :", storedToken);
        } else {
            console.log("Aucun token trouvé dans AsyncStorage");
        }
    }

    const handleLoadStart = () => {
        setLoading(true);
        Animated.timing(progress, {
            toValue: 1,
            duration: 5000,
            useNativeDriver: false,
        }).start();
    };

    const handleLoadEnd = () => {
        setLoading(false);
        Animated.timing(progress, {
            toValue: 0,
            duration: 300,
            useNativeDriver: false,
        }).start();
    };

    useEffect(() => {
        if (extractedURL) {
            setUrl(extractedURL);
        }
        if (!loading) {
            progress.setValue(0);
        }
        getToken()
    }, [loading, extractedURL]);

    const extractChapterInfo = (url) => {
        const urlPattern = /^(https?:\/\/[^\/]+)\/(?:v\d{6}-(.+?)-chapitre-(\d+)(?:-v\d+)?\/|(.+?)-chapitre-(\d+)(?:-v\d+)?\/)/;
        const match = url.match(urlPattern);
        if (match) {
            const domain = match[1];
            const slug = match[2] || match[4];
            const chapterNumber = match[3] || match[5];

            setSlug(slug);
            setCurrentChapter(chapterNumber);
        } else {
            console.log("L'URL ne correspond pas au pattern attendu");
        }

    };

    const setChapter = async () => {
        try {
            const response = await fetch(`https://readmind.badyssblilita.fr/v1/api/book/${slug}?token=${token}`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/merge-patch+json',
                },
                body: JSON.stringify({
                    chapter: currentChapter,
                    currentURL: url
                })
            });

            if (response.ok) {
                const result = await response.json();
                console.log("Succès:", result);
            }
        } catch (e) {
            console.log("Erreur dans la requête:", e);
s        }
    }

    const handleNavigationStateChange = (navState) => {
        const { url } = navState;
        setUrl(url);
        if (url) {
            extractChapterInfo(url);
            setChapter();
        }
    };

    const progressWidth = progress.interpolate({
        inputRange: [0, 1],
        outputRange: ['0%', '100%'],
    });

    return (
        <SafeAreaView  style={styles.safeArea}>
            <View style={styles.container}>
                {loading && (
                    <Animated.View style={[styles.progressBar, { width: progressWidth }]} />
                )}
                <WebView
                    source={{ uri: url }}
                    style={styles.webview}
                    onShouldStartLoadWithRequest={handleNavigation}
                    onLoadStart={handleLoadStart}
                    onLoadEnd={handleLoadEnd}
                    cacheEnabled={true}
                    onNavigationStateChange={handleNavigationStateChange}

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
