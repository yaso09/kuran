import React from 'react';
import { StyleSheet, View, Text, TouchableOpacity, SafeAreaView, Platform } from 'react-native';
import { WifiOff, RotateCcw } from 'lucide-react-native';
import { StatusBar } from 'expo-status-bar';

export default function OfflineScreen({ onRetry }) {
    return (
        <SafeAreaView style={styles.container}>
            <StatusBar style="light" />
            <View style={styles.content}>
                <View style={styles.iconContainer}>
                    <WifiOff size={80} color="#f59e0b" />
                </View>
                <Text style={styles.title}>İnternet Bağlantısı Yok</Text>
                <Text style={styles.description}>
                    Uygulamayı kullanabilmek için internet bağlantısına ihtiyacınız var. Lütfen bağlantınızı kontrol edip tekrar deneyin.
                </Text>
                <TouchableOpacity style={styles.button} onPress={onRetry} activeOpacity={0.8}>
                    <RotateCcw size={20} color="#0b0c0f" />
                    <Text style={styles.buttonText}>Tekrar Dene</Text>
                </TouchableOpacity>
            </View>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#0b0c0f',
    },
    content: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        paddingHorizontal: 40,
    },
    iconContainer: {
        marginBottom: 30,
        padding: 30,
        backgroundColor: 'rgba(245, 158, 11, 0.1)',
        borderRadius: 50,
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#fff',
        marginBottom: 15,
        textAlign: 'center',
        fontFamily: Platform.OS === 'ios' ? 'System' : 'serif',
    },
    description: {
        fontSize: 14,
        color: '#94a3b8',
        textAlign: 'center',
        lineHeight: 22,
        marginBottom: 40,
    },
    button: {
        backgroundColor: '#f59e0b',
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 14,
        paddingHorizontal: 30,
        borderRadius: 16,
        ...Platform.select({
            ios: {
                shadowColor: '#f59e0b',
                shadowOffset: { width: 0, height: 4 },
                shadowOpacity: 0.3,
                shadowRadius: 10,
            },
            android: {
                elevation: 5,
            },
        }),
    },
    buttonText: {
        color: '#0b0c0f',
        fontSize: 16,
        fontWeight: 'bold',
        marginLeft: 10,
    },
});
