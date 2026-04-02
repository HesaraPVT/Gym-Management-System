# Gym Tracker API - FastAPI Backend with MongoDB

A FastAPI backend for the Gym Progress Tracker application with user and admin authentication using MongoDB.

## Setup Instructions

### Prerequisites
- Python 3.8+
- MongoDB (local or cloud)

### 1. Create Python Virtual Environment
```bash
cd backend
python -m venv venv
```

### 2. Activate Virtual Environment

**Windows:**
```bash
venv\Scripts\activate
```

**Mac/Linux:**
```bash
source venv/bin/activate
```

### 3. Install Dependencies
```bash
pip install -r requirements.txt
```

### 4. Configure MongoDB

#### Option 1: Local MongoDB
Install MongoDB locally and ensure it's running on `mongodb://localhost:27017`

#### Option 2: MongoDB Atlas (Cloud)
1. Create account at https://www.mongodb.com/cloud/atlas
2. Create a cluster
3. Get connection string
4. Update `.env` file:
   ```
   MONGODB_URL=mongodb+srv://username:password@cluster0.xxxxx.mongodb.net/?retryWrites=true&w=majority
   ```

### 5. Update .env File
```
SECRET_KEY=your-super-secret-key
MONGODB_URL=mongodb://localhost:27017
DATABASE_NAME=gym_tracker
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=1440
```

### 6. Run the Server
```bash
python main.py
```

Or use uvicorn directly:
```bash
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

The API will be available at: **http://localhost:8000**

## API Documentation

Once the server is running, visit:
- **Swagger UI:** http://localhost:8000/docs
- **ReDoc:** http://localhost:8000/redoc

## Available Endpoints

### User Endpoints
- `POST /api/users/signup` - User registration
- `POST /api/users/signin` - User login
- `GET /api/users/profile` - Get user profile (requires token)

### Admin Endpoints
- `POST /api/admins/signup` - Admin registration
- `POST /api/admins/signin` - Admin login
- `GET /api/admins/profile` - Get admin profile (requires token)

### Health Check
- `GET /health` - Check if API is running
- `GET /` - API info

## Technology Stack

- **FastAPI** - Web framework
- **Motor** - Async MongoDB driver
- **PyMongo** - MongoDB Python driver
- **Pydantic** - Data validation
- **JWT** - Authentication
- **bcrypt** - Password hashing

## Authentication

- Uses **JWT (JSON Web Tokens)** for authentication
- Passwords are hashed with **bcrypt**
- Tokens expire after 24 hours by default
- Token should be stored in frontend localStorage

## Database

- Uses **MongoDB** for flexibility and scalability
- Collections: `users`, `admins`
- Supports both local MongoDB and MongoDB Atlas (cloud)

## Future Enhancements

- [ ] AI Bot integration
- [ ] User progress tracking endpoints
- [ ] Admin statistics endpoints
- [ ] Workout management endpoints
- [ ] Advanced filtering and aggregation

