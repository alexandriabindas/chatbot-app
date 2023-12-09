from uuid import uuid4
from config import config_dict
from langchain.llms import Ollama

config = config_dict.get('local')
model = config.MODEL

users = {
    "alex": {
        '_id': 1,
        'name': 'Alex'
    },
    "system": {
        '_id': 'system',
        'name': 'System Bot',
    },
    "openchat": {
        "_id": 3,
        "name": "Open Chat",
    },
    "llama2": {
        "_id": 'llama2',
        "name": "Llama2",
    },
    "llama2-uncensored": {
        "_id": 'llama2-uncensored',
        "name": "Uncensored Llama2"
    }
}


def get_config_data() -> dict:
    return {
        'embedding': config.embedding_id,
        'loader': config.loader,
        # 'file': config.document.name if config.document else 'none'
    }


def ask_bot(prompt: str, model: str):
    llm = Ollama(model=model, base_url="http://localhost:11434")
    reply = llm(prompt)
    return create_bot_message(user_id=model, text=reply)


def get_llm(model: str):
    llm = Ollama(model=model, base_url="http://localhost:11434")
    return llm


def create_system_message(text, data=None) -> dict:
    id = str(uuid4())
    return {
        "_id": id,
        "text": text,
        "user": users.get('system'),
        "system": True,
        "data": data
    }


def create_bot_message(user_id: str, text: str) -> dict:
    id = str(uuid4())
    return {"_id": id, "text": text, "user": users.get(user_id)}


def generate_join_chat_messages(usernames):
    messages = []
    for username in usernames:
        print("username", username)
        user = users.get(username)
        display_name = user.get('name') if user else username
        system_message = create_system_message(f'{display_name} has entered the chat.')
        messages.append(system_message)
    return messages
