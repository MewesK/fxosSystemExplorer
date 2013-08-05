'use strict';

var DOMHelper = {
    'createElement': function createElement(source) {
        var element = document.createElement('div');
        element.innerHTML = source;
        return element.firstChild;
    },
    'removeElement': function removeElement(element) {
        element.parentNode.removeChild(element);
    }
};