import sys
import requests
import time
from datetime import datetime, timedelta
import os
import logging

from api.library_occupancy_api import LibraryOccupancyAPI


class LibraryGateAPI:
    def __init__(self, username, password, api_url):
        self.username = username
        self.password = password
        self.base_url = 'https://librarygateapi.dundee.ac.uk/librarygatedataapi/api/data'
        self.occupancy_api = LibraryOccupancyAPI(api_url)

    def configure_logging(self):
        # create log directory if it doesn't exist
        log_directory = os.path.join(
            os.getcwd(), "total-library-occupancy", "logs")

        if not os.path.exists(log_directory):
            os.makedirs(log_directory)

        # generate a log file name with the current date
        current_date = datetime.now().strftime("%Y-%m-%d")
        log_file = f'{log_directory}/{current_date}.log'

        # configure logging with the log file and format
        logging.basicConfig(level=logging.INFO, filename=log_file,
                            filemode='a', format='%(levelname)s:[%(asctime)s]:%(name)s: %(message)s')

        # Add a StreamHandler to log to stdout as well
        console_handler = logging.StreamHandler(sys.stdout)
        console_handler.setLevel(logging.INFO)
        formatter = logging.Formatter(
            '%(levelname)s:[%(asctime)s]:%(name)s: %(message)s')
        console_handler.setFormatter(formatter)
        logging.getLogger().addHandler(console_handler)

    def fetch_data(self, interval_minutes):
        # calculate the time range for the past 20 minutes
        end_time = datetime.now()
        start_time = end_time - timedelta(minutes=interval_minutes)

        # format the time strings
        start_time_str = start_time.strftime('%Y-%m-%dT%H:%M:%S.000')
        end_time_str = end_time.strftime('%Y-%m-%dT%H:%M:%S.000')

        # make the API request to the library gates
        auth = (self.username, self.password)
        params = {'from': start_time_str, 'to': end_time_str}
        response = requests.get(self.base_url, auth=auth, params=params)

        # check if the request was successful
        if response.status_code == 200:
            logging.info("Data fetched successfully.")
            return response.json()
        else:
            logging.error(
                f"Failed to fetch data. Status code: {response.status_code}")
            return None

    def parse_response(self, data):
        # checks for valid entry and exits, then calculates the net difference
        in_count = sum(1 for entry in data if entry.get(
            'EventType') == 'Valid_Access' and 'IN' in entry.get('SourceEntityDescription'))
        out_count = sum(1 for entry in data if entry.get(
            'EventType') == 'Valid_Access' and 'OUT' in entry.get('SourceEntityDescription'))
        return in_count - out_count

    def update_total_occupancy(self, net_change):
        # updates the total occupancy based on the newly calculated net difference
        current_occupancy = self.occupancy_api.get_total_occupancy()
        new_occupancy = current_occupancy + net_change
        self.occupancy_api.update_total_occupancy(new_occupancy)
        logging.info(f"Total occupancy updated. Net change: {net_change}")

    def run_periodically(self, interval_minutes):
        last_executed_calibration_logic = None

        while True:
            current_time = datetime.now()
            current_date = current_time.date()
            # check if a new day since the last calibration execution
            if last_executed_calibration_logic is None or last_executed_calibration_logic < current_date:
                self.configure_logging()

                if 4 <= current_time.hour < 5:
                    self.calibration_logic()
                    last_executed_calibration_logic = current_date
                    logging.info("calibration logic executed.")

            # Fetch data from the library gates
            data = self.fetch_data(interval_minutes)

            if data:
                net_change = self.parse_response(data)
                self.update_total_occupancy(net_change)
            else:
                logging.error(
                    f"data was empty from the library gates")

            logging.info(
                f"Waiting for {interval_minutes} minutes before the next request...")
            time.sleep(interval_minutes * 60)

    def calibration_logic(self):
        self.occupancy_api.update_total_occupancy(
            self.occupancy_api.get_total_base())
