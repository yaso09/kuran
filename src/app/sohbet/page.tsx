"use client";

import React, { useState, useRef, useEffect } from "react";
import Navbar from "@/components/Navbar";
import { usePageTracking } from "@/hooks/usePageTracking";
import { ArrowRight, Loader2, ArrowUpRight, Sparkles, Trash2, Download, MessageSquare, Plus, History } from "lucide-react";
import Link from "next/link";
import { SURAHS } from "@/lib/constants";

interface ChatMessage {
    role: 'user' | 'assistant';
    content: string;
    verses?: any[];
}

interface Conversation {
    id: string;
    title: string;
    messages: ChatMessage[];
    createdAt: number;
    updatedAt: number;
}

export default function ChatPage() {
    const [chatInput, setChatInput] = useState("");
    const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
    const [chatLoading, setChatLoading] = useState(false);
    const [conversations, setConversations] = useState<Conversation[]>([]);
    const [currentConversationId, setCurrentConversationId] = useState<string | null>(null);
    const [showHistory, setShowHistory] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    // Track page visit
    usePageTracking('/sohbet', 'Sohbet');

    // Load conversations from localStorage on mount
    useEffect(() => {
        const saved = localStorage.getItem('quran-chat-history');
        if (saved) {
            try {
                const parsed = JSON.parse(saved);
                setConversations(parsed);
            } catch (e) {
                console.error('Failed to load chat history', e);
            }
        }
    }, []);

    // Save conversations to localStorage whenever they change
    useEffect(() => {
        if (conversations.length > 0) {
            localStorage.setItem('quran-chat-history', JSON.stringify(conversations));
        }
    }, [conversations]);

    // Auto-save current conversation
    useEffect(() => {
        if (chatMessages.length > 0 && currentConversationId) {
            const title = chatMessages[0]?.content.slice(0, 50) || 'Yeni Sohbet';
            setConversations(prev => prev.map(conv =>
                conv.id === currentConversationId
                    ? { ...conv, messages: chatMessages, title, updatedAt: Date.now() }
                    : conv
            ));
        }
    }, [chatMessages, currentConversationId]);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        scrollToBottom();
    }, [chatMessages, chatLoading]);

    const createNewConversation = () => {
        const newConv: Conversation = {
            id: Date.now().toString(),
            title: 'Yeni Sohbet',
            messages: [],
            createdAt: Date.now(),
            updatedAt: Date.now()
        };
        setConversations(prev => [newConv, ...prev]);
        setCurrentConversationId(newConv.id);
        setChatMessages([]);
    };

    const loadConversation = (convId: string) => {
        const conv = conversations.find(c => c.id === convId);
        if (conv) {
            setCurrentConversationId(convId);
            setChatMessages(conv.messages);
            setShowHistory(false);
        }
    };

    const deleteConversation = (convId: string) => {
        if (confirm('Bu sohbeti silmek istediğinize emin misiniz?')) {
            setConversations(prev => prev.filter(c => c.id !== convId));
            if (currentConversationId === convId) {
                setChatMessages([]);
                setCurrentConversationId(null);
            }
        }
    };

    const handleSendMessage = async (e?: React.FormEvent) => {
        if (e) e.preventDefault();
        if (!chatInput.trim()) return;

        // Create new conversation if none exists
        if (!currentConversationId) {
            createNewConversation();
        }

        const userMessage = chatInput.trim();
        setChatInput("");
        setChatLoading(true);

        const newMessages = [...chatMessages, { role: 'user' as const, content: userMessage }];
        setChatMessages(newMessages);

        try {
            const cerebrasApiKey = process.env.NEXT_PUBLIC_CEREBRAS_API_KEY;

            if (!cerebrasApiKey) {
                console.error('Cerebras API key not found');
                setChatMessages([...newMessages, {
                    role: 'assistant',
                    content: 'Üzgünüm, şu anda sohbet servisi kullanılamıyor.'
                }]);
                return;
            }

            const aiResponse = await fetch("https://api.cerebras.ai/v1/chat/completions", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${cerebrasApiKey}`
                },
                body: JSON.stringify({
                    model: "llama3.1-8b",
                    messages: [
                        {
                            role: "system",
                            content: "Sen Kur'an konusunda bilgili, yardımsever ve nazik bir asistansın. Kullanıcılarla Kur'an ayetleri, İslam ve manevi konularda sohbet edersin. Yanıtlarını Türkçe ver ve gerektiğinde alakalı ayet referanslarını (örn: 2:255, 3:159) ekle. Kısa ve açık yanıtlar ver."
                        },
                        ...newMessages.map(m => ({ role: m.role, content: m.content }))
                    ],
                    stream: false,
                    max_completion_tokens: 500,
                    temperature: 0.8
                })
            });

            if (!aiResponse.ok) throw new Error("AI hatası");
            const aiData = await aiResponse.json();
            const assistantReply = aiData.choices?.[0]?.message?.content || "Üzgünüm, bir hata oluştu.";

            // Extract verse references
            const verseRegex = /(\d+):(\d+)/g;
            const matches = assistantReply.match(verseRegex) || [];
            const uniqueRefs = [...new Set(matches)];

            let verseDetails: any[] = [];
            if (uniqueRefs.length > 0 && uniqueRefs.length <= 5) {
                const promises = uniqueRefs.map(async (ref) => {
                    try {
                        const res = await fetch(`/api/ayet/${ref}`);
                        if (!res.ok) return null;
                        const data = await res.json();
                        return {
                            ref,
                            surahId: data.sureNo,
                            surahName: SURAHS.find((s: any) => s.id === data.sureNo)?.name || `Sure ${data.sureNo}`,
                            verseNumber: data.verseNumber,
                            text: data.turkish?.diyanet_vakfi,
                            arabic: data.arabic
                        };
                    } catch (e) {
                        return null;
                    }
                });
                verseDetails = (await Promise.all(promises)).filter(v => v !== null);
            }

            setChatMessages([...newMessages, {
                role: 'assistant',
                content: assistantReply,
                verses: verseDetails.length > 0 ? verseDetails : undefined
            }]);
        } catch (error) {
            console.error("Chat error", error);
            setChatMessages([...newMessages, {
                role: 'assistant',
                content: 'Üzgünüm, bir hata oluştu. Lütfen tekrar deneyin.'
            }]);
        } finally {
            setChatLoading(false);
        }
    };

    const clearChat = () => {
        if (confirm('Tüm sohbet geçmişi silinecek. Emin misiniz?')) {
            setChatMessages([]);
            setCurrentConversationId(null);
        }
    };

    const exportChat = () => {
        const chatText = chatMessages.map(m =>
            `${m.role === 'user' ? 'Siz' : 'AI'}: ${m.content}`
        ).join('\n\n');

        const blob = new Blob([chatText], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `kuran-sohbet-${new Date().toISOString().split('T')[0]}.txt`;
        a.click();
        URL.revokeObjectURL(url);
    };

    return (
        <div className="min-h-screen bg-[#0b0c0f] flex flex-col">
            <Navbar />

            <div className="flex flex-1">
                {/* History Sidebar */}
                <div className={`${showHistory ? 'w-80' : 'w-0'} bg-[#15171c] border-r border-slate-800 transition-all duration-300 overflow-hidden flex-shrink-0`}>
                    <div className="p-4 h-full flex flex-col">
                        <div className="flex items-center justify-between mb-4">
                            <h2 className="text-white font-bold text-lg flex items-center gap-2">
                                <History size={20} />
                                Geçmiş
                            </h2>
                            <button
                                onClick={() => setShowHistory(false)}
                                className="text-slate-500 hover:text-white text-xs"
                            >
                                Kapat
                            </button>
                        </div>

                        <button
                            onClick={createNewConversation}
                            className="w-full bg-amber-600 hover:bg-amber-500 text-white px-4 py-3 rounded-lg font-bold mb-4 flex items-center justify-center gap-2 transition-colors"
                        >
                            <Plus size={18} />
                            Yeni Sohbet
                        </button>

                        <div className="flex-1 overflow-y-auto space-y-2">
                            {conversations.map(conv => (
                                <div
                                    key={conv.id}
                                    className={`p-3 rounded-lg cursor-pointer transition-colors group ${currentConversationId === conv.id
                                        ? 'bg-amber-600/20 border border-amber-600/30'
                                        : 'bg-slate-800 hover:bg-slate-700'
                                        }`}
                                >
                                    <div onClick={() => loadConversation(conv.id)}>
                                        <p className="text-white text-sm font-medium truncate mb-1">
                                            {conv.title}
                                        </p>
                                        <p className="text-xs text-slate-500">
                                            {new Date(conv.updatedAt).toLocaleDateString('tr-TR')}
                                        </p>
                                    </div>
                                    <button
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            deleteConversation(conv.id);
                                        }}
                                        className="mt-2 text-red-500 hover:text-red-400 text-xs opacity-0 group-hover:opacity-100 transition-opacity"
                                    >
                                        <Trash2 size={14} className="inline mr-1" />
                                        Sil
                                    </button>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Main Chat Area */}
                <div className="flex-1 flex flex-col max-w-5xl w-full mx-auto h-full">
                    {/* Header - Sticky at top */}
                    <div className="flex items-center justify-between p-4 sm:p-6 pb-4 border-b border-slate-800 bg-[#0b0c0f] sticky top-0 z-10">
                        <div className="flex items-center gap-3">
                            <button
                                onClick={() => setShowHistory(!showHistory)}
                                className="p-2 bg-slate-800 hover:bg-slate-700 text-white rounded-lg transition-colors"
                            >
                                <History size={20} />
                            </button>
                            <div className="w-12 h-12 bg-gradient-to-br from-amber-500 to-purple-600 rounded-2xl flex items-center justify-center shadow-lg shadow-purple-600/20">
                                <Sparkles size={24} className="text-white" />
                            </div>
                            <div>
                                <h1 className="text-2xl font-black text-white tracking-tight">Kur'an Sohbet</h1>
                                <p className="text-xs text-slate-500">Yapay Zeka ile Dini Sohbet</p>
                            </div>
                        </div>

                        {chatMessages.length > 0 && (
                            <div className="flex gap-2">
                                <button
                                    onClick={exportChat}
                                    className="p-2 text-slate-500 hover:text-amber-500 transition-colors"
                                    title="Sohbeti İndir"
                                >
                                    <Download size={20} />
                                </button>
                                <button
                                    onClick={clearChat}
                                    className="p-2 text-slate-500 hover:text-red-500 transition-colors"
                                    title="Sohbeti Temizle"
                                >
                                    <Trash2 size={20} />
                                </button>
                            </div>
                        )}
                    </div>

                    {/* Messages Container - Scrollable */}
                    <div className="flex-1 overflow-y-auto space-y-6 px-4 sm:px-6 py-4">
                        {chatMessages.length === 0 ? (
                            <div className="flex flex-col items-center justify-center h-full text-center py-20">
                                <Sparkles size={64} className="text-slate-700 mb-6" />
                                <h2 className="text-2xl font-black text-white mb-4">Sohbete Başlayın</h2>
                                <p className="text-slate-400 max-w-md mb-6">
                                    Kur'an ayetleri, İslam ve manevi konularda sorularınızı sorun.
                                </p>
                                <div className="flex flex-wrap gap-2 justify-center">
                                    {['Sabır hakkında ne diyor?', 'Namaz konusunda bilgi ver', 'Cennet ayetleri'].map((suggestion) => (
                                        <button
                                            key={suggestion}
                                            onClick={() => { setChatInput(suggestion); handleSendMessage(); }}
                                            className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-sm transition-colors"
                                        >
                                            {suggestion}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        ) : (
                            <>
                                {chatMessages.map((message, i) => (
                                    <div key={i} className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                                        <div className={`max-w-[85%] ${message.role === 'user' ? 'bg-amber-600' : 'bg-slate-800'} rounded-2xl p-4 shadow-lg`}>
                                            <p className="text-white text-sm leading-relaxed whitespace-pre-wrap">{message.content}</p>

                                            {message.verses && message.verses.length > 0 && (
                                                <div className="mt-4 pt-4 border-t border-slate-700 space-y-3">
                                                    <p className="text-xs text-slate-400 font-bold uppercase tracking-wider mb-2">Referans Ayetler:</p>
                                                    {message.verses.map((verse: any, vIdx: number) => (
                                                        <Link
                                                            key={vIdx}
                                                            href={`/kuran/${verse.surahId}#ayet-${verse.verseNumber}`}
                                                            className="block p-3 rounded-xl bg-[#0b0c0f]/50 border border-slate-700 hover:border-amber-500/50 transition-all group"
                                                        >
                                                            <div className="flex justify-between items-start mb-2">
                                                                <span className="text-amber-400 font-bold text-xs uppercase">
                                                                    {verse.surahName} / {verse.verseNumber}
                                                                </span>
                                                                <ArrowUpRight className="text-slate-600 group-hover:text-amber-500 transition-colors" size={12} />
                                                            </div>
                                                            <p className="text-slate-300 text-xs leading-relaxed mb-2">{verse.text}</p>
                                                            <p className="text-slate-500 text-right font-arabic text-sm" dir="rtl">{verse.arabic}</p>
                                                        </Link>
                                                    ))}
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                ))}

                                {chatLoading && (
                                    <div className="flex justify-start">
                                        <div className="bg-slate-800 rounded-2xl p-4 shadow-lg">
                                            <div className="flex items-center gap-2">
                                                <Loader2 className="animate-spin text-amber-500" size={16} />
                                                <p className="text-slate-400 text-sm italic">Düşünüyor...</p>
                                            </div>
                                        </div>
                                    </div>
                                )}

                                <div ref={messagesEndRef} />
                            </>
                        )}
                    </div>

                    {/* Input Form - Sticky at bottom */}
                    <div className="p-4 sm:p-6 pt-4 bg-[#0b0c0f] sticky bottom-0 z-10">
                        <div className="relative">
                            <div className="absolute -inset-0.5 bg-gradient-to-r from-amber-500 to-purple-600 rounded-lg blur opacity-30"></div>
                            <form onSubmit={handleSendMessage} className="relative flex items-center bg-[#15171c] rounded-lg p-3 ring-1 ring-slate-800 shadow-2xl">
                                <input
                                    type="text"
                                    value={chatInput}
                                    onChange={(e) => setChatInput(e.target.value)}
                                    placeholder="Mesajınızı yazın..."
                                    className="flex-1 bg-transparent border-none text-white focus:ring-0 placeholder:text-slate-600 py-2 px-3 focus:outline-none"
                                    disabled={chatLoading}
                                />
                                <button
                                    type="submit"
                                    disabled={chatLoading || !chatInput.trim()}
                                    className="bg-amber-600 hover:bg-amber-500 text-white p-3 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed ml-2"
                                >
                                    {chatLoading ? <Loader2 className="animate-spin" size={20} /> : <ArrowRight size={20} />}
                                </button>
                            </form>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
