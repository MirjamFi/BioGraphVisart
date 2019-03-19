FROM node:10-slim

RUN apt-get update \
    && apt-get upgrade -y \
    && mkdir /app

WORKDIR /app

COPY src .
COPY public .
COPY package.json .
COPY config .
COPY scripts .

RUN npm install 

CMD ["npm", "start"]
