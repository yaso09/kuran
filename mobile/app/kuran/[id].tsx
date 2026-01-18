import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, ActivityIndicator, TouchableOpacity, Share } from 'react-native';
import { useLocalSearchParams, Stack, useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ChevronLeft, Play, Pause, Share2 } from 'lucide-react-native';
import { SURAHS } from '../../lib/constants';
import { useColorScheme } from 'nativewind';
import { SurahData, Verse } from '../../types/quran';

export default function SurahDetailScreen() {
    const { id } = useLocalSearchParams();
    const surahId = Number(id);
    const surah = SURAHS.find(s => s.id === surahId);
    const router = useRouter();
    const { colorScheme } = useColorScheme();
    const isDark = colorScheme === 'dark';

    const [loading, setLoading] = useState(true);
    const [data, setData] = useState<SurahData | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [playingVerse, setPlayingVerse] = useState<string | null>(null);

    useEffect(() => {
        fetchSurah();
    }, [surahId]);

    const fetchSurah = async () => {
        try {
            setLoading(true);
            const response = await fetch(`https://kurancilar.github.io/json/sure/${surahId}.json`);
            if (!response.ok) throw new Error('Veri alınamadı');
            const json = await response.json();
            setData(json);
        } catch (err) {
            setError('Sure yüklenirken bir sorun oluştu.');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleShare = async (verse: Verse) => {
        try {
            await Share.share({
                message: `${surah?.name} Suresi, ${verse.verseNumber}. Ayet\n\n${verse.turkish.diyanet_vakfi}\n\nhttps://quran-app.com/kuran/${surahId}?ayet=${verse.verseNumber}`,
            });
        } catch (error) {
            console.error(error);
        }
    };

    const renderVerse = ({ item }: { item: Verse }) => (
        <View className="mb-6 p-4 bg-white dark:bg-slate-900 rounded-2xl border border-gray-100 dark:border-slate-800 shadow-sm">
            {/* Header: Number and Actions */}
            <View className="flex-row justify-between items-center mb-4 bg-gray-50 dark:bg-slate-800/50 p-2 rounded-xl">
                <View className="flex-row items-center">
                    <View className="w-8 h-8 bg-amber-100 dark:bg-amber-900/30 rounded-full items-center justify-center mr-3 border border-amber-200 dark:border-amber-800/30">
                        <Text className="font-bold text-amber-600 dark:text-amber-500 text-xs">{item.verseNumber}</Text>
                    </View>
                    <Text className="text-gray-400 dark:text-slate-500 text-xs font-medium">Ayet</Text>
                </View>
                <View className="flex-row gap-2">
                    <TouchableOpacity
                        onPress={() => setPlayingVerse(playingVerse === item.verseKey ? null : item.verseKey)}
                        className="p-2 bg-white dark:bg-slate-800 rounded-full border border-gray-200 dark:border-slate-700"
                    >
                        {playingVerse === item.verseKey ? (
                            <Pause size={16} color={isDark ? '#e2e8f0' : '#475569'} />
                        ) : (
                            <Play size={16} color={isDark ? '#e2e8f0' : '#475569'} />
                        )}
                    </TouchableOpacity>
                    <TouchableOpacity
                        onPress={() => handleShare(item)}
                        className="p-2 bg-white dark:bg-slate-800 rounded-full border border-gray-200 dark:border-slate-700"
                    >
                        <Share2 size={16} color={isDark ? '#e2e8f0' : '#475569'} />
                    </TouchableOpacity>
                </View>
            </View>

            {/* Arabic Text */}
            <Text className="text-3xl text-right font-amiri leading-loose mb-6 text-gray-900 dark:text-white" style={{ lineHeight: 50 }}>
                {item.arabic}
            </Text>

            {/* Turkish Meaning */}
            <View className="border-t border-gray-100 dark:border-slate-800 pt-4">
                <Text className="text-base text-gray-700 dark:text-gray-300 leading-relaxed font-sans">
                    {item.turkish.diyanet_vakfi}
                </Text>
            </View>
        </View>
    );

    return (
        <SafeAreaView className="flex-1 bg-gray-50 dark:bg-slate-950">
            <Stack.Screen options={{ headerShown: false }} />

            {/* Simple Header */}
            <View className="flex-row items-center justify-between px-4 py-3 bg-white dark:bg-slate-950 border-b border-gray-100 dark:border-slate-800 z-10 shadow-sm">
                <TouchableOpacity
                    onPress={() => router.back()}
                    className="w-10 h-10 items-center justify-center rounded-full bg-gray-100 dark:bg-slate-900 active:opacity-70"
                >
                    <ChevronLeft size={24} color={isDark ? '#e2e8f0' : '#1e293b'} />
                </TouchableOpacity>

                <View className="items-center">
                    <Text className="text-lg font-bold text-gray-900 dark:text-white">{surah?.name}</Text>
                    <Text className="text-xs text-gray-500 dark:text-gray-400 font-medium tracking-wide">
                        {surah ? `${surah.verseCount} Ayet` : ''}
                    </Text>
                </View>

                <View className="w-10" />
            </View>

            {loading ? (
                <View className="flex-1 items-center justify-center">
                    <ActivityIndicator size="large" color="#f59e0b" />
                    <Text className="mt-4 text-gray-500 dark:text-gray-400 font-medium">Yükleniyor...</Text>
                </View>
            ) : error ? (
                <View className="flex-1 items-center justify-center p-8">
                    <Text className="text-red-500 text-center mb-4 text-lg font-bold">Bir hata oluştu</Text>
                    <Text className="text-gray-500 text-center mb-6">{error}</Text>
                    <TouchableOpacity
                        onPress={fetchSurah}
                        className="bg-amber-500 px-6 py-3 rounded-xl active:bg-amber-600"
                    >
                        <Text className="text-white font-bold">Tekrar Dene</Text>
                    </TouchableOpacity>
                </View>
            ) : (
                <FlatList
                    data={data?.verses}
                    keyExtractor={(item) => item.id.toString()}
                    renderItem={renderVerse}
                    contentContainerStyle={{ padding: 16, paddingBottom: 40 }}
                    showsVerticalScrollIndicator={false}
                    initialNumToRender={5}
                />
            )}
        </SafeAreaView>
    );
}
