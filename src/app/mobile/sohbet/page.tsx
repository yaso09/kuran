"use client";

import React, { useState, useRef, useEffect } from "react";
import { ArrowRight, Loader2, Sparkles, Trash2, History, Plus, MessageSquare, ArrowLeft } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
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

export default function MobileChatPage() {
    const router = useRouter();
    const [chatInput, setChatInput] = useState("");
    const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
    const [chatLoading, setChatLoading] = useState(false);
    const [conversations, setConversations] = useState<Conversation[]>([]);
    const [currentConversationId, setCurrentConversationId] = useState<string | null>(null);
    const [showHistory, setShowHistory] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);

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

    useEffect(() => {
        if (conversations.length > 0) {
            localStorage.setItem('quran-chat-history', JSON.stringify(conversations));
        }
    }, [conversations]);

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
        setShowHistory(false);
    };

    const loadConversation = (convId: string) => {
        const conv = conversations.find(c => c.id === convId);
        if (conv) {
            setCurrentConversationId(convId);
            setChatMessages(conv.messages);
            setShowHistory(false);
        }
    };

    const handleSendMessage = async (e?: React.FormEvent) => {
        if (e) e.preventDefault();
        if (!chatInput.trim()) return;

        if (!currentConversationId) {
            const newId = Date.now().toString();
            const newConv: Conversation = {
                id: newId,
                title: chatInput.trim().slice(0, 50),
                messages: [],
                createdAt: Date.now(),
                updatedAt: Date.now()
            };
            setConversations(prev => [newConv, ...prev]);
            setCurrentConversationId(newId);
        }

        const userMessage = chatInput.trim();
        setChatInput("");
        setChatLoading(true);

        const newMessages = [...chatMessages, { role: 'user' as const, content: userMessage }];
        setChatMessages(newMessages);

        try {
            const cerebrasApiKey = process.env.NEXT_PUBLIC_CEREBRAS_API_KEY;
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
                            content: "Sen Kur'an konusunda bilgili, yardımsever ve nazik bir asistansın. Kullanıcılarla Kur'an ayetleri, İslam ve manevi konularda sohbet edersin. Yanıtlarını Türkçe ver ve gerektiğinde alakalı ayet referanslarını (örn: 2:255) ekle. Mobil ekranda okunacak şekilde kısa tut."
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

            const verseRegex = /(\d+):(\d+)/g;
            const matches = assistantReply.match(verseRegex) || [];
            const uniqueRefs = [...new Set(matches)];

            let verseDetails: any[] = [];
            if (uniqueRefs.length > 0 && uniqueRefs.length <= 3) {
                const promises = uniqueRefs.map(async (ref) => {
                    const res = await fetch(`/api/ayet/${ref}`);
                    if (!res.ok) return null;
                    const data = await res.json();
                    return {
                        ref,
                        surahId: data.sureNo,
                        surahName: SURAHS.find(s => s.id === data.sureNo)?.name || `Sure ${data.sureNo}`,
                        verseNumber: data.verseNumber,
                        text: data.turkish?.diyanet_vakfi,
                        arabic: data.arabic
                    };
                });
                verseDetails = (await Promise.all(promises)).filter(v => v !== null);
            }

            setChatMessages([...newMessages, {
                role: 'assistant',
                content: assistantReply,
                verses: verseDetails.length > 0 ? verseDetails : undefined
            }]);
        } catch (error) {
            setChatMessages([...newMessages, {
                role: 'assistant',
                content: 'Hata oluştu. Lütfen tekrar deneyin.'
            }]);
        } finally {
            setChatLoading(false);
        }
    };

    return (
        <div className="flex flex-col h-[calc(100vh-3.5rem)] bg-[#0b0c0f]">
            {/* Mobile Chat Header */}
            <div className="bg-[#15171c] p-4 border-b border-slate-800 flex items-center justify-between sticky top-0 z-20">
                <div className="flex items-center gap-3">
                    <button onClick={() => setShowHistory(!showHistory)} className="p-2 text-slate-400">
                        <History size={20} />
                    </button>
                    <div>
                        <h2 className="text-white font-black text-sm uppercase tracking-tighter italic">AI SOHBET</h2>
                        <span className="text-[10px] text-amber-500 font-bold uppercase tracking-widest">Çevrimiçi Asistan</span>
                    </div>
                </div>
                <button onClick={createNewConversation} className="p-2 text-amber-500">
                    <Plus size={24} />
                </button>
            </div>

            {/* History Overlay */}
            {showHistory && (
                <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm animate-in fade-in duration-300">
                    <div className="bg-[#15171c] w-[85%] h-full p-6 animate-in slide-in-from-left duration-300">
                        <div className="flex justify-between items-center mb-8">
                            <h3 className="text-white font-black uppercase italic">GEÇMİŞ SOHBETLER</h3>
                            <button onClick={() => setShowHistory(false)} className="text-slate-500 p-2"><ArrowLeft size={24} /></button>
                        </div>
                        <div className="space-y-3 overflow-y-auto h-[80vh]">
                            {conversations.map(conv => (
                                <button key={conv.id} onClick={() => loadConversation(conv.id)} className={`w-full text-left p-4 rounded-2xl border ${currentConversationId === conv.id ? "bg-amber-600/10 border-amber-600/30" : "bg-slate-800 border-slate-700"}`}>
                                    <p className="text-white text-xs font-bold line-clamp-1 truncate">{conv.title}</p>
                                    <span className="text-[8px] text-slate-500 font-black mt-1 uppercase">{new Date(conv.updatedAt).toLocaleDateString()}</span>
                                </button>
                            ))}
                            {conversations.length === 0 && <p className="text-slate-600 text-[10px] font-black uppercase text-center py-20">Henüz sohbet yok</p>}
                        </div>
                    </div>
                </div>
            )}

            {/* Chat Area */}
            <div className="flex-1 overflow-y-auto px-4 py-6 space-y-6">
                {chatMessages.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-full text-center space-y-6">
                        <div className="w-20 h-20 bg-amber-600/10 rounded-3xl flex items-center justify-center text-amber-500 border border-amber-600/20">
                            <Sparkles size={40} />
                        </div>
                        <div>
                            <h3 className="text-white font-black text-xl italic uppercase">Sorularınızı Sorun</h3>
                            <p className="text-slate-500 text-xs mt-2 font-medium px-8 leading-relaxed">Kur'an ayetleri ve manevi konularda yapay zeka ile sohbet edin.</p>
                        </div>
                        <div className="flex flex-wrap gap-2 justify-center">
                            {['Sabır nedir?', 'Cennet ayetleri', 'Dua örnekleri'].map(s => (
                                <button key={s} onClick={() => { setChatInput(s); handleSendMessage(); }} className="px-4 py-2 bg-slate-800 border border-slate-700 rounded-full text-[10px] font-black uppercase text-slate-400">
                                    {s}
                                </button>
                            ))}
                        </div>
                    </div>
                ) : (
                    <>
                        {chatMessages.map((msg, i) => (
                            <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                                <div className={`max-w-[90%] p-4 rounded-[1.75rem] shadow-lg ${msg.role === 'user' ? 'bg-amber-600 text-white rounded-tr-none' : 'bg-[#15171c] text-white border border-slate-800 rounded-tl-none'}`}>
                                    <p className="text-sm leading-relaxed whitespace-pre-wrap font-medium">{msg.content}</p>
                                    {msg.verses && (
                                        <div className="mt-4 space-y-2">
                                            {msg.verses.map((v: any, j: number) => (
                                                <Link key={j} href={`/mobile/kuran/${v.surahId}`} className="block p-3 rounded-2xl bg-[#0b0c0f]/50 border border-slate-800">
                                                    <span className="text-[9px] font-black text-amber-500 uppercase">{v.surahName} / {v.verseNumber}</span>
                                                    <p className="text-[10px] text-slate-400 line-clamp-2 mt-1 italic">{v.text}</p>
                                                </Link>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            </div>
                        ))}
                        {chatLoading && (
                            <div className="flex justify-start">
                                <div className="bg-[#15171c] p-4 rounded-3xl border border-slate-800 flex items-center gap-3">
                                    <Loader2 className="animate-spin text-amber-500" size={16} />
                                    <span className="text-xs text-slate-500 font-bold uppercase tracking-widest italic">Düşünüyor...</span>
                                </div>
                            </div>
                        )}
                        <div ref={messagesEndRef} />
                    </>
                )}
            </div>

            {/* Input Fixed at bottom of chat */}
            <div className="p-4 bg-[#0b0c0f] border-t border-slate-800">
                <form onSubmit={handleSendMessage} className="flex gap-2">
                    <input
                        type="text"
                        value={chatInput}
                        onChange={(e) => setChatInput(e.target.value)}
                        placeholder="Bir soru yazın..."
                        className="flex-1 bg-[#15171c] border border-slate-800 rounded-2xl px-5 py-3.5 text-sm text-white focus:border-amber-500 outline-none placeholder:text-slate-600 font-medium"
                        disabled={chatLoading}
                    />
                    <button
                        type="submit"
                        disabled={chatLoading || !chatInput.trim()}
                        className="w-12 h-12 bg-amber-600 text-white rounded-2xl flex items-center justify-center active:scale-90 transition-transform disabled:opacity-50 shadow-lg shadow-amber-600/20"
                    >
                        {chatLoading ? <Loader2 className="animate-spin" size={20} /> : <ArrowRight size={22} />}
                    </button>
                </form>
            </div>
        </div>
    );
}
