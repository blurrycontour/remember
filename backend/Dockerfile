FROM python:3.12-slim

ARG wd=/repo
WORKDIR ${wd}

RUN apt-get update && \
    apt-get install -y --no-install-recommends ca-certificates && \
    apt-get install -y fonts-noto-core && \
    apt-get clean

COPY pyproject.toml ${wd}/pyproject.toml
COPY src ${wd}/src
RUN pip install .[backend] --no-cache-dir

COPY backend ${wd}/backend

CMD ["python", "-m", "backend.main"]
