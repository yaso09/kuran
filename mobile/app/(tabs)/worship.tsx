import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Modal, FlatList, RefreshControl } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MapPin, ChevronDown, Clock, Radio } from 'lucide-react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { getPrayerTimes } from '../../lib/pray';
import { TURKISH_CITIES } from '../../lib/cities';
import { useColorScheme } from 'nativewind';

interface PrayerTime {
    vakit: string;
    saat: string;
}

export default function WorshipScreen() {
    const [city, setCity] = useState<string>('İstanbul');
    const [times, setTimes] = useState<PrayerTime[]>([]);
    const [loading, setLoading] = useState(true);
    const [modalVisible, setModalVisible] = useState(false);
    const [nextPrayer, setNextPrayer] = useState<{ vakit: string; remaining: string } | null>(null);

    const { colorScheme } = useColorScheme();
    const isDark = colorScheme === 'dark';

    useEffect(() => {
        loadSettings();
    }, []);

    useEffect(() => {
        if (city) {
            loadTimes();
            const interval = setInterval(updateCountdown, 1000);
            return () => clearInterval(interval);
        }
    }, [city, times]);

    const loadSettings = async () => {
        try {
            const savedCity = await AsyncStorage.getItem('user_city');
            if (savedCity) setCity(savedCity);
            else setCity('İstanbul');
        } catch (e) {
            console.error(e);
        }
    };

    const saveCity = async (selectedCity: string) => {
        try {
            await AsyncStorage.setItem('user_city', selectedCity);
            setCity(selectedCity);
            setModalVisible(false);
        } catch (e) {
            console.error(e);
        }
    };

    const loadTimes = async () => {
        setLoading(true);
        const data = await getPrayerTimes(city);
        if (data.success && data.result) {
            setTimes(data.result);
        }
        setLoading(false);
    };

    const updateCountdown = () => {
        if (times.length === 0) return;

        const now = new Date();
        const currentMinutes = now.getHours() * 60 + now.getMinutes();
        const currentSeconds = now.getHours() * 3600 + now.getMinutes() * 60 + now.getSeconds();

        let next = null;
        let nextTimeStr = '';

        for (const t of times) {
            const [h, m] = t.saat.split(':').map(Number);
            const timeMinutes = h * 60 + m;

            if (timeMinutes > currentMinutes) {
                next = t;
                nextTimeStr = t.saat;
                break;
            }
        }

        if (!next) {
            // If passed all, next is Imsak of tomorrow (approx for now, using today's Imsak)
            next = times[0];
            nextTimeStr = times[0].saat;
            // Logic for tomorrow's countdown is complex without tomorrow's data, simplified for MVP
        }

        if (next) {
            const [targetH, targetM] = nextTimeStr.split(':').map(Number);
            const targetSeconds = targetH * 3600 + targetM * 60;

            let diff = targetSeconds - currentSeconds;
            if (diff < 0) diff += 24 * 3600; // Wrap around for next day

            const h = Math.floor(diff / 3600);
            const m = Math.floor((diff % 3600) / 60);
            const s = diff % 60;

            setNextPrayer({
                vakit: next.vakit,
                remaining: `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`
            });
        }
    };

    const renderCityItem = ({ item }: { item: string }) => (
        <TouchableOpacity
            className="p-4 border-b border-gray-100 dark:border-slate-800"
            onPress={() => saveCity(item)}
        >
            <Text className="text-gray-900 dark:text-white font-medium">{item}</Text>
        </TouchableOpacity>
    );

    return (
        <SafeAreaView className="flex-1 bg-white dark:bg-slate-950">
            {/* City Selector Header */}
            <View className="px-4 py-3 border-b border-gray-100 dark:border-slate-800 flex-row justify-between items-center">
                <View>
                    <Text className="text-xs text-gray-500 dark:text-gray-400 font-bold uppercase tracking-wider">Konum</Text>
                    <TouchableOpacity
                        className="flex-row items-center mt-1"
                        onPress={() => setModalVisible(true)}
                    >
                        <MapPin size={18} color="#f59e0b" style={{ marginRight: 6 }} />
                        <Text className="text-xl font-black text-gray-900 dark:text-white mr-1">{city}</Text>
                        <ChevronDown size={16} color={isDark ? '#94a3b8' : '#64748b'} />
                    </TouchableOpacity>
                </View>
                <TouchableOpacity className="w-10 h-10 bg-amber-50 dark:bg-amber-900/10 rounded-full items-center justify-center">
                    <Radio size={20} color="#f59e0b" />
                </TouchableOpacity>
            </View>

            <ScrollView
                contentContainerStyle={{ padding: 16 }}
                refreshControl={<RefreshControl refreshing={loading} onRefresh={loadTimes} tintColor="#f59e0b" />}
            >
                {/* Countdown Card */}
                {nextPrayer && (
                    <View className="bg-gradient-to-br from-amber-500 to-amber-600 rounded-3xl p-6 mb-8 shadow-lg shadow-amber-500/30">
                        <View className="flex-row justify-between items-start mb-2">
                            <View>
                                <Text className="text-amber-100 font-medium mb-1">Sıradaki Vakit</Text>
                                <Text className="text-3xl font-black text-white">{nextPrayer.vakit}</Text>
                            </View>
                            <Clock size={32} color="rgba(255,255,255,0.3)" />
                        </View>
                        <Text className="text-5xl font-bold text-white tracking-widest mt-4 font-mono">
                            {nextPrayer.remaining}
                        </Text>
                        <Text className="text-amber-100 text-xs mt-2 text-right">kaldı</Text>
                    </View>
                )}

                {/* Times Grid */}
                <View className="bg-gray-50 dark:bg-slate-900 rounded-3xl p-4">
                    {times.map((item, index) => {
                        const isNext = item.vakit === nextPrayer?.vakit;
                        return (
                            <View
                                key={item.vakit}
                                className={`flex-row justify-between items-center p-4 rounded-xl mb-2 ${isNext ? 'bg-white dark:bg-slate-800 shadow-sm border border-amber-200 dark:border-amber-900/30' : ''}`}
                            >
                                <View className="flex-row items-center">
                                    <View className={`w-2 h-2 rounded-full mr-3 ${isNext ? 'bg-amber-500' : 'bg-gray-300 dark:bg-slate-700'}`} />
                                    <Text className={`font-bold ${isNext ? 'text-amber-600 dark:text-amber-500 text-lg' : 'text-gray-600 dark:text-slate-400'}`}>
                                        {item.vakit}
                                    </Text>
                                </View>
                                <Text className={`font-black ${isNext ? 'text-gray-900 dark:text-white text-xl' : 'text-gray-900 dark:text-white'}`}>
                                    {item.saat}
                                </Text>
                            </View>
                        )
                    })}
                </View>

                {/* Radio Banner Helper */}
                <View className="mt-8 bg-indigo-600 rounded-2xl p-6 relative overflow-hidden">
                    <View className="absolute -right-4 -top-4 w-24 h-24 bg-indigo-500 rounded-full opacity-50" />
                    <View className="relative z-10">
                        <Text className="text-white font-bold text-lg mb-1">Kuran Radyo</Text>
                        <Text className="text-indigo-200 text-sm mb-4">7/24 Kesintisiz Yayın</Text>
                        <TouchableOpacity className="bg-white self-start px-4 py-2 rounded-full">
                            <Text className="text-indigo-600 font-bold text-xs">Şimdi Dinle</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </ScrollView>

            {/* City Selection Modal */}
            <Modal
                animationType="slide"
                transparent={true}
                visible={modalVisible}
                onRequestClose={() => setModalVisible(false)}
            >
                <View className="flex-1 bg-black/50">
                    <View className="flex-1 mt-20 bg-white dark:bg-slate-950 rounded-t-3xl overflow-hidden">
                        <View className="p-4 border-b border-gray-100 dark:border-slate-800 flex-row justify-between items-center">
                            <Text className="text-xl font-bold text-gray-900 dark:text-white">Şehir Seçin</Text>
                            <TouchableOpacity onPress={() => setModalVisible(false)} className="p-2">
                                <Text className="text-amber-500 font-bold">Kapat</Text>
                            </TouchableOpacity>
                        </View>
                        <FlatList
                            data={TURKISH_CITIES}
                            renderItem={renderCityItem}
                            keyExtractor={(item) => item}
                            contentContainerStyle={{ paddingBottom: 40 }}
                        />
                    </View>
                </View>
            </Modal>
        </SafeAreaView>
    );
}
