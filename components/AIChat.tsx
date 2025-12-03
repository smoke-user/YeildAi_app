
import React, { useState, useRef, useEffect } from 'react';
import { Send, Image as ImageIcon, Loader2, Bot, User, X } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';
import { sendChatMessage } from '../services/geminiService';
import { ChatMessage } from '../types';

export const AIChat: React.FC = () => {
  const { t, language } = useLanguage();
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'welcome',
      role: 'model',
      text: t.chat.welcome,
      timestamp: Date.now()
    }
  ]);
  const [inputText, setInputText] = useState('');
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64String = reader.result as string;
        // Remove data URL prefix for API
        const base64Data = base64String.split(',')[1];
        setSelectedImage(base64Data);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSend = async () => {
    if ((!inputText.trim() && !selectedImage) || loading) return;

    const newUserMessage: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      text: inputText,
      image: selectedImage || undefined,
      timestamp: Date.now()
    };

    setMessages(prev => [...prev, newUserMessage]);
    setInputText('');
    const imageToSend = selectedImage;
    setSelectedImage(null);
    setLoading(true);

    try {
      const responseText = await sendChatMessage(newUserMessage.text, imageToSend, language);
      
      const newAiMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: 'model',
        text: responseText,
        timestamp: Date.now()
      };
      
      setMessages(prev => [...prev, newAiMessage]);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-[calc(100vh-140px)] md:h-[calc(100vh-100px)] bg-white dark:bg-dark-card rounded-2xl shadow-sm border border-slate-200 dark:border-dark-border overflow-hidden">
      {/* Header */}
      <div className="p-4 border-b border-slate-200 dark:border-dark-border bg-yield-50 dark:bg-yield-900/30">
        <div className="flex items-center gap-3">
          <div className="bg-yield-600 p-2 rounded-lg text-white">
            <Bot size={24} />
          </div>
          <div>
            <h2 className="font-bold text-slate-800 dark:text-white">{t.chat.title}</h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">{t.chat.subtitle}</p>
          </div>
        </div>
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((msg) => (
          <div 
            key={msg.id} 
            className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div className={`max-w-[85%] md:max-w-[70%] rounded-2xl p-4 ${
              msg.role === 'user' 
                ? 'bg-yield-600 text-white rounded-br-none' 
                : 'bg-slate-100 dark:bg-yield-900/40 text-slate-800 dark:text-slate-100 rounded-bl-none'
            }`}>
              {msg.image && (
                <div className="mb-3 rounded-lg overflow-hidden border border-white/20">
                  <img 
                    src={`data:image/jpeg;base64,${msg.image}`} 
                    alt="Uploaded" 
                    className="max-h-48 object-cover w-full"
                  />
                </div>
              )}
              <div className="whitespace-pre-wrap text-sm md:text-base">{msg.text}</div>
              <div className={`text-[10px] mt-2 opacity-70 ${msg.role === 'user' ? 'text-right' : 'text-left'}`}>
                {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </div>
            </div>
          </div>
        ))}
        {loading && (
          <div className="flex justify-start">
            <div className="bg-slate-100 dark:bg-yield-900/40 rounded-2xl rounded-bl-none p-4 flex items-center gap-2 text-slate-500 dark:text-slate-400 text-sm">
              <Loader2 size={16} className="animate-spin" />
              {t.chat.agentThinking}
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="p-4 border-t border-slate-200 dark:border-dark-border bg-white dark:bg-dark-card">
        {selectedImage && (
          <div className="flex items-center gap-2 mb-2 p-2 bg-slate-50 dark:bg-yield-900/20 rounded-lg w-fit border border-slate-200 dark:border-dark-border">
             <img src={`data:image/jpeg;base64,${selectedImage}`} alt="Preview" className="w-10 h-10 object-cover rounded" />
             <span className="text-xs text-slate-500 dark:text-slate-400 max-w-[150px] truncate">Image selected</span>
             <button onClick={() => setSelectedImage(null)} className="text-slate-400 hover:text-red-500">
               <X size={16} />
             </button>
          </div>
        )}
        <div className="flex gap-2">
          <input
            type="file"
            accept="image/*"
            className="hidden"
            ref={fileInputRef}
            onChange={handleImageSelect}
          />
          <button
            onClick={() => fileInputRef.current?.click()}
            className="p-3 bg-slate-100 dark:bg-yield-900/30 text-slate-600 dark:text-slate-300 rounded-xl hover:bg-slate-200 dark:hover:bg-yield-900/50 transition-colors"
            title={t.common.uploadPhoto}
          >
            <ImageIcon size={20} />
          </button>
          <div className="flex-1 relative">
            <input
              type="text"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSend()}
              placeholder={t.chat.placeholder}
              className="w-full h-full px-4 py-3 bg-slate-50 dark:bg-yield-900/20 border border-slate-200 dark:border-dark-border rounded-xl focus:ring-2 focus:ring-yield-500 outline-none text-slate-800 dark:text-white"
            />
          </div>
          <button
            onClick={handleSend}
            disabled={(!inputText.trim() && !selectedImage) || loading}
            className={`p-3 rounded-xl transition-all ${
              (!inputText.trim() && !selectedImage) || loading
                ? 'bg-slate-200 dark:bg-yield-900/20 text-slate-400' 
                : 'bg-yield-600 text-white hover:bg-yield-700 shadow-lg'
            }`}
          >
            {loading ? <Loader2 size={20} className="animate-spin" /> : <Send size={20} />}
          </button>
        </div>
      </div>
    </div>
  );
};
