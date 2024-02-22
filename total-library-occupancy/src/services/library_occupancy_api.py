import requests
import logging


class LibraryOccupancyAPI:
    def __init__(self, api_url):
        self.api_url = api_url
        self.api_key = "9e4a2455-2cba-4c0f-8f2e-a68a54151f12"

    def get_total_occupancy(self):
        # fetch total occupancy from the API
        response = requests.get(f"{self.api_url}/occupancy/sections/1")
        if response.status_code == 200:
            data = response.json().get('data', [])

            if data:
                # extract current occupancy data from the response
                section = data[0]
                current_occupancy = section.get('current_occupancy', 0)
                logging.info("Total occupancy fetched successfully.")
                return current_occupancy
            else:
                logging.warning("No data found in the response.")
                return 0
        else:
            logging.error("Failed to fetch total occupancy from API.")
            return 0

    def update_total_occupancy(self, total_occupancy):
        # Update total occupancy to the API
        headers = {'X-API-Key': self.api_key}
        payload = {
            'sensor_id': "gate",
            'occupancy_count': total_occupancy}

        response = requests.post(
            f"{self.api_url}/occupancy/add", json=payload, headers=headers)
        if response.status_code != 200:
            logging.error("Failed to update total occupancy to API.")

    def get_total_base(self):
        # TODO: Implement API endpoint to fetch total base occupancy
        return 0
