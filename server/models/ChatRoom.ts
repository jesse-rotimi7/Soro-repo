import mongoose, { Document, Schema } from 'mongoose';

export interface IChatRoom extends Document {
  name: string;
  description?: string;
  participants: mongoose.Types.ObjectId[];
  isGroup: boolean;
  isBot?: boolean;
  createdBy: mongoose.Types.ObjectId;
  lastMessage?: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const ChatRoomSchema = new Schema<IChatRoom>({
  name: {
    type: String,
    required: [true, 'Chat room name is required'],
    trim: true,
    maxlength: [50, 'Chat room name cannot exceed 50 characters']
  },
  description: {
    type: String,
    maxlength: [200, 'Description cannot exceed 200 characters']
  },
  participants: [{
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  }],
  isGroup: {
    type: Boolean,
    default: false
  },
  isBot: {
    type: Boolean,
    default: false
  },
  createdBy: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  lastMessage: {
    type: Schema.Types.ObjectId,
    ref: 'Message'
  }
}, {
  timestamps: true
});

// Ensure participants array has at least 2 members
ChatRoomSchema.pre('save', function(next) {
  if (this.participants.length < 2) {
    next(new Error('Chat room must have at least 2 participants'));
  } else {
    next();
  }
});

export default mongoose.model<IChatRoom>('ChatRoom', ChatRoomSchema);

