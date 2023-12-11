from uuid import uuid4
from config import Config

config = Config.get_config()


def get_config_data() -> dict:
    return {
        'embedding': config.embedding_id,
        'loader': config.loader,
        'document': config.document.dict() if config.document else None
    }


def create_system_message(text, user_id, data=None) -> dict:
    id = str(uuid4())
    return {
        "_id": id,
        "text": text,
        "user": config.users.get(user_id),
        "system": True,
        "data": data
    }


def create_bot_message(user_id: str, text: str) -> dict:
    id = str(uuid4())
    return {"_id": id, "text": text, "user": config.users.get(user_id)}


def get_users_list(user_ids):
    users = []
    for id in user_ids:
        user = config.users.get(id)
        users.append(user)
    return users
