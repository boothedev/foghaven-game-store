import os

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from starlette.responses import FileResponse

from .routers import auth as auth_router
from .routers import games as games_router
from .routers import orders as orders_router
from .routers import payment_cards as payment_cards_router
from .routers import users as users_router

app = FastAPI()


# Add CORS middleware (adjust in production)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# Mount static files (keep same path as before)
app.mount("/api/static", StaticFiles(directory="dist"), name="static")


# Include routers
app.include_router(games_router.router)
app.include_router(auth_router.router)
app.include_router(users_router.router)
app.include_router(payment_cards_router.router)
app.include_router(orders_router.router)


# Serve main application files
# @app.get("/")
# def serve_app():
#     return FileResponse("dist/index.html")


# Catch-all for SPA routing - serves index.html for any unmatched route
@app.get("/{full_path:path}")
def catch_all(full_path: str):
    file_path = os.path.join("dist", full_path)
    if os.path.exists(file_path) and os.path.isfile(file_path):
        return FileResponse(file_path)
    return FileResponse("dist/index.html")
