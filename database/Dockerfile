FROM python:3.12-alpine

RUN apk add --no-cache mongodb-tools

ARG MONGODB_STRING
ARG BUCKET_NAME
ARG wd=/repo
WORKDIR ${wd}

COPY pyproject.toml ${wd}/pyproject.toml
RUN pip install . --no-cache-dir

COPY src ${wd}/src
RUN pip install . --no-cache-dir

ENV MONGODB_STRING ${MONGODB_STRING}
ENV BUCKET_NAME ${BUCKET_NAME}
RUN echo "#!/bin/sh" > /usr/share/backup_service.sh && \
    echo "python ${wd}/database/backup.py" >> /usr/share/backup_service.sh && \
    chmod +x /usr/share/backup_service.sh
COPY database/crontab /etc/crontabs/root
RUN sed -i 's/\r$//' /etc/crontabs/root

COPY database ${wd}/database

CMD ["crond", "-f"]
