# UOD Li-Busy Backend
This repository contains the backend components for the University of Dundee Library Occupancy Tracker project. The backend is responsible for handling the occupancy data collected from the Raspberry Pi sensors and the library turnstile gates, performing calculations, and exposing the data through a REST API.

## Table of Contents
- [Getting Started](#getting-started)
- [Repository Structure](#repository-structure)
- [Deployment](#deployment)

## Getting Started
To get a local copy of the project up and running, follow these steps:
1. Clone the repository: `git clone https://github.com/your_username/uod-lib-occupancy-backend.git`
2. Navigate to the project directory: `cd uod-lib-occupancy-backend`
3. Set up the required environment variables (e.g., database credentials, API keys)
4. Build and run the Docker containers: `docker-compose up --build`

## Repository Structure
The repository has the following structure:

```
uod-lib-occupancy-backend/
├── .github/
│   └── ISSUE_TEMPLATE/
├── ansible-pi-network/
├── api/
├── library-occupancy-calculations/
├── mysql-database/
├── nginx/
├── .gitignore
├── docker-compose.yml
└── README.md
```

- `.github/ISSUE_TEMPLATE`: Contains templates for creating new issues on GitHub.
- `ansible-pi-network`: Ansible playbooks for managing the network of Raspberry Pi sensors.
- `api`: Contains the code for the Node.js Express REST API that exposes the occupancy data.
- `library-occupancy-calculations`: Python scripts for calculating the total library occupancy and predicting future occupancy levels.
- `mysql-database`: SQL files for recreating the database. Contains all the data prior to 21/04/2024.
- `nginx`: Configuration files for the Nginx web server.
- `.gitignore`: Lists the files and directories that should be ignored by Git.
- `docker-compose.yml`: Docker Compose configuration file for managing the backend services.
- `README.md`: This file, providing an overview of the repository.

## Deployment
The backend components are designed to be deployed using Docker containers. The `docker-compose.yml` file defines the services and configurations required for deployment. Follow these steps to deploy the backend:

1. Ensure that Docker and Docker Compose are installed on your system.
2. Navigate to the project directory: `cd uod-lib-occupancy-backend`
3. Build and start the containers: `docker-compose up --build -d`

This will build and start the containers in detached mode, running in the background.
