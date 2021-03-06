import 'babel-polyfill';
require('./polyfills'); //is this really the correct way to load polyfills?

//React
var React = require('react');
var ReactDOM = require('react-dom');
var Application = require('./components/Application.react');

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


/*import VidePageOverlayViewer from './_modules/vide-module-pageOverlay-viewer';*/

//enhance react app to allow dispatching functions, not just plain states
let store = createStore(VideAppState, applyMiddleware(
        thunkMiddleware
    )
);

let videViewManager = new VideViewManager(store);

let xmlViewer = new VideXmlViewer();
eohub.registerModule(xmlViewer);

let videFacsimileViewer = new VideFacsimileViewer();
eohub.registerModule(videFacsimileViewer);

/*let videPageOverlayViewer = new VidePageOverlayViewer();
eohub.registerModule(videPageOverlayViewer);
*/
let transcriptionViewer = new VideTranscriptionViewer();
eohub.registerModule(transcriptionViewer);

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

