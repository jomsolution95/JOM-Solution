
import React, { useState, useRef, useEffect } from 'react';
import { Search, Send, Paperclip, MoreVertical, Phone, Video, Info, Image as ImageIcon, X } from 'lucide-react';

const mockContacts = [
  { id: '1', name: 'Jean Michel', avatar: 'https://ui-avatars.com/api/?name=Jean+Michel', lastMsg: 'Merci pour votre commande !', time: '10:30', unread: 2, online: true },
  { id: '2', name: 'Tech Solutions', avatar: 'https://ui-avatars.com/api/?name=Tech+Solutions', lastMsg: 'Le devis est prêt.', time: 'Hier', unread: 0, online: false },
  { id: '3', name: 'Sarah Ndiaye', avatar: 'https://ui-avatars.com/api/?name=Sarah+Ndiaye', lastMsg: 'Ok, on se voit lundi.', time: 'Lun', unread: 0, online: true },
  { id: '4', name: 'Support JOM', avatar: 'https://ui-avatars.com/api/?name=Support', lastMsg: 'Votre ticket #4829 a été résolu.', time: 'Lun', unread: 0, online: false },
];

interface Message {
    id: string;
    text: string;
    sender: 'me' | 'other';
    time: string;
    image?: string;
}

export const MessagesPage: React.FC = () => {
  const [activeChat, setActiveChat] = useState(mockContacts[0]);
  const [message, setMessage] = useState('');
  const [attachment, setAttachment] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Mock conversation history
  const [messages, setMessages] = useState<Message[]>([
      { id: '1', text: 'Bonjour ! J\'ai bien reçu votre demande.', sender: 'other', time: '10:00' },
      { id: '2', text: 'Super, merci pour la confirmation rapide.', sender: 'me', time: '10:05' },
      { id: '3', text: 'Merci pour votre commande !', sender: 'other', time: '10:30' }
  ]);

  // Auto-scroll to bottom
  useEffect(() => {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
      if (e.target.files && e.target.files[0]) {
          const file = e.target.files[0];
          // Create a preview URL
          const url = URL.createObjectURL(file);
          setAttachment(url);
      }
  };

  const handleSendMessage = () => {
      if (!message.trim() && !attachment) return;

      const newMessage: Message = {
          id: Date.now().toString(),
          text: message,
          sender: 'me',
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          image: attachment || undefined
      };

      setMessages([...messages, newMessage]);
      setMessage('');
      setAttachment(null);
      if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
      if (e.key === 'Enter' && !e.shiftKey) {
          e.preventDefault();
          handleSendMessage();
      }
  };

  return (
    <div className="bg-gray-50 dark:bg-gray-900 min-h-[calc(100vh-4rem)] flex">
        {/* Sidebar List */}
        <div className="w-full md:w-80 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 flex flex-col">
            <div className="p-4 border-b border-gray-200 dark:border-gray-700">
                <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Messages</h2>
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                    <input 
                        type="text" 
                        placeholder="Rechercher..." 
                        className="w-full pl-10 pr-4 py-2 bg-gray-100 dark:bg-gray-700 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 dark:text-white"
                    />
                </div>
            </div>
            
            <div className="flex-1 overflow-y-auto">
                {mockContacts.map(contact => (
                    <div 
                        key={contact.id}
                        onClick={() => setActiveChat(contact)}
                        className={`p-4 flex items-center gap-3 cursor-pointer transition-colors hover:bg-gray-50 dark:hover:bg-gray-700/50 ${activeChat.id === contact.id ? 'bg-primary-50 dark:bg-primary-900/20 border-r-4 border-primary-600' : ''}`}
                    >
                        <div className="relative">
                            <img src={contact.avatar} alt={contact.name} className="w-12 h-12 rounded-full object-cover" />
                            {contact.online && <span className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-white dark:border-gray-800 rounded-full"></span>}
                        </div>
                        <div className="flex-1 min-w-0">
                            <div className="flex justify-between items-center mb-1">
                                <h3 className={`text-sm font-semibold truncate ${activeChat.id === contact.id ? 'text-primary-700 dark:text-primary-400' : 'text-gray-900 dark:text-white'}`}>
                                    {contact.name}
                                </h3>
                                <span className="text-xs text-gray-500">{contact.time}</span>
                            </div>
                            <div className="flex justify-between items-center">
                                <p className="text-xs text-gray-500 truncate dark:text-gray-400">{contact.lastMsg}</p>
                                {contact.unread > 0 && (
                                    <span className="bg-primary-600 text-white text-xs w-5 h-5 flex items-center justify-center rounded-full font-bold">
                                        {contact.unread}
                                    </span>
                                )}
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>

        {/* Chat Area */}
        <div className="hidden md:flex flex-1 flex-col bg-white dark:bg-gray-900">
            {/* Chat Header */}
            <div className="p-4 border-b border-gray-200 dark:border-gray-800 flex justify-between items-center bg-white dark:bg-gray-800">
                <div className="flex items-center gap-3">
                    <img src={activeChat.avatar} alt={activeChat.name} className="w-10 h-10 rounded-full" />
                    <div>
                        <h3 className="font-bold text-gray-900 dark:text-white">{activeChat.name}</h3>
                        <span className="text-xs text-green-500 flex items-center gap-1">
                            {activeChat.online ? 'En ligne' : 'Hors ligne'}
                        </span>
                    </div>
                </div>
                <div className="flex items-center gap-2 text-gray-500">
                    <button className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full"><Phone className="w-5 h-5" /></button>
                    <button className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full"><Video className="w-5 h-5" /></button>
                    <button className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full"><Info className="w-5 h-5" /></button>
                </div>
            </div>

            {/* Messages */}
            <div className="flex-1 p-4 overflow-y-auto space-y-4 bg-gray-50 dark:bg-gray-900">
                <div className="flex justify-center">
                    <span className="text-xs text-gray-400 bg-gray-200 dark:bg-gray-800 px-3 py-1 rounded-full">Aujourd'hui</span>
                </div>
                
                {messages.map((msg) => (
                    <div key={msg.id} className={`flex items-end gap-2 ${msg.sender === 'me' ? 'justify-end' : ''}`}>
                        {msg.sender === 'other' && <img src={activeChat.avatar} className="w-8 h-8 rounded-full mb-1" alt="" />}
                        <div className={`p-3 rounded-2xl max-w-md shadow-sm ${
                            msg.sender === 'me' 
                            ? 'bg-primary-600 text-white rounded-br-none' 
                            : 'bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-bl-none'
                        }`}>
                            {msg.image && (
                                <img src={msg.image} alt="attachment" className="rounded-lg mb-2 max-w-full h-auto object-cover max-h-60" />
                            )}
                            {msg.text && <p className={`text-sm ${msg.sender === 'me' ? 'text-white' : 'text-gray-800 dark:text-gray-200'}`}>{msg.text}</p>}
                            <span className={`text-[10px] mt-1 block ${msg.sender === 'me' ? 'text-primary-200 text-right' : 'text-gray-400'}`}>{msg.time}</span>
                        </div>
                    </div>
                ))}
                <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <div className="p-4 bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700">
                {attachment && (
                    <div className="mb-3 relative inline-block">
                        <img src={attachment} alt="Preview" className="h-20 rounded-lg border border-gray-200 dark:border-gray-600" />
                        <button 
                            onClick={() => { setAttachment(null); if(fileInputRef.current) fileInputRef.current.value = ''; }}
                            className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-0.5 hover:bg-red-600"
                        >
                            <X className="w-4 h-4" />
                        </button>
                    </div>
                )}
                <div className="flex items-center gap-2">
                    <button 
                        onClick={() => fileInputRef.current?.click()}
                        className="text-gray-400 hover:text-primary-600 p-2 transition-colors"
                        title="Joindre un fichier"
                    >
                        <Paperclip className="w-5 h-5" />
                    </button>
                    <input 
                        type="file" 
                        ref={fileInputRef}
                        onChange={handleFileSelect}
                        className="hidden"
                        accept="image/*"
                    />
                    
                    <input 
                        type="text" 
                        value={message}
                        onChange={(e) => setMessage(e.target.value)}
                        onKeyDown={handleKeyPress}
                        placeholder="Écrivez votre message..." 
                        className="flex-1 bg-gray-100 dark:bg-gray-700 rounded-full px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 dark:text-white"
                    />
                    <button 
                        onClick={handleSendMessage}
                        disabled={!message.trim() && !attachment}
                        className={`p-3 rounded-full transition-colors ${
                            message.trim() || attachment 
                            ? 'bg-primary-600 text-white hover:bg-primary-700 shadow-md' 
                            : 'bg-gray-100 text-gray-400 dark:bg-gray-700 cursor-not-allowed'
                        }`}
                    >
                        <Send className="w-5 h-5" />
                    </button>
                </div>
            </div>
        </div>
    </div>
  );
};

export default MessagesPage;
