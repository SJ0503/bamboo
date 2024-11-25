from fastapi import FastAPI, HTTPException, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from pydantic import BaseModel
from threading import Thread
import uvicorn
from pyngrok import ngrok
from emotion_model import predict_with_probabilities
from data_fetcher import fetch_user_data
from keyword_extractor import extract_emotion_keyword
from memory_manager import get_session_memory, update_session_memory
from langchain.schema import HumanMessage, AIMessage, SystemMessage
from openai_service import llm
from data_fetcher import fetch_user_data, fetch_chat_data_and_generate_wordcloud

import os
from config import static_dir  # static_dir 임포트

# FastAPI 앱 생성
app = FastAPI()

# CORS 설정
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # 특정 도메인으로 제한 가능
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

script_dir = os.path.dirname(os.path.abspath(__file__))
static_dir = os.path.join(script_dir, "static")

# 정적 파일 제공 설정
app.mount("/static", StaticFiles(directory=static_dir), name="static")
print(f"Static directory path: {static_dir}")

# 입력 데이터 모델 정의
class EmotionRequest(BaseModel):
    user_email: str
    croom_idx: int
    session_idx: int
    first_user_message: str
    previous_message: str
    current_user_message: str

# 워드클라우드 요청 모델 정의
class WordCloudRequest(BaseModel):
    croom_idx: int

def load_prompt(user_preference):
    base_prompt_path = "emotion_classification_api/prompts/base_prompt.txt"
    with open(base_prompt_path, "r", encoding="utf-8") as file:
        base_prompt = file.read()

    additional_prompt = ""
    additional_prompt_path = f"emotion_classification_api/prompts/chat_style_{user_preference}.txt"
    if os.path.exists(additional_prompt_path):
        with open(additional_prompt_path, "r", encoding="utf-8") as file:
            additional_prompt = file.read()

    combined_prompt = f"{base_prompt}\n{additional_prompt}"
    return combined_prompt

# 워드클라우드 생성 엔드포인트
@app.post("/generate_wordcloud")
async def generate_wordcloud(request: Request, request_data: WordCloudRequest):
    try:
        croom_idx = request_data.croom_idx
        image_path = fetch_chat_data_and_generate_wordcloud(croom_idx)
        image_filename = os.path.basename(image_path)
        base_url = str(request.base_url).rstrip("/")
        image_url = f"{base_url}/static/wordclouds/{image_filename}"

        return {"wordcloud_url": image_url}

    except ValueError as ve:
        raise HTTPException(status_code=404, detail=str(ve))
    except Exception as e:
        print(f"Error generating word cloud: {e}")
        raise HTTPException(status_code=500, detail="Internal Server Error")

# 모델 예측 API 엔드포인트 정의
@app.post("/predict")
async def predict(request: EmotionRequest):
    try:
        # Step 1: 사용자 데이터 페칭
        user_data = fetch_user_data(request.user_email, request.croom_idx, request.session_idx)
        print("Fetched User Data:", user_data)
        user_preference = user_data.get("user_preference", "Default preference")
        diary_info = user_data.get("diary_info", "No diary information available.")

        # Step 2: 메모리에서 세션 메모리 가져오기 또는 초기화
        chat_history = user_data.get("chat_history", [])
        memory = get_session_memory(request.croom_idx, request.session_idx, chat_history)
        print("Memory state for session:", f"{request.croom_idx}_{request.session_idx}")
        for msg in memory.chat_memory.messages:
            print(f"Role: {msg.type}, Content: {msg.content}")

        # Step 3: 사용자 선호도 기반 프롬프트 로드
        base_prompt = load_prompt(user_preference)
        print("Loaded Base Prompt:", base_prompt)

        # Step 4: 감정 분류
        emotion_ratios = predict_with_probabilities(
            request.first_user_message, request.previous_message, request.current_user_message
        )
        print("Emotion Ratios:", emotion_ratios)

        # Step 5: 특수 감정 키워드 추출
        emotion_keyword = extract_emotion_keyword(emotion_ratios)
        if not emotion_keyword:
            emotion_keyword = "neutral"
        print("Emotion Keyword:", emotion_keyword)

        # Step 6: 시스템 프롬프트 및 메시지 생성
        system_prompt = (
            f"{base_prompt}\n"
            "당신의 이름은 Bamboo이며, 20대 혹은 30대의 친구같은 어시트턴트입니다.\n"
            f"일기 정보: {diary_info}\n"
            f"감정 비율: {emotion_ratios}\n"
            f"감정 키워드: {emotion_keyword}\n"
            "해당 정보를 user_information 섹션을 참고해 활용하여 적절하게 응답해 주세요."
        )

        print("System Prompt:")
        print(system_prompt)

        # 메시지 리스트 생성
        messages = []
        # 시스템 메시지 추가
        messages.append(SystemMessage(content=system_prompt))

        # 이전 대화 내역 메시지 추가
        for msg in memory.chat_memory.messages:
            if msg.type == "human":
                messages.append(HumanMessage(content=msg.content))
            elif msg.type == "ai":
                messages.append(AIMessage(content=msg.content))

        # 현재 사용자 메시지 추가
        current_user_message = HumanMessage(content=request.current_user_message)
        messages.append(current_user_message)

        # LLM 호출
        bot_response = llm(messages)
        print("Bot Response:", bot_response.content)

        # Step 7: 메모리에 사용자 및 봇 응답 추가
        update_session_memory(request.croom_idx, request.session_idx, "user", request.current_user_message)
        update_session_memory(request.croom_idx, request.session_idx, "assistant", bot_response.content)

        # 응답 데이터 생성
        response_data = {
            "current_emotion_probabilities": emotion_ratios,
            "emotion_keyword": emotion_keyword,
            "bot_response": bot_response.content
        }
        return response_data

    except Exception as e:
        print("Unhandled Error:", e)
        raise HTTPException(status_code=500, detail=f"Error generating bot response: {e}")

# 테스트 엔드포인트 추가
@app.get("/test")
async def test():
    try:
        from database_service import engine
        connection = engine.connect()
        connection.close()
        return {"message": "FastAPI 서버 및 데이터베이스 연결이 정상입니다."}
    except Exception as e:
        return {"error": "데이터베이스 연결 실패", "details": str(e)}

# FastAPI 서버 실행 함수 정의
def start_fastapi():
    uvicorn.run(app, host="0.0.0.0", port=8001)

# FastAPI 서버를 백그라운드에서 실행
server_thread = Thread(target=start_fastapi)
server_thread.start()

# ngrok을 사용해 8001번 포트를 외부에서 접근 가능하도록 설정
public_url = ngrok.connect(8001)
print("FastAPI 서버가 실행 중입니다. 다음 주소로 접근하세요:", public_url)

# 워드클라우드용 FastAPI 서버 URL을 반환하는 API
@app.get("/server_url")
async def get_server_url():
    return {"server_url": public_url}
