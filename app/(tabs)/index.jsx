import React, { useState, useRef, useEffect } from 'react';
import { StyleSheet, View, SafeAreaView, Animated } from 'react-native';
import { WebView } from 'react-native-webview';
import AsyncStorage from "@react-native-async-storage/async-storage";

export default function HomeScreen() {
    const [loading, setLoading] = useState(false);
    const [currentChapter, setCurrentChapter] = useState(0);
    const progress = useRef(new Animated.Value(0)).current;
    const [slug, setSlug] = useState('');
    const [token, setToken] = useState('');


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
        setLoading(true);  // Commence le chargement
        Animated.timing(progress, {
            toValue: 1,  // Fait évoluer la barre jusqu'à 100%
            duration: 5000,  // Durée arbitraire (5 secondes)
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
        if (!loading) {
            progress.setValue(0);
        }
        getToken()
    }, [loading]);

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

        console.log(match)
    };

    const setChapter = async () => {
        try {
            const response = await fetch(`https://readmind.badyssblilita.fr/v1/api/book/${slug}?token=${token}`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/merge-patch+json',
                },
                body: JSON.stringify({
                    chapter: currentChapter
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
        <SafeAreaView style={styles.safeArea}>
            <View style={styles.container}>
                {loading && (
                    <Animated.View style={[styles.progressBar, { width: progressWidth }]} />
                )}
                <WebView
                    source={{ uri: 'https://phenixscans.fr' }}
                    style={styles.webview}
                    onShouldStartLoadWithRequest={handleNavigation}
                    onLoadStart={handleLoadStart}
                    onLoadEnd={handleLoadEnd}
                    onNavigationStateChange={handleNavigationStateChange}  // Ajout de la fonction pour capturer l'URL
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
