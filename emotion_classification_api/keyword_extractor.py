# keyword_extractor.py
import numpy as np
import pandas as pd
from typing import Dict, List

# 엑셀 파일 경로 및 데이터 로드
excel_path = 'emotion_classification_api/emotion_words.csv'
try:
    emotion_df = pd.read_csv(excel_path)
    if emotion_df is None or emotion_df.empty:
        raise ValueError("Emotion DataFrame is empty or not loaded correctly.")
    # V, A, D 열 확인
    required_columns = {"V", "A", "D", "감정단어"}
    if not required_columns.issubset(emotion_df.columns):
        raise ValueError("Emotion DataFrame does not contain the required columns: V, A, D, 감정단어.")
except Exception as e:
    raise ValueError(f"Error loading emotion words Excel file: {e}")

# 감정별 V, A, D 값 설정
emotion_vectors = {
    "공포": [0.073, 0.84, 0.293],
    "슬픔": [0.052, 0.288, 0.164],
    "놀람": [0.875, 0.875, 0.562],
    "혐오": [0.052, 0.775, 0.317],
    "행복": [1.0, 0.735, 0.772],
    "분노": [0.082, 0.888, 0.658],
    "중립": [0.5, 0.5, 0.5]
}

def extract_emotion_keyword(emotion_ratios: Dict[str, float]) -> str:
    """
    감정 비율 정보를 바탕으로 가장 유사한 감정 단어를 추출합니다.
    
    Args:
        emotion_ratios (dict): 감정 확률 정보
    
    Returns:
        str: 가장 유사한 감정 단어
    """
    # 가중치 합 벡터 계산 함수
    def calculate_weighted_emotion_vector(emotion_probs: Dict[str, float], emotion_vectors: Dict[str, List[float]]) -> List[float]:
        weighted_vector = [0.0, 0.0, 0.0]
        for emotion, prob in emotion_probs.items():
            if emotion in emotion_vectors:
                weighted_vector = [wv + ev * prob for wv, ev in zip(weighted_vector, emotion_vectors[emotion])]
        return weighted_vector

    # V, A, D 값을 기반으로 가장 유사한 감정 단어 찾기 함수
    def find_closest_emotion_words(target_vector, emotion_df, k=5):
        distances = []
        try:
            for _, row in emotion_df.iterrows():
                vad_vector = np.array([row["V"], row["A"], row["D"]])
                distance = np.linalg.norm(target_vector - vad_vector)
                distances.append((row["감정단어"], distance))
        except KeyError as e:
            raise KeyError(f"Missing required VAD columns in the DataFrame: {e}")
        closest_words = sorted(distances, key=lambda x: x[1])[:k]
        if not closest_words:
            print("Warning: No closest words found. The distances list is empty.")
        return closest_words


    # DB에서 가장 유사한 감정 단어 찾기
    def find_most_similar_emotion_word(target_vector: List[float]) -> str:
        closest_emotions = find_closest_emotion_words(target_vector, emotion_df, k=1)
        if not closest_emotions:  # 빈 리스트일 경우
            print("Warning: No closest emotions found. Returning default emotion.")
            return "Default Emotion"  # 기본 감정 단어 반환
        if len(closest_emotions[0]) < 2:
            print("Warning: Unexpected structure in closest_emotions. Returning default emotion.")
            return "Default Emotion"  # 리스트 구조가 잘못된 경우 기본 값 반환
        return closest_emotions[0][0]  # 가장 유사한 감정 단어 반환


    try:
        # 가중합 벡터 계산
        target_vector = calculate_weighted_emotion_vector(emotion_ratios, emotion_vectors)
        # 디버깅용 출력
        print("Calculated Target Vector:", target_vector)
        
        # 가장 유사한 감정 단어 찾기
        most_similar_emotion = find_most_similar_emotion_word(target_vector)
    except Exception as e:
        raise ValueError(f"Error in emotion keyword extraction: {e}")

    return most_similar_emotion

"""
# 예시로 감정 비율을 테스트
emotion_ratios = {"공포": 0.3, "슬픔": 0.2, "행복": 0.5}  # 예시 감정 비율
try:
    most_similar_emotion = extract_emotion_keyword(emotion_ratios)
    print(f"가장 유사한 감정 단어: {most_similar_emotion}")
except Exception as e:
    print(f"An error occurred: {e}")
"""