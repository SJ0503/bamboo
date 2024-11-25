# prompt_builder.py

def build_system_prompt(user_preference: str, diary_info: str, emotion_ratios: dict, emotion_keyword: str) -> str:
    try:
        emotion_text = ", ".join([f"{emotion}: {ratio}" for emotion, ratio in emotion_ratios.items()])
        system_prompt = (
            f"당신은 {user_preference} 스타일의 공감적인 챗봇입니다.\n"
            f"사용자의 일기 정보:\n{diary_info}\n"
            f"사용자의 현재 감정 비율:\n{emotion_text}\n"
            f"특수 감정 키워드: {emotion_keyword}\n"
        )
        print("System Prompt with Keyword Generated Successfully")
        return system_prompt
    except Exception as e:
        print("Error in build_system_prompt:", e)
        raise

def build_messages(memory_messages: list, current_user_message: str) -> list:
    from langchain.schema import HumanMessage, AIMessage

    messages = memory_messages.copy()
    messages.append(HumanMessage(content=current_user_message))
    print("Messages Built Successfully:", messages)
    return messages

def get_combined_prompt(user_preference: str, diary_info: str, emotion_ratios: dict, memory_messages: list, current_user_message: str, emotion_keyword: str = None) -> list:
    try:
        system_prompt = build_system_prompt(user_preference, diary_info, emotion_ratios, emotion_keyword)
        messages = build_messages(memory_messages, current_user_message)
        combined_messages = [SystemMessage(content=system_prompt)] + messages
        print("Combined Prompt Generated Successfully")
        return combined_messages
    except Exception as e:
        print("Error in get_combined_prompt:", e)
        raise


def build_system_prompt_with_keyword(user_preference: str, diary_info: str, emotion_ratios: dict, emotion_keyword: str) -> str:
    try:
        emotion_text = ", ".join([f"{emotion}: {ratio}" for emotion, ratio in emotion_ratios.items()])
        system_prompt = (
            f"당신은 {user_preference} 스타일의 공감적인 챗봇입니다.\n"
            f"사용자의 일기 정보:\n{diary_info}\n"
            f"사용자의 현재 감정 비율:\n{emotion_text}\n"
            f"특수 감정 키워드: {emotion_keyword}\n"
        )
        print("System Prompt with Keyword Generated Successfully")
        return system_prompt
    except Exception as e:
        print("Error in build_system_prompt_with_keyword:", e)
        raise

