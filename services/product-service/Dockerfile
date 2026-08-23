FROM node:22-alpine

WORKDIR /app

COPY package.json /app

RUN npm install

COPY . .

EXPOSE 3002

CMD [ "npm","start" ]