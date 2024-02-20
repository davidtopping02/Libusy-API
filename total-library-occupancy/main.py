import logging
import time
from gate.library_gates_api import LibraryGateAPI


def main():

    # TODO: configure logging

    # lib gates API credentials and URL
    username = 'dtopping'
    password = 'UO33mUx3zEKb%S8b'
    api_url = 'https://your-library-occupancy-api.com'

    api = LibraryGateAPI(username, password, api_url)

    try:
        api.run_periodically(interval_minutes=20)
    except KeyboardInterrupt:
        # TODO: log the keyboard interupt
        pass
    except Exception as e:
        # TODO: log the error
        pass


if __name__ == "__main__":
    main()
