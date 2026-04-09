import requests

# API Endpoint
API_URL = "http://127.0.0.1:8000/chat"

def chat_with_api():
    print("Terminal Chatbot\n")
    conversation_history = []

    while True:
        user_input = input("You: ").strip()
        if user_input.lower() in {"exit", "quit"}:
            print("Exiting chatbot. Goodbye!")
            break

        payload = {"message": user_input}

        try:
            response = requests.post(API_URL, json=payload)
            response.raise_for_status()
            data = response.json()

            bot_message = data.get("response", "No response from server.")
            trust_score = data.get("trust_score", None)

            if trust_score is not None:
                print(f"EnorAi: {bot_message} (Trust Score: {trust_score})")
            else:
                print(f"EnorAi: {bot_message}")

            conversation_history.append({"user": user_input, "bot": bot_message})

        except requests.exceptions.RequestException as e:
            print(f"Error: Could not reach API. {e}")

if __name__ == "__main__":
    chat_with_api()