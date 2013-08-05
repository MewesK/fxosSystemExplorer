'use strict';

function ObjectNode(key, object, parent) {
    this.key = key;
    this.object = object;
    this.parent = parent;
}

// public
ObjectNode.prototype.getKeys = function() {
    var keys = {
        'Object': [],
        'Function': [],
        'Value': []
    };

    for (var key in this.object) {
        try {
            if (this.object[key] !== null && typeof(this.object[key]) === 'object') {
                keys.Object.push(key);
            } else if (this.object[key] !== null && typeof(this.object[key]) === 'function') {
                keys.Function.push(key);
            } else {
                keys.Value.push(key);
            }
        } catch (exception) {
        }
    }

    // create object properties list
    for (var type in keys) {
        // sort keys
        keys[type].sort(function(a, b) {
            return a.toLowerCase().localeCompare(b.toLowerCase());
        });
    }

    return keys;
};

ObjectNode.prototype.getParent = function() {
    return this.parent;
};

ObjectNode.prototype.getName = function() {
    switch (typeof(this.object)) {
        case 'object':
            return this.key;
        case 'function':
            return this.key + '()';
        default:
            return this.key;
    }
};

ObjectNode.prototype.getValue = function() {
    switch (typeof(this.object)) {
        case 'object':
            var objectType = new String(this.object).match(/\[object (.+)\]/);
            return objectType !== null ? objectType[1] : new String(this.object);
        case 'function':
            return null;
        default:
            return this.object;
    }
};

ObjectNode.prototype.getId = function() {
    return this.parent !== null ? this.parent.getId() + '-' + this.key : this.key;
};

ObjectNode.prototype.getFilterId = function() {
    return 'object-function-value';
};

ObjectNode.prototype.getElement = function() {
    switch (typeof(this.object)) {
        case 'object':
            var element = DOMHelper.createElement('<li><a href="#"><p>' + this.getName() + '</p><p>' + this.getValue() + '</p></a></li>');
            element.querySelector('a').dataset.key = this.key;
            return element;
        case 'function':
            return DOMHelper.createElement('<li><p>' + this.getName() + '</p></li>');
        default:
            return DOMHelper.createElement('<li><p>' + this.getName() + '</p><p>' + this.getValue() + '</p></li>');
    }
};

ObjectNode.prototype.getType = function() {
    switch (typeof(this.object)) {
        case 'object':
            return 'Object';
        case 'function':
            return 'Function';
        default:
            return 'Value';
    }
};

ObjectNode.prototype.item = function(key) {
    return new ObjectNode(key, this.object[key], this);
};