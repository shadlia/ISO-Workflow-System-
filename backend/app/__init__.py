from flask import Flask
from app.config import Config
from app.extensions import db, cors
from app.api import register_api

def create_app(config_class=Config):
    app = Flask(__name__)
    app.config.from_object(config_class)

    # Initialize extensions
    db.init_app(app)
    cors.init_app(app)

    # Register API blueprints/routes
    register_api(app)

    # Automatically create tables (if they don't exist)
    with app.app_context():
        db.create_all()

    return app
