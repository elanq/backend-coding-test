# Rides Service
Rides service is a service that responsible for rides data. This service provides capabilities such as:
1. Creating ride data
2. List and filter ride data
3. Get single ride data

## API Endpoints
Below is the list of supported API Endpoints of Rides service

### **Create single ride**
----
Create single ride based on request paramater

**[POST] /rides**

**Request Body**

| parameter  | attribute  | required  | description  |
|---|---|---|---|
| start_lat  | float  | required  |   represent latitude starting point of ride|
|  start_long | float  | required  | represent longitude starting point of ride  |
| end_lat  | float   | required   |  represents latitude ending point of ride  |
| end_long |  float |  required |  represents longitude ending point of ride |
| rider_name  | string  | required  | represents rider name  |
| driver_name | string  | required  | represents driver name  |
| driver_vehicle  | string  | required  | represents driver vehicle  |

**Sample Request**
```
  curl --request POST \
    --url http://localhost:8010/rides \
    --header 'Content-Type: application/json' \
    --data '{
        "start_lat": 80,
        "start_long": 100,
        "end_lat": 81,
        "end_long": 101,
        "rider_name": "Sugiharto",
        "driver_name": "Sugeng",
        "driver_vehicle": "Motorcycle"
  }'
```

**SampleResponse**
* **Response Code: 200**
  ```
  [
    {
      "rideID": 1,
      "startLat": 80,
      "startLong": 100,
      "endLat": 81,
      "endLong": 101,
      "riderName": "Sugiharto",
      "driverName": "Sugeng",
      "driverVehicle": "Motorcycle",
      "created": "2022-06-16 12:04:49"
    }
  ]
  ```

* **Response Code: 400**
  ```
  {
    "error_code": "VALIDATION_ERROR",
    "message": "Start latitude and longitude must be between -90 - 90 and -180 to 180 degrees respectively"
  }
  ```

### **List rides**
----
List created rides data

**[GET] /rides?offset={offset}&limit={limit}**

**Request Parameter**

| parameter  | attribute  | required  | description  |
|---|---|---|---|
| offset  | integer  | optional  | Offset of pagination. if not specified, default value is 0 |
|  limit | integer  | optional  | Result limit. Default value is 10  |

**Sample Request**
```
curl --request GET \
  --url http://localhost:8010/rides
```

**SampleResponse**
* **Response Code: 200**
  ```
  [
    {
      "rideID": 1,
      "startLat": 80,
      "startLong": 100,
      "endLat": 81,
      "endLong": 101,
      "riderName": "Sugiharto",
      "driverName": "Sugeng",
      "driverVehicle": "Motorcycle",
      "created": "2022-06-16 12:04:49"
    }
  ]
  ```

* **Response Code: 404**
  ```
  {
    "error_code": "RIDES_NOT_FOUND_ERROR",
    "message": "Could not find any rides"
  }
  ```

### **Get ride detail by id**
----
Get single ride data by id

**[GET] /rides/:id**

**Path Parameter**

| parameter  | attribute  | required  | description  |
|---|---|---|---|
| id  | integer  | required  | Represents id of single ride |

**Sample Request**
```
curl --request GET \
  --url http://localhost:8010/rides/1
```

**SampleResponse**
* **Response Code: 200**
  ```
  [
    {
      "rideID": 1,
      "startLat": 80,
      "startLong": 100,
      "endLat": 81,
      "endLong": 101,
      "riderName": "Sugiharto",
      "driverName": "Sugeng",
      "driverVehicle": "Motorcycle",
      "created": "2022-06-16 12:04:49"
    }
  ]
  ```

* **Response Code: 404**
  ```
  {
    "error_code": "RIDES_NOT_FOUND_ERROR",
    "message": "Could not find any rides"
  }
  ```