# 1. Base image sử dụng node chính thức
FROM node:23-alpine

WORKDIR /app

COPY package*.json ./

RUN npm install --production

COPY . .

RUN npx prisma generate

CMD ["npm", "run", "nodemon"]