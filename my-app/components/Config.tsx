// 기본 IP 주소 설정
const Addr = "110.0.53.97";  // 필요 시 Add 값을 수정할 수 있음

// 워드 클라우드 주소
const WordCloudAddr = "https://1952-121-147-12-202.ngrok-free.app/predict";

// API 주소 설정
export const serverAddress = `http://${Addr}:8082`;
r
// 워드클라우드 주소
export const WCAddr = WordCloudAddr.replace('predict', 'generate_wordcloud');