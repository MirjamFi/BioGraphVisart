FROM alpine:edge

# Installs latest Chromium (76) package.
RUN apk add --no-cache \
      chromium \
      nss \
      freetype \
      freetype-dev \
      harfbuzz \
      ca-certificates \
      ttf-freefont \
      nodejs \
      yarn \
	  git \
	  wget \
	  npm \
	  bash


# Tell Puppeteer to skip installing Chrome. We'll be using the installed package.
ENV PUPPETEER_SKIP_CHROMIUM_DOWNLOAD true

# Puppeteer v1.17.0 works with Chromium 76.
RUN yarn add puppeteer@1.17.0

RUN mkdir /app && npm i -g nodemon
COPY src /app/src
COPY package.json /app/package.json

# Add user so we don't need --no-sandbox.
RUN addgroup -S app && adduser -S -g app app \
    && mkdir -p /home/app/Downloads /app \
    && chown -R app:app /home/app \
    && chown -R app:app /app

RUN wget -O /usr/local/bin/dumb-init https://github.com/Yelp/dumb-init/releases/download/v1.2.2/dumb-init_1.2.2_amd64 \
    && chmod +x /usr/local/bin/dumb-init

RUN git clone https://github.com/sebwink/wait-for-it

# Run everything after as non-privileged user.
USER app
WORKDIR /app 
RUN npm i

ENTRYPOINT ["dumb-init", "--", "/wait-for-it/wait-for-it.sh", "--timeout=0", "mongodb:27017", "--"]
CMD ["node", "src/main.js"]
