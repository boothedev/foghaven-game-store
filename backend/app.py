from flask import Flask
from flask_cors import CORS 
from config import Config
from haven import db 


from routes.games import games_bp
from routes.auth import auth_bp
from routes.payment_cards import cards_bp
from routes.platforms import platforms_bp
from routes.genres import genres_bp
from routes.orders import orders_bp
from routes.users import users_bp


def create_app():
    app = Flask(__name__)
    app.config.from_object(Config)
    app.config["SESSION_TYPE"] = "filesystem"
    app.config["SESSION_PERMANENT"] = False

    CORS(app, supports_credentials= True)

    db.init_app(app)

    app.register_blueprint(games_bp, url_prefix="/api")
    app.register_blueprint(auth_bp, url_prefix="/api/auth")
    app.register_blueprint(cards_bp, url_prefix="/api")
    app.register_blueprint(platforms_bp, url_prefix="/api")
    app.register_blueprint(genres_bp, url_prefix="/api")
    app.register_blueprint(orders_bp, url_prefix="/api")
    app.register_blueprint(users_bp, url_prefix="/api") 

    return app

app = create_app()

if __name__ == "__main__":
    app.run(debug= True)