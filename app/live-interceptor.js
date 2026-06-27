'use strict';

(function() {
	function injectInterface() {
		var sidebar = document.getElementById('sidebar');
		var oldCount = document.getElementById('playercount');
		
		if (sidebar) {
			// Masquage du vieux compteur vert d'usine
			if (oldCount) { oldCount.style.display = 'none'; }

			// 1. Reconstruction esthétique de la zone Haute avec votre bannière
			var paddingBlock = sidebar.querySelector('.block.padding');
			if (paddingBlock && !document.getElementById('injected-header')) {
				var headerDiv = document.createElement('div');
				headerDiv.id = 'injected-header';
				headerDiv.style.cssText = 'padding:12px;border-bottom:1px solid #444;text-align:center;background:#222;margin:-20px -15px 10px -15px;';
				headerDiv.innerHTML = '<a href="https://wurm-unlimited.com" target="_blank" rel="noreferrer noopener" style="display:block;width:100%;"><img src="images/half-banner-1.png" border="0" onerror="this.src=\'https://wurm-unlimited.combanners/half-banner-1.png\';" style="border-radius:4px;border:1px solid #ffcc00;box-shadow:0 0 8px rgba(255,204,0,0.4);width:100%;max-width:100%;height:auto;object-fit:contain;display:block;margin:0 auto;"></a>';
				paddingBlock.insertBefore(headerDiv, paddingBlock.firstChild);
			}

			// 2. Injection des boutons cliquables bilingues sous la bannière
			if (!document.getElementById('injected-links')) {
				var linksBlock = document.createElement('div');
				linksBlock.className = 'block';
				linksBlock.id = 'injected-links';
				linksBlock.innerHTML = '<strong style="color:#ffcc00;font-size:12px;display:block;margin-bottom:4px;">🌐 Links (Liens) / Community :</strong>' +
					'<a href="https://wurm-unlimited.com" target="_blank" rel="noreferrer noopener" class="btn-comm" style="display:block!important;text-align:center!important;text-decoration:none!important;font-family:\'Roboto\',sans-serif!important;font-size:11px!important;font-weight:bold!important;padding:8px!important;margin:8px 0!important;border-radius:4px!important;text-shadow:1px 1px 1px #000!important;box-shadow:0 2px 4px rgba(0,0,0,0.4)!important;background:#ffcc00!important;color:#111!important;border:1px solid #cca300!important;">🔗 SERVER WEB PAGE (PAGE WEB)</a>' +
					'<a href="https://discord.gg" target="_blank" rel="noreferrer noopener" class="btn-comm" style="display:block!important;text-align:center!important;text-decoration:none!important;font-family:\'Roboto\',sans-serif!important;font-size:11px!important;font-weight:bold!important;padding:8px!important;margin:8px 0!important;border-radius:4px!important;text-shadow:1px 1px 1px #000!important;box-shadow:0 2px 4px rgba(0,0,0,0.4)!important;background:#5865F2!important;color:#fff!important;border:1px solid #4752c4!important;">💬 JOIN DISCORD (REJOINDRE)</a>';
				sidebar.insertBefore(linksBlock, sidebar.children[1]);
			}

			// 3. Traduction bilingue dynamique des libellés du menu d'usine
			var labels = sidebar.getElementsByTagName('span');
			for (var i = 0; i < labels.length; i++) {
				if (labels[i].innerText === 'Show deeds') { labels[i].innerText = 'Show deeds (Afficher les colonies)'; }
				if (labels[i].innerText === 'Show deed borders') { labels[i].innerText = 'Show deed borders (Frontières)'; }
				if (labels[i].innerText === 'Show guard tower borders') { labels[i].innerText = 'Show tower borders (Rayons d\'action)'; }
			}
			var guardLabels = sidebar.getElementsByTagName('label');
			for (var j = 0; j < guardLabels.length; j++) {
				if (guardLabels[j].textContent.indexOf('Show guard towers') !== -1 && guardLabels[j].children.length === 1) {
					var spn = document.createElement('span'); spn.innerText = ' Show guard towers (Tours de garde)';
					guardLabels[j].appendChild(spn);
					guardLabels[j].childNodes[1].textContent = '';
				}
			}

			// 4. Déplacement et enrichissement bilingue du bloc de synchronisation tout en bas
			var attrBlock = sidebar.querySelector('.block.attribution');
			if (attrBlock && !document.getElementById('injected-sync')) {
				var syncDiv = document.createElement('div');
				syncDiv.id = 'injected-sync';
				syncDiv.style.cssText = 'background:rgba(0,0,0,0.4);border:1px solid #ffcc00;padding:6px;border-radius:4px;font-size:10px;color:#ffcc00;font-weight:bold;text-align:center;margin-top:10px;line-height:1.3;';
				syncDiv.innerHTML = 'Last update / Dernière mise à jour :<br><span id="live-sync-date" style="color:#fff;font-size:11px;font-family:monospace;">2026-06-27 a 04:00:00</span>';
				attrBlock.appendChild(syncDiv);
			}

			setupLeafletPopupHook();
		} else {
			setTimeout(injectInterface, 50);
		}
	}

	function setupLeafletPopupHook() {
		if (window.WurmMapGen && WurmMapGen.map && WurmMapGen.map.map) {
			var mapInstance = WurmMapGen.map.map;

			mapInstance.on('popupopen', function(e) {
				var popup = e.popup;
				var html = popup.getContent();
				if (html && html.indexOf('txt-x') !== -1) return;
				
				if (html && (html.indexOf('Mayor:') !== -1 || html.indexOf('Maire :') !== -1 || html.indexOf('Citizens:') !== -1)) {
					popup.options.maxWidth = 250; popup.options.minWidth = 250; popup.options.keepInView = true; popup.options.autoPan = true; popup.options.offset = L.point(0, -15);
					
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
			setTimeout(setupLeafletPopupHook, 50);
		}
	}

	injectInterface();
})();


