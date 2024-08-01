import mongoose, { Schema, Document, Model } from 'mongoose';

enum UserRole {
  USER = 'user',
  SYSTEM = 'system',
}

// Define the IMessage interface
export interface IMessage extends Document {
  chatId: mongoose.Types.ObjectId; 
  content: string;
  createdAt: Date;
  role: UserRole;
}


const MessageSchema: Schema<IMessage> = new Schema({
  chatId: { type: mongoose.Schema.Types.ObjectId, ref: 'chat', required: true },
  content: { type: String, required: true },
  createdAt: { type: Date, default: Date.now, required: true },
  role: { type: String, enum: Object.values(UserRole), required: true },
});

MessageSchema.index({ chatId: 1 })
const MessageModel: Model<IMessage> =
  mongoose.models.Message || mongoose.model<IMessage>('Message', MessageSchema);

export default MessageModel;
