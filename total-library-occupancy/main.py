from gate.library_gates_api import LibraryGateAPI


def main():

    # TODO: configure logging

    # lib gates API credentials and URL
    username = 'dtopping'
    password = 'UO33mUx3zEKb%S8b'

    api_url = 'http://10.8.0.1:3000'
    # api_url = 'http://uod-lib-occupancy-raspberry-pi-controller-api:3000'

    api = LibraryGateAPI(username, password, api_url)

    api.run_periodically(interval_minutes=20)

    # try:
    #     api.run_periodically(interval_minutes=20)
    # except KeyboardInterrupt:
    #     # TODO: log the keyboard interupt
    #     pass
    # except Exception as e:
    #     # TODO: log the error
    #     pass


if __name__ == "__main__":
    main()
