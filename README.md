# drag-tracker

A simple library for dragging things around. Tracks dragging with touch or mouse (left button).

## Usage ##

    dragTracker({
      container:          /* The element the user can drag within */,
      selector:           /* CSS selector for elements inside the container that are draggable */,
      callback:           /* Your code wich decides what happens during a drag operation */,
      handleOffset: true  /* Whether callback coordinates should be the dragged element's top-left corner *) instead of the actual mouse position */,
      roundCoords:  true  /* Whether callback coordinates should be integers */
    });

All options are optional. Without a `callback`, the coordinates are written to `console.log`.

*) Center for SVG `<circle>`s and `<ellipse>`s

**Demo**: https://codepen.io/Sphinxxxx/pen/KXedQe
