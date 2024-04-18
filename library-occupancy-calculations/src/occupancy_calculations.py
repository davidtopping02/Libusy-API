from total_occupancy.total_occupancy_manager import TotalOccupancyManager
from occupancy_prediction.occupancy_prediction_manager import OccpancyPredictionManager
import threading


class OccupancyCalculationManager:

    def __init__(self):
        self.total_occupancy_manager = TotalOccupancyManager()
        self.occupancy_prediction_manager = OccpancyPredictionManager()

    def run_calculations(self):

        # Define target functions for threads
        def run_total_occupancy():
            self.total_occupancy_manager.run_periodically()

        def run_occupancy_prediction():
            self.occupancy_prediction_manager.run_periodically()

        total_occupancy_thread = threading.Thread(target=run_total_occupancy)
        occupancy_prediction_thread = threading.Thread(
            target=run_occupancy_prediction)

        # Start both threads
        total_occupancy_thread.start()
        occupancy_prediction_thread.start()
