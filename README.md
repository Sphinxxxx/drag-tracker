# drag-tracker

A simple library for dragging things around. Tracks dragging with touch or mouse (left button).

## Demo

https://rawgit.com/Sphinxxxx/drag-tracker/master/demo/index.html  
https://codepen.io/Sphinxxxx/pen/KXedQe

## Usage

    dragTracker({
      container:          /* The element the user can drag within */,
      selector:           /* CSS selector for elements inside the container that are draggable, or a single HTML element */,
      
      callback:           /* Your code which decides what happens during a drag operation */,
      callbackDragStart:  /* Optional callback when a drag operation is about to start */,
      callbackDragEnd:    /* Optional callback when a drag operation has ended */,
      callbackClick:      /* Optional callback when a draggable element is only clicked, not dragged */,
      propagateEvents:    /* Whether to let mouse/touch events propagate (bubble) after being handled. Usually not wanted in case multiple handlers track the same container */,
      
      roundCoords:  true  /* Whether callback coordinates should be integers */,
      dragOutside:  true  /* Whether the draggable elements can be dragged outside the bounds of the container */,

      /* Whether callback coordinates should be adjusted to suit the dragged element instead of the actual mouse position */
      handleOffset: true (default)  /* Coordinates are the element's center for SVG `<circle>`s and `<ellipse>`s, and the top-left corner for all other elements */,
                    'center'        /* Coordinates are always the element's center */
                    'topleft'       /* Coordinates are always the element's top-left corner */
                    false           /* No adjustment, just use the mouse position */
    });

All options are optional. Without a `callback`, the coordinates are written to `console.log`.
