//This results in window.dragTracker.dragTracker()
//instead of window.dragTracker()...
//
//  //http://jamesknelson.com/re-exporting-es6-modules/
//  export { default as dragTracker } from './src/drag-tracker.js';


import dragTracker from './src/drag-tracker.js';

export default dragTracker;
