import {
  ChatCompletionRequestMessageRoleEnum,
  Configuration,
  OpenAIApi,
} from "openai-edge";
import { Message } from "ai";
import { getContext } from "@/lib/context";
import { NextRequest, NextResponse } from "next/server";
import ChatModel from "@/lib/db/models/chat.model";
import MessageModel from "@/lib/db/models/messages.model";
import dbconnect from "@/lib/db/dbconnect";


const config = new Configuration({
  apiKey: process.env.OPENAI_API_KEY,
});
const openai = new OpenAIApi(config);

export async function POST(request: NextRequest) {
  await dbconnect();
  try {
    const {
      messages,
      chatId,
    }: {
      messages: Message[];
      chatId: string;
    } = await request.json();

    let fileKey: string;
    try {
      fileKey = await getFileKeyByChatId(chatId);
    } catch (error) {
      return NextResponse.json({ error: "Chat not found" }, { status: 404 });
    }

    const lastMessage = messages[messages.length - 1];
    const context = await getContext(lastMessage.content, fileKey);

    const prompt = {
      role: "system" as ChatCompletionRequestMessageRoleEnum,
      content: `AI assistant is a brand new, powerful, human-like artificial intelligence.
        The traits of AI include expert knowledge, helpfulness, cleverness, and articulateness.
        AI is a well-behaved and well-mannered individual.
        AI is always friendly, kind, and inspiring, and he is eager to provide vivid and thoughtful responses to the user.
        AI has the sum of all knowledge in their brain, and is able to accurately answer nearly any question about any topic in conversation.
        START CONTEXT BLOCK
        ${context}
        END OF CONTEXT BLOCK
        AI assistant will take into account any CONTEXT BLOCK that is provided in a conversation.
        If the context does not provide the answer to question, the AI assistant will say, "I'm sorry, but I don't know the answer to that question".
        AI assistant will not apologize for previous responses, but instead will indicate new information was gained.
        AI assistant will not invent anything that is not drawn directly from the context.`,
    };

    const response = await openai.createChatCompletion({
      model: "gpt-3.5-turbo",
      messages: [
        prompt,
        ...messages.filter((msg) => msg.role === "user").map((msg) => ({
          role: msg.role as ChatCompletionRequestMessageRoleEnum,
          content: msg.content,
        })),
      ],
      stream: true,
    });
    console.log("Response:", response);

    // const stream = new ReadableStream({
    //   async start(controller) {
    //     const encoder = new TextEncoder();

    //     await MessageModel.create({
    //       chatId,
    //       content: lastMessage.content,
    //       role: "user",
    //     });

    //     let accumulatedResponse = "";

    //     const reader = response.body?.getReader();
    //     if (!reader) {
    //       controller.close();
    //       return;
    //     }

    //     while (true) {
    //       const { done, value } = await reader.read();
    //       if (done) break;

    //       const chunk = new TextDecoder().decode(value);
    //       const lines = chunk.split("\n").filter((line) => line.trim() !== "");
    //       for (const line of lines) {
    //         const message = line.replace(/^data: /, "");
    //         if (message === "[DONE]") {
    //           break;
    //         }
    //         try {
    //           const parsed = JSON.parse(message);
    //           const content = parsed.choices[0].delta.content || "";
    //           accumulatedResponse += content;
    //           controller.enqueue(encoder.encode(content));
    //         } catch (error) {
    //           console.error("Error parsing stream:", error);
    //         }
    //       }
    //     }

    //     await MessageModel.create({
    //       chatId,
    //       content: accumulatedResponse,
    //       role: "system",
    //     });

    //     controller.close();
    //   },
    // });
    const stream = new ReadableStream({
      async start(controller) {
        const encoder = new TextEncoder();
        await MessageModel.create({
          chatId,
          content: lastMessage.content,
          role: "user",
        });
    
        let accumulatedResponse = "";
    
        const reader = response.body?.getReader();
        if (!reader) {
          controller.close();
          return;
        }
    
        while (true) {
          const { done, value } = await reader.read();
          if (done) {
            controller.enqueue(encoder.encode('data: [DONE]\n\n'));
            break;
          }
    
          const chunk = new TextDecoder().decode(value);
          const lines = chunk.split('\n').filter(line => line.trim() !== '');
          for (const line of lines) {
            const message = line.replace(/^data: /, '');
            if (message === '[DONE]') {
              controller.enqueue(encoder.encode('data: [DONE]\n\n'));
              break;
            }
            try {
              const parsed = JSON.parse(message);
              const content = parsed.choices[0].delta.content || '';
              if (content) {
                accumulatedResponse += content;
                controller.enqueue(encoder.encode(`data: ${JSON.stringify({ content })}\n\n`));
              }
            } catch (error) {
              console.error('Error parsing stream:', error);
            }
          }
        }
    
        await MessageModel.create({
          chatId,
          content: accumulatedResponse,
          role: "system",
        });
    
        controller.close();
      },
    });
    
    // return new Response(stream, {
    //   headers: {
    //     'Content-Type': 'text/event-stream',
    //     'Cache-Control': 'no-cache',
    //     'Connection': 'keep-alive',
    //   },
    // });
    return new Response(stream, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
      },
    });
  } catch (error: any) {
    console.error("Error in chat API:", error);
    return NextResponse.json(
      { error: "An error occurred", details: error.message },
      { status: 500 }
    );
  }
}

async function getFileKeyByChatId(chatId: string): Promise<string> {
  const chat = await ChatModel.findById(chatId);
  if (!chat) {
    throw new Error("Chat not found");
  }
  return chat.fileKey;
}
