import os
import requests
from dotenv import load_dotenv

load_dotenv()

URL = os.getenv("API_URL", "http://127.0.0.1:5000/data")

test_data = [
    {"name": "Ana", "age": 25, "city": "São Paulo"},
    {"name": "João", "age": 30, "city": "Rio de Janeiro"},
    {"name": "Maria", "age": 28, "city": "Belo Horizonte"},
    {"name": "Pedro", "age": 35, "city": "Curitiba"},
    {"name": "Paula", "age": 22, "city": "Porto Alegre"},
    {"name": "Lucas", "age": 32, "city": "Salvador"},
    {"name": "Carla", "age": 27, "city": "Fortaleza"},
    {"name": "Rafael", "age": 38, "city": "Manaus"},
    {"name": "Tatiane", "age": 29, "city": "Goiânia"},
    {"name": "Felipe", "age": 33, "city": "Belém"},
    {"name": "Ana", "age": 25, "city": "São Paulo"},
    {"name": "João", "age": 30, "city": "Rio de Janeiro"},
    {"name": "Maria", "age": 28, "city": "Belo Horizonte"},
    {"name": "Pedro", "age": 35, "city": "Curitiba"},
    {"name": "Paula", "age": 22, "city": "Porto Alegre"},
    {"name": "Lucas", "age": 32, "city": "Salvador"},
    {"name": "Carla", "age": 27, "city": "Fortaleza"},
    {"name": "Rafael", "age": 38, "city": "Manaus"},
    {"name": "Tatiane", "age": 29, "city": "Goiânia"},
    {"name": "Felipe", "age": 33, "city": "Belém"},
    {"name": "Ana", "age": 25, "city": "São Paulo"},
    {"name": "João", "age": 30, "city": "Rio de Janeiro"},
    {"name": "Maria", "age": 28, "city": "Belo Horizonte"},
    {"name": "Pedro", "age": 35, "city": "Curitiba"},
    {"name": "Paula", "age": 22, "city": "Porto Alegre"},
    {"name": "Lucas", "age": 32, "city": "Salvador"},
    {"name": "Carla", "age": 27, "city": "Fortaleza"},
    {"name": "Rafael", "age": 38, "city": "Manaus"},
    {"name": "Tatiane", "age": 29, "city": "Goiânia"},
    {"name": "Felipe", "age": 33, "city": "Belém"},
]

def main():
    response = requests.post(URL, json=test_data)
    print("状态:", response.status_code)
    try:
        print("响应:", response.json())
    except Exception:
        print(response.text)

if __name__ == "__main__":
    main()
