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
          lignes: {},
        }
      }
    })

    arretData.records.map((arret) => {
      line = {}
      if (arret.fields.location_type === "0") {
        obj = arret.fields

        const coordonnees = [obj.stop_coordinates[1], obj.stop_coordinates[0]]
        let route_type = "autre"

        circuitData.records.map((circuit) => {
          circuit.fields.shape.coordinates.map((shape) => {
            shape.map((coos) => {
              if (arrayEquals(coos, coordonnees)) {
                route_type = (circuit.fields.route_type).toLowerCase()
                if (!arrets[obj.parent_station].lignes[route_type]) {
                  arrets[obj.parent_station].lignes[route_type] = []
                }
                if (arrets[obj.parent_station].lignes[route_type].find(e => e.id === circuit.fields.route_short_name) == undefined) {
                  arrets[obj.parent_station].lignes[route_type].push({
                    id: circuit.fields.route_short_name,
                    nom: circuit.fields.route_long_name,
                    color: `#${circuit.fields.route_color}`,
                    stations: []
                  })
                }

                if (!arrets[obj.parent_station].lignes[route_type].find(e => e.id === circuit.fields.route_short_name).stations.find(e => e.id === obj.stop_id)) {
                  arrets[obj.parent_station].lignes[route_type].find(e => e.id === circuit.fields.route_short_name).stations.push({
                    id: obj.stop_id,
                    nom: obj.stop_name,
                    latitude: obj.stop_coordinates[0],
                    longitude: obj.stop_coordinates[1],
                    acces_handicape: obj.wheelchair_boarding
                  })
                }
              }
            })
          })
        })

        Object.keys(arrets[obj.parent_station].lignes).forEach(function(key, index) {
          if (arrets[obj.parent_station].lignes.length == 0) {
            arrets[obj.parent_station]["acces_handicape"] = false
          }
          else {
            arrets[obj.parent_station].lignes[key].map(ligne => {
              ligne.stations.find(e => e.acces_handicape == 0) ? arrets[obj.parent_station]["acces_handicape"] = false : arrets[obj.parent_station]["acces_handicape"] = true
            });
          }
        });
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
          for (i =0; i<circuit.fields.shape.coordinates[0].length; i++ ){
            if (
              arret.latitude === circuit.fields.shape.coordinates[0][i][1] &&
              arret.longitude === circuit.fields.shape.coordinates[0][i][0]
            ) {
              return true;
            }
          }
        });

        const listeCordonnees = circuit.fields.shape.coordinates[0]
        listeCordonnees.forEach(element => {
          element.reverse()
        });
  
        circuits.push({
          id: circuit.fields.route_short_name,
          nom: circuit.fields.route_long_name, 
          couleur: `#${circuit.fields.route_color}`,
          type: circuit.fields.route_type,
          coordinates: listeCordonnees,
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