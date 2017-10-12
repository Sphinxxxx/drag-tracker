function dragTracker(options) {
    options = options || {};
    const container = options.container || document.documentElement,
          callback = options.callback || console.log,
          selector = options.selector,
          handleOffset = (options.handleOffset !== false),
          roundCoords = (options.roundCoords !== false)
    ;
    
    let dragged, mouseOffset, dragStart;
    
    //Element.closest polyfill:
    //https://developer.mozilla.org/en-US/docs/Web/API/Element/closest
    const ep = Element.prototype;
    if (!ep.matches)
         ep.matches = ep.msMatchesSelector || ep.webkitMatchesSelector;
    if (!ep.closest)
         ep.closest = function(s) {
            var node = this;
            do {
                if(node.matches(s)) return node;
                //https://github.com/Financial-Times/polyfill-service/issues/1279
                node = (node.tagName === 'svg') ? node.parentNode : node.parentElement;
            } while(node); 

            return null;
        };


    function getMousePos(e, elm, offset) {
        let x = e.clientX,
            y = e.clientY;

        if(elm) {
            const bounds = elm.getBoundingClientRect();
            x -= bounds.left;
            y -= bounds.top;
            if(offset) {
                x -= offset[0];
                y -= offset[1];
            }

            //SVG circles and ellipses are positioned by their center (cx/cy), not the top-left corner:
            if((elm.nodeName === 'circle') || (elm.nodeName === 'ellipse')) {
                x -= bounds.width/2;
                y -= bounds.height/2;
            }
        }
        return (roundCoords ? [Math.round(x), Math.round(y)] : [x, y]);
    }

    function onDown(e) {
        dragged = selector ? e.target.closest(selector) : {};
        if(dragged) {
            e.preventDefault();

            mouseOffset = (selector && handleOffset) ? getMousePos(e, dragged) : [0, 0];
            dragStart = getMousePos(e, container, mouseOffset);
            if(roundCoords) { dragStart = dragStart.map(Math.round); }
        }
    }

    function onMove(e) {
        e.preventDefault();

        const pos = getMousePos(e, container, mouseOffset);
        callback(dragged, pos, dragStart);
    }


    /* Mouse/touch input */

    container.addEventListener('mousedown', function(e) {
        if(isLeftButton(e)) { onDown(e); }
    });
    container.addEventListener('touchstart', function(e) {
        onDown(tweakTouch(e));
    });

    window.addEventListener('mousemove', function(e) {
        if(!dragged) { return; }

        if(isLeftButton(e)) { onMove(e); }
        else { dragged = null; }
    });
    window.addEventListener('touchmove', function(e) {
        if(dragged) { onMove(tweakTouch(e)); }
    });

    function isLeftButton(e) {
        return (e.buttons !== undefined)
            ? (e.buttons === 1)
            //Safari (not tested):
            //https://developer.mozilla.org/en-US/docs/Web/API/MouseEvent#Browser_compatibility
            : (e.which === 1);
    }
    function tweakTouch(e) {
        var touch = e.targetTouches[0];
        touch.preventDefault = e.preventDefault.bind(e);
        return touch;
    }
}
