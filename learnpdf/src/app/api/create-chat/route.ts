
import ChatModel from "@/lib/db/models/chat.model";
import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { loadpdfIntoPinecone } from "@/app/helpers/Pincone";

// /api/create-chat
export async function POST(req: Request, res: Response) {
  const { userId } = auth();
  if (!userId) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }
  try {
    const body = await req.json();
    const { file_key, file_name, file_url } = body;
    console.log(file_key, file_name,file_url);
    const newchat= new ChatModel({
      fileKey: file_key,
      pdfName: file_name,
      pdfUrl: file_url,
      userId,
    });
    const savedChat = await newchat.save();
    await loadpdfIntoPinecone(file_url,file_key);

    return NextResponse.json(
      {
        chat_id: newchat._id,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "internal server error" },
      { status: 500 }
    );
  }
}