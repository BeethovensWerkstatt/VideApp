###############################################
FROM node:10.24.1 as builder
LABEL maintainer="Jan-Peter Voigt"

WORKDIR /usr/app

COPY . .
RUN npm i
RUN ./node_modules/.bin/gulp
RUN ./node_modules/.bin/gulp buildServer
COPY ./source_server/serverConfig.json.docker build/serverConfig.json

###############################################
FROM node:10.24.1
WORKDIR /usr/app
COPY --from=builder /usr/app/build/* .

CMD [ "node", "videServer.js" ]
