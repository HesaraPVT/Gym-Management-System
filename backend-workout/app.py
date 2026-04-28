from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import os
import re

# Import document loader utilities
from document_loader import process_document, build_retrieval_chain, store_embeddings

# Initialize FastAPI
app = FastAPI(title="Mistral AI-powered Search API")

# Add CORS middleware to allow requests from frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://127.0.0.1:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Request schema
class QueryRequest(BaseModel):
    query: str

# Global variable to store the retrieval chain
qa_chain = None


def clean_response_text(text):
    """Remove boilerplate lead-ins so responses start directly with the answer."""
    cleaned = text.strip()
    leadin_patterns = [
        r"^\s*based on (the )?(provided )?context[,\s:.-]*",
        r"^\s*according to (the )?(provided )?context[,\s:.-]*",
        r"^\s*from (the )?(provided )?context[,\s:.-]*",
        r"^\s*given (the )?(provided )?context[,\s:.-]*",
    ]

    for pattern in leadin_patterns:
        cleaned = re.sub(pattern, "", cleaned, flags=re.IGNORECASE)

    cleaned = re.sub(r"^\s*[,\-:.]+\s*", "", cleaned)
    return cleaned.strip()

# Initialize embeddings from PDF on startup
def initialize_embeddings():
    """Load and process sample.pdf on startup"""
    global qa_chain
    
    sample_file = "sample.pdf"
    
    if not os.path.exists(sample_file):
        print(f"❌ ERROR: {sample_file} not found!")
        return False
    
    try:
        print(f"📄 Processing {sample_file}...")
        
        # Extract + Chunk + Store embeddings
        texts = process_document(sample_file)
        
        if not texts:
            print("❌ No text extracted from PDF!")
            return False
        
        print(f"✂️ Split into {len(texts)} chunks")
        store_embeddings(texts)
        
        # Build retrieval chain
        qa_chain = build_retrieval_chain()
        print("✅ Embeddings initialized and retrieval chain ready!")
        return True
    except Exception as e:
        print(f"❌ Error initializing embeddings: {e}")
        return False

# API endpoint for querying
@app.post("/query")
async def search_and_generate_response(request: QueryRequest):
    try:
        if qa_chain is None:
            raise HTTPException(status_code=500, detail="Embeddings not initialized. Make sure sample.pdf exists.")
        
        print(f"🔍 Processing query: {request.query}")
        response = qa_chain.invoke(request.query)
        cleaned_response = clean_response_text(str(response))
        print(f"✅ Response generated: {cleaned_response}")
        # Return plain text response only, not JSON
        return {"query": request.query, "response": cleaned_response}
    except Exception as e:
        print(f"❌ Error in /query endpoint: {e}")
        import traceback
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/")
async def home():
    return {"message": "Mistral AI-powered search API is running!", "pdf": "sample.pdf"}

# Run the server
if __name__ == "__main__":
    import uvicorn
    
    # Initialize embeddings before starting server
    initialize_embeddings()
    
    uvicorn.run(app, host="127.0.0.1", port=8000)
