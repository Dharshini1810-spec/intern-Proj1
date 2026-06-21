from typing import List, Optional, Dict
from datetime import datetime
from pydantic import BaseModel, ConfigDict


class StoryOptionsSchemas(BaseModel):
    text: str
    node_id: Optional[int] = None
    required_item: Optional[str] = None


class StoryNodeBase(BaseModel): 
    content: str
    is_ending: bool = False
    is_winning_ending:bool =False


class CompleteStoryNodeResponse(StoryNodeBase):
    id: int
    options: List[StoryOptionsSchemas] = []
    chapter: Optional[str] = None
    rewards: Optional[dict] = None
    item_collected: Optional[str] = None
    achievement_unlocked: Optional[str] = None
    ending_type: Optional[str] = None
    mini_game: Optional[str] = None

    model_config = ConfigDict(from_attributes=True)


class StoryBase(BaseModel):
    title: str
    character: Optional[str] = None
    session_id: Optional[str] = None 

    model_config = ConfigDict(from_attributes=True)


class CreateStoryRequest(BaseModel):
    theme: str
    character: Optional[str] = "Explorer Emma"


class CompleteStoryResponse(StoryBase):
    id: int
    created_at: datetime
    root_node: Optional[CompleteStoryNodeResponse] = None
    all_nodes: Dict[int, CompleteStoryNodeResponse]

    model_config = ConfigDict(from_attributes=True)


