# drag-tracker

A simple library for dragging things around. Tracks dragging with touch or mouse (left button).

## Usage ##

    dragTracker({
      container:          /* The element the user can drag within */,
      selector:           /* CSS selector for elements inside the container that are draggable */,
      
      callback:           /* Your code wich decides what happens during a drag operation */,
      callbackStart:      /* Optional callback when a drag operation is about to start */,
      callbackEnd:        /* Optional callback when a drag operation has ended */,
      
      roundCoords:  true  /* Whether callback coordinates should be integers */,
      dragOutside:  true  /* Whether the draggable elements can be dragged outside the bounds of the container */,

      /* Whether callback coordinates should be adjusted to suit the dragged element instead of the actual mouse position */
      handleOffset: true (default)  /* Coordinates are the element's center for SVG `<circle>`s and `<ellipse>`s, and the top-left corner for all other elements */,
                    'center'        /* Coordinates are always the element's center */
                    'topleft'       /* Coordinates are always the element's top-left corner */
                    false           /* No adjustment, just use the mouse position */
    });

All options are optional. Without a `callback`, the coordinates are written to `console.log`.

**Demo**: https://codepen.io/Sphinxxxx/pen/KXedQe
