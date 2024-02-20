import requests


class LibraryOccupancyAPI:
    def __init__(self, api_url):
        self.api_url = api_url

    def get_total_occupancy(self):
        response = requests.get(f"{self.api_url}/total_occupancy")
        if response.status_code == 200:
            return response.json().get('total_occupancy', 0)
        else:
            print("Failed to fetch total occupancy from API.")
            return 0

    def update_total_occupancy(self, total_occupancy):
        payload = {'total_occupancy': total_occupancy}
        response = requests.put(
            f"{self.api_url}/total_occupancy", json=payload)
        if response.status_code != 200:
            print("Failed to update total occupancy to API.")
