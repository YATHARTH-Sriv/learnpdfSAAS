// 'use client'

// import { Button } from '@/components/ui/button'
// import { Input } from '@/components/ui/input'
// import { useChat } from 'ai/react'
// import { Send } from 'lucide-react'
// import { useEffect, useRef, useState } from 'react'
// import { Message } from 'ai'
// import MessageList from './Messagelist'

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
//     return [];
//   }
// }

// interface ChatComponentProps {
//   chatId: string;
// }

// const ChatComponent: React.FC<ChatComponentProps> = ({ chatId }) => {
//   const messageContainer = useRef<HTMLDivElement>(null)
//   const [initialMessages, setInitialMessages] = useState<Message[]>([])
//   const [isLoading, setIsLoading] = useState(true)

//   useEffect(() => {
//     setIsLoading(true);
//     getInitialMessages(chatId)
//       .then((messages) => {
//         setInitialMessages(messages)
//       })
//       .catch((error) => {
//         console.error("Failed to fetch initial messages:", error)
//       })
//       .finally(() => {
//         setIsLoading(false)
//       })
//   }, [chatId])

//   const { input, handleInputChange, handleSubmit, messages } = useChat({
//     api: '/api/chat',
//     body: { chatId },
//     initialMessages,
//   })

//   useEffect(() => {
//     const container = messageContainer.current;
//     if (container) {
//       const shouldScroll = container.scrollTop + container.clientHeight === container.scrollHeight;
//       if (shouldScroll) {
//         container.scrollTo({
//           top: container.scrollHeight,
//           behavior: 'smooth',
//         })
//       }
//     }
//   }, [messages])
//   console.log(messages)
//   return (
//     <div className="relative h-screen overflow-hidden flex flex-col">
//       <div className="sticky top-0 inset-x-0 p-2 bg-white h-fit text-xl font-bold border-b">
//         Chat
//       </div>
      
//       <div className="flex-grow overflow-auto" ref={messageContainer}>
        
//         <MessageList messages={messages} isLoading={isLoading} />
//       </div>

//       <form
//         onSubmit={handleSubmit}
//         className="sticky bottom-0 inset-x-0 p-2 bg-white bg-gradient-to-t from-white"
//       >
//         <div className="flex">
//           <Input
//             value={input}
//             onChange={handleInputChange}
//             placeholder="Ask any question..."
//             className="w-full"
//             aria-label="Chat input"
//           />
//           <Button type="submit" className="bg-blue-600 ml-2" aria-label="Send message">
//             <Send className="h-4 w-4" />
//           </Button>
//         </div>
//       </form>
//     </div>
//   )
// }

// export default ChatComponent

'use client'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { useChat } from 'ai/react'
import { Send } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import { Message } from 'ai'
import MessageList from './Messagelist'

// ... (keep your getInitialMessages function)
async function getInitialMessages(chatId: string): Promise<Message[]> {
    try {
      const response = await fetch(`/api/get-messages`, {
        method: 'POST',
        body: JSON.stringify({ chatId }),
        headers: { 'Content-Type': 'application/json' },
      });
      if (!response.ok) {
        throw new Error('Failed to fetch messages');
      }
      return await response.json();
    } catch (error) {
      console.error("Error fetching initial messages:", error);
      return [];
    }
  }

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
  //     const data = await response.json();
  //     console.log('Fetched initial messages:', data);
  //     return data.data;
  //   } catch (error) {
  //     console.error('Error fetching initial messages:', error);
  //     return [];
  //   }
  // }
  

  // async function getInitialMessages(chatId: string): Promise<Message[]> {
  //   try {
  //     const response = await fetch(`${process.env.NEXT_PUBLIC_URL}/api/get-messages`, {
  //       method: 'POST',
  //       body: JSON.stringify({ chatId }),
  //       headers: { 'Content-Type': 'application/json' },
  //     });
  //     if (!response.ok) {
  //       throw new Error('Failed to fetch messages');
  //     }
  //     const data = await response.json();
  //     return Array.isArray(data) ? data : [];
  //   } catch (error) {
  //     console.error("Error fetching initial messages:", error);
  //     return [];
  //   }
  // }



interface ChatComponentProps {
  chatId: string;
}

const ChatComponent: React.FC<ChatComponentProps> = ({ chatId }) => {
  const messageContainer = useRef<HTMLDivElement>(null)
  // const [initialMessages, setInitialMessages] = useState<Message[]>([])
  const [isLoadingInitial, setIsLoadingInitial] = useState(true)

  // useEffect(() => {
  //   setIsLoadingInitial(true);
  //   getInitialMessages(chatId)
  //     .then((messages) => {
  //       setInitialMessages(messages)
  //     })
  //     .catch((error) => {
  //       console.error("Failed to fetch initial messages:", error)
  //     })
  //     .finally(() => {
  //       setIsLoadingInitial(false)
  //     })
  // }, [chatId])

  const [initialMessages, setInitialMessages] = useState<Message[]>([]);

  useEffect(() => {
  setIsLoadingInitial(true);
  getInitialMessages(chatId)
    .then((messages) => {
      setInitialMessages(Array.isArray(messages) ? messages : []);
    })
    .catch((error) => {
      console.error("Failed to fetch initial messages:", error);
      setInitialMessages([]);
    })
    .finally(() => {
      setIsLoadingInitial(false);
    });
}, [chatId])




  // const { input, handleInputChange, handleSubmit, messages, isLoading: isChatLoading } = useChat({
  //   api: '/api/chat',
  //   body: { chatId },
  //   initialMessages,
  // })

  const {
    input,
    handleInputChange,
    handleSubmit,
    messages,
    isLoading: isChatLoading,
  } = useChat({
    api: '/api/chat',
    body: { chatId },
    initialMessages,
    onError: (error) => {
      console.error("Chat error:", error);
    },
  });
  
  // Add these console logs
  console.log('Initial messages:', initialMessages);
  console.log('Current messages:', messages);

  useEffect(() => {
    const container = messageContainer.current;
    if (container) {
      container.scrollTo({
        top: container.scrollHeight,
        behavior: 'smooth',
      })
    }
  }, [messages])

  return (
    <div className="relative h-screen overflow-hidden flex flex-col">
      <div className="sticky top-0 inset-x-0 p-2 bg-white h-fit text-xl font-bold border-b">
        Chat
      </div>

      <div className="flex-grow overflow-auto" ref={messageContainer}>
        <MessageList 
          messages={messages} 
          isLoading={isLoadingInitial || (isChatLoading && messages.length === 0)}
        />
      </div>

      <form
        onSubmit={handleSubmit}
        className="sticky bottom-0 inset-x-0 p-2 bg-white bg-gradient-to-t from-white"
      >
        <div className="flex">
          <Input
            value={input}
            onChange={handleInputChange}
            placeholder="Ask any question..."
            className="w-full"
            aria-label="Chat input"
          />
          <Button type="submit" className="bg-blue-600 ml-2" aria-label="Send message">
            <Send className="h-4 w-4" />
          </Button>
        </div>
      </form>
    </div>
  )
}

export default ChatComponent