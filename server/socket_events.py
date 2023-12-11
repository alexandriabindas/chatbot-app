from flask import request
from flask_socketio import SocketIO, emit
from config import Config
from app.helper import get_users_list, create_system_message, create_bot_message, get_config_data
from app.models import Message, File, ToClientEvents, embeddings, loaders
from app.chatbot_singleton import ChatbotManager

socketio = SocketIO()
config = Config.get_config()


def generate_join_chat_messages(active_bots):
    messages = []
    users = get_users_list(active_bots)
    for user in users:
        name = user.get('name')
        system_message = create_system_message(f"{name} has entered the chat.", 'alex')
        messages.append(system_message)
    return messages

def _send_system_message_with_config(text: str = 'Success', user_ids=['openchat', 'llama2', 'llama2-uncensored'], ):
    for user_id in user_ids:
        system_message = create_system_message(text, user_id, data=get_config_data())
        print("system_message", system_message)
        emit(ToClientEvents.CONFIG_UPDATE.value, system_message)


def _send_message_to_client(text: str):
    emit(ToClientEvents.MESSAGE.value, text)


def register_socket_events():

    @socketio.on('connect')
    def handle_connect():
        print('Client connected:', request.sid)

    @socketio.on('disconnect')
    def handle_disconnect():
        print('Client disconnected:', request.sid)


    @socketio.on('join_group')
    def on_join(data):
        user = data['user']['_id']
        active_bots = data.get('active_bots')
        all_active = [user, *active_bots]
        print(all_active)
        messages = generate_join_chat_messages(all_active)
        for msg in messages:
            emit('message', msg)
        config.document = None

    @socketio.on('update_config')
    def handle_update_config(data):
        print("UPDATED CONFIG", data)
        message_id = data.get('messageId')
        # config_id = message_id.split('_')[0]
        value = data.get('value')
        if 'loader' in message_id:
            config.loader = value
        elif 'embedding' in message_id:
            config.embedding_id = value
        config_id = message_id.split('_')[0]
        _send_system_message_with_config(f'Successfully updated {config_id} to {value}', ['system'])

    @socketio.on('/config')
    def handle_config(config_id: str):
        message_text = 'Select a PDF loader' if 'loader' in config_id else 'Select an embedding function'
        _config = loaders if 'loader' in config_id else embeddings
        print(_config)
        values = [{'title': v.get('title'), 'value': v.get('value')} for k, v in _config.items()]
        message = create_bot_message(user_id='alex', text=message_text)
        message['quickReplies'] = {'type': 'radio', 'values': values, 'keepIt': False}
        message['_id'] = f"{config_id}_{message.get('_id')}"
        _send_message_to_client(message)

    @socketio.on('document')
    def handle_document(data: dict):
        '''
        This should handle a user selecting or unselecting a document.
        NOTE: This document is set on the global scope and will dictate the PDF in context
        for the llms.
        '''
        document = data.get('document')
        system_message = None
        if not document and config.document:
            config.document = None
            # print("Removing document from config")
            # system_message = create_system_message("File removed. You may still ask general questions.")
        elif document:
            local_uri = f"./app/data/{document.get('name')}"
            file = File(**document, local_uri=local_uri)
            config.document = file
            print(f"Added {config.document.name} to config.document")
            for user_id in ['openchat', 'llama2', 'llama2-uncensored']:
                system_message = create_system_message(f'You may now ask questions about {config.document.name}.', user_id)
                _send_message_to_client(system_message)
            _send_system_message_with_config('Successfully updated document.')

    @socketio.on('document-group')
    def handle_document(data: dict):
        '''
        This should handle a user selecting or unselecting a document.
        NOTE: This document is set on the global scope and will dictate the PDF in context
        for the llms.
        '''
        document = data.get('document')
        system_message = None
        if not document and config.document:
            config.document = None
            # print("Removing document from config")
            # system_message = create_system_message("File removed. You may still ask general questions.")
        elif document:
            local_uri = f"./app/data/{document.get('name')}"
            file = File(**document, local_uri=local_uri)
            config.document = file
            print(f"Added {config.document.name} to config.document")
            system_message = create_system_message(f'You may now ask questions about {config.document.name}.', 'system')
            _send_message_to_client(system_message)
            _send_system_message_with_config('Successfully updated document.', ['alex'])

    @socketio.on('send_message')
    def handle_send_message(data: dict):
        print("ToClientEvents.TYPING", ToClientEvents.TYPING.value)
        emit(ToClientEvents.TYPING.value, True)
        message = Message(**data)
        print("Message", message)
        for id in message.active_bots:
            chatbot = ChatbotManager().get_or_create_instance(id)
            try:
                if not config.document:
                    response = chatbot.ask_question(message.prompt)
                else:
                    response = chatbot.ask_bot_about_pdf(message)
            except Exception as e:
                response = create_bot_message(user_id=id, text="Sorry, there is something wrong.")
                print("Error", e)

            print(f"{id}_response", response)
            _send_message_to_client(response)
        emit(ToClientEvents.TYPING.value, False)
