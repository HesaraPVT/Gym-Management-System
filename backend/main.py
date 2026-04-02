from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from database import connect_db, close_db
from routes import router
from inventory_routes import router as inventory_router
from contextlib import asynccontextmanager
import uvicorn

# Lifespan context manager for startup/shutdown events
@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup
    print("[*] Application starting...")
    await connect_db()
    print("[OK] MongoDB connected")
    yield
    # Shutdown
    print("[*] Application shutting down...")
    await close_db()
    print("[OK] MongoDB disconnected")

# Create FastAPI app with lifespan
app = FastAPI(
    title="Gym Tracker API",
    description="Backend API for Gym Progress Tracker with AI Bot Integration",
    version="1.0.0",
    lifespan=lifespan
)

# Add CORS middleware
origins = [
    "http://localhost:3000",
    "http://localhost:3001",
    "http://127.0.0.1:3000",
    "http://127.0.0.1:3001",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routes
app.include_router(router)
app.include_router(inventory_router)

# Health check endpoint
@app.get("/health")
def health_check():
    return {"status": "ok", "message": "Gym API is running"}

@app.get("/")
def root():
    return {
        "message": "Gym Tracker API",
        "docs": "/docs",
        "version": "1.0.0"
    }

if __name__ == "__main__":
    uvicorn.run(
        "main:app",
        host="0.0.0.0",
        port=8080,
        reload=True
    )
