from datetime import datetime
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

    def get_occupancy_data_by_time_period(self, section_id, start_date, end_date):
        url = f"{self.api_url}/occupancy/sections/{section_id}/time-period"
        params = {'startDate': start_date, 'endDate': end_date}

        # Making the GET request
        response = requests.get(url, params=params)

        if response.status_code == 200:
            data = response.json()
            logging.info("Occupancy data fetched successfully.")
            return data
        else:
            logging.error(
                f"Failed to fetch occupancy data from API. Status code: {response.status_code}")
            return None

    def post_predictions(self, section_id, predictions):
        headers = {'X-API-Key': self.api_key}
        url = f"{self.api_url}/occupancy/predictions"

        # Prepare data for API post request
        data_to_post = {
            "section_id": section_id,
            "predictions": []
        }

        # Convert predictions to the correct timestamp format for MySQL
        for hour, prediction in predictions:
            timestamp = datetime.now().replace(
                hour=hour, minute=0, second=0, microsecond=0).isoformat()
            data_to_post["predictions"].append({
                "timestamp": timestamp,
                "occupancy_count": prediction
            })

        # Post predictions to the API
        response = requests.post(url, json=data_to_post, headers=headers)
        if response.status_code == 200:
            logging.info(
                f"Predictions for Section {section_id} posted successfully.")
        else:
            logging.error(
                f"Failed to post predictions for Section {section_id} to API. Status code: {response.status_code}")

    def get_total_base(self):
        # TODO: Implement API endpoint to fetch total base occupancy
        return 0
