import React, { useState } from 'react';
import {
    View,
    Text,
    TextInput,
    TouchableOpacity,
    StyleSheet,
    Alert
} from 'react-native';
import { login, storeToken } from '../services/api';

export default function LoginScreen({ navigation }: any) {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);

    const handleLogin = async () => {
        if (!email || !password) {
            Alert.alert('Error', 'Please fill in all fields');
            return;
        }

        setLoading(true);
        try {
            const response = await login({ email, password });

            // Store the JWT token
            await storeToken(response.token);

            Alert.alert('Success!', `Welcome back, ${response.displayName}!`, [
                {
                    text: 'OK',
                    onPress: () => navigation.navigate('Feed')
                }
            ]);

        } catch (error: any) {
            let errorMessage = 'Login failed';
            if (error.response?.data) {
                errorMessage = error.response.data;
            } else if (error.message) {
                errorMessage = error.message;
            }

            Alert.alert('Login Failed', errorMessage);
        } finally {
            setLoading(false);
        }
    };

    return (
        <View style={styles.container}>
            <Text style={styles.title}>WarBox</Text>
            <Text style={styles.subtitle}>Wayne State University</Text>

            <TextInput
                style={styles.input}
                placeholder="Email"
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
                editable={!loading}
            />

            <TextInput
                style={styles.input}
                placeholder="Password"
                value={password}
                onChangeText={setPassword}
                secureTextEntry
                editable={!loading}
            />

            <TouchableOpacity
                style={[styles.button, loading && styles.buttonDisabled]}
                onPress={handleLogin}
                disabled={loading}
            >
                <Text style={styles.buttonText}>
                    {loading ? 'Signing In...' : 'Login'}
                </Text>
            </TouchableOpacity>

            <TouchableOpacity
                style={styles.linkButton}
                onPress={() => navigation.navigate('Register')}
                disabled={loading}
            >
                <Text style={styles.linkText}>Don't have an account? Sign up</Text>
            </TouchableOpacity>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        padding: 20,
        backgroundColor: '#f5f5f5',
    },
    title: {
        fontSize: 32,
        fontWeight: 'bold',
        textAlign: 'center',
        marginBottom: 10,
        color: '#2c3e50',
    },
    subtitle: {
        fontSize: 16,
        textAlign: 'center',
        marginBottom: 40,
        color: '#7f8c8d',
    },
    input: {
        borderWidth: 1,
        borderColor: '#ddd',
        padding: 15,
        marginBottom: 15,
        borderRadius: 8,
        backgroundColor: 'white',
        fontSize: 16,
    },
    button: {
        backgroundColor: '#3498db',
        padding: 15,
        borderRadius: 8,
        marginBottom: 20,
    },
    buttonDisabled: {
        backgroundColor: '#bdc3c7',
    },
    buttonText: {
        color: 'white',
        textAlign: 'center',
        fontSize: 16,
        fontWeight: 'bold',
    },
    linkButton: {
        padding: 10,
    },
    linkText: {
        color: '#3498db',
        textAlign: 'center',
        fontSize: 14,
    },
});