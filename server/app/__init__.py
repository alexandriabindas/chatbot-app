
from flask import Flask
from config import config_dict
from server.app.socket_events import register_socket_events, socketio


def create_app(config_key='local'):
    app = Flask(__name__)
    # Enabling config initiation
    app.config.from_object(config_dict[config_key])
    config_dict[config_key].init_app(app)
    socketio.init_app(app)

    # Registering the main and the api blueprints here
    # from app.main import main as main_blueprint
    from app.api import api as api_blueprint
    app.register_blueprint(api_blueprint, url_prefix='/api/v1')
    register_socket_events()
    return app
