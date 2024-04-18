from datetime import datetime, timedelta
import requests
import logging

turnstile_gates_api_service_instance = None


class TurnstileGatesApiService:
    def __init__(self, username, password):
        self.username = username
        self.password = password
        self.base_url = 'https://librarygateapi.dundee.ac.uk/librarygatedataapi/api/data'

    def set_instance(self):
        global turnstile_gates_api_service_instance
        turnstile_gates_api_service_instance = self

    def get_instance(self):
        return turnstile_gates_api_service_instance

    def fetch_gate_data(self):
        # fetch data from the library gate API for the past 30 minutes
        end_time = datetime.now()
        start_time = end_time - timedelta(minutes=30)
        start_time_str = start_time.strftime('%Y-%m-%dT%H:%M:%S.000')
        end_time_str = end_time.strftime('%Y-%m-%dT%H:%M:%S.000')
        auth = (self.username, self.password)
        params = {'from': start_time_str, 'to': end_time_str}
        response = requests.get(self.base_url, auth=auth, params=params)

        # check response status and return data if successful
        if response.status_code == 200:
            logging.info("successfully fetched library gate data from the API")
            return response.json()
        else:
            logging.error(
                f"failed to fetch library gate data from the API: {response.status_code}")
            return None

    def get_net_change(self, data):
        # parse fetched library gate data to calculate net change in occupancy
        logging.info("parsing library gate data")
        in_count = sum(1 for entry in data if entry.get(
            'EventType') == 'Valid_Access' and 'IN' in entry.get('SourceEntityDescription', '').upper())
        out_count = sum(1 for entry in data if entry.get(
            'EventType') == 'Valid_Access' and 'OUT' in entry.get('SourceEntityDescription', '').upper())
        net_change = in_count - out_count
        return net_change


# Initialise instance
tunstile_gate_api_username = 'dtopping'
tunstile_gate_api_password = 'UO33mUx3zEKb%S8b'
turnstile_gates_api_service = TurnstileGatesApiService(
    tunstile_gate_api_username, tunstile_gate_api_password)

# Set instances
turnstile_gates_api_service.set_instance()
