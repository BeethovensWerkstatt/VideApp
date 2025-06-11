FROM node:10

COPY "VideApp-beta29" /VideApp-beta29
WORKDIR /VideApp-beta29
RUN npm install
COPY serverConfig.json .

CMD "node" "VideApp-beta29.js"
