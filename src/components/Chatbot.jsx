'use client';

import { useState, useRef, useEffect } from 'react';
import { MessageCircle, X, Send, Bot, User } from 'lucide-react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useSelector } from 'react-redux';
import Axios from '@/lib/axios';
import ENDPOINTS from '@/lib/apiConfig';
import toast from 'react-hot-toast';
import ReactMarkdown from 'react-markdown';

const Chatbot = () => {
  const router = useRouter();
  const isAuthenticated = useSelector((state) => state.auth.isAuthenticated);
  const [isOpen, setIsOpen] = useState(false);
  const [sessionId, setSessionId] = useState(null);
  const [messages, setMessages] = useState([
    {
      role: 'bot',
      content: 'Hello! I\'m your **Shophub** assistant. I can help you with questions about our clothing products, prices, availability, and customer support.\n\n📞 Support: 8670010941\n📧 Email: wtamang333@gmail.com\n\nHow can I assist you today?',
    },
  ]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Load sessionId from localStorage on mount
  useEffect(() => {
    const savedSessionId = localStorage.getItem('chatbotSessionId');
    if (savedSessionId) {
      setSessionId(savedSessionId);
    }
  }, []);

  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen]);

  // Load conversation history when sessionId is available (only once when opening)
  useEffect(() => {
    const loadConversation = async () => {
      if (sessionId && isOpen) {
        try {
          const response = await Axios({
            url: `${ENDPOINTS.chatbot.chat.url}/${sessionId}`,
            method: 'get',
          });
          
          if (response.data.data?.conversation?.messages && response.data.data.conversation.messages.length > 0) {
            const history = response.data.data.conversation.messages;
            // Convert to display format (skip system messages)
            const formattedMessages = history
              .filter(msg => msg.role !== 'system')
              .map(msg => ({
                role: msg.role === 'assistant' ? 'bot' : msg.role,
                content: msg.content,
              }));
            
            if (formattedMessages.length > 0) {
              setMessages(formattedMessages);
            }
          }
        } catch (error) {
          console.error('Error loading conversation:', error);
          // If conversation not found, start fresh
          if (error.response?.status === 404) {
            setSessionId(null);
            localStorage.removeItem('chatbotSessionId');
          }
        }
      }
    };

    // Only load if we have a sessionId and chat is just opened
    if (sessionId && isOpen) {
      loadConversation();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen]);

  const handleCloseChat = async () => {
    // Delete conversation from database if sessionId exists
    if (sessionId) {
      try {
        await Axios({
          url: ENDPOINTS.chatbot.deleteConversation.url.replace(':sessionId', sessionId),
          method: ENDPOINTS.chatbot.deleteConversation.method,
        });
      } catch (error) {
        console.error('Error deleting conversation:', error);
        // Continue even if deletion fails
      }
    }
    
    // Clear chat history
    setMessages([
      {
        role: 'bot',
        content: 'Hello! I\'m your **Shophub** assistant. I can help you with questions about our clothing products, prices, availability, and customer support.\n\n📞 Support: 8670010941\n📧 Email: wtamang333@gmail.com\n\nHow can I assist you today?',
      },
    ]);
    
    // Clear sessionId
    setSessionId(null);
    localStorage.removeItem('chatbotSessionId');
    
    // Close chat
    setIsOpen(false);
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    
    if (!inputMessage.trim() || isLoading) return;

    const userMessage = inputMessage.trim();
    setInputMessage('');
    
    // Add user message to chat
    setMessages((prev) => [...prev, { role: 'user', content: userMessage }]);
    setIsLoading(true);

    try {
      const response = await Axios({
        url: ENDPOINTS.chatbot.chat.url,
        method: ENDPOINTS.chatbot.chat.method,
        data: { 
          message: userMessage,
          sessionId: sessionId,
          isAuthenticated: isAuthenticated,
        },
      });

      const botResponse = response.data.data.response;
      const newSessionId = response.data.data.sessionId;
      
      // Update sessionId if it's a new session
      if (newSessionId && newSessionId !== sessionId) {
        setSessionId(newSessionId);
        // Store in localStorage for persistence
        localStorage.setItem('chatbotSessionId', newSessionId);
      }
      
      setMessages((prev) => [...prev, { role: 'bot', content: botResponse }]);
    } catch (error) {
      console.error('Chatbot error:', error);
      let errorMessage = error.response?.data?.message || 'Sorry, I encountered an error. Please try again.';
      
      // Handle quota/billing/balance errors with helpful message
      if (errorMessage.includes('quota') || errorMessage.includes('billing') || errorMessage.includes('balance') || errorMessage.includes('insufficient')) {
        errorMessage = `I'm currently experiencing technical difficulties with my AI service. 

For immediate assistance, please contact our support team:
📞 Phone: 8670010941
📧 Email: wtamang333@gmail.com

You can also browse our products directly on the website. Thank you for your understanding!`;
      }
      
      setMessages((prev) => [...prev, { role: 'bot', content: errorMessage }]);
      
      // Only show toast for non-quota errors
      if (!errorMessage.includes('quota') && !errorMessage.includes('billing')) {
        toast.error('Failed to get response from chatbot');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      {/* Chat Button */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="fixed bottom-6 right-6 z-[9999] bg-[#FFCBD8] hover:bg-[#ffb3c6] text-white rounded-full p-4 shadow-lg transition-all duration-300 hover:scale-110 flex items-center justify-center animate-pulse sm:bottom-4 sm:right-4"
          aria-label="Open chatbot"
        >
          <MessageCircle size={24} />
        </button>
      )}

      {/* Chat Window */}
      {isOpen && (
        <div className="fixed bottom-6 right-6 z-[9999] w-96 h-[600px] max-w-[calc(100vw-3rem)] max-h-[calc(100vh-3rem)] bg-white rounded-lg shadow-2xl flex flex-col border border-gray-200 animate-in slide-in-from-bottom-5 duration-300 md:w-96 sm:w-[calc(100vw-2rem)] sm:right-3 sm:bottom-3">
          {/* Header */}
          <div className="bg-[#FFCBD8] text-white p-4 rounded-t-lg flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Bot size={20} />
              <h3 className="font-semibold text-lg">Shophub Assistant</h3>
            </div>
            <button
              onClick={handleCloseChat}
              className="hover:bg-white/20 rounded-full p-1 transition-colors"
              aria-label="Close chatbot"
            >
              <X size={20} />
            </button>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50 scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100">
            {messages.map((message, index) => (
              <div
                key={index}
                className={`flex gap-3 ${
                  message.role === 'user' ? 'justify-end' : 'justify-start'
                }`}
              >
                {message.role === 'bot' && (
                  <div className="flex-shrink-0 w-8 h-8 bg-[#FFCBD8] rounded-full flex items-center justify-center">
                    <Bot size={16} className="text-white" />
                  </div>
                )}
                <div
                  className={`max-w-[75%] rounded-lg px-4 py-2 ${
                    message.role === 'user'
                      ? 'bg-[#FFCBD8] text-white'
                      : 'bg-white text-gray-800 border border-gray-200'
                  }`}
                  style={{ pointerEvents: 'auto' }}
                >
                  {message.role === 'bot' ? (
                    <div className="text-sm max-w-none">
                      <ReactMarkdown
                        components={{
                          p: ({ children }) => <p className="mb-2 last:mb-0">{children}</p>,
                          strong: ({ children }) => <strong className="font-bold text-gray-900">{children}</strong>,
                          a: ({ href, children }) => {
                            // Check if it's an internal link (starts with /)
                            if (href && href.startsWith('/') && !href.startsWith('//')) {
                              return (
                                <Link
                                  href={href}
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    // Close chatbot when navigating to important pages
                                    if (href.startsWith('/product/') || href === '/checkout' || href === '/cart') {
                                      // Clear history and close
                                      handleCloseChat();
                                    }
                                  }}
                                  className="text-blue-600 hover:text-blue-800 hover:bg-blue-50 underline font-semibold break-words cursor-pointer inline-block relative z-10 px-1 rounded transition-colors"
                                  style={{ pointerEvents: 'auto', textDecoration: 'underline' }}
                                >
                                  {children}
                                </Link>
                              );
                            }
                            // External links
                            return (
                              <a 
                                href={href} 
                                target="_blank" 
                                rel="noopener noreferrer"
                                className="text-blue-600 hover:text-blue-800 hover:bg-blue-50 underline font-semibold break-words cursor-pointer inline-block relative z-10 px-1 rounded transition-colors"
                                onClick={(e) => e.stopPropagation()}
                                style={{ pointerEvents: 'auto', textDecoration: 'underline' }}
                              >
                                {children}
                              </a>
                            );
                          },
                          ul: ({ children }) => <ul className="list-disc list-inside mb-2 space-y-1">{children}</ul>,
                          ol: ({ children }) => <ol className="list-decimal list-inside mb-2 space-y-1">{children}</ol>,
                          li: ({ children }) => <li className="ml-2">{children}</li>,
                        }}
                      >
                        {message.content}
                      </ReactMarkdown>
                    </div>
                  ) : (
                    <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                  )}
                </div>
                {message.role === 'user' && (
                  <div className="flex-shrink-0 w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center">
                    <User size={16} className="text-gray-600" />
                  </div>
                )}
              </div>
            ))}
            {isLoading && (
              <div className="flex gap-3 justify-start">
                <div className="flex-shrink-0 w-8 h-8 bg-[#FFCBD8] rounded-full flex items-center justify-center">
                  <Bot size={16} className="text-white" />
                </div>
                <div className="bg-white text-gray-800 border border-gray-200 rounded-lg px-4 py-2">
                  <div className="flex gap-1">
                    <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></span>
                    <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></span>
                    <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></span>
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <form onSubmit={handleSendMessage} className="p-4 border-t border-gray-200 bg-white rounded-b-lg">
            <div className="flex gap-2">
              <input
                ref={inputRef}
                type="text"
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                placeholder="Ask about products or support..."
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#FFCBD8] focus:border-transparent"
                disabled={isLoading}
              />
              <button
                type="submit"
                disabled={!inputMessage.trim() || isLoading}
                className="bg-[#FFCBD8] hover:bg-[#ffb3c6] text-white rounded-lg px-4 py-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center"
              >
                <Send size={18} />
              </button>
            </div>
            <p className="text-xs text-gray-500 mt-2 text-center">
              Ask about products, prices, or contact support
            </p>
          </form>
        </div>
      )}
    </>
  );
};

export default Chatbot;

