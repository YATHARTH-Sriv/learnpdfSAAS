import ChatSideBar from "@/app/chat/[chatId]/ChatSidebar";
import dbconnect from "@/lib/db/dbconnect";
import ChatModel, { Chat } from "@/lib/db/models/chat.model";
import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import React from "react";
import PDFViewer from "./Pdfviewer";
import ChatComponent from "./ChatComponent";

type Props = {
  params: {
    chatId: string;
  };
};

const ChatPage = async ({ params: { chatId } }: Props) => {
  const { userId } = await auth()
  if (!userId) return redirect(`${process.env.NEXT_PUBLIC_API_BASE_URL}/sign-in`)

  await dbconnect()
  const _chats: Chat[] = await ChatModel.find({ userId: userId });
  
  if (!_chats || _chats.length === 0) {
    console.log("No chats found for user:", userId);
    return redirect(`${process.env.NEXT_PUBLIC_API_BASE_URL}`);
  }

  const currentChat: Chat | undefined = _chats.find((chat) => (chat._id as string).toString() === chatId);
  
  if (!currentChat) {
    console.log("Chat not found:", chatId);
    return redirect('/');
  }

  return (
    <div className="flex max-h-screen overflow-scroll">
      <div className="flex w-full max-h-screen overflow-scroll">
        <div className="flex-[1] max-w-xs">
          <ChatSideBar chats={_chats} chatId={chatId} />
        </div>

        <div className="max-h-screen overflow-scroll flex-[5]">
          <PDFViewer pdfUrl={currentChat.pdfUrl || ''} />
        </div>

        <div className="flex-[3] border-l-4 border-l-slate-200">
          <ChatComponent chatId={chatId} />
        </div>
      </div>
    </div>
  )
}

export default ChatPage;