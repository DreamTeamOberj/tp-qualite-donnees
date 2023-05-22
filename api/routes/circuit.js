app.get('/api/circuit', async (req, res) => {

    try {
        const circuitResponse = await fetch('https://data.nantesmetropole.fr/api/records/1.0/search/?dataset=244400404_tan-circuits&q=&rows=10000&facet=route_long_name&facet=route_type');
        const circuitData = await circuitResponse.json();

        circuit = []

        circuitData.records.map((circuit) => {
                circuit.push({
                    nom: circuit.fields.route_long_name,
                })
        })
        res.json(circuit);
    }

    catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Erreur lors de la récupération des données' });
    }

});
