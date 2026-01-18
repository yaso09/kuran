import React from 'react';
import { View, Text, TouchableOpacity, ScrollView, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { BookOpen, Users, Clock, Award, ChevronRight, Moon, Sun } from 'lucide-react-native';


interface LandingPageProps {
    onLogin: () => void;
}

export default function LandingPage({ onLogin }: LandingPageProps) {
    const features = [
        {
            icon: BookOpen,
            title: 'Hibrit Okuma',
            description: 'Hem klasik Mushaf deneyimi hem de detaylı mealli okuma bir arada.',
            color: 'text-emerald-500',
            bg: 'bg-emerald-50 dark:bg-emerald-900/20',
        },
        {
            icon: Users,
            title: 'Sosyal Etkileşim',
            description: 'Ayetler üzerine tartışın, sorular sorun ve topluluğun bir parçası olun.',
            color: 'text-blue-500',
            bg: 'bg-blue-50 dark:bg-blue-900/20',
        },
        {
            icon: Clock,
            title: 'İbadet Asistanı',
            description: 'Namaz vakitleri, kıble yönü ve ibadet takibi parmaklarınızın ucunda.',
            color: 'text-amber-500',
            bg: 'bg-amber-50 dark:bg-amber-900/20',
        },
        {
            icon: Award,
            title: 'Oyunlaştırma',
            description: 'Düzenli okuyarak zinciri kırmayın, rozetler kazanın ve motive olun.',
            color: 'text-purple-500',
            bg: 'bg-purple-50 dark:bg-purple-900/20',
        },
    ];

    return (
        <SafeAreaView className="flex-1 bg-white dark:bg-slate-950">
            <ScrollView contentContainerStyle={{ paddingBottom: 40 }}>
                {/* Hero Section */}
                <View className="px-6 pt-10 pb-6 items-center">
                    {/* Visual Icon/Logo Placeholder */}
                    <View className="w-24 h-24 bg-emerald-100 dark:bg-emerald-900/30 rounded-3xl items-center justify-center mb-6 rotate-3">
                        <BookOpen size={48} className="text-emerald-600 dark:text-emerald-400" color="#059669" />
                    </View>

                    <Text className="text-4xl font-black text-center text-slate-900 dark:text-white leading-tight mb-2">
                        Modern
                        <Text className="text-emerald-600 dark:text-emerald-400"> Kuran </Text>
                        Platformu
                    </Text>

                    <Text className="text-lg text-center text-slate-500 dark:text-slate-400 mb-8 px-4">
                        Kuran-ı Kerim'i anlamak, yaşamak ve paylaşmak için tasarlanmış yeni nesil deneyim.
                    </Text>

                    <TouchableOpacity
                        onPress={onLogin}
                        className="w-full bg-emerald-600 active:bg-emerald-700 py-4 rounded-2xl flex-row items-center justify-center shadow-lg shadow-emerald-500/30"
                    >
                        <Text className="text-white font-bold text-lg mr-2">Keşfetmeye Başla</Text>
                        <ChevronRight size={20} color="white" />
                    </TouchableOpacity>
                </View>

                {/* Divider */}
                <View className="h-px bg-slate-100 dark:bg-slate-800 mx-6 my-4" />

                {/* Features Grid */}
                <View className="px-6 py-4">
                    <Text className="text-xs font-bold uppercase text-slate-400 dark:text-slate-500 mb-6 tracking-widest text-center">
                        Öne Çıkan Özellikler
                    </Text>

                    <View className="gap-4">
                        {features.map((feature, index) => (
                            <View
                                key={index}
                                className="flex-row p-4 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-800 items-start"
                            >
                                <View className={`p-3 rounded-xl mr-4 ${feature.bg}`}>
                                    <feature.icon size={24} color={feature.color.includes('emerald') ? '#10b981' : feature.color.includes('blue') ? '#3b82f6' : feature.color.includes('amber') ? '#f59e0b' : '#a855f7'} />
                                </View>
                                <View className="flex-1">
                                    <Text className="text-lg font-bold text-slate-900 dark:text-white mb-1">
                                        {feature.title}
                                    </Text>
                                    <Text className="text-slate-500 dark:text-slate-400 text-sm leading-relaxed">
                                        {feature.description}
                                    </Text>
                                </View>
                            </View>
                        ))}
                    </View>
                </View>
            </ScrollView>
        </SafeAreaView>
    );
}
