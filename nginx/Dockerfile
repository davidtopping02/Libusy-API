# the official Nginx image as a parent image
ARG TZ
FROM nginx:alpine

# Copy the Nginx configuration file to the container
COPY nginx.conf /etc/nginx/nginx.conf

# Expose HTTPS port
EXPOSE 443

# Start Nginx when the container launches
CMD ["nginx", "-g", "daemon off;"]
