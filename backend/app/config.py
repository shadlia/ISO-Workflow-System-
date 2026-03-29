import os

basedir = os.path.abspath(os.path.dirname(__file__))

class Config:
    # Use SQLite relative to the backend root (one dir up from app/)
    SQLALCHEMY_DATABASE_URI = 'sqlite:///' + os.path.join(basedir, '..', 'workflow.db')
    SQLALCHEMY_TRACK_MODIFICATIONS = False
