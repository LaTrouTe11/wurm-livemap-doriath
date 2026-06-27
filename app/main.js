'use strict';

(function() {
	var configLoaded = false;
	var deedsLoaded = false;
	var towersLoaded = false;

	function init() {
		if (configLoaded && deedsLoaded && towersLoaded) {
			WurmMapGen.util.init();
			WurmMapGen.markers.init();
			WurmMapGen.map.create();
			WurmMapGen.gui.init();
			
			// ENCLENCHEMENT DE NOTRE MOTEUR INJECTEUR COMPATIBLE
			runLiveInterceptor();
		}
	}

	WurmMapGen.init = function() {
		WurmMapGen.util.loadJson('data/config.json', function(data) {
			WurmMapGen.config = data.config;
			configLoaded = true;
			init();
		});

		WurmMapGen.util.loadJson('data/villages.json', function(data) {
			WurmMapGen.villages = data.villages;
			deedsLoaded = true;
			init();
		});

		WurmMapGen.util.loadJson('data/guardtowers.json', function(data) {
			WurmMapGen.guardtowers = data.towers;
			towersLoaded = true;
			init();
		});
	};

	function runLiveInterceptor() {
		var sidebar = document.getElementById('sidebar');
		var oldCount = document.getElementById('playercount');
		
		if (sidebar) {
			if (oldCount) { oldCount.style.display = 'none'; }

			var paddingBlock = sidebar.querySelector('.block.padding');
			if (paddingBlock && !document.getElementById('injected-header')) {
				var headerDiv = document.createElement('div');
				headerDiv.id = 'injected-header';
				headerDiv.style.cssText = 'padding:12px;border-bottom:1px solid #444;text-align:center;background:#222;margin:-20px -15px 10px -15px;';
				headerDiv.innerHTML = '<a href="https://wurm-unlimited.com" target="_blank" rel="noreferrer noopener" style="display:block;width:100%;"><img src="images/half-banner-1.png" border="0" onerror="this.src=\'https://wurm-unlimited.combanners/half-banner-1.png\';" style="border-radius:4px;border:1px solid #ffcc00;box-shadow:0 0 8px rgba(255,204,0,0.4);width:100%;max-width:100%;height:auto;object-fit:contain;display:block;margin:0 auto;"></a>';
				paddingBlock.insertBefore(headerDiv, paddingBlock.firstChild);
			}

			if (!document.getElementById('injected-links')) {
				var linksBlock = document.createElement('div');
				linksBlock.className = 'block';
				linksBlock.id = 'injected-links';
				linksBlock.innerHTML = '<strong style="color:#ffcc00;font-size:12px;display:block;margin-bottom:4px;">🌐 Links (Liens) / Community :</strong>' +
					'<a href="https://wurm-unlimited.com" target="_blank" rel="noreferrer noopener" style="display:block!important;text-align:center!important;text-decoration:none!important;font-family:\'Roboto\',sans-serif!important;font-size:11px!important;font-weight:bold!important;padding:8px!important;margin:8px 0!important;border-radius:4px!important;text-shadow:1px 1px 1px #000!important;box-shadow:0 2px 4px rgba(0,0,0,0.4)!important;background:#ffcc00!important;color:#111!important;border:1px solid #cca300!important;">🔗 SERVER WEB PAGE (PAGE WEB)</a>' +
					'<a href="https://discord.gg" target="_blank" rel="noreferrer noopener" style="display:block!important;text-align:center!important;text-decoration:none!important;font-family:\'Roboto\',sans-serif!important;font-size:11px!important;font-weight:bold!important;padding:8px!important;margin:8px 0!important;border-radius:4px!important;text-shadow:1px 1px 1px #000!important;box-shadow:0 2px 4px rgba(0,0,0,0.4)!important;background:#5865F2!important;color:#fff!important;border:1px solid #4752c4!important;">💬 JOIN DISCORD (REJOINDRE)</a>';
				sidebar.insertBefore(linksBlock, sidebar.children[1]);
			}

			var labels = sidebar.getElementsByTagName('span');
			for (var i = 0; i < labels.length; i++) {
				if (labels[i].innerText === 'Show deeds') { labels[i].innerText = 'Show deeds (Afficher les colonies)'; }
				if (labels[i].innerText === 'Show deed borders') { labels[i].innerText = 'Show deed borders (Frontières)'; }
				if (labels[i].innerText === 'Show guard tower borders') { labels[i].innerText = 'Show tower borders (Rayons d\'action)'; }
			}

			var mapInstance = WurmMapGen.map.map;
			if (mapInstance) {
				mapInstance.eachLayer(function(layer) {
					if (layer && layer._url && layer._url.indexOf('{x}-{y}') !== -1) {
						layer.options.errorTileUrl = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=';
						layer.redraw();
					}
				});

				mapInstance.on('popupopen', function(e) {
					var popup = e.popup;
					var html = popup.getContent();
					if (html && html.indexOf('txt-x') !== -1) return;
					
					if (html && (html.indexOf('Mayor:') !== -1 || html.indexOf('Maire :') !== -1 || html.indexOf('Citizens:') !== -1)) {
						popup.options.maxWidth = 250; popup.options.minWidth = 250; popup.options.keepInView = true; popup.options.autoPan = true; popup.options.offset = L.point(0, -15);
						var lines = html.split('<br>'), villageName = "Colonie", mayorName = "Inconnu", citizensCount = "1";
						for (var i = 0; i < lines.length; i++) {
							var textNode = lines[i].replace(/<\/?[^>]+(>|$)/g, "").trim();
							if (i === 0) villageName = textNode;
							if (textNode.toLowerCase().indexOf('mayor:') !== -1) { mayorName = textNode.replace(/mayor\s*:\s*mayor\s*:/i, "").replace(/mayor\s*:/i, "").trim(); }
							if (textNode.toLowerCase().indexOf('citizens:') !== -1) { citizensCount = textNode.replace(/citizens\s*:\s*citizens\s*:/i, "").replace(/citizens\s*:/i, "").trim(); }
						}
						var latlng = popup.getLatLng();
						var multiplier = WurmMapGen.config && WurmMapGen.config.xyMulitiplier ? WurmMapGen.config.xyMulitiplier : 8;
						var px = Math.floor(latlng.lng * multiplier), py = Math.floor((-latlng.lat) * multiplier);
						
						popup.setContent([
							'<div align="center"><b>' + villageName + '</b></div><hr style="border:0;border-top:1px solid #ffcc00;margin:6px 0;opacity:0.3;">',
							'<div style="font-size:11px;line-height:1.6;color:#fff;">👑 <b>Mayor (Maire) :</b> <span class="txt-m">' + mayorName + '</span><br>',
							'👥 <b>Citizens (Citoyens) :</b> <span class="txt-c">' + citizensCount + '</span><br>📅 <b>Founded (Créé) :</b> <span>2026</span><br>',
							'📍 <b>Coordinates (Position) :</b> <span class="txt-x">X' + px + '</span>, <span class="txt-y">Y' + py + '</span></div>'
						].join(''));
						popup.update();
					}
				});
			}
		}
	}

	window.addEventListener('load', function() {
		WurmMapGen.init();
	});
})();
