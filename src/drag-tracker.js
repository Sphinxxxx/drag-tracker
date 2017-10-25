function dragTracker(options) {
    "use strict";
    
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


    options = options || {};
    const container = options.container || document.documentElement,
          callback = options.callback || console.log,
          callbackStart = options.callbackDragStart,
          callbackEnd = options.callbackDragEnd,
          selector = options.selector,
          //handleOffset: "center", true (default), false
          handleOffset = options.handleOffset || (options.handleOffset !== false),
          roundCoords = (options.roundCoords !== false),
          dragOutside = (options.dragOutside !== false)
    ;
    //Whether callback coordinates should be the dragged element's center instead of the top-left corner
    let offsetToCenter = null;
    switch(handleOffset) {
        case 'center':
            offsetToCenter = true; break;
        case 'topleft':
        case 'top-left':
            offsetToCenter = false; break;
    }


    let dragged, mouseOffset, dragStart;
    
    function getMousePos(e, elm, offset, stayWithin) {
        let x = e.clientX,
            y = e.clientY;

        function respectBounds(value, min, max) {
            return Math.max(min, Math.min(value, max));
        }

        if(elm) {
            const bounds = elm.getBoundingClientRect();
            x -= bounds.left;
            y -= bounds.top;

            if(offset) {
                x -= offset[0];
                y -= offset[1];
            }
            if(stayWithin) {
                x = respectBounds(x, 0, bounds.width);
                y = respectBounds(y, 0, bounds.height);
            }

            //Adjust the mouseOffset on the dragged element
            //if the element is positioned by its center:
            if(elm !== container) {
                const center = (offsetToCenter !== null)
                    ? offsetToCenter
                    //SVG circles and ellipses are positioned by their center (cx/cy), not the top-left corner:
                    : (elm.nodeName === 'circle') || (elm.nodeName === 'ellipse');

                if(center) {
                    x -= bounds.width/2;
                    y -= bounds.height/2;
                }
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
            
            if(callbackStart) {
                callbackStart(dragged, dragStart);
            }
        }
    }

    function onMove(e) {
        if(!dragged) { return; }
        e.preventDefault();

        const pos = getMousePos(e, container, mouseOffset, !dragOutside);
        callback(dragged, pos, dragStart);
    }

    function onEnd(e) {
        if(!dragged) { return; }

        if(callbackEnd) {
            const pos = getMousePos(e, container, mouseOffset, !dragOutside);
            callbackEnd(dragged, pos, dragStart);
        }
        dragged = null;
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
        //"mouseup" outside of window
        else { onEnd(e); }
    });
    window.addEventListener('touchmove', function(e) {
        onMove(tweakTouch(e));
    });

    container.addEventListener('mouseup', function(e) {
        //Here we check that the left button is *no longer* pressed:
        if(!isLeftButton(e)) { onEnd(e); }
    });
    function onTouchEnd(e) { onEnd(tweakTouch(e)); }
    container.addEventListener('touchend', onTouchEnd);
    container.addEventListener('touchcancel', onTouchEnd);


    function isLeftButton(e) {
        return (e.buttons !== undefined)
            ? (e.buttons === 1)
            //Safari (not tested):
            //https://developer.mozilla.org/en-US/docs/Web/API/MouseEvent#Browser_compatibility
            : (e.which === 1);
    }
    function tweakTouch(e) {
        let touch = e.targetTouches[0];
        //touchend:
        if(!touch) { touch = e.changedTouches[0]; }
        
        touch.preventDefault = e.preventDefault.bind(e);
        return touch;
    }
}
