/**
 * Chatbot.tsx
 * A chat interface component that connects users with an AI assistant for food donation help
 */

import React, { useState, useRef, useEffect } from 'react';
import {
  Box,
  Paper,
  TextField,
  IconButton,
  Typography,
  Fab,
  Skeleton,
  useTheme,
  useMediaQuery,
  Fade,
  Zoom,
  Button,
} from '@mui/material';
import SendIcon from '@mui/icons-material/Send';
import ChatIcon from '@mui/icons-material/Chat';
import CloseIcon from '@mui/icons-material/Close';
import { useAuth } from '../contexts/AuthContext';

/// <reference types="vite/client" />

interface Message {
  text: string;
  sender: 'user' | 'bot';
  timestamp: Date;
}
   {/* foot */}
interface ImportMetaEnv {
  readonly VITE_GEMINI_API_KEY: string;
  readonly VITE_API_URL: string;
}

const Chatbot = () => {
  const { user } = useAuth();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      text: 'Hello! I\'m your Zero Hunger assistant. How can I help you today?',
      sender: 'bot',
      timestamp: new Date(),
    },
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim()) return;

    const userMessage: Message = {
      text: input,
      sender: 'user',
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setLoading(true);

    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/chatbot/chat`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${await user?.getIdToken()}`,
        },
        body: JSON.stringify({ message: input }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.error('API Error:', {
          status: response.status,
          statusText: response.statusText,
          error: errorData
        });
        throw new Error(errorData.error || errorData.details || 'Failed to get response from AI');
      }

      const data = await response.json();
      
      if (!data.response) {
        throw new Error('Invalid response format from server');
      }

      const botResponse: Message = {
        text: data.response,
        sender: 'bot',
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, botResponse]);
    } catch (error: any) {
      console.error('Error getting bot response:', error);
      const errorMessage: Message = {
        text: `I apologize, but I encountered an error: ${error.message}. Please try asking your question again, or contact support if the problem persists.`,
        sender: 'bot',
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  if (!user) return null;

  return (
    <>
      <Zoom in={!isOpen}>
        <Fab
          color="primary"
          aria-label="chat"
          onClick={() => setIsOpen(true)}
          sx={{
            position: 'fixed',
            bottom: 16,
            right: 16,
            display: isOpen ? 'none' : 'flex',
            transform: 'scale(1)',
            transition: 'transform 0.3s ease-in-out',
            zIndex: 1200,
            width: isMobile ? 56 : 48,
            height: isMobile ? 56 : 48,
            backgroundColor: theme.palette.primary.main,
            '&:hover': {
              transform: 'scale(1.1)',
              backgroundColor: theme.palette.primary.dark,
            },
          }}
        >
          <ChatIcon sx={{ fontSize: isMobile ? 32 : 24, color: 'white' }} />
        </Fab>
      </Zoom>

      <Fade in={isOpen}>
        <Paper
          elevation={3}
          sx={{
            position: 'fixed',
            bottom: 0,
            right: isMobile ? 0 : 16,
            top: isMobile ? 0 : 'auto',
            left: isMobile ? 0 : 'auto',
            width: isMobile ? '100vw' : 350,
            height: isMobile ? '100vh' : 500,
            display: 'flex',
            flexDirection: 'column',
            zIndex: 1300,
            borderRadius: isMobile ? 0 : 2,
            transform: 'translateY(0)',
            transition: 'transform 0.3s ease-in-out',
            '&:hover': {
              transform: 'translateY(-4px)',
            },
            margin: 0,
            padding: 0,
          }}
        >
          {/* Chat Header */}
          <Box
            sx={{
              p: 2,
              bgcolor: 'primary.main',
              color: 'white',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              borderTopLeftRadius: isMobile ? 0 : 8,
              borderTopRightRadius: isMobile ? 0 : 8,
              position: 'relative',
            }}
          >
            <Typography variant="h6">Zero Hunger Assistant</Typography>
            <IconButton
              size="large"
              onClick={() => setIsOpen(false)}
              sx={{ 
                color: 'white',
                '&:hover': {
                  backgroundColor: 'rgba(255, 255, 255, 0.2)',
                },
                width: isMobile ? 48 : 40,
                height: isMobile ? 48 : 40,
              }}
            >
              <CloseIcon sx={{ fontSize: isMobile ? 32 : 24 }} />
            </IconButton>
          </Box>

          {/* Messages */}
          <Box
            sx={{
              flex: 1,
              overflow: 'auto',
              p: 2,
              display: 'flex',
              flexDirection: 'column',
              gap: 2,
              bgcolor: theme.palette.mode === 'dark' ? 'background.default' : 'grey.50',
            }}
          >
            {messages.map((message, index) => (
              <Box
                key={index}
                sx={{
                  display: 'flex',
                  justifyContent: message.sender === 'user' ? 'flex-end' : 'flex-start',
                  animation: 'fadeIn 0.3s ease-in-out',
                }}
              >
                <Paper
                  elevation={1}
                  sx={{
                    p: 2,
                    maxWidth: '80%',
                    bgcolor: message.sender === 'user' 
                      ? theme.palette.mode === 'dark' ? 'primary.dark' : 'primary.light'
                      : theme.palette.mode === 'dark' ? 'grey.800' : 'grey.100',
                    color: message.sender === 'user' 
                      ? 'white' 
                      : theme.palette.mode === 'dark' ? 'grey.100' : 'text.primary',
                    borderRadius: 2,
                    transform: 'translateY(0)',
                    transition: 'transform 0.2s ease-in-out',
                    '&:hover': {
                      transform: 'translateY(-2px)',
                    },
                  }}
                >
                  <Typography variant="body1">{message.text}</Typography>
                  <Typography
                    variant="caption"
                    sx={{
                      display: 'block',
                      mt: 1,
                      opacity: 0.7,
                      color: message.sender === 'user' 
                        ? 'white' 
                        : theme.palette.mode === 'dark' ? 'grey.400' : 'text.secondary',
                    }}
                  >
                    {message.timestamp.toLocaleTimeString()}
                  </Typography>
                </Paper>
              </Box>
            ))}
            {loading && (
              <Box sx={{ display: 'flex', justifyContent: 'flex-start' }}>
                <Paper
                  elevation={1}
                  sx={{
                    p: 2,
                    maxWidth: '80%',
                    bgcolor: theme.palette.mode === 'dark' ? 'grey.800' : 'grey.100',
                    borderRadius: 2,
                  }}
                >
                  <Skeleton variant="text" width={200} />
                  <Skeleton variant="text" width={150} />
                </Paper>
              </Box>
            )}
            <div ref={messagesEndRef} />
          </Box>

          {/* Input */}
          <Box 
            sx={{ 
              p: 2, 
              borderTop: 1, 
              borderColor: 'divider',
              bgcolor: theme.palette.mode === 'dark' ? 'background.paper' : 'background.paper',
              borderBottomLeftRadius: isMobile ? 0 : 8,
              borderBottomRightRadius: isMobile ? 0 : 8,
            }}
          >
            <Box sx={{ display: 'flex', gap: 1 }}>
              <TextField
                fullWidth
                multiline
                maxRows={4}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Type your message..."
                disabled={loading}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    borderRadius: 2,
                    bgcolor: theme.palette.mode === 'dark' ? 'grey.800' : 'background.paper',
                    '&:hover': {
                      '& .MuiOutlinedInput-notchedOutline': {
                        borderColor: 'primary.main',
                      },
                    },
                    '&.Mui-focused': {
                      '& .MuiOutlinedInput-notchedOutline': {
                        borderColor: 'primary.main',
                      },
                    },
                  },
                  '& .MuiInputBase-input': {
                    color: theme.palette.mode === 'dark' ? 'grey.100' : 'text.primary',
                  },
                  '& .MuiInputBase-input::placeholder': {
                    color: theme.palette.mode === 'dark' ? 'grey.500' : 'text.secondary',
                  },
                }}
              />
              <IconButton
                color="primary"
                onClick={handleSend}
                disabled={loading || !input.trim()}
                sx={{
                  '&:hover': {
                    backgroundColor: 'primary.light',
                    color: 'white',
                  },
                }}
              >
                <SendIcon />
              </IconButton>
            </Box>
          </Box>
        </Paper>
      </Fade>
    </>
  );
};

export default Chatbot; 