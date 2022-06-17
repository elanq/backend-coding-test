async function listRides(db, offset = 0, limit = 10) {
  const query = 'SELECT * FROM Rides LIMIT ?,?';

  return new Promise((resolve, reject) => {
    db.all(query, [offset, limit], (err, rows) => {
      if (err != null) {
        reject(err);
      }
      resolve(rows);
    });
  });
}

async function getRideByID(db, rideID) {
  const query = 'SELECT * FROM Rides WHERE rideID = ?';

  return new Promise((resolve, reject) => {
    db.all(query, [rideID], (err, rows) => {
      if (err != null) { reject(err); }

      resolve(rows);
    });
  });
}

function newRide(requestBody) {
  return {
    startLatitude: requestBody.start_lat,
    startLongitude: Number(requestBody.start_long),
    endLatitude: Number(requestBody.end_lat),
    endLongitude: Number(requestBody.end_long),
    riderName: requestBody.rider_name,
    driverName: requestBody.driver_name,
    driverVehicle: requestBody.driver_vehicle,
  };
}

async function insertNewRide(db, ride) {
  const values = [
    ride.startLatitude,
    ride.startLongitude,
    ride.endLatitude,
    ride.endLongitude,
    ride.riderName,
    ride.driverName,
    ride.driverVehicle,
  ];

  return new Promise((resolve, reject) => {
    db.run('INSERT INTO Rides(startLat, startLong, endLat, endLong, riderName, driverName, driverVehicle) VALUES (?, ?, ?, ?, ?, ?, ?)', values, (err) => {
      if (err) { reject(err); }

      resolve(this.lastID);
    });
  });
}

function validateRideData(ride) {
  if (ride.startLatitude < -90 || ride.startLatitude > 90
      || ride.startLongitude < -180 || ride.startLongitude > 180) {
    return {
      error_code: 'VALIDATION_ERROR',
      message: 'Start latitude and longitude must be between -90 - 90 and -180 to 180 degrees respectively',
    };
  }

  if (ride.endLatitude < -90 || ride.endLatitude > 90
     || ride.endLongitude < -180 || ride.endLongitude > 180) {
    return {
      error_code: 'VALIDATION_ERROR',
      message: 'End latitude and longitude must be between -90 - 90 and -180 to 180 degrees respectively',
    };
  }

  if (typeof ride.riderName !== 'string' || ride.riderName.length < 1) {
    return {
      error_code: 'VALIDATION_ERROR',
      message: 'Rider name must be a non empty string',
    };
  }

  if (typeof ride.driverName !== 'string' || ride.driverName.length < 1) {
    return {
      error_code: 'VALIDATION_ERROR',
      message: 'Driver name must be a non empty string',
    };
  }

  if (typeof driverVehicle !== 'string' || ride.driverVehicle.length < 1) {
    return {
      error_code: 'VALIDATION_ERROR',
      message: 'Driver vehicle must be a non empty string',
    };
  }

  return null;
}

module.exports = {
  listRides,
  getRideByID,
  newRide,
  validateRideData,
  insertNewRide,
};
