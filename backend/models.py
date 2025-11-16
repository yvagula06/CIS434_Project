"""
SQLAlchemy database models for the Open Chat application
"""
from datetime import datetime
from sqlalchemy import Column, Integer, String, Text, DateTime, ForeignKey, Boolean
from sqlalchemy.orm import relationship
from database import Base


class User(Base):
    """
    User model for authentication and ownership of conversations.
    """
    __tablename__ = "users"
    
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(100), nullable=False)
    email = Column(String(100), unique=True, index=True, nullable=False)
    hashed_password = Column(String(255), nullable=False)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)
    
    # Relationships
    conversations = relationship("Conversation", back_populates="user", cascade="all, delete-orphan")
    
    def __repr__(self):
        return f"<User(id={self.id}, name='{self.name}', email='{self.email}')>"


class Conversation(Base):
    """
    Conversation model representing a chat session.
    Each conversation has a default model that can be overridden per message.
    """
    __tablename__ = "conversations"
    
    id = Column(Integer, primary_key=True, index=True)
    uuid = Column(String(36), unique=True, index=True, nullable=False)  # Public identifier
    title = Column(String(200), nullable=True)
    default_model = Column(String(100), nullable=False)  # e.g., "openai/gpt-3.5-turbo"
    user_id = Column(Integer, ForeignKey("users.id"), nullable=True)  # Nullable for anonymous users
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)
    
    # Relationships
    user = relationship("User", back_populates="conversations")
    messages = relationship("Message", back_populates="conversation", cascade="all, delete-orphan")
    
    def __repr__(self):
        return f"<Conversation(id={self.id}, uuid='{self.uuid}', default_model='{self.default_model}')>"


class Message(Base):
    """
    Message model representing a single message in a conversation.
    Can be from 'user' or 'assistant' role.
    User messages can optionally override the conversation's default model.
    """
    __tablename__ = "messages"
    
    id = Column(Integer, primary_key=True, index=True)
    uuid = Column(String(36), unique=True, index=True, nullable=False)  # Public identifier
    conversation_id = Column(Integer, ForeignKey("conversations.id"), nullable=False)
    role = Column(String(20), nullable=False)  # 'user' or 'assistant'
    content = Column(Text, nullable=False)
    model = Column(String(100), nullable=True)  # Model override for this message (optional)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    
    # Relationships
    conversation = relationship("Conversation", back_populates="messages")
    response = relationship("Response", back_populates="message", uselist=False, cascade="all, delete-orphan")
    
    def __repr__(self):
        return f"<Message(id={self.id}, uuid='{self.uuid}', role='{self.role}')>"


class Response(Base):
    """
    Response model storing metadata about AI-generated responses.
    Links to the assistant message and stores additional information
    like tokens used, completion time, etc.
    """
    __tablename__ = "responses"
    
    id = Column(Integer, primary_key=True, index=True)
    message_id = Column(Integer, ForeignKey("messages.id"), unique=True, nullable=False)
    model_used = Column(String(100), nullable=False)  # Actual model that generated the response
    tokens_prompt = Column(Integer, nullable=True)  # Tokens in prompt
    tokens_completion = Column(Integer, nullable=True)  # Tokens in completion
    tokens_total = Column(Integer, nullable=True)  # Total tokens used
    completion_time_ms = Column(Integer, nullable=True)  # Time taken to generate response
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    
    # Relationships
    message = relationship("Message", back_populates="response")
    
    def __repr__(self):
        return f"<Response(id={self.id}, model_used='{self.model_used}', tokens_total={self.tokens_total})>"
