FROM node:20-alpine
WORKDIR /app
COPY package.json .
RUN npm install --production
COPY server.js .
USER 10001
EXPOSE 8080
CMD ["node", "server.js"]
