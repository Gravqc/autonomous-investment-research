from typing import Optional
from pydantic import AnyHttpUrl, PostgresDsn
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    postgres_url: PostgresDsn
    openai_api_key: str
    ollama_host: Optional[AnyHttpUrl] = None
    secret_key: str
    frontend_origin: AnyHttpUrl
    market_aux_api_key:str
    market_aux_base_url:str

    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        case_sensitive=False,
    )


settings = Settings()
