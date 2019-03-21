FROM node:10-slim

RUN apt-get update \
    && apt-get upgrade -y \
    && mkdir /app

WORKDIR /app

COPY src src
COPY public public
COPY package.json .
COPY config config
COPY scripts scripts

RUN npm install 

CMD ["npm", "start"]
