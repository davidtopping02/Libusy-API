import logging
import time
from datetime import datetime, timedelta
from api_services.tunstile_gates_api_service import turnstile_gates_api_service
from api_services.libusy_api_service import libusy_api_service


class TotalOccupancyManager:
    def __init__(self):
        self.last_calibration_date = None
        self.last_prediction_date = None

    def total_occupancy_calibration(self):
        logging.info("Calibrating total occupancy")
        libusy_api_service.update_total_occupancy(0)

    def calculate_next_run(self):
        # Calculate the time until the next scheduled run, at x:17 and x:47
        now = datetime.now()
        next_run = now.replace(second=0, microsecond=0)
        if now.minute < 17:
            next_run = next_run.replace(minute=17)
        elif 17 <= now.minute < 47:
            next_run = next_run.replace(minute=47)
        else:
            next_run = (next_run + timedelta(hours=1)).replace(minute=17)

        # Calculate the time until the next run
        sleep_time = (next_run - now).total_seconds()

        return next_run, sleep_time

    def run_periodically(self):
        while True:
            next_run_time, sleep_time = self.calculate_next_run()
            logging.info(
                f"Sleeping for {sleep_time} seconds until the total occupancy calculation. Next run at: {next_run_time}")

            time.sleep(sleep_time)

            current_time = datetime.now()
            current_date = current_time.date()

            if self.last_calibration_date != current_date and (current_time.hour >= 4 and current_time.hour < 5):
                self.total_occupancy_calibration()
                self.last_calibration_date = current_date

            # fetch data from the library gates API
            data = turnstile_gates_api_service.fetch_gate_data()

            if data:
                net_change = turnstile_gates_api_service.get_net_change(data)
                current_occupancy = libusy_api_service.get_total_occupancy()

                net_difference = current_occupancy + net_change

                logging.info("Net difference is: " + str(net_difference))

                libusy_api_service.update_total_occupancy(net_difference)
            else:
                logging.error("Data was empty from the library gates")
