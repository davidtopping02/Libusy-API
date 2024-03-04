import os
import logging
from datetime import datetime
from total_occupancy_manager import TotalOccupancyManager


def configure_logging():
    current_date = datetime.now().date()

    # define directory to store log files
    log_directory = os.path.join(
        os.getcwd(), "total-library-occupancy", "logs")

    # create log directory if it does not exist
    if not os.path.exists(log_directory):
        os.makedirs(log_directory)

    log_file = os.path.join(log_directory, f'{current_date}.log')
    logger = logging.getLogger()
    logger.setLevel(logging.INFO)

    # handler to write logs to a file
    file_handler = logging.FileHandler(log_file)
    file_handler.setLevel(logging.INFO)

    # console handler to output logs to the console
    console_handler = logging.StreamHandler()
    console_handler.setLevel(logging.INFO)

    # format of the log messages
    formatter = logging.Formatter(
        '%(levelname)s:[%(asctime)s]:%(name)s: %(message)s')
    file_handler.setFormatter(formatter)
    console_handler.setFormatter(formatter)

    # Add the handlers to the logger
    logger.addHandler(file_handler)
    logger.addHandler(console_handler)


def main():
    print("STARTED")
    configure_logging()

    # Credentials and API URL for the TotalOccupancyManager
    username = 'dtopping'
    password = 'UO33mUx3zEKb%S8b'

    # IP address might be for local network access
    # api_url = 'http://10.8.0.1:80/api'

    # For Docker use
    api_url = 'http://uod-lib-occupancy-api:80/api'

    manager = TotalOccupancyManager(api_url, username, password)
    manager.run_periodically()


if __name__ == "__main__":
    main()
