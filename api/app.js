const express = require('express');
const app = express()
const port = 3000

try {
    const arretResponse = await fetch('https://data.nantesmetropole.fr/api/records/1.0/search/?dataset=244400404_tan-arrets&q=&rows=10000');
    const arretData = await arretResponse.json();

    const curcuitResponse = await fetch('https://data.nantesmetropole.fr/api/records/1.0/search/?dataset=244400404_tan-arrets&q=&rows=10000');
    const circuitData = await curcuitResponse.json();
}

catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Erreur lors de la récupération des données' });
}


app.get('/', (req, res) => {
    res.send('Hello World!')
})

app.listen(port, () => {
    console.log(`API lancée sur http://localhost:${port}`);
})

app.get('/api/arrets', async (req, res) => {

    try {
        const response = await fetch('https://data.nantesmetropole.fr/api/records/1.0/search/?dataset=244400404_tan-arrets&q=&rows=10000');
        const data = await response.json();

        res.json(data);
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
