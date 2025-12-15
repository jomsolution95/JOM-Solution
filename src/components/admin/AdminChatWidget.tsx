
import React, { useState, useRef, useEffect } from 'react';
import { MessageSquare, X, Send, Bot, User, Loader2, Sparkles, Database } from 'lucide-react';
import axios from 'axios';
import { useAuth } from '../../context/AuthContext';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

interface Message {
    id: string;
    role: 'user' | 'assistant';
    content: string;
    toolUsed?: string;
    timestamp: Date;
}

export const AdminChatWidget: React.FC = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [input, setInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [messages, setMessages] = useState<Message[]>([
        {
            id: 'welcome',
            role: 'assistant',
            content: "Bonjour Admin 👋 ! Je suis votre assistant JOM. Je peux accéder aux statistiques et données de la plateforme. Comment puis-je vous aider ?",
            timestamp: new Date()
        }
    ]);
    const scrollRef = useRef<HTMLDivElement>(null);
    const { user, token } = useAuth(); // To verify role if needed, or get token

    const scrollToBottom = () => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    };

    const fetchMessages = async () => {
        try {
            // Reusing the same 'history' endpoint logic properly for admin would be better,
            // but for now, let's assume getHistory endpoint works for the logged-in admin.
            // If the scheduler writes to the ADMIN_ID, retrieving history should work.
            const response = await axios.get(`${API_URL}/ai/history`, {
                headers: { Authorization: `Bearer ${token}` }
            });

            if (response.data.length > 0) {
                const mapped = response.data.map((msg: any) => ({
                    id: msg._id,
                    role: msg.role === 'user' ? 'user' : 'assistant',
                    content: msg.content,
                    toolUsed: msg.metadata?.type,
                    timestamp: new Date(msg.createdAt)
                }));
                // Merge or Set (Set is easier for now)
                setMessages(mapped);
            }
        } catch (error) {
            console.error("Fetch history failed", error);
        }
    };

    useEffect(() => {
        if (isOpen && token) {
            fetchMessages();
            const interval = setInterval(fetchMessages, 30000); // Poll every 30s
            return () => clearInterval(interval);
        }
    }, [isOpen, token]);

    useEffect(() => {
        scrollToBottom();
    }, [messages, isOpen]);

    const handleSend = async () => {
        if (!input.trim() || isLoading) return;

        const userMsg: Message = {
            id: Date.now().toString(),
            role: 'user',
            content: input,
            timestamp: new Date()
        };

        setMessages(prev => [...prev, userMsg]);
        setInput('');
        setIsLoading(true);

        try {
            const token = localStorage.getItem('token');
            const response = await axios.post(`${API_URL}/ai/admin-chat`,
                { question: userMsg.content },
                { headers: { Authorization: `Bearer ${token}` } }
            );

            const aiMsg: Message = {
                id: (Date.now() + 1).toString(),
                role: 'assistant',
                content: response.data.answer,
                toolUsed: response.data.toolUsed,
                timestamp: new Date()
            };

            setMessages(prev => [...prev, aiMsg]);
        } catch (error) {
            console.error(error);
            const errorMsg: Message = {
                id: (Date.now() + 1).toString(),
                role: 'assistant',
                content: "Désolé, je rencontre des difficultés pour joindre le serveur.",
                timestamp: new Date()
            };
            setMessages(prev => [...prev, errorMsg]);
        } finally {
            setIsLoading(false);
        }
    };

    if (!isOpen) {
        return (
            <button
                onClick={() => setIsOpen(true)}
                className="fixed bottom-6 right-6 z-50 p-4 bg-gray-900 dark:bg-white text-white dark:text-gray-900 rounded-full shadow-2xl hover:scale-105 transition-transform group"
                title="Admin Copilot"
            >
                <div className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full animate-ping" />
                <div className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full" />
                <Sparkles className="w-6 h-6" />
            </button>
        );
    }

    return (
        <div className="fixed bottom-6 right-6 z-50 w-96 h-[600px] max-h-[80vh] bg-white dark:bg-gray-800 rounded-2xl shadow-2xl flex flex-col border border-gray-200 dark:border-gray-700 animate-in fade-in slide-in-from-bottom-10">
            {/* Header */}
            <div className="p-4 border-b border-gray-100 dark:border-gray-700 flex justify-between items-center bg-gray-900 text-white rounded-t-2xl">
                <div className="flex items-center gap-2">
                    <div className="p-1.5 bg-white/10 rounded-lg">
                        <Bot className="w-5 h-5" />
                    </div>
                    <div>
                        <h3 className="font-bold text-sm">Admin Copilot</h3>
                        <div className="flex items-center gap-1.5">
                            <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
                            <span className="text-xs text-gray-300">En ligne & Connecté</span>
                        </div>
                    </div>
                </div>
                <button
                    onClick={() => setIsOpen(false)}
                    className="p-2 hover:bg-white/10 rounded-lg transition-colors"
                >
                    <X className="w-5 h-5" />
                </button>
            </div>

            {/* Messages */}
            <div
                ref={scrollRef}
                className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50 dark:bg-gray-900/50"
            >
                {messages.map((msg) => (
                    <div
                        key={msg.id}
                        className={`flex gap-3 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}
                    >
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${msg.role === 'user'
                            ? 'bg-primary-100 text-primary-600'
                            : 'bg-gray-900 text-white'
                            }`}>
                            {msg.role === 'user' ? <User className="w-4 h-4" /> : <Sparkles className="w-4 h-4" />}
                        </div>

                        <div className={`flex flex-col max-w-[80%] ${msg.role === 'user' ? 'items-end' : 'items-start'}`}>
                            <div className={`p-3 rounded-2xl text-sm ${msg.role === 'user'
                                ? 'bg-primary-600 text-white rounded-tr-sm'
                                : 'bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-200 shadow-sm border border-gray-100 dark:border-gray-700 rounded-tl-sm'
                                }`}>
                                {msg.content}
                            </div>

                            {/* Tool Evidence Badge */}
                            {msg.toolUsed && (
                                <div className="mt-1 flex items-center gap-1 text-[10px] text-gray-400 bg-gray-100 dark:bg-gray-800 px-2 py-0.5 rounded-full border border-gray-200 dark:border-gray-700 select-none">
                                    <Database className="w-3 h-3" />
                                    <span>Données : {msg.toolUsed}</span>
                                </div>
                            )}

                            <span className="text-[10px] text-gray-400 mt-1 px-1">
                                {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </span>
                        </div>
                    </div>
                ))}

                {isLoading && (
                    <div className="flex gap-3">
                        <div className="w-8 h-8 rounded-full bg-gray-900 text-white flex items-center justify-center">
                            <Sparkles className="w-4 h-4" />
                        </div>
                        <div className="bg-white dark:bg-gray-800 p-3 rounded-2xl rounded-tl-sm shadow-sm border border-gray-100 dark:border-gray-700">
                            <Loader2 className="w-5 h-5 animate-spin text-gray-400" />
                        </div>
                    </div>
                )}
            </div>

            {/* Input */}
            <div className="p-4 bg-white dark:bg-gray-800 border-t border-gray-100 dark:border-gray-700">
                <form
                    onSubmit={(e) => { e.preventDefault(); handleSend(); }}
                    className="flex gap-2"
                >
                    <input
                        type="text"
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        placeholder="Posez une question sur les données..."
                        className="flex-1 bg-gray-100 dark:bg-gray-900 border-0 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-primary-500 dark:text-white"
                        autoFocus
                    />
                    <button
                        type="submit"
                        disabled={!input.trim() || isLoading}
                        className="p-3 bg-primary-600 text-white rounded-xl hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                        <Send className="w-5 h-5" />
                    </button>
                </form>
            </div>
        </div>
    );
};
