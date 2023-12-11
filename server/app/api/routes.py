from app.api import api
from app.helper import get_config_data
from config import Config
from pydantic import BaseModel

import json

config = Config.get_config()


@api.route('/health', methods=['GET'])
def health():
    return {"status": "OK"}


@api.route('/config', methods=['GET'])
def get_config():
    config_data = get_config_data()
    document: BaseModel | None = config.document.dict() if config.document else None
    config_data['document'] = document
    return json.dumps(config_data)
