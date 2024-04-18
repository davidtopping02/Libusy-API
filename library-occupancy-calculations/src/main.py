import os
import logging
from datetime import datetime
from occupancy_calculations import OccupancyCalculationManager

from api_services.libusy_api_service import LibusyApiService
from api_services.tunstile_gates_api_service import TurnstileGatesApiService


def configure_logging():
    # Configure the root logger to output logs to the console
    logging.basicConfig(level=logging.INFO,
                        format='%(levelname)s:[%(asctime)s]:%(name)s: %(message)s')


def main():
    print("STARTED")
    configure_logging()

    occupancy_calculations = OccupancyCalculationManager()
    occupancy_calculations.run_calculations()


if __name__ == "__main__":
    main()
