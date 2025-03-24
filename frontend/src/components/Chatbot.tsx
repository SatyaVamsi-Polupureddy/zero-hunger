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

interface ImportMetaEnv {
  readonly VITE_GEMINI_API_KEY: string;
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
      const systemContext = `You are an AI-powered assistant for a food donation platform "zero hunger" that accepts food donations and also accept food requests by supplying the food from donated to requested persons. Your goal is to guide users in donating food, locating nearby donation centers, and analyzing food trends. You provide polite, clear, and understandable responses to general public in 2-3 lines strictly. You also analyze donation trends using Vertex AI. Greet the user at the start of converstation and thank user for reaching out to us(only 1 time) and motivate them to donate food for the need.

🎯 Your key responsibilities include:
- Helping donors understand what food they can donate and where
- Matching donors with verified recipients, food banks, and shelters
- Providing real-time updates on donation needs in different locations
- Analyzing food donation trends using Vertex AI and suggesting improvements
- Guiding volunteers on how they can contribute to reducing food waste
- Answering FAQs about food donation, safety regulations, and storage tips

🏆 Response Style & Personality:
- Always be empathetic and supportive to encourage food donations
- Give concise yet informative responses with action-oriented suggestions
- When asked for data insights, use structured responses with bullet points or summaries
- If you don't know something, politely admit it and offer alternative resources
- Prioritize locality-based recommendations

⚠️ Limitations & Ethics:
- Do not provide medical or health-related advice
- Do not guarantee food safety or endorse specific organizations
- Do not share personal data of donors or recipients`;

      const response = await fetch('https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${import.meta.env.VITE_GEMINI_API_KEY}`,
        },
        body: JSON.stringify({
          contents: [{
            parts: [{
              text: `${systemContext}\n\nUser: ${input}\nAssistant:`
            }]
          }],
          generationConfig: {
            temperature: 0.9,
            topK: 40,
            topP: 0.95,
            maxOutputTokens: 1024,
          },
          safetySettings: [
            {
              category: "HARM_CATEGORY_HARASSMENT",
              threshold: "BLOCK_MEDIUM_AND_ABOVE"
            },
            {
              category: "HARM_CATEGORY_HATE_SPEECH",
              threshold: "BLOCK_MEDIUM_AND_ABOVE"
            },
            {
              category: "HARM_CATEGORY_SEXUALLY_EXPLICIT",
              threshold: "BLOCK_MEDIUM_AND_ABOVE"
            },
            {
              category: "HARM_CATEGORY_DANGEROUS_CONTENT",
              threshold: "BLOCK_MEDIUM_AND_ABOVE"
            }
          ]
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to get response from AI');
      }

      const data = await response.json();
      
      if (!data.candidates || !data.candidates[0]?.content?.parts?.[0]?.text) {
        throw new Error('Invalid response format from AI');
      }

      const botResponse: Message = {
        text: data.candidates[0].content.parts[0].text.trim(),
        sender: 'bot',
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, botResponse]);
    } catch (error) {
      console.error('Error getting bot response:', error);
      const errorMessage: Message = {
        text: 'I apologize, but I encountered an error. Please try asking your question again, or contact support if the problem persists.',
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
            '&:hover': {
              transform: 'scale(1.1)',
            },
          }}
        >
          <ChatIcon />
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
            width: isMobile ? '100%' : 350,
            height: isMobile ? '100%' : 500,
            display: 'flex',
            flexDirection: 'column',
            zIndex: 1000,
            borderRadius: isMobile ? 0 : 2,
            transform: 'translateY(0)',
            transition: 'transform 0.3s ease-in-out',
            '&:hover': {
              transform: 'translateY(-4px)',
            },
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
            }}
          >
            <Typography variant="h6">Zero Hunger Assistant</Typography>
            <IconButton
              size="small"
              onClick={() => setIsOpen(false)}
              sx={{ 
                color: 'white',
                '&:hover': {
                  backgroundColor: 'rgba(255, 255, 255, 0.1)',
                },
              }}
            >
              <CloseIcon />
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
              bgcolor: theme.palette.background.default,
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
                    bgcolor: message.sender === 'user' ? 'primary.light' : 'grey.100',
                    color: message.sender === 'user' ? 'white' : 'text.primary',
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
                    bgcolor: 'grey.100',
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
              bgcolor: theme.palette.background.paper,
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
                    '&:hover': {
                      '& .MuiOutlinedInput-notchedOutline': {
                        borderColor: 'primary.main',
                      },
                    },
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