const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const cors = require('cors');
const { client } = require('./db');

app.use(bodyParser.json());
app.use(express.static('public'));
app.use(express.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cors());

app.get('/', (req, res) => {
    res.json({
      message: "Welcome My Assesment",
      endpoints: {
        "/addSchool": {
          method: "POST",
          description: "Add a new school to the database.",
          body: {
            name: "School name (string)",
            address: "School address (string)",
            lat: "Latitude of the school (float)",
            long: "Longitude of the school (float)"
          },
          example_input:{
            name:'Mountain Peak Academy',
            address:'555 Summit Road, Peak Town',
            lat:'39.7392',
            long:'-104.9903'
          }
        },
        "/listschools/:latitude/:longitude": {
          method: "GET",
          description: "Retrieve a list of schools sorted by proximity to the specified location.",
          params: {
            latitude: "User's latitude (float)",
            longitude: "User's longitude (float)"
          }
          ,
          example_input:{
            latitude:"39.7392",
            longitude:'-104.9903'
          }
        }
      }
    });
  });



app.post('/addSchool', async (req, res) => {
  try {
    const { name, address, lat, long } = req.body;

    if (!name || !address || !lat || !long) {
      return res.status(400).json({ error: 'All fields are required' });
    }

    const insertQuery = `
      INSERT INTO d (name, address, latitude, longitude)
      VALUES ($1, $2, $3, $4)
      RETURNING *;
    `;
    
    const result = await client.query(insertQuery, [name, address, lat, long]);

    res.status(201).json({
      success: true,
      data: result.rows[0],
    });
  } catch (error) {
    console.error('Error in /addSchool:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

const haversineDistance = (coords1, coords2) => {
  function toRad(x) {
    return (x * Math.PI) / 180;
  }

  const R = 6371; // Radius of the Earth in kilometers
  const dLat = toRad(coords2.latitude - coords1.latitude);
  const dLon = toRad(coords2.longitude - coords1.longitude);
  const lat1 = toRad(coords1.latitude);
  const lat2 = toRad(coords2.latitude);

  const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
            Math.sin(dLon / 2) * Math.sin(dLon / 2) * Math.cos(lat1) * Math.cos(lat2); 
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a)); 
  return R * c; // Distance in kilometers
};

app.get('/listschools/:latitude/:longitude', async (req, res) => {
  try {
    const { latitude, longitude } = req.params;

    // Validate the user's location parameters
    if (!latitude || !longitude) {
      return res.status(400).json({ error: 'Latitude and longitude are required' });
    }

    const userLocation = { latitude: parseFloat(latitude), longitude: parseFloat(longitude) };

    // Fetch all schools from the database
    const result = await client.query('SELECT * FROM d');
    const schools = result.rows;

    // Calculate the distance from the user's location and sort the schools by distance
    const sortedSchools = schools.map(school => {
      const schoolLocation = { latitude: school.latitude, longitude: school.longitude };
      school.distance = haversineDistance(userLocation, schoolLocation);
      return school;
    }).sort((a, b) => a.distance - b.distance);

    res.json(sortedSchools);
  } catch (error) {
    console.error('Error in /listschools:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

app.listen(8080, () => {
  console.log('Server is running on http://localhost:8080');
});
