import React from 'react';
import { View, Text, Switch, TouchableOpacity, ScrollView, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Moon, Settings, Bell, Share2, Info, LogOut, ChevronRight } from 'lucide-react-native';
import { useColorScheme } from 'nativewind';
import { useAuth, useUser } from '@clerk/clerk-expo';
import { useRouter } from 'expo-router';

export default function ProfileScreen() {
    const { colorScheme, toggleColorScheme } = useColorScheme();
    const isDark = colorScheme === 'dark';
    const { signOut } = useAuth();
    const { user } = useUser();
    const router = useRouter();

    const handleNotImplemented = () => {
        Alert.alert('Yakında', 'Bu özellik bir sonraki güncellemede eklenecek.');
    };

    const menuItems = [
        { icon: Bell, label: 'Bildirim Ayarları', action: handleNotImplemented },
        { icon: Settings, label: 'Uygulama Ayarları', action: () => router.push('/settings') },
        { icon: Share2, label: 'Uygulamayı Paylaş', action: handleNotImplemented },
        { icon: Info, label: 'Hakkında', action: () => Alert.alert('Kuran Platformu', 'Versiyon 1.1.0 Beta') },
    ];

    return (
        <SafeAreaView className="flex-1 bg-gray-50 dark:bg-slate-950">
            <ScrollView contentContainerStyle={{ padding: 16 }}>
                <Text className="text-3xl font-black text-gray-900 dark:text-white mb-6">Profil</Text>

                {/* User Card */}
                <View className="bg-gradient-to-r from-amber-500 to-amber-600 p-6 rounded-3xl mb-8 shadow-lg shadow-amber-500/20">
                    <View className="flex-row items-center">
                        <View className="w-16 h-16 bg-white/20 rounded-full items-center justify-center border-2 border-white/30">
                            <Text className="text-2xl font-bold text-white">
                                {user?.primaryEmailAddress?.emailAddress?.[0].toUpperCase() || '?'}
                            </Text>
                        </View>
                        <View className="ml-4 flex-1">
                            <Text className="text-white font-bold text-lg" numberOfLines={1}>
                                {user ? (user.fullName || user.primaryEmailAddress?.emailAddress) : 'Misafir Kullanıcı'}
                            </Text>
                            <Text className="text-amber-100 text-sm">
                                {user ? 'Hoşgeldiniz' : 'Giriş yapın ve ilerlemenizi kaydedin'}
                            </Text>
                        </View>
                    </View>

                    {!user ? (
                        <TouchableOpacity
                            onPress={() => router.push('/auth/sign-in')}
                            className="mt-6 bg-white py-3 rounded-xl items-center"
                        >
                            <Text className="text-amber-600 font-bold">Giriş Yap / Kayıt Ol</Text>
                        </TouchableOpacity>
                    ) : (
                        <View className="mt-4 flex-row justify-between">
                            <View className="bg-white/10 px-3 py-2 rounded-lg items-center flex-1 mr-2">
                                <Text className="text-white text-xs font-bold">
                                    {(user.unsafeMetadata?.streak as number) || 0} Gün Seri
                                </Text>
                            </View>
                            <View className="bg-white/10 px-3 py-2 rounded-lg items-center flex-1 ml-2">
                                <Text className="text-white text-xs font-bold">
                                    {(user.unsafeMetadata?.coins as number) || 0} Coin
                                </Text>
                            </View>
                        </View>
                    )}
                </View>

                {/* Settings Section */}
                <Text className="text-gray-500 dark:text-gray-400 font-bold uppercase text-xs mb-3 ml-2">Genel</Text>
                <View className="bg-white dark:bg-slate-900 rounded-2xl overflow-hidden mb-8 shadow-sm">
                    {/* Dark Mode Toggle */}
                    <View className="flex-row items-center justify-between p-4 border-b border-gray-100 dark:border-slate-800">
                        <View className="flex-row items-center">
                            <View className="w-8 h-8 rounded-full bg-indigo-100 dark:bg-indigo-900/30 items-center justify-center mr-3">
                                <Moon size={18} color={isDark ? '#818cf8' : '#4f46e5'} />
                            </View>
                            <Text className="text-base text-gray-900 dark:text-white font-medium">Karanlık Mod</Text>
                        </View>
                        <Switch
                            value={isDark}
                            onValueChange={toggleColorScheme}
                            trackColor={{ false: '#e2e8f0', true: '#4f46e5' }}
                            thumbColor={'white'}
                        />
                    </View>

                    {menuItems.map((item, index) => (
                        <TouchableOpacity
                            key={index}
                            onPress={item.action}
                            className={`flex-row items-center justify-between p-4 ${index !== menuItems.length - 1 ? 'border-b border-gray-100 dark:border-slate-800' : ''}`}
                        >
                            <View className="flex-row items-center">
                                <View className="w-8 h-8 rounded-full bg-gray-100 dark:bg-slate-800 items-center justify-center mr-3">
                                    <item.icon size={18} color={isDark ? '#94a3b8' : '#64748b'} />
                                </View>
                                <Text className="text-base text-gray-900 dark:text-white font-medium">{item.label}</Text>
                            </View>
                            <ChevronRight size={20} color={isDark ? '#475569' : '#cbd5e1'} />
                        </TouchableOpacity>
                    ))}
                </View>

                {user && (
                    <TouchableOpacity onPress={() => signOut()} className="flex-row items-center justify-center p-4 bg-red-50 dark:bg-red-900/10 rounded-2xl mb-8">
                        <LogOut size={18} color="#ef4444" />
                        <Text className="text-red-500 font-bold ml-2">Çıkış Yap</Text>
                    </TouchableOpacity>
                )}

                <Text className="text-center text-gray-400 dark:text-slate-600 text-xs mb-8">v1.1.0 Beta</Text>
            </ScrollView>
        </SafeAreaView>
    );
}
