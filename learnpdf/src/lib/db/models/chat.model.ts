import mongoose ,{Schema,Document, InferSchemaType} from "mongoose";

export interface Chat extends Document {
    pdfName: string;
    pdfUrl: string;
    createdAt: Date;
    userId: string;
    fileKey: string;
  }




const ChatSchema: Schema<Chat>=new Schema({
    pdfName: { type: String, required: true },
    pdfUrl: { type: String, required: true },
    createdAt: { type: Date, default: Date.now },
    userId: { type: String, required: true },
    fileKey: { type: String, required: true },
}, { timestamps: true });

const ChatModel =
  (mongoose.models.Chat as mongoose.Model<Chat>) ||
  mongoose.model<Chat>('Chat', ChatSchema);

export default ChatModel;