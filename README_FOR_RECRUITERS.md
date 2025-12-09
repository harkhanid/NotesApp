# Notes App - For Recruiters & Hiring Managers

## 🚀 Live Demo

**Frontend:** [https://your-app.vercel.app](https://your-app.vercel.app)

**⚠️ First Visit Notice:**
This application is hosted on Render's free tier. The backend server automatically sleeps after 15 minutes of inactivity to conserve resources. **Your first visit will take approximately 60 seconds** as the server wakes up. A professional loading screen will be displayed during this time. Subsequent visits within 15 minutes will load instantly.

---

## Why This Matters (My Technical Decisions)

### Free Tier Hosting - A Conscious Choice

I chose **Render's free tier** for deployment to demonstrate:
- ✅ **Cost-conscious development** - Understanding production constraints
- ✅ **User experience focus** - Implemented a loading screen to communicate the delay professionally
- ✅ **Problem-solving** - Turned a limitation into a UX feature
- ✅ **Technical awareness** - Understanding of cloud infrastructure and cold starts

### What I Did to Handle This:

1. **Smart Backend Detection**
   - Frontend automatically detects when backend is sleeping
   - Polls health endpoint every 3 seconds until ready
   - No manual intervention needed

2. **Professional Loading Screen**
   - Clear messaging about the delay
   - Explains it's a hosting limitation, not a bug
   - Shows technical understanding

3. **Seamless Transition**
   - Once backend wakes, app loads instantly
   - User experience is smooth after initial wait
   - All features work normally

**This demonstrates:** Product thinking, UX design, and technical problem-solving.

---

## 🎯 Key Features

### Authentication & Security
- ✅ **JWT-based authentication** with httpOnly cookies
- ✅ **OAuth2 Google Sign-In** - One-click social login
- ✅ **Email verification** - Secure account creation flow
- ✅ **Password reset** - Forgot password flow with email tokens
- ✅ **Email conflict handling** - Prevents OAuth account takeover

### Core Features
- ✅ **Rich text editor** - TipTap (ProseMirror) WYSIWYG editor
- ✅ **Real-time collaboration** - Multi-user editing with Yjs & Hocuspocus
- ✅ **Tag management** - Organize notes with tags
- ✅ **Note sharing** - Share notes with other users
- ✅ **Search functionality** - Full-text note search
- ✅ **User preferences** - Customizable themes and fonts

### Technical Features
- ✅ **Session management** - Auto-logout on JWT expiry
- ✅ **Startup detection** - Professional handling of cold starts
- ✅ **Error handling** - Global 401 handler, toast notifications
- ✅ **Responsive design** - Mobile-friendly UI

---

## 🛠 Tech Stack

### Frontend
- **React 18** + Vite
- **Redux Toolkit** - State management
- **React Router** - Client-side routing
- **TipTap** - Rich text editor with collaboration
- **Framer Motion** - Animations

### Backend
- **Spring Boot 3.5** - REST API
- **Spring Security** - Authentication & authorization
- **Spring Data JPA** - Database ORM
- **PostgreSQL** - Production database
- **OAuth2** - Google sign-in integration

### Real-Time Collaboration
- **Hocuspocus** - WebSocket collaboration server
- **Yjs** - CRDT for conflict-free editing
- **JWT authentication** - Secure WebSocket connections

### Deployment
- **Frontend:** Vercel (automatic deployments)
- **Backend:** Render (PostgreSQL + Spring Boot)
- **Collaboration Server:** Render (Node.js)

---

## 🧪 Testing the App

### Test Credentials (Optional)
If you'd like to skip registration, you can use:
- **Email:** demo@example.com
- **Password:** Demo123!

Or create your own account to test the full email verification flow.

### Recommended Test Flow:

1. **First Visit (Cold Start Test)**
   - Visit the app URL
   - Observe the professional loading screen (~60 seconds)
   - Note the clear messaging about hosting limitations

2. **Authentication Testing**
   - Try regular sign-up with email verification
   - Try OAuth Google sign-in
   - Test forgot password flow
   - Test email conflict (create account, then try OAuth with same email)

3. **Core Features Testing**
   - Create notes with rich text formatting
   - Add tags to notes
   - Search notes
   - Share notes with another test account
   - Test real-time collaboration (open same note in two browsers)

4. **Session Management**
   - Note the auto-logout after JWT expiry (set to 1 hour)
   - Observe toast notification on session expiry

5. **Subsequent Visits**
   - Visit again within 15 minutes
   - Note the instant load (no startup delay)

---

## 💡 Architecture Highlights

### Security Best Practices
- **httpOnly cookies** - Prevents XSS attacks on JWT tokens
- **CORS configuration** - Whitelisted origins only
- **Password hashing** - BCrypt with salt
- **Email verification** - Prevents spam accounts
- **OAuth email conflict detection** - Prevents account takeover

### Performance Optimizations
- **Normalized Redux state** - Efficient data structure
- **Lazy loading** - Code splitting with React.lazy
- **Debounced search** - Reduces unnecessary API calls
- **Optimistic updates** - Better perceived performance

### User Experience
- **Global error handling** - Consistent error messaging
- **Toast notifications** - Non-intrusive feedback
- **Loading states** - Clear feedback for async operations
- **Startup screen** - Professional handling of cold starts

---

## 📚 Documentation

Comprehensive documentation is available in the repository:

- **[OAuth & Session Improvements](./notes/OAUTH_AND_SESSION_IMPROVEMENTS.md)** - Details on OAuth implementation and session handling
- **[Render Deployment Guide](./RENDER_DEPLOYMENT_GUIDE.md)** - Complete guide for deploying to Render
- **[Claude.md](./CLAUDE.md)** - Codebase structure and development guide

---

## 🎓 What I Learned / What This Demonstrates

This project showcases:

### Full-Stack Development
- ✅ Building a complete application from scratch
- ✅ Frontend-backend integration
- ✅ Third-party API integration (OAuth, Email)
- ✅ Real-time features (WebSocket, CRDT)

### Security & Authentication
- ✅ Implementing secure authentication flows
- ✅ Understanding OAuth2 protocol
- ✅ Handling session management
- ✅ Preventing common security vulnerabilities

### Problem Solving
- ✅ Turning hosting limitations into UX features
- ✅ Handling race conditions (duplicate user creation)
- ✅ Implementing global error handling
- ✅ Debugging production issues

### DevOps & Deployment
- ✅ Multi-environment configuration (dev/prod)
- ✅ Environment variable management
- ✅ CI/CD with Vercel/Render
- ✅ Database migrations

### User Experience
- ✅ Thinking about edge cases (cold starts, session expiry)
- ✅ Clear user communication
- ✅ Responsive design
- ✅ Accessibility considerations

---

## 🐛 Known Limitations (Intentional Trade-offs)

### Render Free Tier
- **Cold start delay** (~60 seconds after 15 min inactivity)
- **Handled with:** Professional loading screen
- **Alternative:** Upgrade to paid plan ($7/month) for zero downtime

### Email Sending
- **Gmail daily limits** (500 emails/day for free accounts)
- **Handled with:** Sufficient for demo purposes
- **Alternative:** Use transactional email service (SendGrid, AWS SES)

### Real-Time Collaboration
- **Hocuspocus server also sleeps** on free tier
- **Handled with:** Same startup detection mechanism
- **Alternative:** Dedicated WebSocket server

**Why I kept these:** To demonstrate that I understand production constraints and can work within them while maintaining professional UX.

---

## 🚀 Future Improvements

If I were to continue developing this:

1. **Offline Support** - Service workers for offline note editing
2. **Mobile Apps** - React Native apps for iOS/Android
3. **Advanced Search** - Full-text search with Elasticsearch
4. **Note Templates** - Predefined note structures
5. **Export Features** - Export to PDF, Markdown, etc.
6. **Keyboard Shortcuts** - Power user features
7. **Note Versioning** - Track changes over time
8. **Rich Media** - Image upload and embedding

---

## 📧 Contact

**Developer:** Dharmik Harkhani
**Email:** your-email@example.com
**LinkedIn:** [Your LinkedIn Profile]
**GitHub:** [Your GitHub Profile]

---

## 📝 License

This is a portfolio project. Code is available for review but not for commercial use.

---

**Thank you for taking the time to review my work!** 🙏

If you have any questions about technical decisions, architecture, or implementation details, I'm happy to discuss them.
