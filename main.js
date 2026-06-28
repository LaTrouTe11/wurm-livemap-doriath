'use strict';

(function() {
    window.WurmMapGen = window.WurmMapGen || {};

    function fetchData(key, path) {
        return fetch('data/' + path)
            .then(function(response) {
                if (!response.ok) throw new Error('Fichier introuvable: ' + path);
                return response.json();
            })
            .then(function(data) {
                WurmMapGen[key] = data;
            })
            .catch(function(err) {
                console.warn('Chargement sauté pour: ' + path);
                // Sécurité : évite le crash si players.json ou un autre fichier facultatif est absent
                if (key === 'players') { WurmMapGen[key] = []; }
            });
    }

    var filesToLoad = [
        {key: 'config', path: 'config.json'},
        {key: 'villages', path: 'villages.json'},
        {key: 'guardtowers', path: 'guardtowers.json'},
        {key: 'structures', path: 'structures.json'},
        {key: 'portals', path: 'portals.json'},
        {key: 'players', path: 'players.json'},
        {key: 'timestamp', path: 'timestamp.json'}
    ];

    Promise.all(filesToLoad.map(function(item) { return fetchData(item.key, item.path); }))
    .then(function() {
        if (!WurmMapGen.config) {
            document.body.innerHTML = '<h2 style="color:red;">Erreur: config.json manquant.</h2>';
            return;
        }
        WurmMapGen.config.xyMulitiplier = (WurmMapGen.config.actualMapSize / WurmMapGen.config.mapTileSize);
        
        // Sécurité : s'assurer que WurmMapGen.map existe avant d'appeler create()
        if (WurmMapGen.map && typeof WurmMapGen.map.create === 'function') {
            WurmMapGen.map.create();
        } else {
            console.error("Erreur : Le script map.js n'a pas pu être initialisé correctement.");
        }
        
        if (WurmMapGen.gui && typeof WurmMapGen.gui.init === 'function') {
            WurmMapGen.gui.init();
        }
    });
})();


