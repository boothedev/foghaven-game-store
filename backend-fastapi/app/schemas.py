from typing import Optional, Union, Literal
from pydantic import BaseModel, Field


class FilterParams(BaseModel):
    genres: Optional[Union[int, list[int]]] = None
    platforms: Optional[Union[int, list[int]]] = None
    page: int = Field(1, ge=1)
    size: int = Field(100, le=100)
    sort: Literal["rater_count", "rating"] = "rater_count"
    order: Literal["asc", "desc"] = "desc"
    owned: bool = False
    search: Optional[str] = None


class UserAuth(BaseModel):
    username: str = Field(min_length=3, pattern=r"^[a-z0-9_]+$")
    password: str = Field(min_length=3)
    remember: bool = False


class UserUpdate(BaseModel):
    current_password: str = Field(min_length=3)
    new_username: Optional[str] = Field(None, min_length=3, pattern=r"^[a-z0-9_]+$")
    new_password: Optional[str] = Field(None, min_length=3)
    topup: Optional[int] = Field(None, gt=0)


class PaymentCard(BaseModel):
    name: str = Field(min_length=3)
    number: str = Field(min_length=16, max_length=16)
    exp_month: int = Field(ge=1, le=12)
    exp_year: int = Field(ge=2025, lt=2100)
    security_code: int = Field()


class GamesPurchase(BaseModel):
    id: int


class GameRate(BaseModel):
    stars: Optional[int] = Field(None, ge=1, le=5)
