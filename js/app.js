'use strict';

(function() {
    TreeExplorer.init(new ObjectNode('window', window, null));

    var mobile = (navigator.userAgent.search("Mobile") != -1);
    if (mobile) {
        //Let's reduce font-size when in landscape  
        //fs: current font-size
        var fs = parseInt(window.getComputedStyle(document.documentElement).getPropertyValue('font-size'), 10);
        var mql = window.matchMedia("(orientation: portrait)");

        if (mql.matches) { //portrait
            document.documentElement.style.fontSize = fs + 'px';
            document.body.classList.remove('landscape');
        } else { // landscape
            document.documentElement.style.fontSize = fs * 0.7 + 'px';
            document.body.classList.add('landscape');
        }

        mql.addListener(function(m) {
            if (m.matches) { //portrait
                document.documentElement.style.fontSize = fs + 'px';
                document.body.classList.remove('landscape');
            }
            else { //landscape
                document.documentElement.style.fontSize = fs * 0.7 + 'px';
                document.body.classList.add('landscape');
            }
        });
    }
})();