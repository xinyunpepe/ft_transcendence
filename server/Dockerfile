FROM node:16-alpine

WORKDIR /usr/src/app

COPY package*.json ./

RUN npm install
RUN npm install -g @angular/cli@12.0.0

EXPOSE 3000

CMD [ "node", "dist/main" ]
