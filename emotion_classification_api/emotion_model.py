import torch
from transformers import AutoTokenizer, AutoModelForSequenceClassification
import os

# 디바이스 설정
device = torch.device('cuda' if torch.cuda.is_available() else 'cpu')

# 수동 레이블 매핑 정의
label_mapping = {'공포': 0, '놀람': 1, '분노': 2, '슬픔': 3, '중립': 4, '행복': 5, '혐오': 6}
label_index_to_name = {v: k for k, v in label_mapping.items()}

# 토크나이저 로드
model_dir = "emotion_classification_api/emotion_classification_model"
tokenizer = AutoTokenizer.from_pretrained(model_dir)

# 특별 토큰 정의 (훈련 시 추가된 토큰과 동일하게 설정)
special_tokens = ['[CLS]', '[SEP]', '[SPEAKER_A]', '[SPEAKER_B]', '[FIRST]', '[NO_PREV]']
special_tokens_dict = {'additional_special_tokens': special_tokens}
tokenizer.add_special_tokens(special_tokens_dict)

# 모델 로드
model = AutoModelForSequenceClassification.from_pretrained(model_dir, num_labels=len(label_mapping))
model.to(device)
model.eval()  # 평가 모드로 전환

def predict_with_probabilities(first_sentence, previous_sentence, current_sentence, speaker='A'):
    """
    세 가지 문장과 화자 정보를 입력받아 각 감정 레이블에 대한 확률 값을 반환하는 함수.

    Parameters:
    - first_sentence (str): 첫 번째 문장
    - previous_sentence (str): 이전 문장
    - current_sentence (str): 현재 문장
    - speaker (str): 화자 ('A' 또는 'B')

    Returns:
    - label_probs (dict): 각 감정 레이블과 그에 대한 확률을 포함한 dict
    """
    # 화자 토큰 설정
    speaker_token = '[SPEAKER_A]' if speaker.upper() == 'A' else '[SPEAKER_B]'

    # 입력 시퀀스 생성
    if first_sentence == '[NO_FIRST]' and previous_sentence == '[NO_PREV]':
        input_sequence = f"[CLS] [FIRST] {speaker_token} {current_sentence} [SEP]"
    elif first_sentence == '[NO_FIRST]':
        input_sequence = f"[CLS] [FIRST] {speaker_token} {current_sentence} [SEP] {previous_sentence} [SEP]"
    else:
        input_sequence = f"[CLS] [FIRST] {first_sentence} [SEP] {previous_sentence} [SEP] {speaker_token} {current_sentence} [SEP]"

    # 토큰화
    encoded_dict = tokenizer(
        input_sequence,
        add_special_tokens=False,  
        max_length=256,           
        padding='max_length',
        truncation=True,
        return_tensors='pt'
    )

    input_ids = encoded_dict['input_ids'].to(device)
    attention_mask = encoded_dict['attention_mask'].to(device)

    # 모델 예측
    with torch.no_grad():
        outputs = model(input_ids, attention_mask=attention_mask)
        logits = outputs.logits

    # 소프트맥스 적용하여 확률 계산
    probabilities = torch.softmax(logits, dim=1).squeeze().tolist()

    # 레이블과 확률을 매핑하여 딕셔너리 생성
    label_probs = {label: round(prob, 3) for label, prob in zip(label_mapping.keys(), probabilities)}

    return label_probs