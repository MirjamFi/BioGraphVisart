FROM node:10-slim

# Install latest chrome dev package and fonts to support major charsets (Chinese, Japanese, Arabic, Hebrew, Thai and a few others)
# Note: this installs the necessary libs to make the bundled version of Chromium that Puppeteer
# installs, work.
RUN wget -q -O - https://dl-ssl.google.com/linux/linux_signing_key.pub | apt-key add - \
    && sh -c 'echo "deb [arch=amd64] http://dl.google.com/linux/chrome/deb/ stable main" >> /etc/apt/sources.list.d/google.list' \
    && apt-get update \
    && apt-get install -y google-chrome-unstable fonts-ipafont-gothic fonts-wqy-zenhei fonts-thai-tlwg fonts-kacst fonts-freefont-ttf \
      --no-install-recommends \
    && rm -rf /var/lib/apt/lists/*

# If running Docker >= 1.13.0 use docker run's --init arg to reap zombie processes, otherwise
# uncomment the following lines to have `dumb-init` as PID 1
# ADD https://github.com/Yelp/dumb-init/releases/download/v1.2.0/dumb-init_1.2.0_amd64 /usr/local/bin/dumb-init
# RUN chmod +x /usr/local/bin/dumb-init
# ENTRYPOINT ["dumb-init", "--"]

# Uncomment to skip the chromium download when installing puppeteer. If you do,
# you'll need to launch puppeteer with:
#     browser.launch({executablePath: 'google-chrome-unstable'})
# ENV PUPPETEER_SKIP_CHROMIUM_DOWNLOAD true

RUN mkdir /app && npm i -g nodemon
COPY src /app/src
COPY package.json /app/package.json

RUN groupadd -r app && useradd -r -g app -G audio,video app \
    && mkdir -p /home/app/Downloads \
    && chown -R app:app /home/app \
    && chown -R app:app /app 


USER app
WORKDIR /app

RUN npm install 

USER root

RUN cd node_modules/puppeteer/.local-chromium/*/chrome-linux/ \
    && chown root:root chrome_sandbox \
    && chmod 4755 chrome_sandbox \
    && cp -p chrome_sandbox /usr/local/sbin/chrome-devel-sandbox 
	
ENV CHROME_DEVEL_SANDBOX=/usr/local/sbin/chrome-devel-sandbox

RUN wget -O /usr/local/bin/dumb-init https://github.com/Yelp/dumb-init/releases/download/v1.2.2/dumb-init_1.2.2_amd64 \
    && chmod +x /usr/local/bin/dumb-init

RUN apt-get update \
    && apt-get install -y git \
    && git clone https://github.com/sebwink/wait-for-it

USER app

ENTRYPOINT ["dumb-init", "--", "./wait-for-it/wait-for-it.sh", "--timeout=0", "mongodb:27017", "--"]
CMD ["node", "src/main.js"]
