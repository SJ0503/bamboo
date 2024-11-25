# database_service.py

import os
from sqlalchemy import create_engine, text
from dotenv import load_dotenv

# .env 파일 로드
load_dotenv()

# 환경 변수에서 데이터베이스 연결 정보 가져오기
DB_HOST = os.getenv("DB_HOST")
DB_PORT = os.getenv("DB_PORT")
DB_USER = os.getenv("DB_USER")
DB_PASSWORD = os.getenv("DB_PASSWORD")
DB_NAME = os.getenv("DB_NAME")

db_url = f"mysql+pymysql://{DB_USER}:{DB_PASSWORD}@{DB_HOST}:{DB_PORT}/{DB_NAME}"
engine = create_engine(db_url)

# 사용자 선호 답변 스타일 가져오기 함수
def get_user_preference(user_email):
    try:
        with engine.connect() as connection:
            query = text("SELECT chatbot_type FROM user_tb WHERE user_email = :user_email")
            result = connection.execute(query, {"user_email": user_email}).mappings().fetchone()
            return result['chatbot_type'] if result else None
    except Exception as e:
        print(f"Error in get_user_preference: {e}")
        return None

# 사용자 일기 정보 가져오기 함수
def get_diary_info(user_email):
    try:
        with engine.connect() as connection:
            query = text("SELECT created_at, diary_content, emotion_tag FROM diary_tb WHERE user_email = :user_email")
            results = connection.execute(query, {"user_email": user_email}).mappings().fetchall()
            diary_entries = [
                f"작성일: {entry['created_at']}, 내용: {entry['diary_content']}, 감정 태그: {entry['emotion_tag']}" for entry in results
            ]
            return "\n".join(diary_entries) if diary_entries else "No diary entries available."
    except Exception as e:
        print(f"Error in get_diary_info: {e}")
        return "No diary entries available."

# 채팅 내역 가져오기 함수
def get_chat_history(croom_idx, session_idx):
    try:
        with engine.connect() as connection:
            query = text("SELECT chatter, chat_content FROM chatting_tb WHERE croom_idx = :croom_idx AND session_idx = :session_idx ORDER BY chat_idx ASC")
            results = connection.execute(query, {"croom_idx": croom_idx, "session_idx": session_idx}).mappings().fetchall()
            chat_history = [(row['chatter'], row['chat_content']) for row in results]
            return chat_history
    except Exception as e:
        print(f"Error in get_chat_history: {e}")
        return []

# croom_idx만으로 모든 세션의 채팅 내역 가져오기 함수
def get_chat_history_by_croom(croom_idx):
    try:
        with engine.connect() as connection:
            # chatter가 'bot'인 데이터와 emotion_keyword 가져오기
            query = text("""
                SELECT chatter, chat_content, emotion_keyword
                FROM chatting_tb
                WHERE croom_idx = :croom_idx AND chatter = 'bot'
                ORDER BY chat_idx ASC
            """)
            results = connection.execute(query, {"croom_idx": croom_idx}).mappings().fetchall()
            
            # 반환 데이터 디버깅
            print(f"Raw results fetched: {results}")

            # emotion_keyword가 없는 경우 기본값 추가
            chat_history = [
                (row['chatter'], row['chat_content'], row.get('emotion_keyword', ''))
                for row in results
            ]

            # 디버깅: 반환된 데이터 확인
            print(f"Chat history fetched (bot): {chat_history}")

            return chat_history
    except Exception as e:
        print(f"Error in get_chat_history_by_croom: {e}")
        return []
