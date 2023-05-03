app.get('/api/circuit', async (req, res) => {

    try {
        const circuitResponse = await fetch('https://data.nantesmetropole.fr/api/records/1.0/search/?dataset=244400404_tan-circuits&q=&rows=10000&facet=route_long_name&facet=route_type');
        const circuitData = await circuitResponse.json();

        circuit = []

        circuitData.records.map((circuit) => {
            if (circuit.fields.location_type === "1") {
                circuit.push({
                    nom: circuit.fields.stop_name,
                })
            }
        })


        res.json(circuits);
    }

    catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Erreur lors de la récupération des données' });
    }

});
