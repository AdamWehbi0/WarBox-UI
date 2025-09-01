import React, { useState } from 'react';
import {
    View,
    Text,
    TextInput,
    TouchableOpacity,
    StyleSheet,
    Alert,
    ScrollView
} from 'react-native';
import { register, storeToken } from '../services/api';

export default function RegisterScreen({ navigation }: any) {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [handle, setHandle] = useState('');
    const [displayName, setDisplayName] = useState('');
    const [loading, setLoading] = useState(false);

    const handleRegister = async () => {
        if (!email || !password || !handle || !displayName) {
            Alert.alert('Error', 'Please fill in all fields');
            return;
        }

        setLoading(true);
        try {
            const response = await register({
                email,
                password,
                handle,
                displayName
            });

            // Store the JWT token
            await storeToken(response.token);

            Alert.alert(
                'Welcome to WarBox!',
                `Account created successfully for @${response.handle}!`,
                [
                    {
                        text: 'OK',
                        onPress: () => navigation.navigate('Feed')
                    }
                ]
            );

        } catch (error: any) {
            let errorMessage = 'Registration failed';
            if (error.response?.data) {
                errorMessage = error.response.data;
            } else if (error.message) {
                errorMessage = error.message;
            }

            Alert.alert('Registration Failed', errorMessage);
        } finally {
            setLoading(false);
        }
    };

    return (
        <ScrollView contentContainerStyle={styles.container}>
            <Text style={styles.title}>Join WarBox</Text>
            <Text style={styles.subtitle}>Wayne State University</Text>

            <TextInput
                style={styles.input}
                placeholder="Email (@wayne.edu)"
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
                editable={!loading}
            />

            <TextInput
                style={styles.input}
                placeholder="Handle (@username)"
                value={handle}
                onChangeText={setHandle}
                autoCapitalize="none"
                editable={!loading}
            />

            <TextInput
                style={styles.input}
                placeholder="Display Name"
                value={displayName}
                onChangeText={setDisplayName}
                editable={!loading}
            />

            <TextInput
                style={styles.input}
                placeholder="Password (8+ chars, mixed case, numbers)"
                value={password}
                onChangeText={setPassword}
                secureTextEntry
                editable={!loading}
            />

            <TouchableOpacity
                style={[styles.button, loading && styles.buttonDisabled]}
                onPress={handleRegister}
                disabled={loading}
            >
                <Text style={styles.buttonText}>
                    {loading ? 'Creating Account...' : 'Create Account'}
                </Text>
            </TouchableOpacity>

            <TouchableOpacity
                style={styles.linkButton}
                onPress={() => navigation.navigate('Login')}
                disabled={loading}
            >
                <Text style={styles.linkText}>Already have an account? Sign in</Text>
            </TouchableOpacity>
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: {
        flexGrow: 1,
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
        backgroundColor: '#27ae60',
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