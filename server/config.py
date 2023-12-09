import logging

class Development:
    """Local config"""
    # Database configurations
    MODEL = "llama2"
    LLAMA_BASE_URL = "http://localhost:11434"
    document = None
    embedding_id = 'gpt-4'
    loader = 'default'

    @staticmethod
    def init_app(app):
        """Initiates application."""
        print(app)
        app.logger.setLevel(logging.DEBUG)


config_dict = {
    'local': Development,
}
