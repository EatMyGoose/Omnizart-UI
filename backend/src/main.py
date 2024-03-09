from sanic import Sanic, Request, text
from .constants import CONST
from .music_transcribe import transcribeBP
from sanic_ext import Extend
from .schemas import CreateAllTables;

def AppFactory() -> Sanic:
    CreateAllTables();
    
    app = Sanic(CONST.APPLICATION_NAME)
    app.blueprint(transcribeBP)
    app.config.CORS_ORIGINS = "*"
    Extend(app)
    print(app.config);
    return app

app = AppFactory();


