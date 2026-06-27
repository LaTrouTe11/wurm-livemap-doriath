'use strict';

(function() {

// Prepare arrays for loaded data
WurmMapGen.config = null;
WurmMapGen.villages = null;
WurmMapGen.guardtowers = null;
WurmMapGen.structures = null;
WurmMapGen.portals = null;
WurmMapGen.players = null;

// Helper function to fetch a dataset from a JSON file
function fetchData(key, path) {
    return fetch('data/' + path)
        .then(function(response) { 
            if (!response.ok) throw new Error('Erreur chargement : ' + path);
            return response.json(); 
        })
        .then(function(responseData) {
            // CORRECTION : Si la structure est déjà un tableau, on l'utilise tel quel
            // Sinon on cherche la propriété correspondant à la clé
            if (key === 'config') {
                WurmMapGen[key] = responseData;
            } else {
                WurmMapGen[key] = (Array.isArray(responseData)) ? responseData : responseData[key];
            }
            return Promise.resolve();
        });
}

// ... (votre code windowIsFocused et setRealtimeTimer reste identique) ...
var windowIsFocused = true;
window.onblur = function(){ windowIsFocused = false; }
window.onfocus = function(){ windowIsFocused = true; }

function setRealtimeTimer() {
    var time = 30000;
    if (!windowIsFocused) { time = 60000; }
    WurmMapGen.realtimeTimer = setTimeout(function() {
        fetchData('players', 'players.json').then(function() {
            if (WurmMapGen.map && WurmMapGen.map.updatePlayerMarkers) {
                WurmMapGen.map.updatePlayerMarkers();
            }
            setRealtimeTimer();
        });
    }, time);
}

// Prepare promises
var promises = [
    fetchData('config', 'config.json'),
    fetchData('villages', 'villages.json'),
    fetchData('guardtowers', 'guardtowers.json'),
    fetchData('structures', 'structures.json'),
    fetchData('portals', 'portals.json')
];

if (document.body.getAttribute('data-realtime') === 'true') {
    promises.push(fetchData('players', 'players.json'));
}

// Start loading
Promise.all(promises)
.catch(function(err) {
    console.error('Erreur critique lors du chargement des données :', err);
})
.then(function() {
    if (!WurmMapGen.config) return;
    
    WurmMapGen.config.xyMulitiplier = (WurmMapGen.config.actualMapSize / WurmMapGen.config.mapTileSize);

    if (WurmMapGen.map && WurmMapGen.map.create) WurmMapGen.map.create();
    if (WurmMapGen.gui && WurmMapGen.gui.init) WurmMapGen.gui.init();
    
    if (document.body.getAttribute('data-realtime') === 'true') {
        setRealtimeTimer();
    }
});

})();
