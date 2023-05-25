const e = require('express');
const express = require('express');
const fetch = require('node-fetch');
const app = express()
const port = 3000

app.get('/', (req, res) => {
  res.send('Hello World!')
})

app.listen(port, () => {
  console.log(`API lancée sur http://localhost:${port}`);
})


function arrayEquals(a, b) {
  return Array.isArray(a) &&
    Array.isArray(b) &&
    a.length === b.length &&
    a.every((val, index) => val === b[index]);
}

app.get('/api/arret', async (req, res) => {

  try {
    const circuitResponse = await fetch(
      'https://data.nantesmetropole.fr/api/records/1.0/search/?dataset=244400404_tan-circuits&q=&rows=10000'
    );
    const circuitData = await circuitResponse.json();

    const arretResponse = await fetch('https://data.nantesmetropole.fr/api/records/1.0/search/?dataset=244400404_tan-arrets&q=&rows=10000');
    const arretData = await arretResponse.json();

    arrets = {};

    arretData.records.map((arret) => {
      if (arret.fields.location_type === "1") {
        obj = arret.fields
        arrets[obj.stop_id] = {
          latitude: obj.stop_coordinates[0],
          longitude: obj.stop_coordinates[1],
          nom: obj.stop_name,
          id: obj.stop_id,
          enfants: {},
        }
      }
    })

    arretData.records.map((arret) => {
      child = {}
      if (arret.fields.location_type === "0") {
        obj = arret.fields

        child["id"] = obj.stop_id
        child["nom"] = obj.stop_name
        child["acces_handicape"] = obj.wheelchair_boarding
        // child["stations"] = []

        const coordonnees = [obj.stop_coordinates[1], obj.stop_coordinates[0]]
        let route_type = "autre"

        circuitData.records.map((circuit) => {
          circuit.fields.shape.coordinates.map((shape) => {
            shape.map((coos) => {
              if (arrayEquals(coos, coordonnees)) {
                child["ligne"] = {
                  id: circuit.fields.route_short_name,
                  nom: circuit.fields.route_long_name
                }
                route_type = (circuit.fields.route_type).toLowerCase()
              }
            })
          })
        })

        if (child["ligne"]) {

          if (!arrets[obj.parent_station].enfants[route_type]) {
            arrets[obj.parent_station].enfants[route_type] = []
          }
          if (child.nom == "Commerce") {
            arrets[obj.parent_station].enfants[route_type].map(e => {
              console.log(e.ligne.id + " ===== " + child.ligne.id);
            })
          }

          if (!arrets[obj.parent_station].enfants[route_type].find(e => e.ligne.id === child.ligne.id)) {
            if (child.nom == "Commerce") {
              console.log("PUSH !");
            }
            // child.stations.push({ latitude: obj.stop_coordinates[0], longitude: obj.stop_coordinates[1] })
            arrets[obj.parent_station].enfants[route_type].push(child)
          }
          // else {
          //   console.log(route_type);
          //   console.log(arrets[obj.parent_station].enfants[route_type]);
          //   arrets[obj.parent_station].enfants[route_type].stations.push({ latitude: obj.stop_coordinates[0], longitude: obj.stop_coordinates[1] })
          // }
        }
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
      'http://localhost:3000/api/arret'
    );
    const arretData = await arretResponse.json();

    const circuits = [];

    circuitData.records.map((circuit) => {
      const associatedArrets = arretData.filter((arret) => {
        for (i = 0; i < circuit.fields.shape.coordinates[0].length; i++) {
          if (
            arret.latitude === circuit.fields.shape.coordinates[0][i][1] &&
            arret.longitude === circuit.fields.shape.coordinates[0][i][0]
          ) {
            return true;
          }
        }
      });

      circuits.push({
        nom: circuit.fields.route_long_name,
        couleur: `#${circuit.fields.route_color}`,
        type: circuit.fields.route_type,
        coordinates: circuit.fields.shape.coordinates[0],
        arrets: associatedArrets.map((arret) => (arret)),
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