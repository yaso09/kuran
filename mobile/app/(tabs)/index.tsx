import React, { useState } from 'react';
import { View, Text, FlatList, TouchableOpacity, TextInput } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { SURAHS } from '../../lib/constants';
import { Search, Bookmark } from 'lucide-react-native';
import { Link, useRouter } from 'expo-router';
import { useColorScheme } from 'nativewind';

export default function HomeScreen() {
  const [searchQuery, setSearchQuery] = useState('');
  const router = useRouter();
  const { colorScheme } = useColorScheme();
  const isDark = colorScheme === 'dark';

  const filteredSurahs = SURAHS.filter(surah =>
    surah.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    surah.id.toString().includes(searchQuery)
  );

  const renderItem = ({ item }: { item: typeof SURAHS[0] }) => (
    <Link href={`/kuran/${item.id}`} asChild>
      <TouchableOpacity className="flex-row items-center p-4 border-b border-gray-100 dark:border-slate-800 active:bg-gray-50 dark:active:bg-slate-800">
        <View className="w-10 h-10 bg-amber-100 dark:bg-amber-900/20 rounded-lg items-center justify-center mr-4">
          <Text className="text-amber-600 dark:text-amber-500 font-bold">{item.id}</Text>
        </View>
        <View className="flex-1">
          <Text className="text-lg font-bold text-gray-900 dark:text-gray-100">{item.name}</Text>
          <Text className="text-gray-500 dark:text-gray-400 text-sm">{item.verseCount} Ayet</Text>
        </View>
        <View>
          {/* Arabic name placeholder or icon */}
          <Text className="text-2xl text-gray-400 dark:text-slate-600 font-amiri">۞</Text>
        </View>
      </TouchableOpacity>
    </Link>
  );

  return (
    <SafeAreaView className="flex-1 bg-white dark:bg-slate-950">
      <View className="p-4 bg-white dark:bg-slate-950 border-b border-gray-100 dark:border-slate-800">
        <View className="flex-row justify-between items-center mb-4">
          <Text className="text-2xl font-black text-gray-900 dark:text-white">Kuran-ı Kerim</Text>
          <Link href="/kuran/bookmarks" asChild>
            <TouchableOpacity className="p-2 bg-amber-50 dark:bg-amber-900/10 rounded-full">
              <Bookmark size={20} color="#f59e0b" />
            </TouchableOpacity>
          </Link>
        </View>

        <View className="flex-row items-center bg-gray-100 dark:bg-slate-900 rounded-xl px-4 py-3">
          <Search size={20} color={isDark ? '#94a3b8' : '#64748b'} />
          <TextInput
            className="flex-1 ml-3 text-base text-gray-900 dark:text-white"
            placeholder="Sure ara..."
            placeholderTextColor={isDark ? '#52525b' : '#a1a1aa'}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>
      </View>

      <FlatList
        data={filteredSurahs}
        keyExtractor={(item) => item.id.toString()}
        renderItem={renderItem}
        contentContainerStyle={{ paddingBottom: 20 }}
        showsVerticalScrollIndicator={false}
      />
    </SafeAreaView>
  );
}
