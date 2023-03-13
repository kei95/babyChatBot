FROM node:18-alpine
ENV NODE_ENV=production

WORKDIR /dist

COPY ["package.json", "package-lock.json*", "./"]

RUN npm install --production

COPY . .

CMD [ "node", "dist/index.js" ]