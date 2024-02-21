import logging
import sys
from datetime import datetime, timedelta
import requests

# Assuming LibraryOccupancyAPI is properly defined in another module
from api.library_occupancy_api import LibraryOccupancyAPI


class LibraryGateAPI:
    """
    A class to interact with the Library Gate API and manage occupancy data.
    """

    def __init__(self, username, password, api_url):
        self.username = username
        self.password = password
        self.base_url = 'https://librarygateapi.dundee.ac.uk/librarygatedataapi/api/data'
        self.occupancy_api = LibraryOccupancyAPI(api_url)

    def fetch_gate_data(self, interval_minutes):
        end_time = datetime.now()
        start_time = end_time - timedelta(minutes=interval_minutes)

        # Offset by 1 minute behind
        start_time -= timedelta(minutes=1)
        end_time -= timedelta(minutes=1)

        start_time_str = start_time.strftime('%Y-%m-%dT%H:%M:%S.000')
        end_time_str = end_time.strftime('%Y-%m-%dT%H:%M:%S.000')

        auth = (self.username, self.password)
        params = {'from': start_time_str, 'to': end_time_str}
        response = requests.get(self.base_url, auth=auth, params=params)

        if response.status_code == 200:
            logging.info("succesfully fetched library gate data from the API")
            return response.json()
        else:
            logging.error(
                f"failed fetched library gate data from the API: {response.status_code}")
            return None

    def parse_response(self, data):
        logging.info("parsing library gate data")
        in_count = sum(1 for entry in data if entry.get(
            'EventType') == 'Valid_Access' and 'IN' in entry.get('SourceEntityDescription'))
        out_count = sum(1 for entry in data if entry.get(
            'EventType') == 'Valid_Access' and 'OUT' in entry.get('SourceEntityDescription'))
        return in_count - out_count

    def update_total_occupancy(self, net_change):
        current_occupancy = self.occupancy_api.get_total_occupancy()
        new_occupancy = current_occupancy + net_change
        self.occupancy_api.update_total_occupancy(new_occupancy)
        logging.info(f"Total occupancy updated. Net change: {net_change}")
