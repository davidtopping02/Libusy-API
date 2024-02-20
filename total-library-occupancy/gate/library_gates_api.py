import requests
import time
from datetime import datetime, timedelta
from api.library_occupancy_api import LibraryOccupancyAPI


class LibraryGateAPI:
    def __init__(self, username, password, api_url):
        self.username = username
        self.password = password
        self.base_url = 'https://librarygateapi.dundee.ac.uk/librarygatedataapi/api/data'
        self.occupancy_api = LibraryOccupancyAPI(api_url)

    def fetch_data(self):
        # calculate the time range for the past 20 minutes
        end_time = datetime.now()
        start_time = end_time - timedelta(minutes=20)

        # format the time strings
        from_time = start_time.strftime('%Y-%m-%dT%H:%M:%S.000')
        to_time = end_time.strftime('%Y-%m-%dT%H:%M:%S.000')

        # make the API request to the library gates
        auth = (self.username, self.password)
        params = {'from': from_time, 'to': to_time}
        response = requests.get(self.base_url, auth=auth, params=params)

        # check if the request was successful
        if response.status_code == 200:
            return response.json()
        else:
            # TODO: log this instead
            print("Failed to fetch data. Status code:", response.status_code)
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


def run_periodically(self, interval_minutes):
    while True:
        # Fetch data from the library gates
        data = self.fetch_data()

        if data:
            # Parse the response data to calculate net change in occupancy
            net_change = self.parse_response(data)

            # Update the total occupancy using the calculated net change
            self.update_total_occupancy(net_change)

            # TODO: log this
            print(f"Total occupancy updated. Net change: {net_change}")

        # TODO: log this
        print(
            f"Waiting for {interval_minutes} minutes before the next request...")

        time.sleep(interval_minutes * 60)
