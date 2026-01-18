import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, ActivityIndicator, TouchableOpacity, RefreshControl } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { supabase } from '../../lib/supabase';
import { MessageSquare, Heart, Clock } from 'lucide-react-native';
import { useColorScheme } from 'nativewind';

interface ForumPost {
    id: string;
    title: string;
    content: string;
    category: string;
    likes_count: number;
    created_at: string;
}

export default function SocialScreen() {
    const [posts, setPosts] = useState<ForumPost[]>([]);
    const [loading, setLoading] = useState(true);
    const { colorScheme } = useColorScheme();
    const isDark = colorScheme === 'dark';

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
        } catch (error) {
            console.error('Error fetching posts:', error);
        } finally {
            setLoading(false);
        }
    };

    const renderPost = ({ item }: { item: ForumPost }) => (
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
                    <Text className="ml-1 text-gray-500 dark:text-gray-400 text-xs">Yorumlar</Text>
                </View>
            </View>
        </TouchableOpacity>
    );

    return (
        <SafeAreaView className="flex-1 bg-gray-50 dark:bg-slate-950">
            <View className="p-4 border-b border-gray-100 dark:border-slate-800 bg-white dark:bg-slate-950">
                <Text className="text-2xl font-black text-gray-900 dark:text-white">Forum</Text>
                <Text className="text-gray-500 dark:text-gray-400 text-sm">Topluluk Paylaşımları</Text>
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
                    contentContainerStyle={{ padding: 16 }}
                    refreshControl={<RefreshControl refreshing={loading} onRefresh={fetchPosts} tintColor="#f59e0b" />}
                    ListEmptyComponent={() => (
                        <View className="items-center py-20">
                            <Text className="text-gray-400 dark:text-slate-600">Henüz gönderi yok</Text>
                        </View>
                    )}
                />
            )}
        </SafeAreaView>
    );
}
