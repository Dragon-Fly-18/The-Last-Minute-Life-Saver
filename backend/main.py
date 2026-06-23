# from fastapi import FastAPI
# from fastapi.middleware.cors import CORSMiddleware
# from fastapi.responses import JSONResponse
# from gemini import ask_gemini


# app = FastAPI()


# # React frontend connection allow
# app.add_middleware(
#     CORSMiddleware,
#     allow_origins=["*"],
#     allow_credentials=True,
#     allow_methods=["*"],
#     allow_headers=["*"],
# )


# # Test backend
# @app.get("/")
# def home():
#     return {
#         "message": "AI Life Saver Backend Running 🚀"
#     }


# # Gemini AI test
# @app.get("/ai")
# def ai_test():

#     result = ask_gemini(
#         "Create a productivity plan for a student who has assignments and exams"
#     )

#     # If the result is an error string, return a 503 so the frontend knows
#     if result.startswith("Error:"):
#         return JSONResponse(
#             status_code=503,
#             content={"error": result}
#         )

#     return {
#         "AI response": result
#     }

from fastapi import FastAPI
from gemini import ask_gemini

app = FastAPI()


@app.get("/")
def home():
    return {
        "message": "Backend working"
    }


@app.get("/ai")
def ai_test():

    result = ask_gemini(
        "Create a productivity plan for a student who has assignments and exams"
    )

    return {
        "AI response": result
    }