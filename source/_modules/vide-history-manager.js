import 'babel-polyfill';
let shake128 = require('js-sha3').shake_128;
import {version} from './../../package.json';
import {restoreState} from './../redux/actions.redux';
const VideHistoryManager = class VideHistoryManager {
    
    /** 
     * Constructor
     * @param {Object} store is the Redux store which holds the current state of the app
     */
    constructor(store) {
        this._store = store;
        this._userID = document.cookie.replace(/(?:(?:^|.*;\s*)userID\s*\=\s*([^;]*).*$)|^.*$/, '$1');
        this._sessionID;
        
        let sessionCookie = document.cookie.replace(/(?:(?:^|.*;\s*)sessionID\s*\=\s*([^;]*).*$)|^.*$/, '$1');
        
        if(!sessionStorage.getItem('sessionID')) {
            sessionStorage.setItem('sessionID', sessionCookie);
            this._sessionID = sessionCookie;
        } else {
            this._sessionID = sessionStorage.getItem('sessionID');
        }
        
        let userAgent = navigator.userAgent;
        let language = navigator.language;
        
        //when executing unsubscribe, the app is shut down (not needed)
        let unsubscribe = store.subscribe(() => {
            //everytime the state of the app changes, _checkState is called
            this._checkState();
        });
        
        //triggered whenever user navigates through browser history
        window.onpopstate = (event) => {
            this._checkHistory(event);
        };
        
        console.log('[INFO] This is session for tab ' + this._sessionID + ', sessionCookie was ' + sessionCookie);
        console.log('Version: ' + version);
        
        let initialLocation = this._getCurrentHash();
        if(initialLocation !== '') {
            console.log('[INFO] I need to restore state "' + initialLocation + '", directly at page load.');
            console.log(history);
            console.log(history.state);
        }
    }
    
    /** 
     * This function checks if the currently active Redux state is worth to be stored in the browser history or not
     */
    _checkState() {
        let state = this._store.getState();
        
        //logs each change of the state into the console
        console.log('[LOG] state has changed:');
        console.log(state);
        
        if(!state.views.view1.temp && !state.views.view2.temp && !state.network.nolog) {
            this._storeState(state);
        }
    }
    
    /** 
     * This function creates a hasg for the current state and adds both the hash and the state to the browser history.
     * Also logs the state on the server 
     * @param {object} state reflects the current Redux state of the application
     */
    _storeState(state) {
        let hash = shake128.create(32);
        hash.update(JSON.stringify(state));
        let hex = hash.hex();
        
        if(hex !== this._getCurrentHash()) {
            history.pushState(state, '', hex);
            
            //this._worker.postMessage({command: 'saveState', session: this._sessionID, hash: hex, state: state});
            
            /*r.table('sessions').get(this._sessionID)('states').
                append({timestamp: Date.now(),hash: hex}).run(connection, function(err, result) {
                if (err) throw err;
                console.log(JSON.stringify(result, null, 2));
            })
            
            r.table('states').insert({id: hex, state: state}).run(connection, function(err, result) {
                if (err) throw err;
                console.log(JSON.stringify(result, null, 2));
            })*/
        }
    }
    
    /** 
     * This function is called when the user navigates through browser history.
     * It checks if there is a valid state that can be restored. If so, calls _restoreState
     * @param {Object} event that is stored in the browser history
     */
    _checkHistory(event) {
        console.log('[LOG] browser history went to:');
        
        let state = event.state;
        this._restoreState(state);
    }
    
    /** 
     * This function is called in order to restore a given state of the application
     * @param {Object} state of Redux to be restored by dispatching a corresponding action
     */
    _restoreState(state) {
        this._store.dispatch(restoreState(state));
    }
    
    /** 
     * Returns the current hash of the application state, as found in the app URI
     * @returns {string} the hash
     */
    _getCurrentHash() {
        let hash = window.location.pathname;
        if(hash === '/') {
            return '';
        }
        
        return hash.substr(1);
    }

};

export default VideHistoryManager;