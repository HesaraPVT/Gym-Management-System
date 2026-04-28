import os
import fitz  # PyMuPDF
import docx
import requests
import json

# ---- OLLAMA Setup ----
OLLAMA_API_URL = "http://localhost:11434/api/generate"

# ---- LangChain new imports ----
from langchain_community.embeddings import HuggingFaceEmbeddings
from langchain_chroma import Chroma
from langchain_text_splitters import RecursiveCharacterTextSplitter
from langchain_ollama import OllamaLLM

from langchain_core.prompts import ChatPromptTemplate
from langchain_core.runnables import RunnableParallel, RunnablePassthrough

# Load Mistral model via Ollama
llm = OllamaLLM(model="mistral")

# Embedding model
embedding_model = HuggingFaceEmbeddings(model_name="sentence-transformers/all-mpnet-base-v2")


# ---------------------------
# JSON TO TEXT CONVERSION
# ---------------------------

def convert_json_to_text(json_str):
    """Convert JSON data to plain text format"""
    try:
        # Try to parse JSON
        data = json.loads(json_str)
        return format_json_as_text(data)
    except:
        # Not JSON, return as-is
        return json_str


def format_json_as_text(obj, indent=0):
    """Recursively format JSON object as plain text"""
    text = ""
    prefix = "  " * indent
    
    if isinstance(obj, dict):
        for key, value in obj.items():
            if isinstance(value, (dict, list)):
                text += f"{prefix}{key}:\n"
                text += format_json_as_text(value, indent + 1)
            else:
                text += f"{prefix}{key}: {value}\n"
    elif isinstance(obj, list):
        for i, item in enumerate(obj):
            if isinstance(item, (dict, list)):
                text += f"{prefix}Item {i + 1}:\n"
                text += format_json_as_text(item, indent + 1)
            else:
                text += f"{prefix}- {item}\n"
    else:
        text += f"{prefix}{obj}\n"
    
    return text


# ---------------------------
# DOCUMENT PROCESSING
# ---------------------------

def extract_text_from_pdf(path):
    """Extract text from PDF"""
    text = ""
    try:
        doc = fitz.open(path)
        for page in doc:
            text += page.get_text("text") + "\n"
    except Exception as e:
        print(f"PDF Error: {e}")
    return text


def extract_text_from_word(path):
    """Extract text from DOCX"""
    text = ""
    try:
        doc = docx.Document(path)
        for para in doc.paragraphs:
            text += para.text + "\n"
    except Exception as e:
        print(f"DOCX Error: {e}")
    return text


def extract_text_from_txt(path):
    """Extract text from TXT"""
    try:
        with open(path, "r", encoding="utf-8") as f:
            return f.read()
    except Exception as e:
        print(f"TXT Error: {e}")
        return ""


def extract_text(file_path):
    """Auto-detect file type"""
    if file_path.endswith(".pdf"):
        return extract_text_from_pdf(file_path)
    elif file_path.endswith(".docx"):
        return extract_text_from_word(file_path)
    elif file_path.endswith(".txt"):
        return extract_text_from_txt(file_path)
    else:
        print("Unsupported file:", file_path)
        return ""


def process_document(file_path):
    """Extract + Convert JSON to text + Chunk text"""
    text = extract_text(file_path)
    if not text:
        return None

    # Convert JSON to plain text if needed
    text = convert_json_to_text(text)
    
    splitter = RecursiveCharacterTextSplitter(chunk_size=500, chunk_overlap=50)
    return splitter.split_text(text)


# ---------------------------
# CHROMA DB FUNCTIONS
# ---------------------------

def store_embeddings(texts, db_path="chroma_db"):
    vectorstore = Chroma(
        collection_name="documents",
        embedding_function=embedding_model,
        persist_directory=db_path
    )
    vectorstore.add_texts(texts)
    print("✅ Embeddings stored.")


def search_documents(query, db_path="chroma_db"):
    vectorstore = Chroma(
        collection_name="documents",
        embedding_function=embedding_model,
        persist_directory=db_path
    )

    results = vectorstore.similarity_search(query, k=3)
    return results


# ---------------------------
# RETRIEVAL + GENERATION (Runnable-based)
# ---------------------------

def format_docs(docs):
    """Format retrieved documents into a single string"""
    if not docs:
        return ""
    
    formatted = []
    for doc in docs:
        # Handle both Document objects and strings
        if hasattr(doc, 'page_content'):
            formatted.append(doc.page_content)
        else:
            formatted.append(str(doc))
    
    return "\n\n".join(formatted)


def build_retrieval_chain(db_path="chroma_db"):
    vectorstore = Chroma(
        collection_name="documents",
        embedding_function=embedding_model,
        persist_directory=db_path
    )
    retriever = vectorstore.as_retriever(search_kwargs={"k": 3})

    prompt = ChatPromptTemplate.from_template("""
You are a fitness assistant. Use ONLY the provided information to answer questions.

Context information:
{context}

User question: {question}

Instructions:
- Answer directly without saying "based on context" or "according to the information provided"
- Start with the answer itself
- Be concise and practical
- If the context doesn't contain enough information, say "I don't have that information"
""")

    chain = (
        RunnableParallel({
            "context": retriever | format_docs,
            "question": RunnablePassthrough()
        })
        | prompt
        | llm
    )

    return chain


def search_and_summarize(query, db_path="chroma_db"):
    chain = build_retrieval_chain(db_path)
    try:
        response = chain.invoke(query)
        print("\n💡 AI Response:")
        print(response)
    except Exception as e:
        print(f"Error during chain invocation: {e}")


def generate_ai_response(context, question):
    """Manual API call to Ollama"""
    prompt = f"""
Context:
{context}

Question:
{question}
"""
    payload = {"model": "mistral", "prompt": prompt, "stream": False}
    r = requests.post(OLLAMA_API_URL, json=payload)
    return r.json().get("response", "No response.")


# ---------------------------
# MAIN EXECUTION
# ---------------------------

if __name__ == "__main__":
    sample_file = "sample.pdf"  # Put your document path here

    # Extract + Chunk + Store embeddings
    texts = process_document(sample_file)
    if texts:
        store_embeddings(texts)

    # Prompt user for query and perform retrieval+generation
    user_query = input("Enter your search query: ")
    search_and_summarize(user_query)
