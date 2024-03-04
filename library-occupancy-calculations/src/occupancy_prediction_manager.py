from datetime import datetime, timedelta
import pandas as pd
from sklearn.model_selection import train_test_split
from sklearn.ensemble import RandomForestRegressor
from sklearn.metrics import mean_squared_error, r2_score
import logging

from services.library_occupancy_api import LibraryOccupancyAPI


class OccpancyPredictionManager:
    def __init__(self, api_url):
        self.occupancy_api = LibraryOccupancyAPI(api_url)
        self.model = RandomForestRegressor()

    def fetch_data(self, section_id, start_date, end_date):
        # fetching data from the API for a specific section within a time period
        data = self.occupancy_api.get_occupancy_data_by_time_period(
            section_id, start_date, end_date)
        occupancy_data = data.get('occupancy_data', [])
        df = pd.DataFrame(occupancy_data)

        return df

    def preprocess_data(self, df):
        # converting timestamp to datetime and extracting features
        df['date'] = pd.to_datetime(df['date'])
        df['hour'] = df['date'].dt.hour
        df['day_of_week'] = df['date'].dt.dayofweek
        return df

    def prepare_next_day_features(self):
        # preparing features for the next day
        next_day = datetime.now().date() + timedelta(days=1)
        hours = range(24)
        feature_data = [{'hour': hour, 'day_of_week': next_day.weekday()}
                        for hour in hours]
        next_day_features_df = pd.DataFrame(feature_data)
        return next_day_features_df

    def train_model(self, df):
        features = df[['hour', 'day_of_week']]
        target = df['average_occupancy_count']

        # splitting the data into training and testing sets
        X_train, X_test, y_train, y_test = train_test_split(
            features, target, test_size=0.2, random_state=42)

        # training the model on the training set
        self.model.fit(X_train, y_train)

        # evaluating the model on the testing set
        y_pred = self.model.predict(X_test)
        rmse = mean_squared_error(y_test, y_pred, squared=False)
        r2 = r2_score(y_test, y_pred)

        # logging the evaluation metrics
        logging.info(f"Root Mean Squared Error: {rmse}")
        logging.info(f"R^2 Score: {r2}")

    def predict_next_day_occupancy(self):

        next_day_features_df = self.prepare_next_day_features()
        predictions = self.model.predict(next_day_features_df)

        # combining predicted hour with its corresponding prediction
        next_day_predictions_with_time = [(hour, prediction) for hour, prediction in zip(
            next_day_features_df['hour'], predictions)]

        return next_day_predictions_with_time

    def run(self):
        sections = [1, 2, 3, 4, 5, 6]

        for section_id in sections:
            # calculating start and end dates for the last month
            end_date = datetime.now().strftime("%Y-%m-%d")
            start_date = (datetime.now() - timedelta(days=30)
                          ).strftime("%Y-%m-%d")
            df = self.fetch_data(section_id, start_date, end_date)
            df_preprocessed = self.preprocess_data(df)

            # training the model with the preprocessed data
            self.train_model(df_preprocessed)

            # predicting next day occupancy
            next_day_predictions = self.predict_next_day_occupancy()
            logging.info(f"Next Day Predictions for Section {section_id}:")
            for hour, prediction in next_day_predictions:
                logging.info(f"Hour: {hour}, Prediction: {prediction}")

            # posting predictions to the API
            self.occupancy_api.post_predictions(
                section_id, next_day_predictions)
