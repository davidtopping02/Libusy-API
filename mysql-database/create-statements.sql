-- Create section table
CREATE TABLE `section` (
  `section_id` int NOT NULL AUTO_INCREMENT,
  `description` varchar(255) NOT NULL,
  `current_occupancy` int NOT NULL,
  `total_occupancy` int NOT NULL,
  `occupancy_percentage` float GENERATED ALWAYS AS ((case when (`total_occupancy` = 0) then 0 else ((`current_occupancy` / `total_occupancy`) * 100) end)) STORED,
  PRIMARY KEY (`section_id`)
) ENGINE=InnoDB AUTO_INCREMENT=8 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;


-- Create sensor table (sensor)
CREATE TABLE `sensor` (
  `sensor_id` varchar(15) NOT NULL,
  `type` varchar(255) NOT NULL,
  `section_id` int NOT NULL,
  PRIMARY KEY (`sensor_id`),
  KEY `section_id` (`section_id`),
  CONSTRAINT `sensor_ibfk_1` FOREIGN KEY (`section_id`) REFERENCES `section` (`section_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- Create occupancyReading table (occupancyReadings)
CREATE TABLE `occupancyPrediction` (
  `section_id` int NOT NULL,
  `prediction_datetime` datetime NOT NULL,
  `predicted_occupancy` int NOT NULL,
  `prediction_created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`section_id`,`prediction_datetime`),
  KEY `section_id` (`section_id`),
  CONSTRAINT `fk_section_id_prediction` FOREIGN KEY (`section_id`) REFERENCES `section` (`section_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

 
 -- Create occupancySummary table (occupancySummary)
CREATE TABLE `occupancySummary` (
  `summary_id` int NOT NULL AUTO_INCREMENT,
  `section_id` int NOT NULL,
  `date` datetime NOT NULL,
  `average_occupancy_count` int NOT NULL,
  PRIMARY KEY (`summary_id`),
  UNIQUE KEY `section_id` (`section_id`,`date`),
  CONSTRAINT `fk_section_id` FOREIGN KEY (`section_id`) REFERENCES `section` (`section_id`)
) ENGINE=InnoDB AUTO_INCREMENT=145 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- Create occupancyPrediction table
CREATE TABLE `occupancyPrediction` (
  `section_id` int NOT NULL,
  `prediction_time` time NOT NULL,
  `predicted_occupancy` int NOT NULL,
  `prediction_created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`section_id`,`prediction_time`),
  KEY `section_id` (`section_id`),
  CONSTRAINT `fk_section_id_prediction` FOREIGN KEY (`section_id`) REFERENCES `section` (`section_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;