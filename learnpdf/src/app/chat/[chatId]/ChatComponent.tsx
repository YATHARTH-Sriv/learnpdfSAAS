

// 'use client'

// import { Button } from '@/components/ui/button'
// import { Input } from '@/components/ui/input'
// import { useChat } from 'ai/react'
// import { Send } from 'lucide-react'
// import { useEffect, useRef, useState } from 'react'
// import { Message } from 'ai'
// import toast from 'react-hot-toast'

// async function getInitialMessages(chatId: string): Promise<Message[]> {
//   try {
//     const response = await fetch(`/api/get-messages`, {
//       method: 'POST',
//       body: JSON.stringify({ chatId }),
//       headers: { 'Content-Type': 'application/json' },
//     });
//     if (!response.ok) {
//       throw new Error('Failed to fetch messages');
//     }
//     return await response.json();
//   } catch (error) {
//     console.error("Error fetching initial messages:", error);
//     throw error;
//   }
// }

// interface ChatComponentProps {
//   chatId: string;
// }

// const ChatComponent: React.FC<ChatComponentProps> = ({ chatId }) => {
//   const messageContainer = useRef<HTMLDivElement>(null)
//   const [isLoadingInitial, setIsLoadingInitial] = useState(true)
//   const [initialMessages, setInitialMessages] = useState<Message[]>([]);
//   const [isLoading, setIsLoading] = useState(false);

//   useEffect(() => {
//     setIsLoadingInitial(true);
//     getInitialMessages(chatId)
//       .then((fetchedMessages) => {
//         if (Array.isArray(fetchedMessages)) {
//           setInitialMessages(fetchedMessages);
//         } else {
//           console.error("Fetched messages is not an array:", fetchedMessages);
//           setInitialMessages([]);
//         }
//       })
//       .catch((error) => {
//         console.error("Failed to fetch initial messages:", error);
//         toast.error("Failed to load chat history. Please try refreshing the page.");
//         setInitialMessages([]);
//       })
//       .finally(() => {
//         setIsLoadingInitial(false);
//       });
//   }, [chatId]);

//   const { messages, input, handleInputChange, handleSubmit, setMessages } = useChat({
//     streamProtocol: 'text',
//     api: '/api/chat',
//     body: { chatId },
//     initialMessages,
//     onResponse(response) {
//       if (response.status === 401) {
//         toast.error('Unauthorized');
//       }
//     },
//     onFinish() {
//       setIsLoading(false);
//       console.log("chatfinished",messages)
//     },
//     onError(error) {
//       console.error('Chat error:', error);
//       toast.error('Error in chat. Please try again.');
//       setIsLoading(false);
//     },
//   });

//   useEffect(() => {
//     if (!isLoadingInitial && initialMessages.length > 0) {
//       setMessages([...initialMessages, ...messages]);
//     }
//   }, [isLoadingInitial, initialMessages, setMessages]);

//   useEffect(() => {
//     const container = messageContainer.current;
//     if (container) {
//       container.scrollTo({
//         top: container.scrollHeight,
//         behavior: 'smooth',
//       });
//     }
//   }, [messages, isLoading]);

//   const handleFormSubmit = async (e: React.FormEvent) => {
//     e.preventDefault();
//     setIsLoading(true);
//     try {
//       await handleSubmit(e);
//     } catch (error) {
//       console.error('Error submitting message:', error);
//       toast.error('Failed to send message. Please try again.');
//     }
//   };

//   return (
//     <div className="relative h-screen overflow-hidden flex flex-col">
//       <div className="sticky top-0 inset-x-0 p-2 bg-white h-fit text-xl font-bold border-b">
//         Chat
//       </div>

//       <div className="flex-grow overflow-auto" ref={messageContainer}>
//         {(isLoadingInitial ? initialMessages : messages).map((message) => (
//           <div key={message.id} className={message.role === 'user' ? 'user-message' : 'ai-message'}>
//             {message.content}
//           </div>
//         ))}
//         {isLoading && <div className="ai-message">AI is thinking...</div>}
//       </div>

//       <form
//         onSubmit={handleFormSubmit}
//         className="sticky bottom-0 inset-x-0 p-2 bg-white bg-gradient-to-t from-white"
//       >
//         <div className="flex">
//           <Input
//             value={input}
//             onChange={handleInputChange}
//             placeholder="Ask any question..."
//             className="w-full"
//             aria-label="Chat input"
//             disabled={isLoading}
//           />
//           <Button type="submit" className="bg-blue-600 ml-2" aria-label="Send message" disabled={isLoading}>
//             {isLoading ? <span>Sending...</span> : <Send className="h-4 w-4" />}
//           </Button>
//         </div>
//       </form>
//     </div>
//   )
// }

// export default ChatComponent

'use client';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Send } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';

interface Message {
  id: string;
  content: string;
  role: 'user' | 'system';
}

async function getInitialMessages(chatId: string): Promise<Message[]> {
  try {
    const response = await axios.post('/api/get-messages', { chatId }, {
      headers: { 'Content-Type': 'application/json' },
    });
    return response.data || [];
  } catch (error) {
    console.error('Error fetching initial messages:', error);
    throw error;
  }
}

interface ChatComponentProps {
  chatId: string;
}

const ChatComponent: React.FC<ChatComponentProps> = ({ chatId }) => {
  const messageContainer = useRef<HTMLDivElement>(null);
  const [initialMessages, setInitialMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    getInitialMessages(chatId)
      .then((fetchedMessages) => {
        setInitialMessages(fetchedMessages);
        setMessages(fetchedMessages);
      })
      .catch((error) => {
        console.error('Failed to fetch initial messages:', error);
        toast.error('Failed to load chat history. Please try refreshing the page.');
      });
  }, [chatId]);

  useEffect(() => {
    const container = messageContainer.current;
    if (container) {
      container.scrollTo({
        top: container.scrollHeight,
        behavior: 'smooth',
      });
    }
  }, [messages]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;

    setIsLoading(true);

    try {
      const userMessage: Message = {
        id: Date.now().toString(),
        content: input,
        role: 'user',
      };
      setMessages((prevMessages) => [...prevMessages, userMessage]);

      const response = await axios.post("/api/chat", { chatId, message: input }, {
        headers: { 'Content-Type': 'application/json' },
      });

      const aiMessage: Message = {
        id: Date.now().toString() + '-ai',
        content: response.data.content,
        role: 'system',
      };
      setMessages((prevMessages) => [...prevMessages, aiMessage]);
      setInput('');
    } catch (error) {
      console.error('Error submitting message:', error);
      toast.error('Failed to send message. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="relative h-screen overflow-hidden flex flex-col">
      <div className="sticky top-0 inset-x-0 p-2 bg-white h-fit text-xl font-bold border-b">
        Chat
      </div>

      <div className="flex-grow overflow-auto" ref={messageContainer}>
        {messages.map((message) => (
          <div key={message.id} className={message.role === 'user' ? 'user-message' : 'ai-message'}>
            {message.content}
          </div>
        ))}
        {isLoading && <div className="ai-message">AI is thinking...</div>}
      </div>

      <form
        onSubmit={handleSubmit}
        className="sticky bottom-0 inset-x-0 p-2 bg-white bg-gradient-to-t from-white"
      >
        <div className="flex">
          <Input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask any question..."
            className="w-full"
            aria-label="Chat input"
            disabled={isLoading}
          />
          <Button type="submit" className="bg-blue-600 ml-2" aria-label="Send message" disabled={isLoading}>
            {isLoading ? <span>Sending...</span> : <Send className="h-4 w-4" />}
          </Button>
        </div>
      </form>
    </div>
  );
};

export default ChatComponent;

  