FROM python:3.12-slim

ARG wd=/repo
WORKDIR ${wd}

RUN apt-get update && \
    apt-get install -y ca-certificates && \
    apt-get install -y fonts-noto-core

COPY pyproject.toml ${wd}/pyproject.toml
RUN pip install .[all] --no-cache-dir

COPY src ${wd}/src
RUN pip install .[all] --no-cache-dir

COPY backend ${wd}/backend

CMD ["python", "-m", "backend.main"]
