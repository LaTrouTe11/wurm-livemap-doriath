'use strict';

(function() {

// Initialisation des objets de données
WurmMapGen.config = null;
WurmMapGen.villages = null;
WurmMapGen.guardtowers = null;
WurmMapGen.structures = null;
WurmMapGen.portals = null;
WurmMapGen.deeds = null;
WurmMapGen.towers = null;
WurmMapGen.players = null;
WurmMapGen.timestamp = null;

// Fonction de chargement automatique
function fetchData(key, path) {
    return fetch('data/' + path)
        .then(function(response) { 
            if (!response.ok) return null; // Si le fichier est manquant, on continue quand même
            return response.json(); 
        })
        .then(function(responseData) {
            if (responseData) {
                WurmMapGen[key] = responseData;
            }
            return Promise.resolve();
        });
}

// Liste de TOUS les fichiers à charger depuis la racine (dossier data/)
var filesToLoad = [
    {key: 'config', path: 'config.json'},
    {key: 'villages', path: 'villages.json'},
    {key: 'guardtowers', path: 'guardtowers.json'},
    {key: 'structures', path: 'structures.json'},
    {key: 'portals', path: 'portals.json'},
    {key: 'deeds', path: 'deeds.json'},
    {key: 'towers', path: 'towers.json'},
    {key: 'players', path: 'players.json'},
    {key: 'timestamp', path: 'timestamp.json'}
];

var promises = filesToLoad.map(function(item) {
    return fetchData(item.key, item.path);
});

Promise.all(promises)
.then(function() {
    if (WurmMapGen.config) {
        WurmMapGen.config.xyMulitiplier = (WurmMapGen.config.actualMapSize / WurmMapGen.config.mapTileSize);
        WurmMapGen.map.create();
        WurmMapGen.gui.init();
    } else {
        console.error('Erreur: config.json introuvable !');
    }
})
.catch(function(err) {
    console.error('Erreur critique lors du chargement des données:', err);
});

})();
