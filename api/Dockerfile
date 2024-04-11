FROM node:14

# set the working directory in the container
WORKDIR /usr/src/app

# copy package.json and package-lock.json if available
COPY src/package*.json ./

# Install any needed packages specified in package.json
RUN npm install --only=production

# Bundle app source inside the Docker image
COPY src/ .

# binds to port 443
EXPOSE 443

# Define the command to run your app in production
CMD ["npm", "start"]
