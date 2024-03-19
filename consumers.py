import json
from channels.generic.websocket import WebsocketConsumer

class ProgressConsumer(WebsocketConsumer):
    def connect(self):
        # Add the consumer to a specific group
        self.group_name = 'progress_updates'
        self.channel_layer.group_add(self.group_name, self.channel_name)
        self.accept()

    def disconnect(self, close_code):
        # Remove the consumer from the group
        self.channel_layer.group_discard(self.group_name, self.channel_name)

    # You can implement the receive method if needed for incoming messages

    def send_progress_update(self, event):
        # Send progress update to WebSocket
        progress = event['progress']
        self.send(text_data=json.dumps({'progress': progress}))