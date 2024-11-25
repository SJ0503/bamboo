from langchain.memory import ConversationBufferMemory
from collections import defaultdict
import os

# 환경 변수에서 API 키 가져오기
OPENAI_API_KEY = os.getenv("OPENAI_API_KEY")

# 세션별 메모리를 저장할 딕셔너리
session_memories = defaultdict(lambda: ConversationBufferMemory(
    return_messages=True,
    input_key="input",
    output_key="output"
))

def get_session_memory(croom_idx: int, session_idx: int, chat_history: list = None, chatbot_name: str = None):
    session_id = f"{croom_idx}_{session_idx}"
    memory = session_memories[session_id]

    if not memory.chat_memory.messages:
        # 메모리가 비어 있을 때만 초기화
        if chat_history:
            for chatter, msg in chat_history:
                if chatter == "user":
                    memory.chat_memory.add_user_message(msg)
                elif chatter in ["bot", "assistant"]:
                    memory.chat_memory.add_ai_message(msg)

    return memory

def update_session_memory(croom_idx: int, session_idx: int, role: str, message: str):
    session_id = f"{croom_idx}_{session_idx}"
    memory = session_memories[session_id]

    if role == "user":
        memory.chat_memory.add_user_message(message)
    elif role == "assistant":
        memory.chat_memory.add_ai_message(message)

def clear_session_memory(croom_idx: int, session_idx: int):
    session_id = f"{croom_idx}_{session_idx}"
    if session_id in session_memories:
        del session_memories[session_id]
