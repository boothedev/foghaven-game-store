from fastapi import APIRouter

from . import auth as auth_router
from . import games as games_router
from . import genres as genres_router
from . import orders as orders_router
from . import payment_cards as payment_cards_router
from . import platforms as platforms_router
from . import users as users_router

router = APIRouter(prefix="/api")

router.include_router(games_router.router)
router.include_router(genres_router.router)
router.include_router(platforms_router.router)
router.include_router(auth_router.router)
router.include_router(users_router.router)
router.include_router(payment_cards_router.router)
router.include_router(orders_router.router)
