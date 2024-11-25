# data_fetcher.py
from database_service import get_user_preference, get_diary_info, get_chat_history, get_chat_history_by_croom
from wordcloud import WordCloud
import os
from config import static_dir  # static_dir 임포트


def fetch_user_data(user_email: str, croom_idx: int, session_idx: int) -> dict:
    try:
        user_preference = get_user_preference(user_email)
        diary_info = get_diary_info(user_email)
        chat_history = get_chat_history(croom_idx, session_idx)

        return {
            "user_preference": user_preference or "Default preference",
            "diary_info": diary_info or "No diary information available.",
            "chat_history": chat_history or []
        }
    except Exception as e:
        print(f"Error in fetch_user_data: {e}")
        return {
            "user_preference": "Default preference",
            "diary_info": "No diary information available.",
            "chat_history": []
        }

def load_chat_history_from_db(croom_idx: int, session_idx: int):
    """
    데이터베이스에서 채팅 기록을 불러옵니다.
    
    Args:
        croom_idx (int): 채팅 방 인덱스
        session_idx (int): 세션 인덱스
    
    Returns:
        list: 이전 채팅 기록 [(chatter, msg), ...]
    """
    chat_history = get_chat_history(croom_idx, session_idx)
    if not chat_history:
        return []
    
    # 반환된 형식이 올바른지 확인 ([(chatter, msg), ...] 형태)
    return chat_history

# 워드 클라우드를 생성하고 이미지 파일로 저장하는 함수
def fetch_chat_data_and_generate_wordcloud(croom_idx: int) -> str:
    try:
        print(f"Static directory path in fetcher.py: {static_dir}")

        # croom_idx에 해당하는 bot의 채팅 기록 가져오기
        chat_history = get_chat_history_by_croom(croom_idx)
        if not chat_history:
            raise ValueError("No chat history available for the given croom_idx.")

        # emotion_keyword만 추출하여 텍스트로 결합
        emotion_keywords = " ".join([entry[2] for entry in chat_history if entry[2]])  # entry[2]는 emotion_keyword
        if not emotion_keywords.strip():
            raise ValueError("No emotion keywords found for the given chat history.")

        # 워드 클라우드 생성
        wordcloud = WordCloud(
            width=800,
            height=400,
            font_path="c:/Windows/Fonts/malgun.ttf",
            background_color='white'
        ).generate(emotion_keywords)

        # 워드클라우드 이미지 저장
        wordcloud_dir = os.path.join(static_dir, "wordclouds")
        os.makedirs(wordcloud_dir, exist_ok=True)
        image_path = os.path.join(wordcloud_dir, f"wordcloud_{croom_idx}.jpg")
        wordcloud.to_file(image_path)

        print(f"Word cloud image path: {image_path}")
        return image_path

    except Exception as e:
        print(f"Error generating wordcloud: {e}")
        raise ValueError("Failed to generate wordcloud")
