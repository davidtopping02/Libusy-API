# Use the official MySQL image from Docker Hub
FROM mysql:latest

# Copy the timezone information to the MySQL initialization directory
RUN echo "USE mysql;" > /docker-entrypoint-initdb.d/timezones.sql && \
    mysql_tzinfo_to_sql /usr/share/zoneinfo >> /docker-entrypoint-initdb.d/timezones.sql

# Ensure the MySQL data directory is empty
RUN rm -rf /var/lib/mysql/*

# Set the entrypoint command
ENTRYPOINT ["docker-entrypoint.sh"]

# Expose MySQL default port
EXPOSE 3306
