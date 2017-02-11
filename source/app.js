import 'babel-polyfill';

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
import { fetchEditions } from './redux/actions.redux';

//load core components
import EoHub from './_modules/eo-hub';
import VideViewManager from './_modules/vide-view-manager';

//load individual modules
import VideXmlViewer from './_modules/vide-module-xml-viewer';
import VideTranscriptionViewer from './_modules/vide-module-transcription-viewer';
import VideTextViewer from './_modules/vide-module-text-viewer';
import VideFacsimileViewer from './_modules/vide-module-facsimile-viewer';
import VideReconstructionViewer from './_modules/vide-module-reconstruction-viewer';
import VideInvarianceViewer from './_modules/vide-module-invariance-viewer';

//enhance react app to allow dispatching functions, not just plain states
let store = createStore(VideAppState, applyMiddleware(
        thunkMiddleware
    )
);


//set up data hub
let eoHub = window.EoHub = new EoHub();


let videViewManager = new VideViewManager(store, eoHub);

/*let xmlViewer = new VideXmlViewer();
eoHub.registerModule(xmlViewer);

let transcriptionViewer = new VideTranscriptionViewer();
eoHub.registerModule(transcriptionViewer);
let vrvToolkit = new verovio.toolkit();
window.vrvStore = {vrvToolkit: vrvToolkit};

let videTextViewer = new VideTextViewer();
eoHub.registerModule(videTextViewer);

let videFacsimileViewer = new VideFacsimileViewer();
eoHub.registerModule(videFacsimileViewer);

let videReconstructionViewer = new VideReconstructionViewer();
eoHub.registerModule(videReconstructionViewer);

let videInvarianceViewer = new VideInvarianceViewer();
eoHub.registerModule(videInvarianceViewer);*/


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
store.dispatch(fetchEditions()).then(() =>
  console.log(store.getState())
);