'use client';

import { useState, useRef, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import QuickActions from './QuickActions';
import MessageContent from './MessageContent';
import JsonMessageContent from './JsonMessageContent';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string | any;
  timestamp: Date;
  type?: 'text' | 'json';
}

export default function MedicalChat() {
  const { data: session } = useSession();
  const [encounterId, setEncounterId] = useState<string | null>(null);
  const [encounterMessages, setEncounterMessages] = useState<Message[]>([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [chatHistory, setChatHistory] = useState<any[]>([]);
  const [error, setError] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [encounterMessages]);

  // Fetch chat history for the user (encounters)
  useEffect(() => {
    if (!session) return;
    const fetchHistory = async () => {
      try {
        const res = await fetch('/api/chat/history');
        if (res.ok) {
          const data = await res.json();
          // Parse timestamps in messages
          const parsedHistory = (data.history || []).map((item: any) => {
            if (Array.isArray(item.messages)) {
              item.messages = item.messages.map((msg: any) => ({
                ...msg,
                timestamp: msg.timestamp ? new Date(msg.timestamp) : new Date()
              }));
            }
            if (item.createdAt) item.createdAt = new Date(item.createdAt);
            if (item.updatedAt) item.updatedAt = new Date(item.updatedAt);
            return item;
          });
          setChatHistory(parsedHistory);
        } else {
          setError('Failed to load chat history.');
        }
      } catch (err) {
        setError('Network error while loading chat history.');
      }
    };
    fetchHistory();
  }, [session]);

  // Start a new encounter
  const startNewEncounter = async () => {
    // Save current encounter if it has messages
    if (encounterMessages.length > 1) {
      try {
        const res = await fetch('/api/chat/encounter', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            messages: encounterMessages,
            encounterId,
          }),
        });
        if (!res.ok) setError('Failed to save previous chat session.');
      } catch (err) {
        setError('Network error while saving previous chat session.');
      }
    }
    setEncounterId(Date.now().toString());
    setEncounterMessages([
      {
        id: '1',
        role: 'assistant',
        content: {
          greeting: "Welcome to Your AI Medical Assistant! 🤗",
          mainContent: {
            summary: "I'm here to help you with health-related questions and provide general medical guidance.",
            keyPoints: [
              "General health information and wellness tips",
              "Symptom guidance and when to seek care",
              "Nutrition and exercise recommendations",
              "Mental health and stress management",
              "Medication information (general)",
              "Preventive care suggestions"
            ],
            recommendations: [
              {
                title: "Ask Questions",
                description: "Feel free to ask about any health concerns or symptoms you may have",
                icon: "🩺"
              },
              {
                title: "Use Quick Actions",
                description: "Try the quick action buttons below for common health topics",
                icon: "⚡"
              }
            ]
          },
          whenToSeekHelp: {
            urgentSigns: ["Severe chest pain", "Difficulty breathing", "Loss of consciousness"],
            consultDoctor: ["Persistent symptoms", "Worsening conditions", "Medication questions"]
          },
          disclaimer: "I provide general information only and cannot replace professional medical advice. Always consult healthcare professionals for personalized care.",
          supportiveClosing: "How can I help you today? 💙"
        },
        timestamp: new Date(),
        type: 'json'
      }
    ]);
    setError(null);
  };

  // On mount, start a new encounter
  useEffect(() => {
    startNewEncounter();
    // eslint-disable-next-line
  }, [session]);

  const sendMessage = async (messageText?: string) => {
    // Ensure we have a valid string
    const textToSend = typeof messageText === 'string' ? messageText : inputMessage;
    
    // Check if textToSend is a string and not empty
    if (typeof textToSend !== 'string' || !textToSend.trim() || isLoading) {
      return;
    }

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: textToSend.trim(),
      timestamp: new Date(),
    };

    setEncounterMessages(prev => [...prev, userMessage]);
    setInputMessage('');
    setIsLoading(true);
    setError(null);
    let updatedMessages: Message[] = [];

    try {
      // Prepare conversation history (last 10 messages for context)
      const conversationHistory = encounterMessages.slice(-10).map(msg => ({
        role: msg.role,
        content: typeof msg.content === 'string' ? msg.content : JSON.stringify(msg.content)
      }));

      const response = await fetch('/api/chat/medical', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: textToSend.trim(),
          conversationHistory,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to get response');
      }

      const aiMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: data.message,
        timestamp: new Date(),
        type: data.type === 'json' ? 'json' : 'text',
      };

      updatedMessages = [...encounterMessages, userMessage, aiMessage];
      setEncounterMessages(updatedMessages);
      // Save the encounter after every message exchange
      await fetch('/api/chat/encounter', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: updatedMessages,
          encounterId,
        }),
      });
    } catch (error: any) {
      setError(error.message || 'Failed to send message.');
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: 'I apologize, but I\'m having trouble responding right now. Please try again in a moment.',
        timestamp: new Date(),
      };
      updatedMessages = [...encounterMessages, userMessage, errorMessage];
      setEncounterMessages(updatedMessages);
      // Save the encounter even if there was an error
      await fetch('/api/chat/encounter', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: updatedMessages,
          encounterId,
        }),
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const handleSendClick = () => {
    if (inputMessage && typeof inputMessage === 'string' && inputMessage.trim()) {
      sendMessage();
    }
  };

  const clearChat = () => {
    setEncounterMessages([
      {
        id: '1',
        role: 'assistant',
        content: {
          greeting: "Welcome Back! 🤗",
          mainContent: {
            summary: "I'm your AI medical assistant, ready to help with your health questions.",
            keyPoints: [],
            recommendations: []
          },
          whenToSeekHelp: {
            urgentSigns: [],
            consultDoctor: []
          },
          disclaimer: "This is general information only. Always consult healthcare professionals for medical advice.",
          supportiveClosing: "How can I assist you today? 💙"
        },
        timestamp: new Date(),
        type: 'json'
      }
    ]);
  };

  if (!session) {
    return (
      <div className="flex items-center justify-center h-96 bg-gray-50 rounded-lg">
        <p className="text-gray-600">Please sign in to use the medical chat assistant.</p>
      </div>
    );
  }

  return (
    <div className="flex h-[600px] bg-white rounded-lg shadow-lg border">
      {/* Chat Main Area */}
      <div className="flex flex-col flex-1">
        {/* New Chat Button */}
        <div className="flex justify-end p-2">
          <button onClick={startNewEncounter} className="bg-blue-600 text-white px-4 py-1 rounded hover:bg-blue-700 transition">+ New Chat</button>
        </div>
        {/* Chat Header */}
        <div className="flex items-center justify-between p-4 border-b bg-blue-50">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
              </svg>
            </div>
            <div>
              <h3 className="font-semibold text-gray-900">Medical AI Assistant</h3>
              <p className="text-sm text-gray-600">Powered by GPT-4o</p>
            </div>
          </div>
          <button
            onClick={clearChat}
            className="px-3 py-1 text-sm bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 transition-colors"
          >
            Clear Chat
          </button>
        </div>

        {/* Messages Container */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {encounterMessages.map((message) => (
            <div
              key={message.id}
              className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'} ${
                message.role === 'user' ? 'message-user' : 'message-assistant'
              }`}
            >
              <div
                className={`max-w-[80%] p-4 rounded-lg shadow-sm ${
                  message.role === 'user'
                    ? 'bg-blue-600 text-white'
                    : 'bg-white text-gray-900 border border-gray-200'
                }`}
              >
                <div className={`${message.role === 'assistant' ? 'prose prose-sm max-w-none' : ''}`}>
                  {message.type === 'json' ? (
                    <JsonMessageContent content={message.content} isUser={message.role === 'user'} />
                  ) : (
                    <MessageContent content={message.content} isUser={message.role === 'user'} />
                  )}
                </div>
                <p className={`text-xs mt-3 ${
                  message.role === 'user' ? 'text-blue-100' : 'text-gray-500'
                }`}>
                  {message.timestamp.toLocaleTimeString()}
                </p>
              </div>
            </div>
          ))}
          
          {isLoading && (
            <div className="flex justify-start message-assistant">
              <div className="bg-white border border-gray-200 p-4 rounded-lg shadow-sm max-w-[80%]">
                <div className="flex items-center space-x-2">
                  <div className="flex space-x-1">
                    <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce"></div>
                    <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                    <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                  </div>
                  <span className="text-gray-600 text-sm">AI is thinking...</span>
                </div>
              </div>
            </div>
          )}
          
          <div ref={messagesEndRef} />
        </div>

        {/* Input Area */}
        <div className="p-4 border-t bg-gray-50">
          {/* Quick Actions */}
          {encounterMessages.length <= 1 && (
            <QuickActions 
              onQuickAction={(message) => sendMessage(message)} 
              disabled={isLoading}
            />
          )}
          
          <div className="flex space-x-2">
            <textarea
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Ask me about your health concerns, symptoms, or general wellness questions..."
              className="w-full border rounded-md p-2 focus:ring-2 focus:ring-blue-400 text-gray-900 placeholder-gray-500"
              rows={2}
              disabled={isLoading}
            />
            <button
              onClick={sendMessage}
              disabled={!inputMessage.trim() || isLoading}
              className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {isLoading ? (
                <svg className="w-5 h-5 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
              ) : (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                </svg>
              )}
            </button>
          </div>
          
          {/* Disclaimer */}
          <p className="text-xs text-gray-500 mt-2">
            ⚠️ This AI provides general information only. Always consult healthcare professionals for medical advice.
          </p>
        </div>

        {error && (
          <div className="bg-red-100 text-red-700 p-2 rounded mb-2 text-sm text-center">
            {error}
          </div>
        )}
      </div>
      {/* Chat History Sidebar */}
      <div className="w-72 border-l bg-gray-50 p-4 overflow-y-auto rounded-r-lg flex flex-col">
        <h4 className="font-semibold text-gray-800 mb-4">Chat History</h4>
        {chatHistory.length === 0 ? (
          <div className="text-gray-500 text-sm">No previous chats.</div>
        ) : (
          <ul className="space-y-3">
            {chatHistory.map((item, idx) => {
              const hasMessages = Array.isArray(item.messages) && item.messages.length > 0;
              // Find first user message, fallback to first assistant message
              let preview = '';
              if (hasMessages) {
                const userMsg = item.messages.find((m: any) => m.role === 'user');
                const assistantMsg = item.messages.find((m: any) => m.role === 'assistant');
                preview = userMsg?.content || assistantMsg?.content || 'No preview available';
                if (typeof preview === 'object') preview = JSON.stringify(preview);
              }
              return (
                <li
                  key={item._id || idx}
                  className={`bg-white rounded-lg shadow p-3 hover:bg-blue-50 transition cursor-pointer ${encounterId === item.encounterId ? 'ring-2 ring-blue-400' : ''}`}
                  onClick={() => {
                    if (hasMessages) {
                      setEncounterMessages(item.messages);
                      setEncounterId(item.encounterId);
                    }
                  }}
                >
                  <div className="text-xs text-gray-500 mb-1">
                    {item.createdAt ? `${new Date(item.createdAt).toLocaleDateString()} ${new Date(item.createdAt).toLocaleTimeString()}` : ''}
                  </div>
                  <div className="font-medium text-gray-700 truncate">
                    {preview}
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </div>
  );
}