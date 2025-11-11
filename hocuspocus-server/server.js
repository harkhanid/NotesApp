import { Server } from '@hocuspocus/server'
import axios from 'axios'
import dotenv from 'dotenv'

dotenv.config()

const PORT = process.env.PORT || 1234
const BACKEND_URL = process.env.BACKEND_URL || 'http://localhost:8080'

// Create Hocuspocus server
const server = Server.configure({
  port: PORT,

  // Lifecycle hooks
  async onConnect(data) {
    const { documentName, requestParameters } = data
    console.log(`✅ Client connected to document: ${documentName}`)

    // Log connection info
    if (requestParameters.get('token')) {
      console.log('   Token received (auth will be implemented in Phase 3)')
    }
  },

  async onDisconnect(data) {
    const { documentName } = data
    console.log(`❌ Client disconnected from document: ${documentName}`)
  },

  async onLoadDocument(data) {
    const { documentName } = data
    console.log(`📄 Loading document: ${documentName}`)

    // Phase 4 Simplification:
    // Initial content is loaded by the frontend from the database via Redux
    // Hocuspocus just manages real-time sync between clients
    // Return null to start with empty Yjs document
    console.log(`ℹ️ Returning empty document - frontend will set initial content`)
    return null
  },

  async onStoreDocument(data) {
    const { documentName } = data
    console.log(`💾 Document ${documentName} updated`)

    // Phase 4: We'll save content to Spring Boot backend here
  },

  async onAuthenticate(data) {
    const { requestParameters, documentName } = data
    const token = requestParameters.get('token')

    // Extract noteId from document name (format: "note-{uuid}")
    const noteId = documentName.replace('note-', '')

    if (!token) {
      console.log('❌ No token provided for document:', documentName)
      throw new Error('Authentication token required')
    }

    try {
      // Verify token with Spring Boot backend
      const response = await axios.post(
        `${BACKEND_URL}/api/notes/collaboration/verify`,
        { noteId },
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Cookie': `token=${token}`, // JWT stored in httpOnly cookie
            'Content-Type': 'application/json'
          },
          withCredentials: true
        }
      )

      const { allowed, email, username } = response.data

      if (!allowed) {
        console.log(`❌ User ${email} not authorized for document: ${documentName}`)
        throw new Error('Not authorized to access this document')
      }

      console.log(`✅ User ${email} authenticated for document: ${documentName}`)

      return {
        user: {
          id: email,
          name: username,
          email: email,
          token: token // Store token for use in other hooks
        }
      }
    } catch (error) {
      if (error.response) {
        console.error(`❌ Auth failed: ${error.response.status} ${error.response.statusText}`)
      } else {
        console.error(`❌ Auth error:`, error.message)
      }
      throw new Error('Authentication failed')
    }
  },
})

server.listen(() => {
  console.log(`
╔═══════════════════════════════════════════════════╗
║  🚀 Hocuspocus Server Running                     ║
║                                                   ║
║  Port: ${PORT}                                     ║
║  WebSocket URL: ws://localhost:${PORT}             ║
║  Backend URL: ${BACKEND_URL}                       ║
║                                                   ║
║  Phase: 4 - COMPLETE                              ║
║  ✅ Per-note collaboration                        ║
║  ✅ JWT authentication                            ║
║  ✅ Database autosave (frontend)                  ║
╚═══════════════════════════════════════════════════╝
  `)
})

// Graceful shutdown
process.on('SIGINT', () => {
  console.log('\n🛑 Shutting down Hocuspocus server...')
  server.destroy()
  process.exit(0)
})

process.on('SIGTERM', () => {
  console.log('\n🛑 Shutting down Hocuspocus server...')
  server.destroy()
  process.exit(0)
})
