'use strict';

(function() {

	WurmMapGen.config = null;
	WurmMapGen.villages = null;
	WurmMapGen.guardtowers = null;
	WurmMapGen.structures = null;
	WurmMapGen.portals = null;
	WurmMapGen.players = null;

	var modulesLoaded = 0;

	function loadData(file, callback) {
		fetch('data/' + file + '.json?v=' + Date.now())
			.then(function(response) {
				if (!response.ok) {
					callback(null);
					return;
				}
				return response.json();
			})
			.then(function(data) {
				callback(data);
			})
			.catch(function() {
				callback(null);
			});
	}

	function checkProgress() {
		modulesLoaded++;
		if (modulesLoaded === 6) {
			WurmMapGen.gui.init();
			WurmMapGen.map.create();
			WurmMapGen.gui.loaded();
			activateBulleInterceptor(); // Lance le blindage des bulles
		}
	}

	// BLINDAGE INTÉGRAL : Réécrit la bulle au clic par-dessus le code de map.js
	function activateBulleInterceptor() {
		if (WurmMapGen.map && WurmMapGen.map.map) {
			var mapInstance = WurmMapGen.map.map;
			
			mapInstance.on('popupopen', function(e) {
				var popup = e.popup;
				var content = popup.getContent();
				
				// Applique de force les options de positionnement et de décalage anti-tremblement
				popup.options.keepInView = true;
				popup.options.autoPan = true;
				popup.options.offset = L.point(0, -25);
				popup.options.autoPanPaddingTopLeft = L.point(50, 320);
				popup.options.autoPanPaddingBottomRight = L.point(50, 50);
				
				if (content && (content.indexOf('Mayor:') !== -1 || content.indexOf('Maire :') !== -1)) {
					var titleMatch = content.match(/<b>(.*?)<\/b>/);
					var rawTitle = titleMatch ? titleMatch[1] : '';
					var decodedTitle = rawTitle.replace(/&#39;/g, "'").trim();
					var targetVillage = null;
					
					if (WurmMapGen.villages) {
						for (var i = 0; i < WurmMapGen.villages.length; i++) {
							var currentName = WurmMapGen.villages[i].name.replace(/&#39;/g, "'").trim();
							if (currentName === decodedTitle) {
								targetVillage = WurmMapGen.villages[i];
								break;
							}
						}
					}
					
					if (targetVillage) {
						var mottoText = targetVillage.motto ? targetVillage.motto : '';
						var mayorText = targetVillage.mayor ? targetVillage.mayor : 'Inconnu';
						var citizensCount = targetVillage.citizens ? targetVillage.citizens : '1';
						var dateComplete = targetVillage.creation ? targetVillage.creation + ' 2026' : 'En 2026';
						
						var newContent = [
							'<div align="center"><b style="color: #FFD700; font-size: 15px; text-shadow: 1px 2px 3px #000; font-family: Roboto, sans-serif; letter-spacing: 0.5px;">' + WurmMapGen.util.escapeHtml(targetVillage.name) + '</b><br>',
							(mottoText ? '<i style="color: #bbb; font-size: 11px;">' + WurmMapGen.util.escapeHtml(mottoText) + '</i>' : '') + '</div>',
							'<div style="margin-top: 8px; font-size: 11px; line-height: 1.4; color: #fff;">',
							'<b>Maire :</b> <span style="color: #00FF7F; font-weight: bold;">' + WurmMapGen.util.escapeHtml(mayorText) + '</span><br>',
							'<b>Citoyens :</b> <span style="color: #00FFFF; font-weight: bold;">' + citizensCount + '</span><br>',
							'<b>Créé le :</b> ' + WurmMapGen.util.escapeHtml(dateComplete) + '<br>',
							'<b>Position :</b> <span style="font-family: monospace;">' + Math.floor(targetVillage.x) + ' x, ' + Math.floor(targetVillage.y) + ' y</span>',
							'</div>'
						].join('');
						
						popup.setContent(newContent);
						popup.update();
					}
				}
			});
		}
	}

	loadData('config', function(data) { WurmMapGen.config = data ? data.config : {}; checkProgress(); });
	loadData('villages', function(data) { WurmMapGen.villages = data ? data.villages : []; checkProgress(); });
	loadData('guardtowers', function(data) { WurmMapGen.guardtowers = data ? data.guardtowers : []; checkProgress(); });
	loadData('structures', function(data) { WurmMapGen.structures = data ? data.structures : []; checkProgress(); });
	loadData('portals', function(data) { WurmMapGen.portals = data ? data.portals : []; checkProgress(); });
	loadData('players', function(data) { WurmMapGen.players = data ? data.players : []; checkProgress(); });

})();
