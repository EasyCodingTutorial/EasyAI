"use client";
import React, { useState, useEffect, useRef } from 'react';
import styles from './ChatRoom.module.css';
import { GoogleGenerativeAI } from "@google/generative-ai";
import { ChatInput } from './ChatInput';
import Markdown from 'react-markdown';

interface ChatMessage {
    sender: 'user' | 'ai';
    text: string;
}

// Update the GenerativeModel interface to match the actual return type
interface GenerativeModel {
    generateContent: (text: string) => Promise<{ response: { text: () => string } }>;
}

export const ChatRoom = () => {
    const [chats, setChats] = useState<ChatMessage[]>([]);
    const [loading, setLoading] = useState<boolean>(false);
    const [model, setModel] = useState<GenerativeModel | null>(null);

    const chatContainerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const apiKey = process.env.NEXT_PUBLIC_GEMINI_API ?? '';
        const aiInstance = new GoogleGenerativeAI(apiKey);

        // Set the model
        setModel(aiInstance.getGenerativeModel({ model: "gemini-1.5-flash" }));
    }, []);

    const handlePromptSubmit = async (text: string) => {
        if (!text.trim()) return;

        setChats((prevChat) => [...prevChat, { sender: 'user', text }]);
        setLoading(true);

        try {
            if (model) {
                const result = await model.generateContent(text);
                const responseText = result.response.text(); // Call the function to get the string

                displayTextGradually(responseText);
            }
        } catch (error) {
            console.log('Error In Generating Content', error);
            setChats((prevChat) => [
                ...prevChat, { sender: 'ai', text: 'An Error Occurred while generating.' }
            ]);
        } finally {
            setLoading(false);
        }
    };

    const displayTextGradually = (fullText: string) => {
        const words = fullText.split(' ');
        let currentText = '';
        const timeouts: NodeJS.Timeout[] = [];

        words.forEach((word, index) => {
            const timeout = setTimeout(() => {
                currentText += (index === 0 ? '' : ' ') + word;

                setChats((prevChat) => {
                    const lastChat = prevChat[prevChat.length - 1];

                    if (lastChat?.sender === 'ai') {
                        // Update Last AI Message Instead of Adding a new one
                        return [
                            ...prevChat.slice(0, -1),
                            { sender: 'ai', text: currentText }
                        ];
                    } else {
                        return [
                            ...prevChat, { sender: 'ai', text: currentText }
                        ];
                    }
                });
            }, index * 50); // 50 MS per word

            timeouts.push(timeout);
        });

        // Cleanup function to clear timeouts
        return () => {
            timeouts.forEach(timeout => clearTimeout(timeout));
        };
    };

    useEffect(() => {
        if (chatContainerRef.current) {
            chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
        }
    }, [chats, loading]);

    return (
        <div className={styles.ChatRoom}>
            <div className={styles.ChatHistory} ref={chatContainerRef}>
                {
                    chats.map((chat, index) => (
                        <div
                            key={index}
                            className={chat.sender === 'user' ? styles.UserMESSAGE : styles.AIMESSAGE}
                        >
                            <strong>
                                {chat.sender === 'user' ? 'You ' : 'EASY AI '}
                            </strong>
                            <Markdown>
                                {chat.text}
                            </Markdown>
                        </div>
                    ))
                }
            </div>

            {/* When AI IS GENERATING MESSAGE THEN WE ARE SHOWING THIS TEXT */}
            {
                loading && <div className={styles.Thinking}>Easy AI is Thinking...</div>
            }

            <ChatInput
                onSubmit={handlePromptSubmit}
            />
        </div>
    );
};