###############################################
FROM node:10 as builder
LABEL maintainer="Jan-Peter Voigt"

WORKDIR /usr/app
RUN npm i -g gulp

COPY . /usr/app/
RUN npm i
RUN gulp gulpfile.js ./gulpfile.js default

###############################################
#FROM node:10
#WORKDIR /usr/app
#COPY --from=builder /usr/app/build/* .

CMD [ "ls", "-lh" ]
