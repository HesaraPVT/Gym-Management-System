from fastapi import APIRouter, HTTPException, status
from database import get_users_collection, get_admins_collection, get_trainers_collection
from schemas import (
    UserCreate, 
    UserSignin, 
    UserResponse, 
    UserWithToken,
    AdminCreate,
    AdminSignin,
    AdminResponse,
    AdminWithToken,
    TrainerCreate,
    TrainerSignin,
    TrainerResponse,
    TrainerWithToken,
    MeasurementCreate,
    MeasurementResponse,
    WorkoutCreate,
    WorkoutResponse
)
from auth import (
    hash_password, 
    verify_password, 
    create_access_token
)
from bson import ObjectId
from datetime import datetime
from typing import List

router = APIRouter()

# ==================== USER ROUTES ====================

@router.post("/api/users/signup", response_model=UserWithToken)
async def signup_user(user: UserCreate):
    """User signup endpoint"""
    users_collection = await get_users_collection()
    
    # Check if user already exists
    existing_user = await users_collection.find_one({"email": user.email})
    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email already registered"
        )
    
    # Hash password and create user
    hashed_password = hash_password(user.password)
    user_doc = {
        "name": user.name,
        "email": user.email,
        "hashed_password": hashed_password,
        "created_at": datetime.utcnow(),
        "is_active": True
    }
    
    result = await users_collection.insert_one(user_doc)
    user_id = str(result.inserted_id)
    
    # Create token
    access_token = create_access_token(
        data={"sub": user.email, "id": user_id, "role": "user"}
    )
    
    user_response = UserResponse(
        id=user_id,
        name=user.name,
        email=user.email,
        created_at=user_doc["created_at"],
        is_active=True
    )
    
    return {
        "user": user_response,
        "token": access_token,
        "token_type": "bearer",
        "role": "user"
    }

@router.post("/api/users/signin", response_model=UserWithToken)
async def signin_user(credentials: UserSignin):
    """User signin endpoint"""
    users_collection = await get_users_collection()
    
    # Find user by email
    user = await users_collection.find_one({"email": credentials.email})
    
    print(f"User signin attempt - Email: {credentials.email}")
    print(f"User found: {user is not None}")
    
    if not user:
        print(f"No user found with email: {credentials.email}")
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password"
        )
    
    # Verify password
    password_valid = verify_password(credentials.password, user["hashed_password"])
    print(f"Password valid: {password_valid}")
    
    if not password_valid:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password"
        )
    
    # Create token
    user_id = str(user["_id"])
    access_token = create_access_token(
        data={"sub": user["email"], "id": user_id, "role": "user"}
    )
    
    user_response = UserResponse(
        id=user_id,
        name=user["name"],
        email=user["email"],
        created_at=user["created_at"],
        is_active=user["is_active"]
    )
    
    print(f"User signin successful: {user_id}")
    
    return {
        "user": user_response,
        "token": access_token,
        "token_type": "bearer",
        "role": "user"
    }

@router.get("/api/users")
async def get_all_users():
    """Get all users (Admin endpoint)"""
    users_collection = await get_users_collection()
    users = await users_collection.find({}).to_list(None)
    
    result = []
    for user in users:
        result.append({
            "id": str(user["_id"]),
            "name": user["name"],
            "email": user["email"],
            "created_at": user["created_at"],
            "is_active": user["is_active"]
        })
    
    return result

@router.post("/api/users/{user_id}/measurements")
async def add_measurement(user_id: str, measurement: MeasurementCreate):
    """Add measurement for a user"""
    try:
        # Verify user exists
        users_collection = await get_users_collection()
        user = await users_collection.find_one({"_id": ObjectId(user_id)})
        if not user:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="User not found"
            )
        
        # Create measurements collection if not exists
        db_name = users_collection.database.name
        db = users_collection.database
        
        measurements_doc = {
            "user_id": user_id,
            "weight": measurement.weight,
            "bodyFat": measurement.bodyFat,
            "muscleMass": measurement.muscleMass,
            "height": measurement.height,
            "date": measurement.date or datetime.utcnow().isoformat()
        }
        
        result = await db["measurements"].insert_one(measurements_doc)
        
        return {
            "id": str(result.inserted_id),
            "user_id": user_id,
            "weight": measurement.weight,
            "bodyFat": measurement.bodyFat,
            "muscleMass": measurement.muscleMass,
            "height": measurement.height,
            "date": measurements_doc["date"]
        }
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )

@router.get("/api/users/{user_id}/measurements")
async def get_user_measurements(user_id: str):
    """Get all measurements for a user"""
    try:
        users_collection = await get_users_collection()
        db = users_collection.database
        
        measurements = await db["measurements"].find({"user_id": user_id}).to_list(None)
        
        result = []
        for m in measurements:
            result.append({
                "id": str(m["_id"]),
                "user_id": m["user_id"],
                "weight": m["weight"],
                "bodyFat": m["bodyFat"],
                "muscleMass": m["muscleMass"],
                "height": m["height"],
                "date": m["date"]
            })
        
        return result
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )

@router.put("/api/users/{user_id}/measurements/{measurement_id}")
async def update_measurement(user_id: str, measurement_id: str, measurement: MeasurementCreate):
    """Update a measurement for a user"""
    try:
        users_collection = await get_users_collection()
        db = users_collection.database
        
        # Update the measurement
        result = await db["measurements"].update_one(
            {"_id": ObjectId(measurement_id), "user_id": user_id},
            {"$set": {
                "weight": measurement.weight,
                "bodyFat": measurement.bodyFat,
                "muscleMass": measurement.muscleMass,
                "height": measurement.height,
                "date": measurement.date
            }}
        )
        
        if result.matched_count == 0:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Measurement not found"
            )
        
        print(f"Measurement updated: {measurement_id}")
        
        return {
            "id": measurement_id,
            "user_id": user_id,
            "weight": measurement.weight,
            "bodyFat": measurement.bodyFat,
            "muscleMass": measurement.muscleMass,
            "height": measurement.height,
            "date": measurement.date
        }
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )

@router.delete("/api/users/{user_id}/measurements/{measurement_id}")
async def delete_measurement(user_id: str, measurement_id: str):
    """Delete a measurement for a user"""
    try:
        users_collection = await get_users_collection()
        db = users_collection.database
        
        result = await db["measurements"].delete_one(
            {"_id": ObjectId(measurement_id), "user_id": user_id}
        )
        
        if result.deleted_count == 0:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Measurement not found"
            )
        
        print(f"Measurement deleted: {measurement_id}")
        
        return {"message": "Measurement deleted successfully"}
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )

@router.get("/api/users/profile")
async def get_user_profile():
    """Get authenticated user profile"""
    return {"message": "User profile endpoint"}

@router.post("/api/users/{user_id}/workouts")
async def add_workout(user_id: str, workout: WorkoutCreate):
    """Add workout for a user"""
    try:
        # Verify user exists
        users_collection = await get_users_collection()
        user = await users_collection.find_one({"_id": ObjectId(user_id)})
        if not user:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="User not found"
            )
        
        # Create workouts collection if not exists
        db = users_collection.database
        
        workout_doc = {
            "user_id": user_id,
            "exercise": workout.exercise,
            "sets": workout.sets,
            "reps": workout.reps,
            "weight": workout.weight,
            "date": workout.date or datetime.utcnow().isoformat()
        }
        
        result = await db["workouts"].insert_one(workout_doc)
        
        return {
            "id": str(result.inserted_id),
            "user_id": user_id,
            "exercise": workout.exercise,
            "sets": workout.sets,
            "reps": workout.reps,
            "weight": workout.weight,
            "date": workout_doc["date"]
        }
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )

@router.get("/api/users/{user_id}/workouts")
async def get_user_workouts(user_id: str):
    """Get all workouts for a user"""
    try:
        users_collection = await get_users_collection()
        db = users_collection.database
        
        workouts = await db["workouts"].find({"user_id": user_id}).to_list(None)
        
        result = []
        for w in workouts:
            result.append({
                "id": str(w["_id"]),
                "user_id": w["user_id"],
                "exercise": w["exercise"],
                "sets": w["sets"],
                "reps": w["reps"],
                "weight": w["weight"],
                "date": w["date"]
            })
        
        return result
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )

@router.put("/api/users/{user_id}/workouts/{workout_id}")
async def update_workout(user_id: str, workout_id: str, workout: WorkoutCreate):
    """Update a workout for a user"""
    try:
        users_collection = await get_users_collection()
        db = users_collection.database
        
        # Update the workout
        result = await db["workouts"].update_one(
            {"_id": ObjectId(workout_id), "user_id": user_id},
            {"$set": {
                "exercise": workout.exercise,
                "sets": workout.sets,
                "reps": workout.reps,
                "weight": workout.weight,
                "date": workout.date
            }}
        )
        
        if result.matched_count == 0:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Workout not found"
            )
        
        print(f"Workout updated: {workout_id}")
        
        return {
            "id": workout_id,
            "user_id": user_id,
            "exercise": workout.exercise,
            "sets": workout.sets,
            "reps": workout.reps,
            "weight": workout.weight,
            "date": workout.date
        }
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )

@router.delete("/api/users/{user_id}/workouts/{workout_id}")
async def delete_workout(user_id: str, workout_id: str):
    """Delete a workout for a user"""
    try:
        users_collection = await get_users_collection()
        db = users_collection.database
        
        result = await db["workouts"].delete_one(
            {"_id": ObjectId(workout_id), "user_id": user_id}
        )
        
        if result.deleted_count == 0:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Workout not found"
            )
        
        print(f"Workout deleted: {workout_id}")
        
        return {"message": "Workout deleted successfully"}
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )

# ==================== ADMIN ROUTES ====================

@router.post("/api/admins/signup", response_model=AdminWithToken)
async def signup_admin(admin: AdminCreate):
    """Admin signup endpoint"""
    admins_collection = await get_admins_collection()
    
    # Check if admin already exists
    existing_admin = await admins_collection.find_one({"email": admin.email})
    if existing_admin:
        print(f"Admin already exists with email: {admin.email}")
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email already registered"
        )
    
    # Hash password and create admin
    hashed_password = hash_password(admin.password)
    admin_doc = {
        "name": admin.name,
        "email": admin.email,
        "hashed_password": hashed_password,
        "created_at": datetime.utcnow(),
        "is_active": True
    }
    
    result = await admins_collection.insert_one(admin_doc)
    admin_id = str(result.inserted_id)
    
    print(f"Admin created successfully: {admin_id}")
    
    # Create token
    access_token = create_access_token(
        data={"sub": admin.email, "id": admin_id, "role": "admin"}
    )
    
    admin_response = AdminResponse(
        id=admin_id,
        name=admin.name,
        email=admin.email,
        created_at=admin_doc["created_at"],
        is_active=True
    )
    
    return {
        "admin": admin_response,
        "token": access_token,
        "token_type": "bearer",
        "role": "admin"
    }

@router.post("/api/admins/signin", response_model=AdminWithToken)
async def signin_admin(credentials: AdminSignin):
    """Admin signin endpoint"""
    admins_collection = await get_admins_collection()
    
    # Find admin by email
    admin = await admins_collection.find_one({"email": credentials.email})
    
    print(f"Admin signin attempt - Email: {credentials.email}")
    print(f"Admin found: {admin is not None}")
    
    if not admin:
        print(f"No admin found with email: {credentials.email}")
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password"
        )
    
    # Verify password
    password_valid = verify_password(credentials.password, admin["hashed_password"])
    print(f"Password valid: {password_valid}")
    
    if not password_valid:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password"
        )
    
    # Create token
    admin_id = str(admin["_id"])
    access_token = create_access_token(
        data={"sub": admin["email"], "id": admin_id, "role": "admin"}
    )
    
    admin_response = AdminResponse(
        id=admin_id,
        name=admin["name"],
        email=admin["email"],
        created_at=admin["created_at"],
        is_active=admin["is_active"]
    )
    
    print(f"Admin signin successful: {admin_id}")
    
    return {
        "admin": admin_response,
        "token": access_token,
        "token_type": "bearer",
        "role": "admin"
    }

@router.get("/api/admins/profile")
async def get_admin_profile():
    """Get authenticated admin profile"""
    return {"message": "Admin profile endpoint"}

# ==================== TRAINER ROUTES ====================

@router.post("/api/trainers/signup", response_model=TrainerWithToken)
async def signup_trainer(trainer: TrainerCreate):
    """Trainer signup endpoint"""
    trainers_collection = await get_trainers_collection()
    
    # Check if trainer already exists
    existing_trainer = await trainers_collection.find_one({"email": trainer.email})
    if existing_trainer:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email already registered"
        )
    
    # Hash password and create trainer
    hashed_password = hash_password(trainer.password)
    trainer_doc = {
        "name": trainer.name,
        "email": trainer.email,
        "hashed_password": hashed_password,
        "specialization": trainer.specialization,
        "created_at": datetime.utcnow(),
        "is_active": True
    }
    
    result = await trainers_collection.insert_one(trainer_doc)
    trainer_id = str(result.inserted_id)
    
    # Create token
    access_token = create_access_token(
        data={"sub": trainer.email, "id": trainer_id, "role": "trainer"}
    )
    
    trainer_response = TrainerResponse(
        id=trainer_id,
        name=trainer.name,
        email=trainer.email,
        specialization=trainer.specialization,
        created_at=trainer_doc["created_at"],
        is_active=trainer_doc["is_active"]
    )
    
    print(f"Trainer signup successful: {trainer_id}")
    
    return {
        "user": trainer_response,
        "token": access_token,
        "token_type": "bearer",
        "role": "trainer"
    }

@router.post("/api/trainers/signin", response_model=TrainerWithToken)
async def signin_trainer(credentials: TrainerSignin):
    """Trainer signin endpoint"""
    trainers_collection = await get_trainers_collection()
    
    # Find trainer by email
    trainer = await trainers_collection.find_one({"email": credentials.email})
    
    print(f"Trainer signin attempt - Email: {credentials.email}")
    print(f"Trainer found: {trainer is not None}")
    
    if not trainer:
        print(f"No trainer found with email: {credentials.email}")
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password"
        )
    
    # Verify password
    password_valid = verify_password(credentials.password, trainer["hashed_password"])
    print(f"Password valid: {password_valid}")
    
    if not password_valid:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password"
        )
    
    # Create token
    trainer_id = str(trainer["_id"])
    access_token = create_access_token(
        data={"sub": trainer["email"], "id": trainer_id, "role": "trainer"}
    )
    
    trainer_response = TrainerResponse(
        id=trainer_id,
        name=trainer["name"],
        email=trainer["email"],
        specialization=trainer.get("specialization"),
        created_at=trainer["created_at"],
        is_active=trainer["is_active"]
    )
    
    print(f"Trainer signin successful: {trainer_id}")
    
    return {
        "user": trainer_response,
        "token": access_token,
        "token_type": "bearer",
        "role": "trainer"
    }

@router.get("/api/trainers/profile")
async def get_trainer_profile():
    """Get authenticated trainer profile"""
    return {"message": "Trainer profile endpoint"}


