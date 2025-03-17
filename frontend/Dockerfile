FROM node:23.10-slim

ARG wd=/repo/frontend
WORKDIR ${wd}

COPY frontend/package.json ${wd}/package.json
RUN npm install

ENV GENERATE_SOURCEMAP false

# CMD ["npm", "start"]
CMD ["npm", "run", "build"]
