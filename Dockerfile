# Use an official Node runtime as a parent image
FROM node:14

RUN mkdir -p /usr/src/app

WORKDIR /usr/src/app

COPY api/ . 

RUN npm install

RUN npm install -g nodemon

EXPOSE 3000

CMD ["npm", "run", "dev"]