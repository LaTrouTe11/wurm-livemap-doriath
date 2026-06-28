'use strict';

(function() {

// Initialisation des objets
window.WurmMapGen = window.WurmMapGen || {};
WurmMapGen.config = null;
WurmMapGen.villages = null;
WurmMapGen.guardtowers = null;
WurmMapGen.structures = null;
WurmMapGen.portals = null;
WurmMapGen.deeds = null;
WurmMapGen.towers = null;
WurmMapGen.players = null;

// Fonction de chargement avec debug intégré
function fetchData(key, path) {
    return fetch('data/' + path)
        .then(function(response) {
            if (!response.ok) throw new Error('Fichier introuvable: ' + path);
            return response.json();
        })
        .then(function(responseData) {
            WurmMapGen[key] = responseData;
            return Promise.resolve();
        })
        .catch(function(err) {
            console.warn('Attention: Impossible de charger ' + path + ' (' + err.message + ')');
            return null; // On continue même si un fichier manque
        });
}

// Liste des fichiers à charger
var filesToLoad = [
    {key: 'config', path: 'config.json'},
    {key: 'villages', path: 'villages.json'},
    {key: 'guardtowers', path: 'guardtowers.json'},
    {key: 'structures', path: 'structures.json'},
    {key: 'portals', path: 'portals.json'},
    {key: 'deeds', path: 'deeds.json'},
    {key: 'towers', path: 'towers.json'}
];

var promises = filesToLoad.map(function(item) {
    return fetchData(item.key, item.path);
});

// Lancement
Promise.all(promises)
.then(function() {
    if (!WurmMapGen.config) {
        throw new Error('CONFIG.JSON EST ABSENT ! La carte ne peut pas démarrer.');
    }

    // Calculs nécessaires
    WurmMapGen.config.xyMulitiplier = (WurmMapGen.config.actualMapSize / WurmMapGen.config.mapTileSize);

    // Initialisation de la carte
    WurmMapGen.map.create();
    WurmMapGen.gui.init();
    
    console.log('Carte chargée avec succès !');
})
.catch(function(err) {
    console.error('ERREUR CRITIQUE:', err.message);
    document.body.innerHTML = '<h2 style="color:red;">Erreur de chargement: ' + err.message + '</h2>';
});

})();
