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

app.get('/api/arret', async (req, res) => {

    try {
        const arretResponse = await fetch('https://data.nantesmetropole.fr/api/records/1.0/search/?dataset=244400404_tan-arrets&q=&rows=10000');
        const arretData = await arretResponse.json();

        arrets = [];

        arretData.records.map((arret) => {
            if (arret.fields.location_type === "1") {
                arrets.push({
                    latitude: arret.fields.stop_coordinates[0],
                    longitude: arret.fields.stop_coordinates[1],
                    nom: arret.fields.stop_name,
                    id: arret.fields.stop_id
                    
                })
            }
        })


        res.json(arrets);
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