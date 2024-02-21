import requests


class LibraryOccupancyAPI:
    def __init__(self, api_url):
        self.api_url = api_url

    def get_total_occupancy(self):
        response = requests.get(f"{self.api_url}/occupancy/sections/2")
        if response.status_code == 200:
            data = response.json().get('data', [])

            if data:
                section = data[0]
                current_occupancy = section.get('current_occupancy', 0)
                return current_occupancy
            else:
                print("No data found in the response.")
                return 0
        else:
            print("Failed to fetch total occupancy from API.")
            return 0

    def update_total_occupancy(self, total_occupancy):
        payload = {
            'sensor_id': "gate",
            'occupancy_count': total_occupancy}

        response = requests.post(
            f"{self.api_url}/occupancy/add", json=payload)
        if response.status_code != 200:
            print("Failed to update total occupancy to API.")
