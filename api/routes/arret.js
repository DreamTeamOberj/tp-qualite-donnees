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

app.get('/api/users/:id', (req, res) => {
    // Récupération de l'utilisateur avec l'ID spécifié dans la requête
    const userId = req.params.id;
    const user = { id: userId, name: 'Alice' };

    res.json(user);
});