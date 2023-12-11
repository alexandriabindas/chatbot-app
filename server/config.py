import os
from flask import Flask


class BaseConfig:
    DEBUG = True
    LLAMA_BASE_URL = "http://localhost:11434"
    VECTORSTORE_DB_PATH = "vectorstores/db/"
    document = None
    embedding_id = 'gpt-4'
    loader = 'default'

    # TODO: Don't do this in real life :)
    users = {
        "alex": {
            '_id': 'alex',
            'name': 'Alex'
        },
        "system": {
            '_id': 'system',
            'name': 'System Bot',
        },
        "openchat": {
            "_id": 'openchat',
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

    @staticmethod
    def init_app(app):
        return app


config_dict = {
    'local': BaseConfig,
}


class Config:
    _config: BaseConfig | None = None

    @staticmethod
    def load_config(app: Flask = None) -> BaseConfig:
        if Config._config is None:
            config_key = os.getenv('FLASK_CONFIG', 'default')
            print(config_key)
            # Initialize the configuration class
            Config._config = BaseConfig()

            # Apply the configuration to the Flask app, if provided
            if app:
                app.config.from_object(Config._config)

        return Config._config

    @staticmethod
    def get_config() -> BaseConfig:
        # Load the config if it's not already loaded
        if Config._config is None:
            Config.load_config()
        return Config._config
