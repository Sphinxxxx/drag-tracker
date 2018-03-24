function dragTracker(options) {
    "use strict";
    /*global Element*/
    
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
          selector = options.selector,

          callback = options.callback || console.log,
          callbackStart = options.callbackDragStart,
          callbackEnd = options.callbackDragEnd,
          //dragTracker may not play well with additional click events on the same container,
          //so we include the opportunity to register clicks as well:
          callbackClick = options.callbackClick,
          propagate = options.propagateEvents,

          roundCoords = (options.roundCoords !== false),
          dragOutside = (options.dragOutside !== false),
          //handleOffset: "center", true (default), false
          handleOffset = options.handleOffset || (options.handleOffset !== false)
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
    
    function stopEvent(e) {
        e.preventDefault();
        if(!propagate) {
            e.stopPropagation();
        }
    }

    function onDown(e) {
        if(selector) {
            dragged = (selector instanceof Element)
                            ? (selector.contains(e.target) ? selector : null)
                            : e.target.closest(selector);
        }
        else {
            //No specific targets, just register dragging within the container. Create a dummy object so 'dragged' isn't falsy:
            dragged = {};
        }

        if(dragged) {
            stopEvent(e);

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
        stopEvent(e);

        const pos = getMousePos(e, container, mouseOffset, !dragOutside);
        callback(dragged, pos, dragStart);
    }

    function onEnd(e) {
        if(!dragged) { return; }

        if(callbackEnd || callbackClick) {
            const pos = getMousePos(e, container, mouseOffset, !dragOutside);

            if(callbackClick && (dragStart[0] === pos[0]) && (dragStart[1] === pos[1])) {
                callbackClick(dragged, dragStart);
            }
            //Call callbackEnd even if this was only a click, because we already called callbackStart:
            if(callbackEnd) {
                callbackEnd(dragged, pos, dragStart);
            }
        }
        dragged = null;
    }

    /* Mouse/touch input */

    container.addEventListener('mousedown', function(e) {
        if(isLeftButton(e)) { onDown(e); }
    });
    container.addEventListener('touchstart', function(e) {
        relayTouch(e, onDown);
    });

    window.addEventListener('mousemove', function(e) {
        if(!dragged) { return; }

        if(isLeftButton(e)) { onMove(e); }
        //"mouseup" outside of window
        else { onEnd(e); }
    });
    window.addEventListener('touchmove', function(e) {
        relayTouch(e, onMove);
    });

    window.addEventListener('mouseup', function(e) {
        //Here we check that the left button is *no longer* pressed:
        if(dragged && !isLeftButton(e)) { onEnd(e); }
    });
    function onTouchEnd(e) { onEnd(tweakTouch(e)); }
    container.addEventListener('touchend', onTouchEnd);
    container.addEventListener('touchcancel', onTouchEnd);


    function isLeftButton(e) {
        return (e.buttons !== undefined)
            ? (e.buttons === 1)
            //Safari: https://developer.mozilla.org/en-US/docs/Web/API/MouseEvent#Browser_compatibility
            : (e.which === 1);
    }
    function relayTouch(e, handler) {
        //Don't interfere with pinch operations - those are probably handled somewhere else..
        if(e.touches.length !== 1) { onEnd(e); return; }

        handler(tweakTouch(e));
    }
    function tweakTouch(e) {
        let touch = e.targetTouches[0];
        //touchend:
        if(!touch) { touch = e.changedTouches[0]; }
        
        touch.preventDefault = e.preventDefault.bind(e);
        touch.stopPropagation = e.stopPropagation.bind(e);
        return touch;
    }
}

export default dragTracker;
