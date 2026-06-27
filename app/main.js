'use strict';

(function() {

// Prepare arrays for loaded data
WurmMapGen.config = null;
WurmMapGen.villages = null;
WurmMapGen.guardtowers = null;
WurmMapGen.structures = null;
WurmMapGen.portals = null;
WurmMapGen.players = null; // Ajouté pour éviter erreur si realtime est off

// Helper function to fetch a dataset from a JSON file
function fetchData(key, path) {
    return fetch('data/' + path)
        .then(function(response) { 
            if (!response.ok) throw new Error('Erreur chargement : ' + path);
            return response.json(); 
        })
        .then(function(responseData) {
            // Si la clé est 'config', on prend l'objet directement
            WurmMapGen[key] = (key === 'config') ? responseData : responseData[key];
            return Promise.resolve();
        });
}

// Keep track of whether or not the window is focused and active
var windowIsFocused = true;
window.onblur = function(){ windowIsFocused = false; }
window.onfocus = function(){ windowIsFocused = true; }

// Helper function to set timeout for refreshing realtime data
function setRealtimeTimer() {
    var time = 30000;
    if (!windowIsFocused) { time = 60000; }

    WurmMapGen.realtimeTimer = setTimeout(function() {
        // CHANGEMENT : on pointe vers players.json et non .php
        fetchData('players', 'players.json').then(function() {
            if (WurmMapGen.map && WurmMapGen.map.updatePlayerMarkers) {
                WurmMapGen.map.updatePlayerMarkers();
                WurmMapGen.gui.playerCount = WurmMapGen.players ? WurmMapGen.players.length : 0;
            }
            setRealtimeTimer();
        });
    }, time);
}

// Prepare promises to load data
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
    console.error('Could not load data');
    console.error(err);
})
.then(function() {
    if (!WurmMapGen.config) return;
    
    // Add computed config values
    WurmMapGen.config.xyMulitiplier = (WurmMapGen.config.actualMapSize / WurmMapGen.config.mapTileSize);

    // Create the map
    if (WurmMapGen.map && WurmMapGen.map.create) {
        WurmMapGen.map.create();
    }

    // Initialise the GUI
    if (WurmMapGen.gui && WurmMapGen.gui.init) {
        WurmMapGen.gui.init();
    }

    // Set interval to refresh realtime data
    if (document.body.getAttribute('data-realtime') === 'true') {
        setRealtimeTimer();
    }
});

})();
