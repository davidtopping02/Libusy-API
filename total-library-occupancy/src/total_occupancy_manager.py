import logging
import time
from datetime import datetime, timedelta
from services.library_gates_api import LibraryGateAPI


class TotalOccupancyManager:
    def __init__(self, api_url, username, password):
        self.api = LibraryGateAPI(username, password, api_url)
        self.last_calibration_date = None

    def total_occupancy_calibration(self):
        self.api.update_total_occupancy(self.api.get_total_base(), True)
        logging.info("total occupancy calibrated")

    def calculate_next_run(self):
        # calculate the time until the next scheduled run, at x:17 and x:47
        now = datetime.now()
        next_run = now.replace(second=0, microsecond=0)
        if now.minute < 17:
            next_run = next_run.replace(minute=17)
        elif 17 <= now.minute < 47:
            next_run = next_run.replace(minute=47)
        else:
            next_run = (next_run + timedelta(hours=1)).replace(minute=17)
        return (next_run - now).total_seconds()

    def run_periodically(self):
        while True:
            sleep_time = self.calculate_next_run()
            logging.info(
                f"Sleeping for {sleep_time} seconds until the next run.")
            time.sleep(sleep_time)

            current_time = datetime.now()
            current_date = current_time.date()

            # check if it's the designated time for calibration and not already calibrated for the day
            if self.last_calibration_date != current_date and 4 <= current_time.hour < 5:
                self.total_occupancy_calibration()
                self.last_calibration_date = current_date

            # fetch data from the library gates API
            data = self.api.fetch_gate_data()

            if data:
                # Parse the response and update total occupancy
                net_change = self.api.parse_response(data)
                self.api.update_total_occupancy(net_change)
            else:
                # Log an error if the data fetched from the library gates is empty
                logging.error("Data was empty from the library gates")
