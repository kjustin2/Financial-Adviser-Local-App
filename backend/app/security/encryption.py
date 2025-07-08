"""Encryption utilities for secure data storage."""

import json
import os
from pathlib import Path
from typing import Any, Dict, Optional

from cryptography.fernet import Fernet

from ..config import settings


class SecureConfigManager:
    """Manages encrypted storage of sensitive configuration data."""

    def __init__(self, user_data_dir: Path = None):
        """Initialize the secure config manager."""
        self.config_dir = user_data_dir or settings.data_dir
        self.config_path = self.config_dir / "config.encrypted"
        self.key_path = self.config_dir / "app.key"

        # Ensure directory exists
        self.config_dir.mkdir(exist_ok=True, parents=True)

    def generate_key(self) -> bytes:
        """Generate a new encryption key."""
        key = Fernet.generate_key()
        with open(self.key_path, "wb") as f:
            f.write(key)

        # Set restrictive permissions (owner read/write only)
        os.chmod(self.key_path, 0o600)
        return key

    def get_key(self) -> bytes:
        """Get the encryption key, generating one if it doesn't exist."""
        if self.key_path.exists():
            with open(self.key_path, "rb") as f:
                return f.read()
        return self.generate_key()

    def encrypt_config(self, config: Dict[str, Any]) -> None:
        """Encrypt and store configuration data."""
        key = self.get_key()
        fernet = Fernet(key)

        # Serialize and encrypt the configuration
        config_json = json.dumps(config, default=str)
        encrypted_data = fernet.encrypt(config_json.encode())

        # Write encrypted data to file
        with open(self.config_path, "wb") as f:
            f.write(encrypted_data)

        # Set restrictive permissions
        os.chmod(self.config_path, 0o600)

    def decrypt_config(self) -> Dict[str, Any]:
        """Decrypt and return configuration data."""
        if not self.config_path.exists():
            return {}

        try:
            key = self.get_key()
            fernet = Fernet(key)

            # Read and decrypt the configuration
            with open(self.config_path, "rb") as f:
                encrypted_data = f.read()

            decrypted_data = fernet.decrypt(encrypted_data)
            return json.loads(decrypted_data.decode())

        except Exception as e:
            # Log error in production
            print(f"Failed to decrypt config: {e}")
            return {}

    def store_api_key(self, service: str, api_key: str) -> None:
        """Store an API key securely."""
        config = self.decrypt_config()
        config[f"{service}_api_key"] = api_key
        self.encrypt_config(config)

    def get_api_key(self, service: str) -> Optional[str]:
        """Retrieve an API key securely."""
        config = self.decrypt_config()
        return config.get(f"{service}_api_key")

    def update_config(self, updates: Dict[str, Any]) -> None:
        """Update configuration with new values."""
        config = self.decrypt_config()
        config.update(updates)
        self.encrypt_config(config)

    def delete_config(self) -> None:
        """Delete all encrypted configuration data."""
        if self.config_path.exists():
            self.config_path.unlink()
        if self.key_path.exists():
            self.key_path.unlink()


# Global instance
config_manager = SecureConfigManager()


def encrypt_sensitive_data(data: str, key: bytes = None) -> bytes:
    """Encrypt sensitive data using Fernet encryption."""
    if key is None:
        key = config_manager.get_key()

    fernet = Fernet(key)
    return fernet.encrypt(data.encode())


def decrypt_sensitive_data(encrypted_data: bytes, key: bytes = None) -> str:
    """Decrypt sensitive data using Fernet encryption."""
    if key is None:
        key = config_manager.get_key()

    fernet = Fernet(key)
    return fernet.decrypt(encrypted_data).decode()
