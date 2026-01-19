import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, ActivityIndicator, TouchableOpacity, RefreshControl, Modal, TextInput, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Link } from 'expo-router';
import { supabase } from '../../lib/supabase';
import { MessageSquare, Heart, Plus, X } from 'lucide-react-native';
import { useColorScheme } from 'nativewind';
import { useUser } from '@clerk/clerk-expo';

interface ForumPost {
    id: string;
    title: string;
    content: string;
    category: string;
    tagged_verses: string[];
    likes_count: number;
    created_at: string;
    user_id: string;
}

export default function SocialScreen() {
    const [posts, setPosts] = useState<ForumPost[]>([]);
    const [loading, setLoading] = useState(true);
    const [modalVisible, setModalVisible] = useState(false);
    const [newTitle, setNewTitle] = useState('');
    const [newContent, setNewContent] = useState('');
    const [newCategory, setNewCategory] = useState('Soru');
    const [taggedVerses, setTaggedVerses] = useState('');
    const [submitting, setSubmitting] = useState(false);

    const { colorScheme } = useColorScheme();
    const isDark = colorScheme === 'dark';
    const { user } = useUser();

    useEffect(() => {
        fetchPosts();
    }, []);

    const fetchPosts = async () => {
        try {
            setLoading(true);
            const { data, error } = await supabase
                .from('forum_posts')
                .select('*')
                .order('created_at', { ascending: false });

            if (error) throw error;
            setPosts(data || []);

            if (user) syncProfile();
        } catch (error) {
            console.error('Error fetching posts:', error);
        } finally {
            setLoading(false);
        }
    };

    const syncProfile = async () => {
        if (!user) return;
        await supabase.from('profiles').upsert({
            id: user.id,
            full_name: user.fullName || `${user.firstName} ${user.lastName}`,
            avatar_url: user.imageUrl,
            streak: (user.unsafeMetadata.streak as number) || 0,
            coins: (user.unsafeMetadata.coins as number) || 0,
            last_read_date: user.unsafeMetadata.lastReadDate as string || null
        });
    };

    const handleCreatePost = async () => {
        if (!user) {
            Alert.alert('Giriş Yapmalısınız', 'Gönderi paylaşmak için lütfen giriş yapın.');
            return;
        }
        if (!newTitle.trim() || !newContent.trim()) {
            Alert.alert('Hata', 'Lütfen başlık ve içerik giriniz.');
            return;
        }

        setSubmitting(true);
        try {
            await syncProfile();
            const { error } = await supabase.from('forum_posts').insert({
                title: newTitle,
                content: newContent,
                user_id: user.id,
                category: newCategory,
                tagged_verses: taggedVerses.split(',').map(v => v.trim()).filter(Boolean),
                likes_count: 0
            });

            if (error) throw error;

            setModalVisible(false);
            setNewTitle('');
            setNewContent('');
            setNewCategory('Soru');
            setTaggedVerses('');
            fetchPosts();
            Alert.alert('Başarılı', 'Gönderiniz paylaşıldı.');
        } catch (error) {
            Alert.alert('Hata', 'Gönderi paylaşılırken bir sorun oluştu.');
            console.error(error);
        } finally {
            setSubmitting(false);
        }
    };

    const renderPost = ({ item }: { item: ForumPost }) => (
        <Link href={{ pathname: '/forum/[id]', params: { id: item.id } }} asChild>
            <TouchableOpacity className="bg-white dark:bg-slate-900 mb-4 p-4 rounded-xl border border-gray-100 dark:border-slate-800 shadow-sm">
                <View className="flex-row justify-between items-start mb-2">
                    <View className="bg-blue-50 dark:bg-blue-900/20 px-2 py-1 rounded-md">
                        <Text className="text-blue-600 dark:text-blue-400 text-xs font-bold uppercase">{item.category || 'Genel'}</Text>
                    </View>
                    <Text className="text-gray-400 dark:text-slate-500 text-xs">
                        {new Date(item.created_at).toLocaleDateString('tr-TR')}
                    </Text>
                </View>

                <Text className="text-lg font-bold text-gray-900 dark:text-white mb-2">{item.title}</Text>
                <Text className="text-gray-600 dark:text-slate-400 text-sm mb-4 line-clamp-2" numberOfLines={2}>
                    {item.content}
                </Text>

                <View className="flex-row items-center space-x-4">
                    <View className="flex-row items-center mr-4">
                        <Heart size={16} color={isDark ? '#94a3b8' : '#64748b'} />
                        <Text className="ml-1 text-gray-500 dark:text-gray-400 text-xs">{item.likes_count || 0}</Text>
                    </View>
                    <View className="flex-row items-center">
                        <MessageSquare size={16} color={isDark ? '#94a3b8' : '#64748b'} />
                        <Text className="ml-1 text-gray-400 dark:text-slate-500 text-xs">Detay ve Yorumlar</Text>
                    </View>
                </View>

                {item.tagged_verses && item.tagged_verses.length > 0 && (
                    <View className="flex-row flex-wrap mt-3 gap-2">
                        {item.tagged_verses.map((verse, idx) => (
                            <View key={idx} className="bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded-md border border-slate-200 dark:border-slate-700">
                                <Text className="text-[10px] text-slate-500 dark:text-slate-400 font-bold">{verse}</Text>
                            </View>
                        ))}
                    </View>
                )}
            </TouchableOpacity>
        </Link>
    );

    return (
        <SafeAreaView className="flex-1 bg-gray-50 dark:bg-slate-950">
            <View className="p-4 border-b border-gray-100 dark:border-slate-800 bg-white dark:bg-slate-950 flex-row justify-between items-center">
                <View>
                    <Text className="text-2xl font-black text-gray-900 dark:text-white">Forum</Text>
                    <Text className="text-gray-500 dark:text-gray-400 text-sm">Topluluk Paylaşımları</Text>
                </View>
                <Link href="/sohbet/index" asChild>
                    <TouchableOpacity className="bg-amber-500 px-4 py-2 rounded-full">
                        <Text className="text-white font-bold text-xs">Asistana Sor</Text>
                    </TouchableOpacity>
                </Link>
            </View>

            {loading && posts.length === 0 ? (
                <View className="flex-1 items-center justify-center">
                    <ActivityIndicator size="large" color="#f59e0b" />
                </View>
            ) : (
                <FlatList
                    data={posts}
                    renderItem={renderPost}
                    keyExtractor={item => item.id}
                    contentContainerStyle={{ padding: 16, paddingBottom: 100 }}
                    refreshControl={<RefreshControl refreshing={loading} onRefresh={fetchPosts} tintColor="#f59e0b" />}
                    ListEmptyComponent={() => (
                        <View className="items-center py-20">
                            <Text className="text-gray-400 dark:text-slate-600">Henüz gönderi yok</Text>
                        </View>
                    )}
                />
            )}

            {/* FAB */}
            <TouchableOpacity
                onPress={() => setModalVisible(true)}
                className="absolute bottom-6 right-6 w-14 h-14 bg-amber-500 rounded-full items-center justify-center shadow-lg shadow-amber-500/40 z-20"
                activeOpacity={0.8}
            >
                <Plus size={24} color="white" />
            </TouchableOpacity>

            {/* Create Post Modal */}
            <Modal
                visible={modalVisible}
                animationType="slide"
                presentationStyle="pageSheet"
                onRequestClose={() => setModalVisible(false)}
            >
                <View className="flex-1 bg-white dark:bg-slate-950 p-4">
                    <View className="flex-row justify-between items-center mb-6">
                        <Text className="text-xl font-bold text-gray-900 dark:text-white">Yeni Gönderi</Text>
                        <TouchableOpacity onPress={() => setModalVisible(false)}>
                            <X size={24} color={isDark ? '#cbd5e1' : '#475569'} />
                        </TouchableOpacity>
                    </View>

                    <TextInput
                        className="bg-gray-50 dark:bg-slate-900 p-4 rounded-xl text-lg font-bold text-gray-900 dark:text-white mb-4"
                        placeholder="Başlık"
                        placeholderTextColor={isDark ? '#64748b' : '#94a3b8'}
                        value={newTitle}
                        onChangeText={setNewTitle}
                    />

                    <View className="flex-row gap-4 mb-4">
                        <View className="flex-1">
                            <Text className="text-xs font-black text-gray-400 uppercase mb-1">Kategori</Text>
                            <View className="bg-gray-50 dark:bg-slate-900 rounded-xl overflow-hidden border border-gray-100 dark:border-slate-800">
                                <TextInput
                                    className="p-3 text-gray-900 dark:text-white font-bold"
                                    value={newCategory}
                                    onChangeText={setNewCategory}
                                    placeholder="örn: Tefekkür"
                                />
                            </View>
                        </View>
                        <View className="flex-1">
                            <Text className="text-xs font-black text-gray-400 uppercase mb-1">Ayet Etiketle</Text>
                            <View className="bg-gray-50 dark:bg-slate-900 rounded-xl overflow-hidden border border-gray-100 dark:border-slate-800">
                                <TextInput
                                    className="p-3 text-gray-900 dark:text-white font-bold"
                                    value={taggedVerses}
                                    onChangeText={setTaggedVerses}
                                    placeholder="örn: 2:255, 1:1"
                                />
                            </View>
                        </View>
                    </View>

                    <TextInput
                        className="flex-1 bg-gray-50 dark:bg-slate-900 p-4 rounded-xl text-base text-gray-900 dark:text-white mb-4"
                        placeholder="Düşüncelerinizi paylaşın..."
                        placeholderTextColor={isDark ? '#64748b' : '#94a3b8'}
                        multiline
                        textAlignVertical="top"
                        value={newContent}
                        onChangeText={setNewContent}
                    />

                    <TouchableOpacity
                        onPress={handleCreatePost}
                        disabled={submitting}
                        className={`bg-amber-500 p-4 rounded-xl items-center mb-8 ${submitting ? 'opacity-70' : ''}`}
                    >
                        {submitting ? (
                            <ActivityIndicator color="white" />
                        ) : (
                            <Text className="text-white font-bold text-lg">Paylaş</Text>
                        )}
                    </TouchableOpacity>
                </View>
            </Modal>
        </SafeAreaView>
    );
}
