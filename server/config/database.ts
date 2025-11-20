import mongoose from 'mongoose';

const connectDB = async () => {
  try {
    const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/soro-chat';
    const conn = await mongoose.connect(mongoUri);
    console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
    return true;
  } catch (error: any) {
    console.error('❌ Database connection error:', error.message);
    
    if (error.message?.includes('whitelist') || error.message?.includes('IP')) {
      console.error('\n📋 To fix MongoDB Atlas connection:');
      console.error('1. Go to https://cloud.mongodb.com/');
      console.error('2. Navigate to your cluster → Network Access');
      console.error('3. Click "Add IP Address"');
      console.error('4. Click "Allow Access from Anywhere" (0.0.0.0/0) for development');
      console.error('   OR add your current IP address');
      console.error('\n💡 Alternatively, use local MongoDB:');
      console.error('   Set MONGODB_URI=mongodb://localhost:27017/soro-chat in your .env file');
    }
    
    console.error('\n⚠️  Server will continue running but database features will not work.');
    console.error('   Please fix the MongoDB connection and restart the server.\n');
    return false;
  }
};

export default connectDB;



