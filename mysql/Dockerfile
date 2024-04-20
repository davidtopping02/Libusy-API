# Use the official MySQL 5.7 image as the base
FROM mysql:5.7.21

# Run commands to add timezone info during initialization
RUN echo "USE mysql;" > /docker-entrypoint-initdb.d/timezones.sql && mysql_tzinfo_to_sql /usr/share/zoneinfo >> /docker-entrypoint-initdb.d/timezones.sql
