import React, { useState } from 'react';
import { StyleSheet, View, TouchableOpacity, Text, TextInput, Alert } from 'react-native';
import { SafeAreaView } from "react-native-safe-area-context"
import AsyncStorage from "@react-native-async-storage/async-storage";

export default function TokenForm() {
    const [token, setToken] = useState('');
    const [success, setSuccess] = useState(false);

    const handleSubmit = async () => {
        if (token) {
            try {
                await AsyncStorage.setItem('token', token);
                setToken('');
                setSuccess(true)
            } catch (error) {
                Alert.alert("Erreur", "Échec de la sauvegarde du token");
            }
        } else {
            Alert.alert("Erreur", "Veuillez entrer un token.");
        }
    };


    return (
        <SafeAreaView style={styles.safeArea}>
            <View style={styles.container}>
                <Text style={styles.label}>Token</Text>
                <TextInput
                    style={styles.input}
                    value={token}
                    onChangeText={setToken}
                    placeholder="Veuillez entrer votre token"
                    autoCapitalize="none"
                />
                <TouchableOpacity style={styles.button} onPress={handleSubmit}>
                    <Text style={styles.buttonText}>Envoyer</Text>
                </TouchableOpacity>
                    {
                    success &&
                    <Text>Votre token a été enregistré !</Text>
                    }
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
        padding: 20,
    },
    label: {
        fontSize: 18,
        marginBottom: 10,
        fontWeight: 'bold',
    },
    input: {
        height: 40,
        borderColor: '#ccc',
        borderWidth: 1,
        borderRadius: 5,
        paddingHorizontal: 10,
        marginBottom: 20,
    },
    button: {
        backgroundColor: "#6FFF90",
        padding: 10,
        alignItems: 'center',
        borderRadius: 5,
    },
    buttonText: {
        fontSize: 16,
        fontWeight: 'bold',
    },
});
