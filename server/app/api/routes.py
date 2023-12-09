from config import config_dict
from app.api import api
from app.helper import get_config_data

config = config_dict.get('local')
model = config.MODEL


@api.route('/health', methods=['GET'])
def health():
    return {"status": "OK"}


@api.route('/config', methods=['GET'])
def config():
    return get_config_data()
