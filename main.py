import MySQLdb
from flask import Flask, jsonify, request
from flask_restful import Api, Resource


class Database:
    def __init__(self, host, port, user, password, db):
        self.connection = MySQLdb.connect(
            host=host,
            port=port,
            user=user,
            passwd=password,
            db=db
        )

    def execute_query(self, query):
        cur = self.connection.cursor()
        cur.execute(query)
        data = cur.fetchall()
        cur.close()
        return data

    def close(self):
        self.connection.close()


app = Flask(__name__)
app.config['MYSQL_HOST'] = '10.8.0.1'
app.config['MYSQL_PORT'] = 3307
app.config['MYSQL_USER'] = 'flask'
app.config['MYSQL_PASSWORD'] = 'password'
app.config['MYSQL_DB'] = 'uodLibraryOccupancy'

db = Database(
    host=app.config['MYSQL_HOST'],
    port=app.config['MYSQL_PORT'],
    user=app.config['MYSQL_USER'],
    password=app.config['MYSQL_PASSWORD'],
    db=app.config['MYSQL_DB']
)

api = Api(app)


class Sensor(Resource):
    def get(self):
        data = db.execute_query('''SELECT * FROM sensor''')
        db.close()
        return jsonify(data)


class Occupancy(Resource):
    def get(self):
        # Get the section_id from the request parameters or set a default value
        section_id = request.args.get('section', 1, type=int)

        # Execute the SQL query with the provided section_id (no quotes)
        query = f'''SELECT od.occupancy_count
        FROM occupancyData od
        JOIN sensor s ON od.sensor_id = s.sensor_id
        WHERE s.section_id = {section_id}
        ORDER BY od.timestamp DESC
        LIMIT 1;
        '''

        data = db.execute_query(query)
        print(jsonify(data))
        return jsonify(data)


api.add_resource(Sensor, "/sensors")
api.add_resource(Occupancy, "/occupancy")


if __name__ == "__main__":
    app.run(debug=True)
