import { Server } from '@hocuspocus/server'

const PORT = process.env.PORT || 1234

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

    // Phase 4: We'll load initial content from Spring Boot backend here
    // For now, return empty document
    return null
  },

  async onStoreDocument(data) {
    const { documentName } = data
    console.log(`💾 Document ${documentName} updated`)

    // Phase 4: We'll save content to Spring Boot backend here
  },

  async onAuthenticate(data) {
    const { requestParameters } = data

    // Phase 3: We'll verify JWT with Spring Boot backend here
    // For now, allow all connections
    if (requestParameters.get('token')) {
      console.log('🔓 Token received but authentication bypassed (Phase 2 - dev mode)')
    } else {
      console.log('🔓 No token - authentication bypassed (Phase 2 - dev mode)')
    }

    return {
      user: {
        id: 'anonymous',
        name: 'Anonymous'
      }
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
║                                                   ║
║  Phase: 2 - Basic WebSocket Sync                 ║
║  Status: Authentication disabled (dev mode)      ║
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
