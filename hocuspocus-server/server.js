import { Server } from "@hocuspocus/server";
import axios from "axios";
import axiosRetry from "axios-retry";
import dotenv from "dotenv";
import pino from "pino";
import { createServer } from "http";
import { randomUUID } from "crypto";

dotenv.config();

// ============================================================================
// CONFIGURATION & VALIDATION
// ============================================================================

const NODE_ENV = process.env.NODE_ENV || "development";
const PORT = parseInt(process.env.PORT || "1234", 10);
const HEALTH_PORT = parseInt(process.env.HEALTH_PORT || "9090", 10);
const BACKEND_URL = process.env.BACKEND_URL || "http://localhost:8080";
const LOG_LEVEL =
  process.env.LOG_LEVEL || (NODE_ENV === "production" ? "info" : "debug");
const SHUTDOWN_TIMEOUT_MS = parseInt(
  process.env.SHUTDOWN_TIMEOUT_MS || "30000",
  10
);

// Validate configuration
function validateConfig() {
  const errors = [];

  if (isNaN(PORT) || PORT < 1024 || PORT > 65535) {
    errors.push(
      `Invalid PORT: ${process.env.PORT}. Must be between 1024-65535`
    );
  }

  if (isNaN(HEALTH_PORT) || HEALTH_PORT < 1024 || HEALTH_PORT > 65535) {
    errors.push(
      `Invalid HEALTH_PORT: ${process.env.HEALTH_PORT}. Must be between 1024-65535`
    );
  }

  if (!BACKEND_URL || !BACKEND_URL.match(/^https?:\/\/.+/)) {
    errors.push(
      `Invalid BACKEND_URL: ${BACKEND_URL}. Must be a valid HTTP(S) URL`
    );
  }

  if (errors.length > 0) {
    console.error("Configuration validation failed:");
    errors.forEach((err) => console.error(`  - ${err}`));
    process.exit(1);
  }
}

validateConfig();

// ============================================================================
// LOGGING SETUP
// ============================================================================

const logger = pino({
  level: LOG_LEVEL,
  transport:
    NODE_ENV === "development"
      ? {
          target: "pino-pretty",
          options: {
            colorize: true,
            translateTime: "HH:MM:ss",
            ignore: "pid,hostname",
          },
        }
      : undefined,
  formatters: {
    level: (label) => {
      return { level: label };
    },
  },
  base: {
    env: NODE_ENV,
  },
});

// ============================================================================
// METRICS TRACKING
// ============================================================================

const metrics = {
  activeConnections: 0,
  totalConnections: 0,
  authSuccesses: 0,
  authFailures: 0,
  backendErrors: 0,
  startTime: Date.now(),
  connectionsByDocument: new Map(),

  incrementConnection() {
    this.activeConnections++;
    this.totalConnections++;
  },

  decrementConnection() {
    this.activeConnections--;
  },

  addDocumentConnection(documentName) {
    const current = this.connectionsByDocument.get(documentName) || 0;
    this.connectionsByDocument.set(documentName, current + 1);
  },

  removeDocumentConnection(documentName) {
    const current = this.connectionsByDocument.get(documentName) || 0;
    if (current > 1) {
      this.connectionsByDocument.set(documentName, current - 1);
    } else {
      this.connectionsByDocument.delete(documentName);
    }
  },

  getStats() {
    return {
      activeConnections: this.activeConnections,
      totalConnections: this.totalConnections,
      authSuccesses: this.authSuccesses,
      authFailures: this.authFailures,
      backendErrors: this.backendErrors,
      uptimeSeconds: Math.floor((Date.now() - this.startTime) / 1000),
      activeDocuments: this.connectionsByDocument.size,
    };
  },
};

// ============================================================================
// HTTP CLIENT SETUP
// ============================================================================

const httpClient = axios.create({
  timeout: 5000, // 5 second timeout
  headers: {
    "Content-Type": "application/json",
  },
});

// Configure retry logic for resilience
axiosRetry(httpClient, {
  retries: 2,
  retryDelay: axiosRetry.exponentialDelay,
  retryCondition: (error) => {
    // Retry on network errors and 5xx errors, but not on 4xx (auth errors)
    return (
      axiosRetry.isNetworkOrIdempotentRequestError(error) ||
      (error.response && error.response.status >= 500)
    );
  },
  onRetry: (retryCount, error, requestConfig) => {
    logger.warn(
      {
        retryCount,
        url: requestConfig.url,
        error: error.message,
      },
      "Retrying backend request"
    );
  },
});

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

function isValidJWT(token) {
  // Basic JWT format validation: three base64 parts separated by dots
  return /^[A-Za-z0-9-_]+\.[A-Za-z0-9-_]+\.[A-Za-z0-9-_]+$/.test(token);
}

function isValidUUID(str) {
  const uuidRegex =
    /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  return uuidRegex.test(str);
}

function sanitizeDocumentName(documentName) {
  if (!documentName || typeof documentName !== "string") {
    throw new Error("INVALID_DOCUMENT_NAME");
  }

  if (!documentName.startsWith("note-")) {
    throw new Error("INVALID_DOCUMENT_FORMAT");
  }

  return documentName.replace("note-", "");
}

// ============================================================================
// BACKEND CONNECTIVITY CHECK
// ============================================================================

async function checkBackendConnectivity() {
  try {
    logger.info(
      { backendUrl: BACKEND_URL },
      "Checking backend connectivity..."
    );

    // Try to reach the backend (any endpoint, just to verify it's up)
    const response = await httpClient.get(`${BACKEND_URL}/actuator/health`, {
      timeout: 10000,
      validateStatus: () => true, // Accept any status
    });

    if (response.status < 500) {
      logger.info({ status: response.status }, "Backend is reachable");
      return true;
    } else {
      logger.warn({ status: response.status }, "Backend returned server error");
      return false;
    }
  } catch (error) {
    logger.error(
      {
        error: error.message,
        code: error.code,
      },
      "Backend connectivity check failed"
    );

    if (NODE_ENV === "production") {
      logger.error("Cannot start in production without backend connectivity");
      return false;
    } else {
      logger.warn(
        "Continuing in development mode despite backend connectivity issues"
      );
      return true;
    }
  }
}

// ============================================================================
// HOCUSPOCUS SERVER CONFIGURATION
// ============================================================================

const server = Server.configure({
  port: PORT,

  async onConnect(data) {
    const { documentName, socketId, context } = data;
    const requestId = context?.requestId || randomUUID();

    try {
      metrics.incrementConnection();
      metrics.addDocumentConnection(documentName);

      logger.info(
        {
          requestId,
          documentName,
          socketId,
          user: context?.user?.email,
          activeConnections: metrics.activeConnections,
        },
        "Client connected"
      );
    } catch (error) {
      logger.error(
        {
          requestId,
          documentName,
          socketId,
          error: error.message,
          stack: error.stack,
        },
        "Error in onConnect handler"
      );
    }
  },

  async onDisconnect(data) {
    const { documentName, socketId, context } = data;
    const requestId = context?.requestId || randomUUID();

    try {
      metrics.decrementConnection();
      metrics.removeDocumentConnection(documentName);

      logger.info(
        {
          requestId,
          documentName,
          socketId,
          user: context?.user?.email,
          activeConnections: metrics.activeConnections,
        },
        "Client disconnected"
      );
    } catch (error) {
      logger.error(
        {
          requestId,
          documentName,
          socketId,
          error: error.message,
          stack: error.stack,
        },
        "Error in onDisconnect handler"
      );
    }
  },

  async onLoadDocument(data) {
    const { documentName } = data;
    const requestId = randomUUID();

    try {
      logger.debug(
        {
          requestId,
          documentName,
        },
        "Loading document"
      );

      // Return null to start with empty Yjs document
      // Frontend handles initial content loading from database
      return null;
    } catch (error) {
      logger.error(
        {
          requestId,
          documentName,
          error: error.message,
          stack: error.stack,
        },
        "Error in onLoadDocument handler"
      );

      return null;
    }
  },

  async onStoreDocument(data) {
    const { documentName } = data;
    const requestId = randomUUID();

    try {
      logger.info(
        {
          requestId,
          documentName,
        },
        "Document updated (persistence handled by frontend autosave)"
      );
    } catch (error) {
      logger.error(
        {
          requestId,
          documentName,
          error: error.message,
          stack: error.stack,
        },
        "Error in onStoreDocument handler"
      );
    }
  },

  async onAuthenticate(data) {
    const { requestParameters, documentName } = data;
    const requestId = randomUUID();
    const startTime = Date.now();

    try {
      // Store requestId in context for later use
      data.context = { requestId };

      // ========== Token Validation ==========
      const token = requestParameters.get("token");

      if (!token) {
        logger.warn(
          { requestId, documentName },
          "Authentication failed: Missing token"
        );
        metrics.authFailures++;
        throw new Error("AUTH_TOKEN_REQUIRED");
      }

      if (typeof token !== "string" || token.trim().length === 0) {
        logger.warn(
          { requestId, documentName },
          "Authentication failed: Empty token"
        );
        metrics.authFailures++;
        throw new Error("INVALID_TOKEN");
      }

      if (!isValidJWT(token)) {
        logger.warn(
          {
            requestId,
            documentName,
            tokenPrefix: token.substring(0, 20) + "...",
          },
          "Authentication failed: Invalid JWT format"
        );
        metrics.authFailures++;
        throw new Error("INVALID_TOKEN_FORMAT");
      }

      // ========== Document Name Validation ==========
      let noteId;
      try {
        noteId = sanitizeDocumentName(documentName);
      } catch (error) {
        logger.warn(
          {
            requestId,
            documentName,
            error: error.message,
          },
          "Authentication failed: Invalid document name"
        );
        metrics.authFailures++;
        throw error;
      }

      if (!isValidUUID(noteId)) {
        logger.warn(
          {
            requestId,
            documentName,
            noteId,
          },
          "Authentication failed: Invalid note ID format"
        );
        metrics.authFailures++;
        throw new Error("INVALID_NOTE_ID");
      }

      // ========== Backend Verification ==========
      logger.debug(
        {
          requestId,
          noteId,
          backendUrl: BACKEND_URL,
        },
        "Verifying authentication with backend"
      );

      let response;
      try {
        response = await httpClient.post(
          `${BACKEND_URL}/api/notes/collaboration/verify`,
          { noteId },
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
      } catch (error) {
        const duration = Date.now() - startTime;

        // Handle specific error cases
        if (error.code === "ECONNREFUSED") {
          logger.error(
            {
              requestId,
              backendUrl: BACKEND_URL,
              duration,
            },
            "Backend unreachable"
          );
          metrics.backendErrors++;
          throw new Error("BACKEND_UNAVAILABLE");
        }

        if (error.code === "ETIMEDOUT" || error.code === "ECONNABORTED") {
          logger.error(
            {
              requestId,
              duration,
              timeout: httpClient.defaults.timeout,
            },
            "Backend request timeout"
          );
          metrics.backendErrors++;
          throw new Error("BACKEND_TIMEOUT");
        }

        if (error.response) {
          // Backend returned an HTTP error response
          const status = error.response.status;

          if (status === 401 || status === 403) {
            logger.warn(
              {
                requestId,
                noteId,
                status,
                duration,
              },
              "Authentication rejected by backend"
            );
            metrics.authFailures++;
            throw new Error("UNAUTHORIZED");
          }

          if (status >= 500) {
            logger.error(
              {
                requestId,
                status,
                statusText: error.response.statusText,
                duration,
              },
              "Backend server error"
            );
            metrics.backendErrors++;
            throw new Error("BACKEND_ERROR");
          }
        }

        // Unknown error
        logger.error(
          {
            requestId,
            error: error.message,
            code: error.code,
            duration,
          },
          "Unexpected error during backend verification"
        );
        metrics.backendErrors++;
        throw new Error("AUTHENTICATION_FAILED");
      }

      // ========== Response Validation ==========
      if (!response || !response.data) {
        logger.error(
          {
            requestId,
            noteId,
          },
          "Backend returned empty response"
        );
        metrics.backendErrors++;
        throw new Error("BACKEND_INVALID_RESPONSE");
      }

      const { allowed, email, username } = response.data;

      if (typeof allowed !== "boolean") {
        logger.error(
          {
            requestId,
            noteId,
            responseData: response.data,
          },
          "Backend returned invalid response format"
        );
        metrics.backendErrors++;
        throw new Error("BACKEND_INVALID_RESPONSE");
      }

      if (!allowed) {
        logger.warn(
          {
            requestId,
            noteId,
            email,
          },
          "User not authorized for document"
        );
        metrics.authFailures++;
        throw new Error("UNAUTHORIZED");
      }

      // ========== Success ==========
      const duration = Date.now() - startTime;
      metrics.authSuccesses++;

      logger.info(
        {
          requestId,
          noteId,
          email,
          username,
          duration,
        },
        "Authentication successful"
      );

      // Store user in context (do NOT include token for security)
      const user = {
        id: email,
        name: username,
        email: email,
      };

      data.context.user = user;

      return { user };
    } catch (error) {
      const duration = Date.now() - startTime;

      // Log final error if not already logged
      if (
        !error.message.startsWith("AUTH_") &&
        !error.message.startsWith("BACKEND_") &&
        !error.message.startsWith("INVALID_") &&
        error.message !== "UNAUTHORIZED"
      ) {
        logger.error(
          {
            requestId,
            documentName,
            error: error.message,
            stack: error.stack,
            duration,
          },
          "Unexpected authentication error"
        );
        metrics.authFailures++;
      }

      // Re-throw for Hocuspocus to handle
      throw error;
    }
  },
});

// ============================================================================
// HEALTH CHECK HTTP SERVER
// ============================================================================

const healthServer = createServer((req, res) => {
  // Enable CORS for health checks
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") {
    res.writeHead(200);
    res.end();
    return;
  }

  if (req.url === "/health" && req.method === "GET") {
    res.writeHead(200, { "Content-Type": "application/json" });
    res.end(
      JSON.stringify({
        status: "healthy",
        timestamp: new Date().toISOString(),
      })
    );
    return;
  }

  if (req.url === "/metrics" && req.method === "GET") {
    const stats = metrics.getStats();
    res.writeHead(200, { "Content-Type": "application/json" });
    res.end(JSON.stringify(stats));
    return;
  }

  if (req.url === "/ready" && req.method === "GET") {
    // Readiness check - verify we can handle traffic
    const isReady = metrics.activeConnections >= 0; // Simple check
    const statusCode = isReady ? 200 : 503;

    res.writeHead(statusCode, { "Content-Type": "application/json" });
    res.end(
      JSON.stringify({
        ready: isReady,
        timestamp: new Date().toISOString(),
      })
    );
    return;
  }

  // 404 for other paths
  res.writeHead(404, { "Content-Type": "application/json" });
  res.end(JSON.stringify({ error: "Not found" }));
});

// ============================================================================
// GRACEFUL SHUTDOWN
// ============================================================================

let isShuttingDown = false;

async function gracefulShutdown(signal) {
  if (isShuttingDown) {
    logger.warn("Shutdown already in progress, ignoring signal");
    return;
  }

  isShuttingDown = true;

  logger.info(
    { signal },
    "Received shutdown signal, starting graceful shutdown"
  );

  // Set a timeout to force exit if graceful shutdown hangs
  const forceExitTimer = setTimeout(() => {
    logger.error("Graceful shutdown timeout exceeded, forcing exit");
    process.exit(1);
  }, SHUTDOWN_TIMEOUT_MS);

  try {
    // Stop accepting new connections on health server
    healthServer.close(() => {
      logger.info("Health server closed");
    });

    // Close WebSocket server (will wait for active connections)
    logger.info(
      {
        activeConnections: metrics.activeConnections,
      },
      "Closing WebSocket server and waiting for active connections to complete"
    );

    await new Promise((resolve) => {
      server.destroy(() => {
        logger.info("WebSocket server closed");
        resolve();
      });
    });

    clearTimeout(forceExitTimer);

    logger.info(
      {
        totalConnections: metrics.totalConnections,
        authSuccesses: metrics.authSuccesses,
        authFailures: metrics.authFailures,
        uptimeSeconds: Math.floor((Date.now() - metrics.startTime) / 1000),
      },
      "Graceful shutdown complete"
    );

    process.exit(0);
  } catch (error) {
    clearTimeout(forceExitTimer);
    logger.error(
      {
        error: error.message,
        stack: error.stack,
      },
      "Error during graceful shutdown"
    );
    process.exit(1);
  }
}

// ============================================================================
// PROCESS ERROR HANDLERS
// ============================================================================

process.on("unhandledRejection", (reason, promise) => {
  logger.error(
    {
      reason: reason instanceof Error ? reason.message : reason,
      stack: reason instanceof Error ? reason.stack : undefined,
      promise: promise,
    },
    "Unhandled promise rejection"
  );

  // In production, unhandled rejections should not crash the process
  // but we log them for investigation
  if (NODE_ENV === "development") {
    process.exit(1);
  }
});

process.on("uncaughtException", (error) => {
  logger.fatal(
    {
      error: error.message,
      stack: error.stack,
    },
    "Uncaught exception - exiting process"
  );

  // Uncaught exceptions are serious - always exit
  process.exit(1);
});

process.on("SIGINT", () => gracefulShutdown("SIGINT"));
process.on("SIGTERM", () => gracefulShutdown("SIGTERM"));

// ============================================================================
// STARTUP
// ============================================================================

async function startServer() {
  try {
    logger.info(
      {
        nodeEnv: NODE_ENV,
        port: PORT,
        healthPort: HEALTH_PORT,
        backendUrl: BACKEND_URL,
        logLevel: LOG_LEVEL,
      },
      "Starting Hocuspocus server"
    );

    // Check backend connectivity
    const backendReachable = await checkBackendConnectivity();

    if (!backendReachable && NODE_ENV === "production") {
      logger.fatal("Cannot start in production without backend connectivity");
      process.exit(1);
    }

    // Start health server
    healthServer.listen(HEALTH_PORT, () => {
      logger.info(
        {
          port: HEALTH_PORT,
          endpoints: {
            health: `/health`,
            metrics: `/metrics`,
            ready: `/ready`,
          },
        },
        "Health check server started"
      );
    });

    // Start WebSocket server
    server.listen(() => {
      const wsProtocol = NODE_ENV === "production" ? "wss" : "ws";
      const displayUrl =
        NODE_ENV === "production"
          ? `${wsProtocol}://[production-url]:${PORT}`
          : `${wsProtocol}://localhost:${PORT}`;

      logger.info(`
╔═══════════════════════════════════════════════════╗
║  Hocuspocus Server Running                        ║
║                                                   ║
║  Environment: ${NODE_ENV.padEnd(36)}║
║  WebSocket Port: ${String(PORT).padEnd(31)}║
║  Health Port: ${String(HEALTH_PORT).padEnd(34)}║
║  WebSocket URL: ${displayUrl.padEnd(30)}║
║  Backend: ${BACKEND_URL.padEnd(38)}║
║                                                   ║
║  Features:                                        ║
║  ✓ Real-time collaboration                        ║
║  ✓ JWT authentication                             ║
║  ✓ Per-note isolation                             ║
║  ✓ Awareness (cursors & presence)                 ║
║  ✓ Structured logging                             ║
║  ✓ Health checks & metrics                        ║
║  ✓ Graceful shutdown                              ║
║  ✓ Error handling & retry logic                   ║
╚═══════════════════════════════════════════════════╝
      `);

      logger.info(
        {
          wsPort: PORT,
          healthPort: HEALTH_PORT,
          environment: NODE_ENV,
        },
        "Hocuspocus server started successfully"
      );
    });
  } catch (error) {
    logger.fatal(
      {
        error: error.message,
        stack: error.stack,
      },
      "Failed to start server"
    );
    process.exit(1);
  }
}

startServer();
