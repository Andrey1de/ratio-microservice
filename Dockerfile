
FROM node:10-alpine
WORKDIR /app
COPY . .
ENV PORT 3000
ENV MONGO_URL mongodb://localhost:27017/rates
ENV LOG_LEVEL info
RUN npm install
CMD [ "node", "app.js" ]
EXPOSE ${PORT}
