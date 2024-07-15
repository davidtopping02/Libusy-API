# use an official Node runtime as a parent image
ARG TZ
FROM node:14

# set the working directory in the container
WORKDIR /usr/src/app

# copy package.json and package-lock.json 
COPY api/src/package*.json ./

# install any needed packages specified in package.json
RUN npm install

# Bundle app source inside the Docker image
COPY api/src/ .

# Use the PORT environment variable in your server code
ENV PORT 8080

# binds to port 8080, the port available outside the container
EXPOSE 8080 

CMD ["npm", "run", "dev"]
