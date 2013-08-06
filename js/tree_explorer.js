'use strict';

var TreeExplorer = {

    // properties

    'node': null,

    // init

    'init': function init(node) {
        console.log('init', node);
        TreeExplorer.node = node;
        TreeExplorer.createView(TreeExplorer.node);
        TreeExplorer.setView(TreeExplorer.node);
    },

    // event handler

    'handleBack': function handleBack(event) {
        console.log('handleBack', event);
        event.preventDefault();
        
        TreeExplorer.setView(TreeExplorer.node.getParent());
    },

    'handleClick': function handleClick(event) {
        console.log('handleClick', event);
        event.preventDefault();
        
        var node = TreeExplorer.node.item(event.target.parentElement.dataset.key);
        TreeExplorer.createView(node);
        TreeExplorer.setView(node);
    },

    'handleFilterOpen': function handleFilterOpen(event) {
        console.log('handleFilterOpen', event);
        event.preventDefault();
        
        var node = TreeExplorer.node.item(event.target.parentElement.dataset.key);
        document.querySelector('#view-filter-' + node.getFilterId()).style.display = '';
    },

    'handleFilterCancel': function handleFilterCancel(event) {
        console.log('handleFilterCancel', event);
        event.preventDefault();
        
        document.querySelector('#' + event.target.dataset.view).style.display = 'none';
    },

    'handleFilterToggle': function handleFilterToggle(event) {
        console.log('handleFilterToggle', event);
        
        var type = event.target.dataset.type;
        var checked = event.target.checked;
        
        console.log(type, checked);      
        
        var viewMainElements = document.querySelectorAll('.view-main:not(.template)');
        for (var i = 0; i < viewMainElements.length; i++) {
            var viewMainElement = viewMainElements.item(i);
            var filters = JSON.parse(viewMainElement.dataset.filters);
            filters[type] = checked;
            viewMainElement.dataset.filters = JSON.stringify(filters);
            
            var itemElements = viewMainElement.querySelectorAll('.items li');
            for (var i = 0; i < itemElements.length; i++) {
                var itemElement = itemElements.item(i);
                if (filters[itemElement.dataset.type] === false) {
                    itemElement.classList.add('hidden-by-filter');
                } else {
                    itemElement.classList.remove('hidden-by-filter');
                }
            }
        }
    },

    'handleSearchSubmit': function handleSearchCancel(event) {
        console.log('handleSearchSubmit', event);
        event.preventDefault();
        
        document.querySelector('.current-view #search-field').blur();
        
        return false;
    },

    'handleSearchInput': function handleSearchInput(event) {
        console.log('handleSearchInput', event);
        event.preventDefault();
        
        var searchTerm = document.querySelector('.current-view #search-field').value,
            itemElements = document.querySelectorAll('.current-view .items li');
    
        for (var i = 0; i < itemElements.length; i++) {
            var itemElement = itemElements.item(i);
            if (itemElement.querySelector('p:first-child').textContent.toLowerCase().contains(searchTerm.toLowerCase())) {
                itemElement.classList.remove('hidden-by-search');
                itemElement.style.display = '';
            } else {
                itemElement.classList.add('hidden-by-search');
            }
        }
    },

    'handleSearchClear': function handleSearchClear(event) {
        console.log('handleSearchClear', event);
        event.preventDefault();

        var inputElement = document.querySelector('.current-view #search-field');
        inputElement.value = '';
        inputElement.blur();

        var itemElements = document.querySelectorAll('.current-view .items li.hidden-by-search');
        for (var i = 0; i < itemElements.length; i++) {
            itemElements.item(i).classList.remove('hidden-by-search');
        }
    },

    // views

    'createView': function createView(node) {
        console.log('createView', node);
        
        if (document.querySelector('#view-main-' + node.getId()) != null) {
            return;
        }

        // create main view
        var viewMainElement = document.querySelector('#view-main-template').cloneNode(true);
        viewMainElement.id = 'view-main-' + node.getId();
        viewMainElement.classList.remove('template');
        viewMainElement.dataset.position = node.getParent() == null ? 'current' : 'right';
        viewMainElement.querySelector('h1').textContent = node.getName();

        // back button
        if (node.getParent() != null) {
            viewMainElement.querySelector('#btn-view-back').addEventListener('click', TreeExplorer.handleBack);
        } else {
            viewMainElement.querySelector('#btn-view-back').classList.add('template');
        }
        
        // item filter button
        viewMainElement.querySelector('#btn-filter').addEventListener('click', TreeExplorer.handleFilterOpen);

        // search field
        viewMainElement.querySelector('#search-field').addEventListener('input', TreeExplorer.handleSearchInput);
        viewMainElement.querySelector('#search-form').addEventListener('submit', TreeExplorer.handleSearchSubmit);
        viewMainElement.querySelector('#btn-search-clear').addEventListener('ontouchstart' in window ? 'touchstart' : 'mousedown', TreeExplorer.handleSearchClear);
        
        // create filter view
        var viewFilterElement = document.querySelector('#view-filter-template').cloneNode(true);
        viewFilterElement.id = 'view-filter-' + node.getFilterId();
        viewFilterElement.classList.remove('template');
        viewFilterElement.style.display = 'none';
        
        // item filter cancel button
        viewFilterElement.querySelector('button').dataset.view = viewFilterElement.id;
        viewFilterElement.querySelector('button').addEventListener('click', TreeExplorer.handleFilterCancel);

        var keys = node.getKeys();
        var filters = {};
        
        // use last filter settings if available
        var lastViewMainElement = document.querySelector('.view-main:not(.template)');
        console.log('lastFilters', lastViewMainElement);
        if (lastViewMainElement) {
            filters = JSON.parse(lastViewMainElement.dataset.filters);
        }
        
        for (var type in keys) {
            if (!(type in filters)) {
                filters[type] = true;
            }
            
            for (var i in keys[type]) {
                var element = node.item(keys[type][i]).getElement();
                element.dataset.type = filters[type];
                
                if (type == 'Object') {
                    element.querySelector('a').dataset.key = keys[type][i];
                    element.querySelector('a').addEventListener('click', TreeExplorer.handleClick);
                }

                // hide if filter is set
                if (filters[type] === false) {
                    element.classList.add('hidden-by-filter');
                }

                viewMainElement.querySelector('.items').appendChild(element);
            }
            
            var filterElement = DOMHelper.createElement('<p>Show ' + type + 's<label class="pack-switch"><input type="checkbox" checked><span></span></label></p>');
            filterElement.querySelector('input').dataset.type = type;
            filterElement.querySelector('input').addEventListener('click', TreeExplorer.handleFilterToggle);
            
            viewFilterElement.querySelector('.items').appendChild(filterElement);
        }

        viewMainElement.dataset.filters = JSON.stringify(filters);

        document.querySelector('body').appendChild(viewMainElement);
        if (document.querySelector('#'+'view-filter-' + node.getFilterId()) == null) {
            document.querySelector('body').appendChild(viewFilterElement);  
        }
    },

    'setView' : function setView(node) {
        console.log('setView', node);
        
        var currentViewElement = document.querySelector('#view-main-' + TreeExplorer.node.getId()),
            nextViewElement = document.querySelector('#view-main-' + node.getId());

        currentViewElement.classList.remove('current-view');
        nextViewElement.classList.add('current-view');

        // right
        if (node !== TreeExplorer.node && node !== TreeExplorer.node.getParent()) {
            // backup scroll position
            currentViewElement.querySelector('.scrollable').dataset.scrollTop = currentViewElement.querySelector('.scrollable').scrollTop;

            // animate
            currentViewElement.style.animation = 'currentToLeft 0.4s forwards';
            nextViewElement.style.animation = 'rightToCurrent 0.4s forwards';
        }

        // left
        if (node !== TreeExplorer.node && node === TreeExplorer.node.getParent()) {
            // remove child object view
            currentViewElement.addEventListener('animationend', function() {
                DOMHelper.removeElement(currentViewElement);
            });

            // animate
            currentViewElement.style.animation = 'currentToRight 0.4s forwards';
            nextViewElement.style.animation = 'leftToCurrent 0.4s forwards';

            // restore scroll position
            nextViewElement.querySelector('.scrollable').scrollTop = nextViewElement.querySelector('.scrollable').dataset.scrollTop;
        }

        TreeExplorer.node = node;
    }
};