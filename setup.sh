#!/bin/bash

echo "🚀 Setting up Soro Chat Application..."

# Check if .env exists
if [ ! -f .env ]; then
    echo "📝 Creating .env file..."
    cat > .env << EOF
# MongoDB Configuration
MONGODB_URI=mongodb://localhost:27017/soro-chat
# Or use MongoDB Atlas: mongodb+srv://username:password@cluster.mongodb.net/soro-chat

# JWT Configuration
JWT_SECRET=your-super-secret-jwt-key-here-make-it-long-and-random
JWT_EXPIRE=7d

# Server Configuration
PORT=5000
NODE_ENV=development

# Frontend URL (for CORS)
CLIENT_URL=http://localhost:3000
NEXT_PUBLIC_API_URL=http://localhost:5000/api
NEXT_PUBLIC_SOCKET_URL=http://localhost:5000
EOF
    echo "✅ .env file created!"
else
    echo "⚠️  .env file already exists, skipping..."
fi

echo ""
echo "🔧 Next steps:"
echo "1. Update the .env file with your MongoDB connection details"
echo "2. Make sure MongoDB is running (local or Atlas)"
echo "3. Run: npm run dev"
echo ""
echo "📖 For detailed setup instructions, see README.md"
echo ""
echo "🎉 Setup complete! Happy coding!"







