from app.chatbot import ChatBot


class SingletonMeta(type):
    _instances = {}

    def __call__(cls, *args, **kwargs):
        if cls not in cls._instances:
            cls._instances[cls] = super(SingletonMeta, cls).__call__(*args, **kwargs)
        return cls._instances[cls]


class ChatbotManager(metaclass=SingletonMeta):
    def __init__(self):
        self.id_instance_map = {}

    def add_instance(self, id: str, instance: ChatBot):
        print("Adding bot instance with id:", id)
        self.id_instance_map[id] = instance
        return instance

    def get_or_create_instance(self, id) -> ChatBot:
        # Attempt to get the instance if it exists
        chatbot = self.id_instance_map.get(id)
        # Otherwise, create and add it
        if chatbot is None:
            instance = ChatBot(id=id)
            chatbot = self.add_instance(id=id, instance=instance)
        return chatbot

    def remove_instance(self, id):
        if id in self.id_instance_map:
            del self.id_instance_map[id]
