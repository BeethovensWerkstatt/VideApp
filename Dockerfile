###############################################
FROM node:10 as builder
LABEL maintainer="Jan-Peter Voigt"

WORKDIR /usr/app

COPY . .
RUN npm i
# RUN ./node_modules/.bin/gulp
# RUN ./node_modules/.bin/gulp buildServer

###############################################
#FROM node:10
#WORKDIR /usr/app
#COPY --from=builder /usr/app/build/* .

CMD [ "./node_modules/.bin/gulp", "--help" ]
