FROM node:16-alpine

WORKDIR /usr/client/src/app

COPY package*.json ./

RUN npm install
# RUN npm install -g @angular/cli@12.0.0

COPY . .

EXPOSE 4200

