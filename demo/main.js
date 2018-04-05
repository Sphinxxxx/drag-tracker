/*global dragTracker*/
/*global Vue*/


/* Basic I: HTML element dragging */

(function initDragHtml() {
    const container = document.querySelector('#basic-html .container');

    dragTracker({
        container: container,
        selector: '.box',
        callback: (box, pos, start) => {
            box.style.left = pos[0] + 'px';
            box.style.top  = pos[1] + 'px';

            //box.textContent += pos + ' ';
        },

        //Bonus: Cancel drag operations
        callbackDragStart: (box, pos) => {
            container.style.backgroundColor = '';

            //box.textContent += pos + ' ';
        },
        callbackDragEnd: (box, pos, start, cancelled) => {
            if(cancelled) {
                container.style.backgroundColor = 'pink';
                box.style.left = start[0] + 'px';
                box.style.top  = start[1] + 'px';
            }
        },
    });
})();


/* Basic II: Draw on canvas */

(function initDrawCanvas() {
    const canvas = document.querySelector('#basic-canvas canvas'),
          ctx = canvas.getContext("2d");

    canvas.width = canvas.height = 400;
    ctx.lineWidth = 2;
    ctx.strokeStyle = 'lime'; //'rgba(0,0,0, .1)';

    let lastPos;
    dragTracker({
        container: document.querySelector('#basic-canvas .container'),
        callbackDragStart: (_, pos) => {
            lastPos = pos;
        },
        callback: (_, pos, start) => {
            ctx.beginPath();
            ctx.moveTo(lastPos[0], lastPos[1]);
            ctx.lineTo(pos[0], pos[1]);
            ctx.stroke();

            lastPos = pos;
        },
    });
})();


/* Advanced: Vue interaction */

(function initVue() {
    //Global state model. Can be changed from within Vue or from the outside.
    const _svgState = {
        nodeRadius: 16,
        nodes: [],
        lines: [],
        selectedNode: null,
    };
    
    function createNode(x, y, r) {
        return {
            coord: [
                x || Math.round(Math.random()*400),
                y || Math.round(Math.random()*400)
            ],
            radius: r || _svgState.nodeRadius || 10,
        };
    }
    function addNode() {
        _svgState.nodes.push(createNode());
    }
    function addLine() {
        _svgState.lines.push({ start: createNode(), end: createNode() });
    }

    addNode();
    addNode();
    addLine();
    addLine();
    
    //Needs to be part of the reactive state, or else drag-node's classObj() won't update correctly..
    //  let _selectedNode;
    
    Vue.component('drag-node', {
        props: ['p'],
        template: '<circle data-draggable :class="classObj" @dragging="onDragging" :cx="p.coord[0]" :cy="p.coord[1]" :r="p.radius" />',
        computed: {
            classObj() {
                return {
                    selected: (this.p === _svgState.selectedNode),
                };
            },
        },
        methods: {
            onDragging(e) {
                this.p.coord = e.detail.pos;
                _svgState.selectedNode = this.p;
            },
        }
    });
    new Vue({
        el: '#advanced-vue',
        data: {
            svg: _svgState,
        },
        methods: {
            addNode() { addNode(); },
            addLine() { addLine(); },
        },
        filters: {
            prettyCompact: function(obj) {
                if(!obj) return '';
                const pretty = JSON.stringify(obj, null, 2),
                      //Collapse simple arrays (arrays without objects or nested arrays) to one line:
                      compact = pretty.replace(/\[[^[{]*?]/g, (match => match.replace(/\s+/g, ' ')));

                return compact;
            }
        },
    });

    //Vue replaces the original <svg> element, so we must wait until now to enable dragging:
    dragTracker({
        container: document.querySelector('#advanced-vue svg'), 
        selector: '[data-draggable]',
        dragOutside: false,
        callback: (node, pos) => {
            //Doesn't look like this binding is two-way,
            //so we must dispatch a custom event which is handled by the node's Vue component...
            //	node.setAttribute('cx', pos[0]);
            //	node.setAttribute('cy', pos[1]);

            var event = document.createEvent('CustomEvent');
            event.initCustomEvent('dragging', true, false, { pos } );
            //var event = new CustomEvent('dragging', { detail: { pos } });
            node.dispatchEvent(event);
        },
        callbackClick: (node, pos) => {
            //Raise the same event as when dragging, just to select nodes on click:
            var event = document.createEvent('CustomEvent');
            event.initCustomEvent('dragging', true, false, { pos } );
            node.dispatchEvent(event);
            
            //alert('Click');
        },
    });

    //Example of changing the state from the outside. Vue will notice and update the SVG:
    document.querySelector('#advanced-vue #size').addEventListener('input', (e) => {
        if(!_svgState.selectedNode) { return; }
        _svgState.selectedNode.radius = e.target.value;
    });
})();
