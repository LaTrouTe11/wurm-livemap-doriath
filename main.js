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
                console.warn('Chargement sauté ou fichier vide : ' + path);
                // Sécurité totale : initialise des données vides par défaut pour éviter l'écran blanc
                WurmMapGen[key] = (key === 'config' || key === 'timestamp') ? {} : [];
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
        // Si le fichier config n'a pas pu être chargé du tout, on applique des valeurs de secours
        if (!WurmMapGen.config || !WurmMapGen.config.actualMapSize) {
            WurmMapGen.config = {
                serverName: "[QC/FR/CAN] QBC Doriath",
                actualMapSize: 4096,
                mapTileSize: 256,
                mapMaxZoom: 5,
                mapMinZoom: 0,
                nativeZoom: 5,
                markerType: 2
            };
        }
        
        WurmMapGen.config.xyMulitiplier = (WurmMapGen.config.actualMapSize / WurmMapGen.config.mapTileSize);
        
        // Initialisation sécurisée des composants de la carte
        if (WurmMapGen.map && typeof WurmMapGen.map.create === 'function') {
            WurmMapGen.map.create();
        }
        
        if (WurmMapGen.gui && typeof WurmMapGen.gui.init === 'function') {
            WurmMapGen.gui.init();
        }
    });
})();


