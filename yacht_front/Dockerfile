FROM node:erbium
RUN mkdir /www
ADD ./dist/ /www/dist
WORKDIR /www
CMD ["node", "dist/server/main.js"]
