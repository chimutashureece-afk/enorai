from fastapi import FastAPI
from app.pipeline.orchestrator import LLMPipeline

app = FastAPI()

pipeline = LLMPipeline()

@app.get("/")
def read_root():
    return {"message": "EnorAI API is running!"}

# API Endpoint
@app.post("/chat")
def chat(data: dict):
    user_message = data.get("message", "")
    if not user_message:
        return {"error": "No message provided"}
    
    result = pipeline.run(user_message)
    return {
        "response": result.get("response"),
        "trust_score": result.get("score")
    }