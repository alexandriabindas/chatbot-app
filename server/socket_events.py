from flask import request
from flask_socketio import SocketIO, emit, join_room
from config import config_dict, logging
from app.helper import ask_bot, generate_join_chat_messages, create_system_message, create_bot_message, get_config_data
from app.pdf_helper import ask_bot_about_pdf, loaders, embeddings
from app.models import Message, File

config = config_dict.get('local')
model = config.MODEL

socketio = SocketIO()


def send_update_config_to_client(text: str = 'Success'):
    system_message = create_system_message(text, data=get_config_data())
    emit('config_update_success', system_message)


def register_socket_events():

    @socketio.on('connect')
    def handle_connect():
        print('Client connected:', request.sid)

    @socketio.on('disconnect')
    def handle_disconnect():
        print('Client disconnected:', request.sid)

    @socketio.on('join_chat')
    def on_join(data):
        user = data['user']['name']
        room = data.get('room')
        active_bots = data.get('active_bots')
        all_active = [user, *active_bots]
        join_room(room)
        messages = generate_join_chat_messages(all_active)
        print(messages)
        for message in messages:
            emit('message', message)
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
            embedding_config = embeddings.get(value)
            config.embedding_id = value
            config.embedding = embedding_config.get('class')
        config_id = message_id.split('_')[0]
        send_update_config_to_client(f'Successfully updated {config_id} to {value}')

    @socketio.on('config')
    def handle_config_call(config_id: str):
        values = []
        if config_id in 'loader':
            message = create_bot_message(user_id='alex', text='Select a PDF loader')
            for k, v in loaders.items():
                values.append({
                    'title': v.get('title'),
                    'value': v.get('value')
                })
        if config_id in 'embeddings':
            message = create_bot_message(user_id='alex', text='Select an embedding function')
            for k, v in embeddings.items():
                values.append({
                    'title': v.get('title'),
                    'value': v.get('value'),
                })
        message['quickReplies'] = {
                'type': 'radio',
                'values': values,
                'keepIt': False,
        }
        message['_id'] = f"{config_id}_{message.get('_id')}"
        emit('message', message)

    @socketio.on('document')
    def handle_document(data: dict):
        document = data.get('document')
        if not document:
            config.document = None
            logging.debug("Removing document from config")
            system_message = create_system_message("File removed. You may still ask general questions.")
        else:
            local_uri = f"./app/data/{document.get('name')}"
            file = File(**document, local_uri=local_uri)
            config.document = file
            logging.debug(f"Added {config.document.name} to config.document")
            system_message = create_system_message(f'You may now ask questions about {config.document.name}.')
        send_update_config_to_client('Successfully updated document.')
        emit('message', system_message)

    @socketio.on('send_message')
    def handle_message_from_client(data: dict):
        emit('typing', True)
        message = Message(**data)
        print("Message", message)
        # g.file = message.file
        for bot_name in message.active_bots:
            try:
                if not config.document:
                    response = ask_bot(model=bot_name, prompt=message.prompt)
                else:
                    response = ask_bot_about_pdf(model=bot_name, message=message)
            except Exception as e:
                response = create_bot_message(user_id=bot_name,
                                              text="Sorry, there is something wrong.")
                print("Error", e)
            print(f"{bot_name}_response", response)
            emit('message', response)
        emit('typing', False)
