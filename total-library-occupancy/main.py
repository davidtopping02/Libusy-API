import os
import logging
import time
from datetime import datetime, timedelta
from gate.library_gates_api import LibraryGateAPI


class TotalOccupancyManager:
    def __init__(self, api_url, username, password, interval_minutes):
        self.api = LibraryGateAPI(username, password, api_url)
        self.interval_minutes = interval_minutes
        self.last_calibration_date = None

    def configure_logging(self):
        current_date = datetime.now().date()
        log_directory = os.path.join(
            os.getcwd(), "total-library-occupancy", "logs")
        if not os.path.exists(log_directory):
            os.makedirs(log_directory)
        log_file = os.path.join(log_directory, f'{current_date}.log')

        # Create a logger
        logger = logging.getLogger()
        logger.setLevel(logging.INFO)

        file_handler = logging.FileHandler(log_file)
        file_handler.setLevel(logging.INFO)

        console_handler = logging.StreamHandler()
        console_handler.setLevel(logging.INFO)

        # Create formatter and set it for the handlers
        formatter = logging.Formatter(
            '%(levelname)s:[%(asctime)s]:%(name)s: %(message)s')
        file_handler.setFormatter(formatter)
        console_handler.setFormatter(formatter)

        logger.addHandler(file_handler)
        logger.addHandler(console_handler)

    def total_occupancy_calibration(self):
        self.api.update_total_occupancy(self.api.get_total_base())
        logging.info("total occupancy calibrated")

    def run_periodically(self):

        self.configure_logging()

        while True:
            current_time = datetime.now()
            current_date = current_time.date()

            if self.last_calibration_date != current_date and 4 <= current_time.hour < 5:
                self.configure_logging()
                self.total_occupancy_calibration()
                self.last_calibration_date = current_date

            data = self.api.fetch_gate_data(self.interval_minutes)

            if data:
                net_change = self.api.parse_response(data)
                self.api.update_total_occupancy(net_change)
            else:
                logging.error("Data was empty from the library gates")
            logging.info(
                f"Waiting for {self.interval_minutes} minutes before the next request...")
            time.sleep(self.interval_minutes * 60)


def main():
    print("STARTED")
    username = 'dtopping'
    password = 'UO33mUx3zEKb%S8b'
    api_url = 'http://10.8.0.1:3000'
    # For Docker use: api_url = 'http://uod-lib-occupancy-api:3000'
    manager = TotalOccupancyManager(
        api_url, username, password, interval_minutes=10)
    manager.run_periodically()


if __name__ == "__main__":
    main()
