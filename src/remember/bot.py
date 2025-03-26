import os
from typing import Tuple

from telegram import Bot
from telegram.error import TelegramError

from .singleton import SingletonMeta



class TelegramBot(metaclass=SingletonMeta):
    """A class to interact
    with the Telegram bot."""

    def __init__(self):
        telegram_bot_token =  os.getenv("TELEGRAM_BOT_TOKEN")
        self.chat_id = os.getenv("TELEGRAM_CHAT_ID")
        self.bot = Bot(token=telegram_bot_token)


    async def send_notification(self, message: str) -> Tuple[str, bool]:
        """Send a notification to Telegram."""
        try:
            print(f"Sending message: {message}")
            await self.bot.send_message(chat_id=self.chat_id, text=message, parse_mode="markdown")
        except TelegramError as e:
            print(f"Exception: {e}")
            return f"Error sending Telegram notification: {e}", False

        return "Notification sent successfully", True
