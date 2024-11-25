# data_fetcher.py   원본 백업용
from database_service import get_user_preference, get_diary_info, get_chat_history

def fetch_user_data(user_email: str, croom_idx: int, session_idx: int) -> dict:
    """
    사용자 이메일과 채팅 방, 세션 인덱스를 기반으로 필요한 데이터를 가져옵니다.
    
    Args:
        user_email (str): 사용자의 이메일
        croom_idx (int): 채팅 방 인덱스
        session_idx (int): 세션 인덱스
    
    Returns:
        dict: 사용자 선호도, 일기 정보, 채팅 내역
    """
    try:
        user_preference = get_user_preference(user_email)
        diary_info = get_diary_info(user_email)
        chat_history = get_chat_history(croom_idx, session_idx)
        
        # 데이터가 None인 경우 기본 값 반환
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
