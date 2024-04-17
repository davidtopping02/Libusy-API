# use an official Node runtime as a parent image
FROM node:14

# set the working directory in the container
WORKDIR /usr/src/app

# copy package.json and package-lock.json 
COPY src/package*.json ./

# install any needed packages specified in package.json
RUN npm install

# Bundle app source inside the Docker image
COPY src/ .

# binds to port 443,  the port available outside the container
EXPOSE 80 

CMD ["npm", "run", "dev"]
