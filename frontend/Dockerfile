FROM node:20.15.1-slim

ARG wd=/repo/frontend
WORKDIR ${wd}

COPY frontend/package.json ${wd}/package.json
RUN npm install

COPY frontend/public ${wd}/public
COPY frontend/src ${wd}/src
COPY frontend/README.md ${wd}/README.md

# CMD ["npm", "start"]
CMD ["npm", "run", "build"]
