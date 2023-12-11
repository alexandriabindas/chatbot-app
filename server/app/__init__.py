
from flask import Flask
from socket_events import register_socket_events, socketio
from config import Config


def create_app():
    app = Flask(__name__)
    Config.load_config(app)
    socketio.init_app(app)

    from app.api import api as api_blueprint
    app.register_blueprint(api_blueprint, url_prefix='/api/v1')
    register_socket_events()
    return app
