# openai_service.py

import os
from dotenv import load_dotenv
from langchain_openai.chat_models import ChatOpenAI

load_dotenv()

OPENAI_API_KEY = os.getenv("OPENAI_API_KEY")

llm = ChatOpenAI(
    model_name="gpt-4o-mini-2024-07-18",
    temperature=0.7,
    openai_api_key=OPENAI_API_KEY,
)
