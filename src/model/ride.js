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

module.exports = {
  listRides,
  getRideByID,
};
