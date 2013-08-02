(function() {
	createObjectView(window, []);
		
	function getPropertyByPath(obj, path) {
		return path.length == 0 ? obj : getPropertyByPath(obj[path[0]], path.slice(1));
	}
	
	function getIdByPath(path) {
		var id = 'view_';
		for (i in path) {
			id += path[i];
		}
		return id;
	}
		
	function createElement(source) {
		var element = document.createElement('div');;
		element.innerHTML = source;
		return element.firstChild;
	}
	
	function removeElement(querySelector) {
		var element = document.querySelector(querySelector);
		if (element != null) {
			element.parentNode.removeChild(element);
		}
	}
		
	function createObjectView(baseObject, path) {					
		var object = getPropertyByPath(baseObject, path.slice(0));
		
		var viewElement = createElement(
			'<section id="'+getIdByPath(path)+'" data-position="'+(path.length == 0 ? 'current' : 'right')+'" role="region">'+
				'<header class="fixed">'+
					(path.length > 0 ? '<a id="btn-buttons-back" href="#"><span class="icon icon-back">back</span></a>' : '')+ 
					'<h1 id="name">'+object+'</h1>'+
				'</header>'+
				'<article class="content scrollable header">'+
					'<div data-type="list">'+
						'<ul id="items"></ul>'+
					'</div>'+
				'</article>'+
			'</section>'
		);

		if (path.length > 0) {
			var nextPath = path.slice(0, -1);
			var buttonElement = viewElement.querySelector('a');
			
			buttonElement.dataset.currentPath = JSON.stringify(path);
			buttonElement.dataset.nextPath = JSON.stringify(nextPath);
			
			// add click event
			buttonElement.addEventListener('click', function(event) { 
				event.preventDefault();
				
				var currentPath = JSON.parse(this.dataset.currentPath);
				var nextPath = JSON.parse(this.dataset.nextPath);
				var currentPathId = '#'+getIdByPath(currentPath);
				var nextPathId = '#'+getIdByPath(nextPath);
			
				// animate
				document.querySelector(currentPathId).style.animation = 'currentToRight 0.4s forwards';
				document.querySelector(nextPathId).style.animation = 'leftToCurrent 0.4s forwards';
				
				// restore scroll position
				document.querySelector(nextPathId + ' .scrollable').scrollTop = document.querySelector(nextPathId + ' .scrollable').dataset.scrollTop;
	
				// remove child object view
				document.querySelector(nextPathId).addEventListener('transitionend', function(_event){
					removeElement(currentPathId);
				});
			});
		}
		
		var keys = {
			'objects': [],
			'functions': [],
			'values': [],
		};
		
		for (key in object) {
			try {
				if (object[key] != null && typeof(object[key]) == 'object') {
					keys.objects.push(key);
				} else if (object[key] != null && typeof(object[key]) == 'function') {
					keys.functions.push(key);
				} else {
					keys.values.push(key);
				}
			} catch (exception) { 
			}
		}
			
		for (type in keys) {
			// sort keys
			keys[type].sort(function (a, b) {
				return a.toLowerCase().localeCompare(b.toLowerCase());
			});
			
			for (i in keys[type]) {
				var key = keys[type][i];
				var itemElement = null;
				
				if (type == 'objects') {
					var nextPath = path.slice(0);
					nextPath.push(key);
					
					var objectType = new String(object[key]).match(/\[object (.+)\]/);
					
					itemElement = createElement('<li><a href="#"><p>'+key+'</p><p>'+(objectType != null ? objectType[1] : object[key])+'</p></a></li>');
					var buttonElement = itemElement.querySelector('a');
		
					buttonElement.dataset.currentPath = JSON.stringify(path);
					buttonElement.dataset.nextPath = JSON.stringify(nextPath);
					
					// add click event
					buttonElement.addEventListener('click', function(event) { 
						event.preventDefault();

						var currentPath = JSON.parse(this.dataset.currentPath);
						var nextPath = JSON.parse(this.dataset.nextPath);
						var currentPathId = '#'+getIdByPath(currentPath);
						var nextPathId = '#'+getIdByPath(nextPath);
						
						// create child object view
						createObjectView(baseObject, nextPath);
						
						// backup scroll position
						document.querySelector(currentPathId + ' .scrollable').dataset.scrollTop = document.querySelector(currentPathId + ' .scrollable').scrollTop;
						
						// animate
						document.querySelector(currentPathId).style.animation = 'currentToLeft 0.4s forwards';
						document.querySelector(nextPathId).style.animation = 'rightToCurrent 0.4s forwards';
					});
				} else if (type == 'functions') {
					itemElement = createElement('<li><p>'+key+'()</p></li>');
				} else {
					itemElement = createElement('<li><p>'+key+'</p><p>'+object[key]+'</p></li>');
				}
				
				viewElement.querySelector('#items').appendChild(itemElement);
			}
		}
		
		document.querySelector('body').appendChild(viewElement);
	}
})();