# Use an official Node runtime as a parent image
FROM node:14

# Set the working directory in the container
WORKDIR /usr/src/app

# Copy package.json and package-lock.json if available
COPY api/package*.json ./

# Install any needed packages specified in package.json
RUN npm install

# Bundle app source inside the Docker image
COPY api/ .

# Your app binds to port 3000, make the port available outside the container
EXPOSE 3000

# Define the command to run your app
CMD ["npm", "run", "dev"]
