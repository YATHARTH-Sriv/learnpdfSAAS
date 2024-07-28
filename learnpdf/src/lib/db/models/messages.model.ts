
import mongoose, { Schema, Document } from 'mongoose';

interface Messages extends Document {
  chatId: mongoose.Schema.Types.ObjectId;
  content: string;
  createdAt: Date;
  role: string;
}

const MessageSchema: Schema<Messages>=new Schema(
  {
    chatId: { type: mongoose.Schema.Types.ObjectId, ref: 'Chat', required: true },
    content: { type: String, required: true },
    createdAt: { type: Date, default: Date.now },
    role: { type: String, required: true, enum: ['user', 'gpt'] }, 
  },
  { timestamps: true }
);

// Export the Mongoose model
const MessageModel=(mongoose.models.Message as mongoose.Model<Messages> || mongoose.model<Messages>('Message', MessageSchema))
export default MessageModel;
