FROM node:14

WORKDIR /dist

COPY . /dist
RUN npm install

EXPOSE 3000
CMD [ "npm", "start" ]