FROM alpine:3.6

RUN apk update && apk add git bash curl python3
RUN python3 -m pip install xonsh
RUN git clone https://github.com/sebwink/wait-for-it

WORKDIR /wait-for-it
COPY setup.sh .
COPY setup.xsh .

CMD ["./wait-for-it.sh", "--timeout=0", "kong:8001" ,"--", "bash", "setup.sh"]
