import os
import uvicorn
import argparse as ap

from fastapi import FastAPI, Request, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.exceptions import RequestValidationError
from fastapi.encoders import jsonable_encoder
from fastapi.responses import JSONResponse, HTMLResponse

import firebase_admin
from firebase_admin import credentials

from .utils.text_html import to_html
from .routers import account, default, category, card


app = FastAPI(root_path="/api")

app.include_router(default.router)
app.include_router(category.router)
app.include_router(card.router)
app.include_router(account.router)


origins = ["*"]
app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

credentials_file = os.path.expanduser("~/.gcp/firebase-credentials.json")
creds = credentials.Certificate(credentials_file)
firebase_admin.initialize_app(creds)


@app.exception_handler(RequestValidationError)
async def validation_exception_handler(request: Request, exc: RequestValidationError):
    data = await request.body()
    print(data)
    return JSONResponse(
        status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
        content=jsonable_encoder({"detail": exc.errors(), "body": exc.body}),
    )


@app.get('/', response_class=HTMLResponse)
async def root():
    html_str = to_html(
        '<h1>Always Remember!</h1>',
    )
    return html_str


if __name__ == '__main__':
    parser = ap.ArgumentParser()
    args = parser.parse_args()

    uvicorn.run(
        'backend.main:app',
        host='0.0.0.0',
        port=5000,
        reload=True,
        reload_includes=['*.py', '*.reload'],
        proxy_headers=True,
    )
