'use strict';

(function() {
	function injectVueProperties() {
		// Injection forcée dans l'instance globale pour interdire l'erreur ReferenceError
		if (window.WurmMapGen && WurmMapGen.gui && WurmMapGen.gui.app) {
			var app = WurmMapGen.gui.app;
			if (!app.hasOwnProperty('showSoloDeeds')) {
				if (app.$set) {
					app.$set(app, 'showSoloDeeds', true);
					app.$set(app, 'showSmallDeeds', true);
					app.$set(app, 'showLargeDeeds', true);
				} else {
					app.showSoloDeeds = true;
					app.showSmallDeeds = true;
					app.showLargeDeeds = true;
				}
			}
			setupLeafletHook();
		} else {
			// Création préventive de la structure de l'application si non instanciée
			if (window.WurmMapGen && WurmMapGen.config) {
				WurmMapGen.config.showSoloDeeds = true;
				WurmMapGen.config.showSmallDeeds = true;
				WurmMapGen.config.showLargeDeeds = true;
			}
			setTimeout(injectVueProperties, 50);
		}
	}

	function setupLeafletHook() {
		if (window.WurmMapGen && WurmMapGen.map && WurmMapGen.map.map) {
			var mapInstance = WurmMapGen.map.map;

			setInterval(function() {
				var countEl = document.getElementById('playercount');
				var targetEl = document.getElementById('custom-playercount');
				if (countEl && targetEl) {
					var count = parseInt(countEl.innerText) || 0;
					targetEl.innerText = count + ' players (joueurs) online';
				}
			}, 2000);

			WurmMapGen.gui.filterDeedsLayer = function() {
				var app = WurmMapGen.gui.app;
				if (!window.WurmMapGen.map.layers.villageMarkers) return;
				
				WurmMapGen.map.layers.villageMarkers.eachLayer(function(marker) {
					var html = marker.getPopup().getContent();
					var temp = document.createElement('div');
					temp.innerHTML = html;
					var citText = temp.querySelector('.txt-c') ? temp.querySelector('.txt-c').innerText : "1";
					var count = parseInt(citText) || 1;

					var visible = false;
					if (count === 1 && app.showSoloDeeds) visible = true;
					if (count >= 2 && count <= 5 && app.showSmallDeeds) visible = true;
					if (count >= 6 && app.showLargeDeeds) visible = true;

					if (visible) {
						if (!mapInstance.hasLayer(marker)) mapInstance.addLayer(marker);
					} else {
						if (mapInstance.hasLayer(marker)) mapInstance.removeLayer(marker);
					}
				});
			};
			
			mapInstance.on('popupopen', function(e) {
				var popup = e.popup;
				var html = popup.getContent();
				if (html && html.indexOf('txt-x') !== -1) return;
				
				if (html && (html.indexOf('Mayor:') !== -1 || html.indexOf('Maire :') !== -1 || html.indexOf('Citizens:') !== -1)) {
					popup.options.maxWidth = 250;
					popup.options.minWidth = 250;
					popup.options.keepInView = true;
					popup.options.autoPan = true;
					popup.options.offset = L.point(0, -15);
					
					var lines = html.split('<br>');
					var villageName = "Colonie", mayorName = "Inconnu", citizensCount = "1";
					
					for (var i = 0; i < lines.length; i++) {
						var textNode = lines[i].replace(/<\/?[^>]+(>|$)/g, "").trim();
						if (i === 0) villageName = textNode;
						if (textNode.toLowerCase().indexOf('mayor:') !== -1) {
							mayorName = textNode.replace(/mayor\s*:\s*mayor\s*:/i, "").replace(/mayor\s*:/i, "").trim();
						}
						if (textNode.toLowerCase().indexOf('citizens:') !== -1) {
							citizensCount = textNode.replace(/citizens\s*:\s*citizens\s*:/i, "").replace(/citizens\s*:/i, "").trim();
						}
					}
					
					var latlng = popup.getLatLng();
					var multiplier = window.WurmMapGen && WurmMapGen.config && WurmMapGen.config.xyMulitiplier ? WurmMapGen.config.xyMulitiplier : 8;
					var px = Math.floor(latlng.lng * multiplier);
					var py = Math.floor((-latlng.lat) * multiplier);
					
					var newContent = [
						'<div align="center"><b>' + villageName + '</b></div>',
						'<hr style="border:0; border-top:1px solid #ffcc00; margin:6px 0; opacity:0.3;">',
						'<div style="font-size: 11px; line-height: 1.6; color: #ffffff;">',
						'👑 <b>Mayor (Maire) :</b> <span class="txt-m">' + mayorName + '</span><br>',
						'👥 <b>Citizens (Citoyens) :</b> <span class="txt-c">' + citizensCount + '</span><br>',
						'📅 <b>Founded (Créé) :</b> <span>2026</span><br>',
						'📍 <b>Coordinates (Position) :</b> <span class="txt-x">X' + px + '</span>, <span class="txt-y">Y' + py + '</span>',
						'</div>'
					].join('');
					
					popup.setContent(newContent);
					popup.update();
				}
			});
		} else {
			setTimeout(setupLeafletHook, 50);
		}
	}

	injectVueProperties();
})();
