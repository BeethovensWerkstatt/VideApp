###############################################
FROM node:10.18.1-alpine as builder
LABEL maintainer="Jan-Peter Voigt"

WORKDIR /usr/app

COPY . .
RUN npm i -g gulp@3.9.1
RUN npm i -g bower@1.8.12
RUN node -v
RUN npm -v
RUN gulp -v
RUN bower -v
RUN npm i
RUN ./node_modules/.bin/gulp
RUN ./node_modules/.bin/gulp buildServer
COPY ./source_server/serverConfig.json.docker build/serverConfig.json

###############################################
FROM node:10.18.1-alpine
WORKDIR /usr/app
COPY --from=builder /usr/app/build/* .
COPY --from=builder /usr/app/build/node_modules .

CMD [ "node", "videServer.js" ]
