from typing import Optional
from sqlmodel import Field, SQLModel

class SystemConfig(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    openai_api_key: str = Field(default="CHANGE_ME")
    model_name: str = Field(default="gpt-4o-mini")
    temperature: float = Field(default=0.3)
    system_prompt: str = Field(default="You are a helpful assistant for Mango Inc.")
    admin_password_hash: Optional[str] = Field(default=None)