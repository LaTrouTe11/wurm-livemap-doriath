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
            });
    }

    var filesToLoad = [
        {key: 'config', path: 'config.json'},
        {key: 'villages', path: 'villages.json'},
        {key: 'guardtowers', path: 'guardtowers.json'},
        {key: 'structures', path: 'structures.json'},
        {key: 'portals', path: 'portals.json'},
        {key: 'players', path: 'players.json'}
    ];

    Promise.all(filesToLoad.map(function(item) { return fetchData(item.key, item.path); }))
    .then(function() {
        if (!WurmMapGen.config) {
            document.body.innerHTML = '<h2 style="color:red;">Erreur: config.json manquant.</h2>';
            return;
        }
        WurmMapGen.config.xyMulitiplier = (WurmMapGen.config.actualMapSize / WurmMapGen.config.mapTileSize);
        WurmMapGen.map.create();
        WurmMapGen.gui.init();
    });
})();
