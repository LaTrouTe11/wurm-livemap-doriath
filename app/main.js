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

// Fonction de chargement robuste (ne plante pas si un fichier est vide ou manque)
function fetchData(key, path) {
    return fetch('data/' + path)
        .then(function(response) { 
            if (!response.ok) return null;
            return response.json(); 
        })
        .then(function(responseData) {
            // On stocke directement la donnée sans chercher de clé intermédiaire
            if (responseData) {
                WurmMapGen[key] = responseData;
            }
            return Promise.resolve();
        });
}

// Gestion du focus (pour économiser la batterie des visiteurs)
var windowIsFocused = true;
window.onblur = function(){ windowIsFocused = false; }
window.onfocus = function(){ windowIsFocused = true; }

// Timer temps réel pour les joueurs
function setRealtimeTimer() {
    var time = windowIsFocused ? 30000 : 60000;
    WurmMapGen.realtimeTimer = setTimeout(function() {
        fetchData('players', 'players.json').then(function() {
            if (WurmMapGen.map.updatePlayerMarkers) {
                WurmMapGen.map.updatePlayerMarkers();
            }
            setRealtimeTimer();
        });
    }, time);
}

// Liste des fichiers à charger
var filesToLoad = [
    {key: 'config', path: 'config.json'},
    {key: 'villages', path: 'villages.json'},
    {key: 'guardtowers', path: 'guardtowers.json'},
    {key: 'structures', path: 'structures.json'},
    {key: 'portals', path: 'portals.json'},
    {key: 'deeds', path: 'deeds.json'},
    {key: 'towers', path: 'towers.json'},
    {key: 'players', path: 'players.json'}
];

// Chargement
var promises = filesToLoad.map(function(item) {
    return fetchData(item.key, item.path);
});

Promise.all(promises)
.then(function() {
    if (!WurmMapGen.config) {
        throw new Error('config.json introuvable ou corrompu');
    }
    
    // Calculs de base pour la carte
    WurmMapGen.config.xyMulitiplier = (WurmMapGen.config.actualMapSize / WurmMapGen.config.mapTileSize);
    
    WurmMapGen.map.create();
    WurmMapGen.gui.init();

    if (document.body.getAttribute('data-realtime') === 'true') {
        setRealtimeTimer();
    }
})
.catch(function(err) {
    console.error('Erreur lors du chargement:', err);
});

})();
