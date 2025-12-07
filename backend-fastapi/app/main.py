import os

from fastapi import FastAPI, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from starlette.responses import FileResponse

from . import routers

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
app.mount("/static", StaticFiles(directory="dist"), name="static")


# Include routers
app.include_router(routers.api_router)


# Serve main application files
# @app.get("/")
# def serve_app():
#     return FileResponse("dist/index.html")


# Catch-all for SPA routing - serves index.html for any unmatched route
@app.get("/{full_path:path}")
def catch_all(full_path: str):
    if full_path.startswith("api/"):
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Unimplemented api"
        )

    file_path = os.path.join("dist", full_path)
    if os.path.exists(file_path) and os.path.isfile(file_path):
        return FileResponse(file_path)
    return FileResponse("dist/index.html")
