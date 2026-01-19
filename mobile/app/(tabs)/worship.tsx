import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Modal, FlatList, RefreshControl } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MapPin, ChevronDown, Clock, Bell } from 'lucide-react-native';
import { Link } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { getPrayerTimes } from '../../lib/pray';
import { TURKISH_CITIES } from '../../lib/cities';
import { schedulePrayerNotification, registerForPushNotificationsAsync } from '../../lib/notifications';
import QuranRadio from '../../components/QuranRadio';
import { useUser } from '@clerk/clerk-expo';

export default function WorshipScreen() {
    const [city, setCity] = useState('İstanbul');
    const [prayerTimes, setPrayerTimes] = useState<any>(null);
    const [nextPrayer, setNextPrayer] = useState<string>('');
    const [countdown, setCountdown] = useState<string>('');
    const [modalVisible, setModalVisible] = useState(false);
    const [loading, setLoading] = useState(false);

    // Notification State
    const [notificationsEnabled, setNotificationsEnabled] = useState(false);
    const { user } = useUser();

    useEffect(() => {
        loadCity();
        const interval = setInterval(() => {
            calculateNextPrayer();
        }, 60000); // Update every minute
        return () => clearInterval(interval);
    }, [user]);

    useEffect(() => {
        if (prayerTimes) {
            calculateNextPrayer();
        }
    }, [prayerTimes]);

    const loadCity = async () => {
        try {
            setLoading(true);
            let initialCity = 'İstanbul';

            // Try Clerk first
            if (user?.unsafeMetadata?.city) {
                initialCity = user.unsafeMetadata.city as string;
            } else {
                // Fallback to AsyncStorage
                const savedCity = await AsyncStorage.getItem('user_city');
                if (savedCity) initialCity = savedCity;
            }

            const savedNotif = await AsyncStorage.getItem('notifications_enabled');
            if (savedNotif) setNotificationsEnabled(JSON.parse(savedNotif));

            setCity(initialCity);
            fetchPrayerTimes(initialCity);
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    };

    const saveCity = async (selectedCity: string) => {
        try {
            setCity(selectedCity);
            setModalVisible(false);
            fetchPrayerTimes(selectedCity);

            // Save locally
            await AsyncStorage.setItem('user_city', selectedCity);

            // Sync with Clerk
            if (user) {
                await user.update({
                    unsafeMetadata: {
                        ...user.unsafeMetadata,
                        city: selectedCity
                    }
                });
            }
        } catch (e) {
            console.error(e);
        }
    };

    const toggleNotifications = async () => {
        const newState = !notificationsEnabled;
        setNotificationsEnabled(newState);
        await AsyncStorage.setItem('notifications_enabled', JSON.stringify(newState));

        if (newState) {
            await registerForPushNotificationsAsync();
            // Ideally schedule here based on prayerTimes
            if (prayerTimes) {
                // Demo scheduling for next prayer
                // schedulePrayerNotification('Namaz Vakti', 'Vakit Girdi!', 5);
            }
        }
    };

    const fetchPrayerTimes = async (cityName: string) => {
        setLoading(true);
        try {
            const times = await getPrayerTimes(cityName);
            setPrayerTimes(times);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const calculateNextPrayer = () => {
        // Basic countdown logic (simplified for demo)
        // Needs full date parsing implementation used in original pray.ts
        if (!prayerTimes) return;

        const now = new Date();
        const currentMinutes = now.getHours() * 60 + now.getMinutes();

        const prayers = [
            { name: 'İmsak', time: prayerTimes['İmsak'] },
            { name: 'Güneş', time: prayerTimes['Güneş'] },
            { name: 'Öğle', time: prayerTimes['Öğle'] },
            { name: 'İkindi', time: prayerTimes['İkindi'] },
            { name: 'Akşam', time: prayerTimes['Akşam'] },
            { name: 'Yatsı', time: prayerTimes['Yatsı'] }
        ];

        let next = null;
        let diff = 0;

        for (const p of prayers) {
            const [h, m] = p.time.split(':').map(Number);
            const pMinutes = h * 60 + m;

            if (pMinutes > currentMinutes) {
                next = p;
                diff = pMinutes - currentMinutes;
                break;
            }
        }

        if (!next) {
            // Tomorrow Imsak
            next = prayers[0];
            // Simplified calc
            setNextPrayer('İmsak (Yarın)');
            setCountdown('...');
            return;
        }

        setNextPrayer(next.name);
        const h = Math.floor(diff / 60);
        const m = diff % 60;
        setCountdown(`${h} sa ${m} dk`);
    };

    return (
        <SafeAreaView className="flex-1 bg-gray-50 dark:bg-slate-950">
            <ScrollView
                contentContainerStyle={{ padding: 16 }}
                refreshControl={<RefreshControl refreshing={loading} onRefresh={loadCity} tintColor="#f59e0b" />}
            >
                {/* Header */}
                <View className="flex-row items-center justify-between mb-6">
                    <View>
                        <Text className="text-gray-500 dark:text-gray-400 text-sm font-medium">Konum</Text>
                        <TouchableOpacity
                            onPress={() => setModalVisible(true)}
                            className="flex-row items-center"
                        >
                            <MapPin size={18} color="#f59e0b" />
                            <Text className="text-2xl font-black text-gray-900 dark:text-white ml-1">{city}</Text>
                            <ChevronDown size={20} color="#f59e0b" />
                        </TouchableOpacity>
                    </View>
                    <TouchableOpacity
                        onPress={toggleNotifications}
                        className={`p-3 rounded-full ${notificationsEnabled ? 'bg-amber-100' : 'bg-gray-100 dark:bg-slate-800'}`}
                    >
                        <Bell size={20} color={notificationsEnabled ? '#d97706' : '#94a3b8'} fill={notificationsEnabled ? '#d97706' : 'none'} />
                    </TouchableOpacity>
                </View>

                {/* Countdown Card */}
                <View className="bg-amber-500 rounded-3xl p-6 mb-6 shadow-lg shadow-amber-500/30">
                    <View className="flex-row justify-between items-start">
                        <View>
                            <Text className="text-amber-100 font-medium mb-1">Sıradaki Vakit</Text>
                            <Text className="text-4xl font-black text-white mb-2">{nextPrayer}</Text>
                            <View className="bg-white/20 px-3 py-1 rounded-full self-start flex-row items-center">
                                <Clock size={14} color="white" />
                                <Text className="text-white font-bold ml-1">{countdown}</Text>
                            </View>
                        </View>
                        <View className="bg-white/20 w-12 h-12 rounded-full items-center justify-center">
                            <Clock size={24} color="white" />
                        </View>
                    </View>
                </View>

                {/* Prayer List */}
                <View className="bg-white dark:bg-slate-900 rounded-3xl p-4 shadow-sm mb-6">
                    {prayerTimes && Object.keys(prayerTimes).map((key, index) => (
                        <View key={key} className={`flex-row justify-between items-center py-3 ${index !== 5 ? 'border-b border-gray-100 dark:border-slate-800' : ''}`}>
                            <Text className="text-base font-bold text-gray-600 dark:text-gray-400">{key}</Text>
                            <Text className="text-lg font-black text-gray-900 dark:text-white">{prayerTimes[key]}</Text>
                        </View>
                    ))}
                    {!prayerTimes && (
                        <View className="py-10 items-center">
                            <Text className="text-gray-400">Yükleniyor...</Text>
                        </View>
                    )}
                </View>

                {/* Radio Section */}
                <View className="mb-6">
                    <QuranRadio />
                </View>

                {/* Zikirmatik Banner */}
                <Link href="/zikirmatik/index" asChild>
                    <TouchableOpacity className="mt-4 bg-teal-600 rounded-2xl p-6 relative overflow-hidden mb-8">
                        <View className="absolute -right-4 -top-4 w-24 h-24 bg-teal-500 rounded-full opacity-50" />
                        <View className="relative z-10">
                            <Text className="text-white font-bold text-lg mb-1">Zikirmatik</Text>
                            <Text className="text-teal-200 text-sm">Günlük Zikirlerinizi Takip Edin</Text>
                        </View>
                    </TouchableOpacity>
                </Link>
            </ScrollView>

            {/* City Selection Modal */}
            <Modal
                visible={modalVisible}
                animationType="slide"
                presentationStyle="pageSheet"
                onRequestClose={() => setModalVisible(false)}
            >
                <View className="flex-1 bg-white dark:bg-slate-950 p-4">
                    <View className="flex-row justify-between items-center mb-4">
                        <Text className="text-xl font-bold text-gray-900 dark:text-white">Şehir Seçin</Text>
                        <TouchableOpacity onPress={() => setModalVisible(false)}>
                            <Text className="text-amber-500 font-bold">Kapat</Text>
                        </TouchableOpacity>
                    </View>
                    <FlatList
                        data={TURKISH_CITIES}
                        keyExtractor={(item) => item}
                        renderItem={({ item }) => (
                            <TouchableOpacity
                                onPress={() => saveCity(item)}
                                className="py-4 border-b border-gray-100 dark:border-slate-800"
                            >
                                <Text className={`text-lg ${city === item ? 'font-bold text-amber-500' : 'text-gray-900 dark:text-white'}`}>
                                    {item}
                                </Text>
                            </TouchableOpacity>
                        )}
                    />
                </View>
            </Modal>
        </SafeAreaView>
    );
}
