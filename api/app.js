const express = require('express');
const app = express()
const port = 3000

app.get('/', (req, res) => {
  res.send('Hello World!')
})

app.listen(port, () => {
  console.log(`API lancée sur http://localhost:${port}`);
})

app.get('/api/arret', async (req, res) => {

  try {
    const arretResponse = await fetch('https://data.nantesmetropole.fr/api/records/1.0/search/?dataset=244400404_tan-arrets&q=&rows=10000');
    const arretData = await arretResponse.json();

    arrets = {};

    arretData.records.map((arret) => {
      if (arret.fields.location_type === "1") {
        obj = arret.fields
        console.log(obj.stop_id)
        arrets[obj.stop_id] = {
          latitude: obj.stop_coordinates[0],
          longitude: obj.stop_coordinates[1],
          nom: obj.stop_name,
          id: obj.stop_id,
          enfants: []
        }
      }
    })

    arretData.records.map((arret) => {
      if (arret.fields.location_type === "0") {
        obj = arret.fields
        console.log(obj.stop_id + " - " + obj.parent_station);

        arrets[obj.parent_station].enfants.push({
          id: obj.stop_id,
          nom: obj.stop_name,
          latitude: obj.stop_coordinates[0],
          longitude: obj.stop_coordinates[1],
          acces_handicape: obj.wheelchair_boarding > 0 ? true : false
        })
      }
    })

    res.json(Object.values(arrets));
  }

  catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Erreur lors de la récupération des données' });
  }

});

app.get('/api/circuit', async (req, res) => {
  try {
    const circuitResponse = await fetch(
      'https://data.nantesmetropole.fr/api/records/1.0/search/?dataset=244400404_tan-circuits&q=&rows=10000'
    );
    const circuitData = await circuitResponse.json();

    const arretResponse = await fetch(
      'https://data.nantesmetropole.fr/api/records/1.0/search/?dataset=244400404_tan-arrets&q=&rows=10000'
    );
    const arretData = await arretResponse.json();

    const circuits = [];

    circuitData.records.map((circuit) => {
      const associatedArrets = arretData.records.filter((arret) => {
        if (
          arret.fields.location_type === "1" &&
          arret.fields.stop_coordinates[0] === circuit.fields.shape.coordinates[0][0][1] &&
          arret.fields.stop_coordinates[1] === circuit.fields.shape.coordinates[0][0][0]
        ) {
          return true;
        }
      });

      circuits.push({
        nom: circuit.fields.route_long_name,
        couleur: `#${circuit.fields.route_color}`,
        type: circuit.fields.route_type,
        coordinates: circuit.fields.shape.coordinates,
        arrets: associatedArrets.map((arret) => ({
          nom: arret.fields.stop_name,
          coordonnees: arret.fields.stop_coordinates,
        })),
      });
    });

    res.json(circuits);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Erreur lors de la récupération des données' });
  }
});


app.get('/api/users/:id', (req, res) => {
  // Récupération de l'utilisateur avec l'ID spécifié dans la requête
  const userId = req.params.id;
  const user = { id: userId, name: 'Alice' };

  res.json(user);
});