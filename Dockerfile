FROM node:22.23.4-alpine

ENV TZ="Europe/London"

USER root

RUN apk add --no-cache \
    openjdk17-jre-headless \
    curl \
    aws-cli

WORKDIR /app

COPY . .
RUN npm install

ENTRYPOINT [ "./entrypoint.sh" ]
