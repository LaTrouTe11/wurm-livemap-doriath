
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
                // Sécurité totale : initialise des structures vides pour éviter le blocage de l'affichage
                if (key === 'config') {
                    WurmMapGen[key] = {
                        serverName: "[QC/FR/CAN] QBC Doriath",
                        actualMapSize: 4096,
                        mapTileSize: 256,
                        mapMaxZoom: 5,
                        mapMinZoom: 0,
                        nativeZoom: 5,
                        markerType: 2
                    };
                } else if (key === 'timestamp') {
                    WurmMapGen[key] = { timestamp: Math.floor(Date.now() / 1000) };
                } else {
                    WurmMapGen[key] = [];
                }
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
        // Double sécurité sur la configuration
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
        
        // Initialisation forcée et sécurisée des modules de la carte
        if (WurmMapGen.map && typeof WurmMapGen.map.create === 'function') {
            try {
                WurmMapGen.map.create();
            } catch(mapError) {
                console.error("Erreur durant la création de la carte Leaflet:", mapError);
            }
        } else {
            console.error("Le module map.js est introuvable ou mal chargé.");
        }
        
        if (WurmMapGen.gui && typeof WurmMapGen.gui.init === 'function') {
            try {
                WurmMapGen.gui.init();
            } catch(guiError) {
                console.error("Erreur durant l'initialisation du menu Vue.js:", guiError);
            }
        } else {
            console.error("Le module gui.js est introuvable ou mal chargé.");
        }
    });
})();


