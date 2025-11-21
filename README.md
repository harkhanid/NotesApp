# NotesApp

A modern, full-stack note-taking application with real-time collaborative editing, rich text formatting, and secure authentication.

## ✨ Features

### Core Features

- 📝 **Rich Text Editor** - Full-featured WYSIWYG editor powered by TipTap
- 🤝 **Real-time Collaboration** - Multiple users can edit the same note simultaneously with live cursor tracking
- 🏷️ **Tag Management** - Organize notes with custom tags
- 🔍 **Search & Filter** - Find notes quickly with search and tag-based filtering
- 📱 **Responsive Design** - Works seamlessly on desktop, tablet, and mobile
- 🌓 **Theme Support** - Light and dark mode
- 🔤 **Font Customization** - Choose from multiple font families

### Authentication & Security

- 🔐 **Secure Authentication** - JWT-based authentication with httpOnly cookies
- 🔑 **OAuth2 Integration** - Sign in with Google
- 👥 **Note Sharing** - Share notes with other users with controlled access
- 🔒 **Authorization** - Per-note access control

### Technical Features

- ⚡ **Real-time Sync** - WebSocket-based collaboration using Yjs CRDT
- 💾 **Auto-save** - Automatic note saving with debouncing
- 🎨 **Modern UI** - Built with React and Framer Motion for smooth animations
- 📦 **State Management** - Redux Toolkit for predictable state
- 🗄️ **Robust Backend** - Spring Boot with JPA/Hibernate

## 🛠️ Tech Stack

### Frontend

- **Framework**: React 18 + Vite
- **State Management**: Redux Toolkit
- **Routing**: React Router
- **Rich Text Editor**: TipTap with collaboration extensions
- **Real-time**: Yjs + Hocuspocus Provider
- **Animations**: Framer Motion
- **Styling**: CSS3

### Backend

- **Framework**: Spring Boot 3.5.6
- **Security**: Spring Security with JWT
- **ORM**: Spring Data JPA + Hibernate
- **Database**: MySQL (development) / PostgreSQL (production)
- **OAuth2**: Google OAuth2 integration

### Collaboration Server

- **Runtime**: Node.js
- **Server**: Hocuspocus (Yjs WebSocket server)
- **Authentication**: JWT verification with backend

### DevOps

- **Frontend Hosting**: Vercel
- **Backend Hosting**: Render
- **Database**: PostgreSQL on Render
- **Version Control**: Git

## 📋 Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js** (v18 or higher)
- **npm** or **yarn**
- **Java JDK** (17 or higher)
- **Maven** (3.8+)
- **MySQL** (8.0+) for local development
- **Docker** (optional, for containerized deployment)
- **Git**

## 🚀 Getting Started

### 1. Clone the Repository

```bash
git clone https://github.com/yourusername/NotesApp.git
cd NotesApp
```

### 2. Setup Database

Create a MySQL database for local development:

```sql
CREATE DATABASE notesapp;
```

### 3. Configure Environment Variables

#### Backend (Spring Boot)

Create `notes/.env`:

```bash
cd notes
cp .env.example .env
```

Edit `notes/.env`:

```env
DATABASE_URL=jdbc:mysql://localhost:3306/notesapp
DATABASE_USERNAME=root
DATABASE_PASSWORD=your_mysql_password
JWT_SECRET=your-super-secret-jwt-key-min-256-bits
GOOGLE_CLIENT_ID=your-google-client-id.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=GOCSPX-your-google-client-secret
OAUTH2_REDIRECT_URI=http://localhost:8080/login/oauth2/code/google
CORS_ALLOWED_ORIGINS=http://localhost:5173
PORT=8080
```

**Generate JWT Secret**:

```bash
openssl rand -base64 64
```

**Get Google OAuth Credentials**:

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing
3. Enable Google+ API
4. Create OAuth 2.0 credentials
5. Add authorized redirect URI: `http://localhost:8080/login/oauth2/code/google`
6. Add authorized JavaScript origin: `http://localhost:5173`

#### Collaboration Server (Hocuspocus)

Create `hocuspocus-server/.env`:

```bash
cd hocuspocus-server
cp .env.example .env
```

Edit `hocuspocus-server/.env`:

```env
PORT=1234
BACKEND_URL=http://localhost:8080
NODE_ENV=development
```

#### Frontend (React)

Create `frontend/.env.local`:

```bash
cd frontend
cp .env.example .env.local
```

Edit `frontend/.env.local`:

```env
VITE_API_URL=http://localhost:8080
VITE_WEBSOCKET_URL=ws://localhost:1234
```

### 4. Install Dependencies

#### Backend

```bash
cd notes
./mvnw clean install
```

#### Collaboration Server

```bash
cd hocuspocus-server
npm install
```

#### Frontend

```bash
cd frontend
npm install
```

### 5. Run the Application

You'll need **three terminal windows**:

#### Terminal 1 - Backend

```bash
cd notes
./mvnw spring-boot:run
```

Backend runs on: `http://localhost:8080`

#### Terminal 2 - Collaboration Server

```bash
cd hocuspocus-server
npm run dev
```

WebSocket server runs on: `ws://localhost:1234`

#### Terminal 3 - Frontend

```bash
cd frontend
npm run dev
```

Frontend runs on: `http://localhost:5173`

### 6. Access the Application

Open your browser and navigate to:

```
http://localhost:5173
```

Create an account or sign in with Google to start using the app!

## 📁 Project Structure

```
NotesApp/
├── frontend/                 # React frontend application
│   ├── src/
│   │   ├── components/      # React components
│   │   │   ├── dashboard/   # Main dashboard view
│   │   │   ├── editor/      # TipTap rich text editor
│   │   │   ├── loginPage/   # Authentication pages
│   │   │   └── ...
│   │   ├── store/           # Redux store and slices
│   │   │   ├── notesSlice.js
│   │   │   ├── authSlice.js
│   │   │   └── uiSlice.js
│   │   ├── Service/         # API service layer
│   │   ├── utils/           # Utility functions
│   │   │   └── collaborationManager.js
│   │   └── constants/       # App constants
│   ├── .env.example         # Environment template
│   └── package.json
│
├── notes/                   # Spring Boot backend
│   ├── src/main/java/com/dharmikharkhani/notes/
│   │   ├── auth/           # Authentication & security
│   │   │   ├── config/     # Security configuration
│   │   │   ├── security/   # JWT, OAuth2 handlers
│   │   │   └── service/    # Auth services
│   │   ├── controller/     # REST controllers
│   │   ├── entity/         # JPA entities (Note, Tag, User)
│   │   ├── repository/     # Data repositories
│   │   ├── service/        # Business logic
│   │   └── dto/            # Data transfer objects
│   ├── src/main/resources/
│   │   └── application.properties
│   ├── .env.example        # Environment template
│   └── pom.xml
│
├── hocuspocus-server/      # WebSocket collaboration server
│   ├── server.js           # Hocuspocus server setup
│   ├── .env.example        # Environment template
│   └── package.json
│
├── CLAUDE.md               # Development context for AI
├── DEPLOYMENT.md           # General deployment guide
├── PRODUCTION_DEPLOYMENT.md # Production deployment guide
└── README.md               # This file
```

## 🔑 Key Features Explained

### Real-time Collaboration

The app uses **Yjs CRDT** (Conflict-free Replicated Data Type) for real-time collaboration:

1. When a note is opened, the frontend creates a Yjs document
2. A Hocuspocus provider connects to the WebSocket server
3. The server authenticates the user via the backend
4. Multiple users can edit simultaneously with automatic conflict resolution
5. Cursor positions and selections are shared in real-time

**Architecture**:

```
Frontend (Editor) ←→ Hocuspocus Server ←→ Backend (Auth)
     ↓                      ↓
  Yjs CRDT            WebSocket Server
```

### State Management

The frontend uses **Redux Toolkit** with a normalized state structure:

```javascript
{
  notes: {
    byId: {
      "uuid-1": { id, title, content, tags, ... },
      "uuid-2": { id, title, content, tags, ... }
    },
    allIds: ["uuid-1", "uuid-2", ...]
  },
  auth: { user, isAuthenticated, ... },
  ui: { theme, font, currentFilter, ... }
}
```

### Authentication Flow

1. User logs in via credentials or Google OAuth
2. Backend generates JWT token
3. Token stored in httpOnly cookie (secure, XSS-protected)
4. Each request includes cookie for authentication
5. JWT validated by Spring Security filter chain

## 🧪 Testing

### Backend Tests

```bash
cd notes
./mvnw test
```

### Frontend Tests

```bash
cd frontend
npm run test
```

## 🏗️ Building for Production

### Frontend

```bash
cd frontend
npm run build
```

Output: `frontend/dist/`

### Backend

**Option 1: Using Maven**
```bash
cd notes
./mvnw clean package -DskipTests
```
Output: `notes/target/notes-*.jar`

**Option 2: Using Docker** (Recommended for Render deployment)
```bash
cd notes
docker build -t notesapp-backend .
```
Output: Docker image `notesapp-backend`

### Collaboration Server

```bash
cd hocuspocus-server
npm install --production
```

## 🚢 Deployment

See [PRODUCTION_DEPLOYMENT.md](./PRODUCTION_DEPLOYMENT.md) for detailed production deployment instructions covering:

- PostgreSQL database setup on Render
- Backend deployment to Render
- Collaboration server deployment to Render
- Frontend deployment to Vercel
- Environment configuration
- Post-deployment steps

### Quick Deployment Summary

1. **Database**: Create PostgreSQL on Render
2. **Backend**: Deploy Spring Boot to Render
3. **Collaboration Server**: Deploy Hocuspocus to Render
4. **Frontend**: Deploy React to Vercel

Estimated cost: **Free tier available** | Production: **~$21-41/month**

## 🔧 Development Tips

### Running in Development Mode

For hot-reload during development:

```bash
# Terminal 1 - Backend (auto-restart on changes)
cd notes
./mvnw spring-boot:run

# Terminal 2 - Collaboration Server (nodemon)
cd hocuspocus-server
npm run dev

# Terminal 3 - Frontend (Vite HMR)
cd frontend
npm run dev
```

### Database Migrations

The app uses Hibernate's `ddl-auto=update` for automatic schema updates. For production, consider using Flyway or Liquibase for versioned migrations.

### Adding New Features

1. **Backend**: Add controller → service → repository
2. **Frontend**: Create component → add Redux slice → connect to API
3. **Collaboration**: Modify Yjs document structure if needed

## 🐛 Troubleshooting

### Backend won't start

- Check database connection in `.env`
- Verify MySQL is running: `mysql -u root -p`
- Check port 8080 is available: `lsof -i :8080`

### Frontend can't connect to backend

- Verify `VITE_API_URL` in `.env.local`
- Check CORS configuration in backend
- Ensure backend is running on port 8080

### WebSocket connection fails

- Verify `VITE_WEBSOCKET_URL` in `.env.local`
- Ensure Hocuspocus server is running on port 1234
- Check browser console for WebSocket errors
- Verify backend is reachable from Hocuspocus server

### OAuth login not working

- Verify Google OAuth credentials in backend `.env`
- Check redirect URIs in Google Cloud Console
- Ensure frontend and backend URLs match configuration

## 📚 API Documentation

### Authentication Endpoints

| Method | Endpoint                       | Description              |
| ------ | ------------------------------ | ------------------------ |
| POST   | `/api/auth/register`           | Register new user        |
| POST   | `/api/auth/login`              | Login with credentials   |
| POST   | `/api/auth/logout`             | Logout user              |
| GET    | `/api/auth/current-user`       | Get current user info    |
| GET    | `/api/auth/ws-token`           | Get WebSocket auth token |
| GET    | `/oauth2/authorization/google` | Initiate Google OAuth    |

### Notes Endpoints

| Method | Endpoint                            | Description          |
| ------ | ----------------------------------- | -------------------- |
| GET    | `/api/notes`                        | Get all user notes   |
| POST   | `/api/notes`                        | Create new note      |
| GET    | `/api/notes/{id}`                   | Get note by ID       |
| PUT    | `/api/notes/{id}`                   | Update note          |
| DELETE | `/api/notes/{id}`                   | Delete note          |
| GET    | `/api/notes/search?keyword={query}` | Search notes         |
| POST   | `/api/notes/{id}/share`             | Share note with user |
| DELETE | `/api/notes/{id}/share/{userId}`    | Remove collaborator  |

### Tags Endpoints

| Method | Endpoint         | Description       |
| ------ | ---------------- | ----------------- |
| GET    | `/api/tags`      | Get all user tags |
| POST   | `/api/tags`      | Create new tag    |
| PUT    | `/api/tags/{id}` | Update tag        |
| DELETE | `/api/tags/{id}` | Delete tag        |

## 🤝 Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

### Development Guidelines

- Follow existing code style and conventions
- Write meaningful commit messages
- Add comments for complex logic
- Update documentation for new features
- Test your changes thoroughly

## 🔒 Security

- JWT tokens stored in httpOnly cookies (XSS protection)
- CORS configured for trusted origins only
- SQL injection prevention via JPA/Hibernate
- Password hashing with BCrypt
- OAuth2 for secure third-party authentication
- Per-note authorization checks

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 👨‍💻 Author

**Dharmik Harkhani**

## 🙏 Acknowledgments

- [TipTap](https://tiptap.dev/) - Extensible rich text editor
- [Hocuspocus](https://tiptap.dev/hocuspocus) - WebSocket backend for Yjs
- [Yjs](https://yjs.dev/) - CRDT framework for real-time collaboration
- [Spring Boot](https://spring.io/projects/spring-boot) - Backend framework
- [React](https://react.dev/) - Frontend framework
- [Vite](https://vitejs.dev/) - Build tool
- [Redux Toolkit](https://redux-toolkit.js.org/) - State management

## 📞 Support

If you encounter any issues or have questions:

1. Check the [Troubleshooting](#troubleshooting) section
2. Review [DEPLOYMENT.md](./DEPLOYMENT.md) for deployment issues
3. Open an issue on GitHub

## 🗺️ Roadmap

Future enhancements planned:

- [ ] Mobile apps (React Native)
- [ ] End-to-end encryption
- [ ] Public note sharing with links
- [ ] Advanced search with filters
- [ ] API rate limiting
- [ ] Email notifications

---

**Happy Note-Taking! 📝✨**
