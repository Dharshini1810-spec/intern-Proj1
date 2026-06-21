from db.database import Base

from sqlalchemy import Column, Integer, String, DateTime, Boolean, ForeignKey, JSON 
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship

class Story(Base):
    __tablename__ = "stories"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String, index=True)
    character = Column(String, nullable=True)
    session_id = Column(String, index=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    nodes = relationship(argument="StoryNode", back_populates="story")



class StoryNode(Base):
    __tablename__ = "story_nodes"

    id = Column(Integer, primary_key=True, index=True)
    story_id = Column(Integer, ForeignKey("stories.id"),index=True)
    content = Column(String)
    is_root=Column(Boolean, default=False)
    is_ending=Column(Boolean, default=False)
    is_winning_ending=Column(Boolean, default=False)
    options = Column(JSON, default=list)
    
    # Children's Game State Fields
    chapter = Column(String, nullable=True)
    rewards = Column(JSON, default=dict)
    item_collected = Column(String, nullable=True)
    achievement_unlocked = Column(String, nullable=True)
    ending_type = Column(String, nullable=True)
    mini_game = Column(String, nullable=True)

    story = relationship(argument="Story", back_populates="nodes")



     