# 🏥 Medical Assistant - AI-Powered Healthcare Companion

A comprehensive medical assistant application built with Next.js, featuring AI-powered chat capabilities, user authentication, and health management tools.

## 🌟 Features

### 🔐 Authentication System
- **Email/Password Authentication** using NextAuth.js
- **Secure Session Management** with JWT tokens
- **Protected Routes** with middleware
- **User Registration & Login** with form validation
- **MongoDB Integration** for user data storage

### 🤖 AI-Powered Medical Chat
- **GPT-4o Integration** for intelligent medical conversations
- **Context-Aware Responses** with conversation history
- **Medical-Specific Prompts** for accurate health guidance
- **Quick Action Buttons** for common medical queries
- **Real-time Chat Interface** with typing indicators
- **Professional Formatting** with emojis and structured responses

### 🎨 Modern UI/UX
- **Responsive Design** built with Tailwind CSS
- **Clean Interface** with smooth animations
- **Professional Styling** for medical content
- **Mobile-Friendly** responsive layout
- **Accessibility Features** for better usability

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ 
- MongoDB database (local or Atlas)
- OpenAI API key

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd medical_assisstent
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Environment Setup**
   Create a `.env.local` file in the root directory:
   ```env
   # MongoDB Configuration
   MONGODB_URI=your_mongodb_connection_string
   
   # NextAuth Configuration
   NEXTAUTH_URL=http://localhost:3000
   NEXTAUTH_SECRET=your_secure_random_secret
   
   # OpenAI Configuration
   OPENAI_API_KEY=your_openai_api_key
   
   # Application Configuration
   NODE_ENV=development
   ```

4. **Run the development server**
   ```bash
   npm run dev
   ```

5. **Open your browser**
   Navigate to [http://localhost:3000](http://localhost:3000)

## 🛠️ Technology Stack

### Frontend
- **Next.js 15** - React framework with App Router
- **React 19** - UI library
- **Tailwind CSS** - Utility-first CSS framework
- **TypeScript** - Type-safe JavaScript

### Backend
- **NextAuth.js** - Authentication solution
- **MongoDB** - Database for user data
- **OpenAI API** - GPT-4o for AI chat functionality

### Key Libraries
- `next-auth` - Authentication
- `mongodb` - Database connectivity
- `openai` - AI integration
- `bcryptjs` - Password hashing

## 📁 Project Structure

```
medical_assisstent/
├── components/
│   ├── auth/                 # Authentication components
│   │   ├── AuthButton.tsx
│   │   ├── AuthGuard.tsx
│   │   └── MessageContent.tsx
│   ├── chat/                 # Chat components
│   │   ├── MedicalChat.tsx
│   │   ├── QuickActions.tsx
│   │   └── MessageContent.tsx
│   └── AuthShowcase.js       # Main auth component
├── lib/
│   ├── auth.config.ts        # NextAuth configuration
│   ├── auth.utils.ts         # Auth utility functions
│   └── mongodb.js            # Database connection
├── pages/api/
│   ├── auth/
│   │   ├── [...nextauth].js  # NextAuth API routes
│   │   └── signup.ts         # User registration
│   ├── chat/
│   │   └── medical.ts        # AI chat API
│   └── test/
│       └── openai.ts         # API testing
├── src/app/
│   ├── auth/                 # Auth pages
│   ├── chat/                 # Chat page
│   ├── dashboard/            # Dashboard page
│   └── layout.tsx            # Root layout
├── hooks/
│   └── useAuth.ts            # Custom auth hooks
├── types/
│   └── next-auth.d.ts        # TypeScript definitions
└── middleware.ts             # Route protection
```

## 🔧 Configuration

### MongoDB Setup
1. Create a MongoDB Atlas account or set up local MongoDB
2. Create a database for the application
3. Add the connection string to `.env.local`

### OpenAI Setup
1. Create an OpenAI account
2. Generate an API key
3. Add the key to `.env.local`

### NextAuth Setup
1. Generate a secure secret:
   ```bash
   node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
   ```
2. Add the secret to `.env.local`

## 🎯 Usage

### Authentication
1. **Sign Up**: Create a new account with email/password
2. **Sign In**: Login with your credentials
3. **Dashboard**: Access your personalized dashboard

### AI Medical Chat
1. Navigate to the **Chat** section
2. Use **Quick Actions** for common queries
3. Ask health-related questions
4. Get AI-powered medical guidance

### Important Medical Disclaimer
⚠️ This application provides general health information only and should never replace professional medical advice. Always consult qualified healthcare professionals for medical diagnosis, treatment, and emergencies.

## 🚀 Deployment

### Vercel (Recommended)
1. Push your code to GitHub
2. Connect your repository to Vercel
3. Add environment variables in Vercel dashboard
4. Deploy automatically

### Other Platforms
- **Netlify**: Configure build settings for Next.js
- **Railway**: Add environment variables and deploy
- **Heroku**: Use Next.js buildpack

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

If you encounter any issues or have questions:

1. Check the [documentation](./AUTH_SETUP.md) and [OpenAI setup guide](./OPENAI_SETUP.md)
2. Search existing [GitHub issues](../../issues)
3. Create a new issue with detailed information

## 🙏 Acknowledgments

- **OpenAI** for providing GPT-4o API
- **NextAuth.js** for authentication solution
- **Vercel** for Next.js framework
- **MongoDB** for database services

---

**⚠️ Medical Disclaimer**: This application is for informational purposes only and does not provide medical advice. Always consult healthcare professionals for medical concerns.