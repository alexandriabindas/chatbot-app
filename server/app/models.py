from pydantic import BaseModel, Field


class User(BaseModel):
    _id: str | int
    name: str


class File(BaseModel):
    size: int
    fileCopyUri: str | None = None
    name: str
    uri: str
    local_uri: str
    type: str


class Message(BaseModel):
    room: str = 'default'
    active_bots: list[str] = Field(default_factory=list)
    user: User
    prompt: str
    system: bool = False
