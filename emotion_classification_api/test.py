import os

def check_model_files(model_dir):
    """
    지정한 모델 디렉토리에 필요한 파일들이 모두 존재하는지 확인하는 함수.

    Parameters:
    - model_dir (str): 모델이 저장된 디렉토리 경로

    Returns:
    - None
    """
    # 현재 작업 디렉토리 출력 (상대 경로 문제 확인용)
    print(f"현재 작업 디렉토리: {os.getcwd()}")

    # 필요한 파일 목록 정의
    required_files = [
        'config.json',
        'model.safetensors',
        'special_tokens_map.json',
        'tokenizer.json',
        'tokenizer_config.json'
    ]

    # 누락된 파일을 저장할 리스트
    missing_files = []

    # 각 파일의 존재 여부 확인
    for file in required_files:
        file_path = os.path.join(model_dir, file)
        if not os.path.isfile(file_path):
            missing_files.append(file)

    # 결과 출력
    if missing_files:
        print("모델 디렉토리에 다음 파일들이 누락되었습니다:")
        for file in missing_files:
            print(f" - {file}")
    else:
        print("모델 디렉토리에 필요한 모든 파일이 존재합니다.")

if __name__ == "__main__":
    # 모델 디렉토리 경로 설정
    # 상대 경로 사용 예시: 현재 스크립트가 있는 디렉토리를 기준으로
    model_dir = "emotion_classification_model"  # 실제 모델 디렉토리로 수정하세요

    # 또는 절대 경로 사용 예시 (Windows)
    # model_dir = r"C:\Users\qsoqs\Desktop\emotion_classification_model"

    # 모델 디렉토리 존재 여부 확인
    if not os.path.exists(model_dir):
        print(f"지정한 모델 디렉토리 '{model_dir}'가 존재하지 않습니다. 경로를 확인해주세요.")
    else:
        # 파일 존재 여부 검사 함수 호출
        check_model_files(model_dir)
print(f"현재 작업 디렉토리: {os.getcwd()}")