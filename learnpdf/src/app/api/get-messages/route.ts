// // pages/api/get-messages.ts
// import { NextResponse } from 'next/server';
// import dbconnect from '@/lib/db/dbconnect';
// import MessageModel from '@/lib/db/models/messages.model';


// export const POST = async (req: Request) => {
//   try {
//     await dbconnect();

//     const body = await req.json();
//     const chatId = body.chatId;

//     // Input validation
//     if (!chatId) {
//       return NextResponse.json({ error: 'chatId is required' }, { status: 400 });
//     }

//     // Use .lean() to get plain objects
//     // const messages = await MessageModel.findById({ chatId })
//     const messages = await MessageModel.findById({ chatId:  chatId }).sort({ createdAt: 1 });
//     console.log(messages)

//     return NextResponse.json({ success: true, data: messages });
//   } catch (error) {
//     console.error('Error fetching messages:', error);
//     let errorMessage = 'Failed to fetch messages';
//     if (error instanceof Error) {
//       errorMessage = error.message;
//     }
//     return NextResponse.json({ success: false, error: errorMessage }, { status: 500 });
//   }
// };

// pages/api/get-messages.ts
// import { NextResponse } from 'next/server';
// import dbconnect from '@/lib/db/dbconnect';
// import MessageModel from '@/lib/db/models/messages.model';

// export const POST = async (req: Request) => {
//   try {
//     await dbconnect();

//     const body = await req.json();
//     const chatId = body.chatId;

//     // Input validation
//     if (!chatId) {
//       return NextResponse.json({ error: 'chatId is required' }, { status: 400 });
//     }

//     // Find messages by chatId, not by _id
//     const messages = await MessageModel.find({ chatId: chatId })
//       .sort({ createdAt: 1 })
//       .lean(); // Use lean() for better performance

//     console.log('Retrieved messages:', messages);

//     return NextResponse.json({ success: true, data: messages });
//   } catch (error) {
//     console.error('Error fetching messages:', error);
//     let errorMessage = 'Failed to fetch messages';
//     if (error instanceof Error) {
//       errorMessage = error.message;
//     }
//     return NextResponse.json({ success: false, error: errorMessage }, { status: 500 });
//   }
// };

// import { db } from '@/lib/db'
// import { messages } from '@/lib/db/schema'
// import { eq } from 'drizzle-orm'
import MessageModel from '@/lib/db/models/messages.model'
import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  const { chatId }: { chatId: number } = await request.json()
  // const _messages = await db
  //   .select()
  //   .from(messages)
  //   .where(eq(messages.chatId, chatId))
  const _messages = await MessageModel.findById({ chatId: chatId }).sort({ createdAt: 1 }).lean()

  return NextResponse.json(_messages)
}