/*!
 * drag-tracker v0.4.5
 * https://github.com/Sphinxxxx/drag-tracker#readme
 *
 * Copyright 2017-2018 Andreas Borgen
 * Released under the MIT license.
 */
(function (global, factory) {
	typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory() :
	typeof define === 'function' && define.amd ? define(factory) :
	(global.dragTracker = factory());
}(this, (function () { 'use strict';

function dragTracker(options) {


    var ep = Element.prototype;
    if (!ep.matches) ep.matches = ep.msMatchesSelector || ep.webkitMatchesSelector;
    if (!ep.closest) ep.closest = function (s) {
        var node = this;
        do {
            if (node.matches(s)) return node;
            node = node.tagName === 'svg' ? node.parentNode : node.parentElement;
        } while (node);

        return null;
    };

    options = options || {};
    var container = options.container || document.documentElement,
        selector = options.selector,
        callback = options.callback || console.log,
        callbackStart = options.callbackDragStart,
        callbackEnd = options.callbackDragEnd,

    callbackClick = options.callbackClick,
        propagate = options.propagateEvents,
        roundCoords = options.roundCoords !== false,
        dragOutside = options.dragOutside !== false,

    handleOffset = options.handleOffset || options.handleOffset !== false;
    var offsetToCenter = null;
    switch (handleOffset) {
        case 'center':
            offsetToCenter = true;break;
        case 'topleft':
        case 'top-left':
            offsetToCenter = false;break;
    }

    var dragged = void 0,
        mouseOffset = void 0,
        dragStart = void 0;

    function getMousePos(e, elm, offset, stayWithin) {
        var x = e.clientX,
            y = e.clientY;

        function respectBounds(value, min, max) {
            return Math.max(min, Math.min(value, max));
        }

        if (elm) {
            var bounds = elm.getBoundingClientRect();
            x -= bounds.left;
            y -= bounds.top;

            if (offset) {
                x -= offset[0];
                y -= offset[1];
            }
            if (stayWithin) {
                x = respectBounds(x, 0, bounds.width);
                y = respectBounds(y, 0, bounds.height);
            }

            if (elm !== container) {
                var center = offsetToCenter !== null ? offsetToCenter
                : elm.nodeName === 'circle' || elm.nodeName === 'ellipse';

                if (center) {
                    x -= bounds.width / 2;
                    y -= bounds.height / 2;
                }
            }
        }
        return roundCoords ? [Math.round(x), Math.round(y)] : [x, y];
    }

    function stopEvent(e) {
        e.preventDefault();
        if (!propagate) {
            e.stopPropagation();
        }
    }

    function onDown(e) {
        if (selector) {
            dragged = selector instanceof Element ? selector.contains(e.target) ? selector : null : e.target.closest(selector);
        } else {
            dragged = {};
        }

        if (dragged) {
            stopEvent(e);

            mouseOffset = selector && handleOffset ? getMousePos(e, dragged) : [0, 0];
            dragStart = getMousePos(e, container, mouseOffset);
            if (roundCoords) {
                dragStart = dragStart.map(Math.round);
            }

            if (callbackStart) {
                callbackStart(dragged, dragStart);
            }
        }
    }

    function onMove(e) {
        if (!dragged) {
            return;
        }
        stopEvent(e);

        var pos = getMousePos(e, container, mouseOffset, !dragOutside);
        callback(dragged, pos, dragStart);
    }

    function onEnd(e) {
        if (!dragged) {
            return;
        }

        if (callbackEnd || callbackClick) {
            var pos = getMousePos(e, container, mouseOffset, !dragOutside);

            if (callbackClick && dragStart[0] === pos[0] && dragStart[1] === pos[1]) {
                callbackClick(dragged, dragStart);
            }
            if (callbackEnd) {
                callbackEnd(dragged, pos, dragStart);
            }
        }
        dragged = null;
    }


    container.addEventListener('mousedown', function (e) {
        if (isLeftButton(e)) {
            onDown(e);
        }
    });
    container.addEventListener('touchstart', function (e) {
        relayTouch(e, onDown);
    });

    window.addEventListener('mousemove', function (e) {
        if (!dragged) {
            return;
        }

        if (isLeftButton(e)) {
            onMove(e);
        }
        else {
                onEnd(e);
            }
    });
    window.addEventListener('touchmove', function (e) {
        relayTouch(e, onMove);
    });

    window.addEventListener('mouseup', function (e) {
        if (dragged && !isLeftButton(e)) {
            onEnd(e);
        }
    });
    function onTouchEnd(e) {
        onEnd(tweakTouch(e));
    }
    container.addEventListener('touchend', onTouchEnd);
    container.addEventListener('touchcancel', onTouchEnd);

    function isLeftButton(e) {
        return e.buttons !== undefined ? e.buttons === 1 :
        e.which === 1;
    }
    function relayTouch(e, handler) {
        if (e.touches.length !== 1) {
            onEnd(e);return;
        }

        handler(tweakTouch(e));
    }
    function tweakTouch(e) {
        var touch = e.targetTouches[0];
        if (!touch) {
            touch = e.changedTouches[0];
        }

        touch.preventDefault = e.preventDefault.bind(e);
        touch.stopPropagation = e.stopPropagation.bind(e);
        return touch;
    }
}

return dragTracker;

})));
