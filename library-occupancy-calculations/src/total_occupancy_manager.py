import logging
import time
from datetime import datetime, timedelta
from services.library_gates_api import LibraryGateAPI
from occupancy_prediction_manager import OccpancyPredictionManager
import threading


class TotalOccupancyManager:
    def __init__(self, api_url, username, password):
        self.lib_gates_api = LibraryGateAPI(username, password, api_url)
        self.occupancy_prediction_manager = OccpancyPredictionManager(api_url)
        self.last_calibration_date = None
        self.last_prediction_date = None  # Date to track when predictions were last made

    def total_occupancy_calibration(self):
        self.lib_gates_api.update_total_occupancy(
            self.lib_gates_api.get_total_base(), True)
        logging.info("Total occupancy calibrated")

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

            # check if it's between 23:00 and 00:00
            if current_time.hour >= 23 or current_time.hour < 0:
                if self.last_prediction_date != current_date:  # Ensure predictions happen only once per day
                    threading.Thread(
                        target=self.run_predictions).start()

            # check if it's the designated time for calibration and not already calibrated for the day
            if self.last_calibration_date != current_date and (current_time.hour >= 4 and current_time.hour < 5):
                self.total_occupancy_calibration()
                self.last_calibration_date = current_date

            # fetch data from the library gates API
            data = self.lib_gates_api.fetch_gate_data()

            if data:
                net_change = self.lib_gates_api.parse_response(data)
                self.lib_gates_api.update_total_occupancy(net_change)
            else:
                logging.error("Data was empty from the library gates")

    def run_predictions(self):
        self.occupancy_prediction_manager.run()
        # Update last prediction date to today
        self.last_prediction_date = datetime.now().date()
