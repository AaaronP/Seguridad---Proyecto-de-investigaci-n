FROM ubuntu:latest

ENV DEBIAN_FRONTEND=noninteractive

RUN apt-get update && \
    apt-get upgrade -y && \
    apt-get install -y nodejs npm && \
    rm -rf /var/lib/apt/lists/*

WORKDIR /rollup-lab

RUN npm init -y && \
    npm install rollup@4.58.0

COPY src/ ./src/
COPY innocent_script.js .

RUN mkdir -p /tmp

CMD ["node", "innocent_script.js"]
