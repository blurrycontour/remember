import os
from typing import Tuple
import asyncio
import requests

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


    def send_notification_sync(self, message: str) -> Tuple[str, bool]:
        """Send a notification to Telegram."""
        try:
            print(f"Sending message: {message}")
            asyncio.run(
                self.bot.send_message(chat_id=self.chat_id, text=message, parse_mode="markdown")
            )
        except TelegramError as e:
            print(f"Exception: {e}")
            return f"Error sending Telegram notification: {e}", False

        return "Notification sent successfully", True



class Ntfy:
    """A class to interact with the Ntfy service."""

    def __init__(self):
        self.ntfy_topic_url = os.getenv("NTFY_TOPIC_URL")


    def send_notification(self, message: str, success: bool) -> Tuple[str, bool]:
        """Send a success or failure notification to Ntfy."""
        status = "success" if success else "failure"
        headers = {
            "Title": "Remember-App Backup",
            "Icon": "https://remember-main.vercel.app/logo192.png",
            "Priority": "3" if success else "2",
            "Tags": "white_check_mark" if success else "x",
            "Authorization": f"Bearer {os.getenv('NTFY_TOKEN')}",
        }

        try:
            print(f"Sending {status} message: {message}")
            response = requests.post(
                self.ntfy_topic_url,
                data=message.encode("utf-8"),
                headers=headers,
                timeout=10,
            )
            response.raise_for_status()
        except requests.RequestException as e:
            print(f"Exception: {e}")
            return f"Error sending Ntfy {status} notification: {e}", False

        return f"{status.capitalize()} notification sent successfully", True
