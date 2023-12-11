
class ConfigHandler:
    def __init__(self, user_id):
        self.user_id = user_id

    def create_config_message(self, config_id, config_data):
        message_text = config_data['message']
        values = [{'title': v.get('title'), 'value': v.get('value')} for v in config_data['values']]

        message = create_bot_message(user_id=self.user_id, text=message_text)
        message['quickReplies'] = {'type': 'radio', 'values': values, 'keepIt': False}
        message['_id'] = f"{config_id}_{message.get('_id')}"
        return message
