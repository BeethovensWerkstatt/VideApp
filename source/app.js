import 'babel-polyfill';
require('./polyfills'); //is this really the correct way to load polyfills?

//React
// var React = require('react');
import React from 'react';
// var ReactDOM = require('react-dom');
import ReactDOM from 'react-dom';
// var Application = require('./components/Application.react');
import Application from './components/Application.react';

//Redux
import thunkMiddleware from 'redux-thunk';
import { createStore, applyMiddleware } from 'redux';
import { Provider } from 'react-redux';

//Redux: the state of the application
import VideAppState from './redux/reducers.redux';

//React: The action to start loading data into the app
import { fetchEditions, switchLanguage } from './redux/actions.redux';

//load core components
import {eohub} from './_modules/eo-hub';
import VideViewManager from './_modules/vide-view-manager';

//load individual modules
import VideXmlViewer from './_modules/vide-module-xml-viewer';
import VideTranscriptionViewer from './_modules/vide-module-transcription-viewer';
import VideTextViewer from './_modules/vide-module-text-viewer';
import VideFacsimileViewer from './_modules/vide-module-facsimile-viewer';

/**
 * This module defines the core react-redux application.
 * It first renders the {@link Application} and then adds available editions
 * to the application state with the {@link fetchEditions()} function.
 * @module
 */

/*import VidePageOverlayViewer from './_modules/vide-module-pageOverlay-viewer';*/

//enhance react app to allow dispatching functions, not just plain states
/**
 * the redux store created from {@link VideAppState}
 */
let store = createStore(VideAppState, applyMiddleware(
        thunkMiddleware
    )
);

/**
 * The VideApp {@link VideViewManager}
 */
let videViewManager = new VideViewManager(store);

/**
 * The {@link VideXmlViewer}
 */
let xmlViewer = new VideXmlViewer();
eohub.registerModule(xmlViewer);

/**
 * The {@link VideFacsimileViewer}
 */
let videFacsimileViewer = new VideFacsimileViewer();
eohub.registerModule(videFacsimileViewer);

/*
let videPageOverlayViewer = new VidePageOverlayViewer();
eohub.registerModule(videPageOverlayViewer);
*/

/**
 * The verovio based {@link VideTranscriptionViewer}
 */
let transcriptionViewer = new VideTranscriptionViewer();
eohub.registerModule(transcriptionViewer);

/**
 * The {@link VideTextViewer}
 */
let videTextViewer = new VideTextViewer();
eohub.registerModule(videTextViewer);


/*store.dispatch(switchLanguage('de'));
store.dispatch(openView(ViewTypes.VIEWTYPE_FACSIMILEVIEW));
store.dispatch(changeViewsRatio(25));
store.dispatch(switchLanguage('fr'));
store.dispatch(openView(ViewTypes.VIEWTYPE_FACSIMILEVIEW,SECONDVIEW_BELOW));
store.dispatch(changeViewsRatio(75));*/

//unsubscribe();

//App start
ReactDOM.render(<Provider store={store}><Application/></Provider>, document.getElementById('react-container'));

//start loading data into the app
store.dispatch(fetchEditions()).then(() => {
  console.log(store.getState());
  //decide if app should be started in german
  if(navigator.language.startsWith('de')) {
    store.dispatch(switchLanguage('de'));
  }
});
