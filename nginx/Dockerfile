# Use the official Nginx image as a parent image
FROM nginx:alpine

# Copy the Nginx configuration file to the container
COPY nginx.conf /etc/nginx/nginx.conf

# Copy the SSL certificates
COPY ssl/cert.pem /etc/ssl/cert.pem
COPY ssl/privkey.pem /etc/ssl/privkey.pem

# Expose HTTPS port
EXPOSE 443

# Start Nginx when the container launches
CMD ["nginx", "-g", "daemon off;"]
