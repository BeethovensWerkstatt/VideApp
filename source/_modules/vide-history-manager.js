import 'babel-polyfill';
/** random hash generator in {@link VideHistoryManager} (<i>$FILE</i>) */
let shake128 = require('js-sha3').shake_128;
import {version} from './../../package.json';
import {restoreState, resetState, receiveEditions, activateEdition} from './../redux/actions.redux';
import {eohub} from './eo-hub';

/** browser history manager */
const VideHistoryManager = class VideHistoryManager {

    /**
     * Constructor
     * @param {Object} store is the Redux store which holds the current state of the app
     */
    constructor(store) {
        this._store = store;
        this._userID = document.cookie.replace(/(?:(?:^|.*;\s*)userID\s*\=\s*([^;]*).*$)|^.*$/, '$1');
        this._sessionID;
        this._socketID;

        let sessionCookie = document.cookie.replace(/(?:(?:^|.*;\s*)sessionID\s*\=\s*([^;]*).*$)|^.*$/, '$1');

        this._socketID = sessionCookie;

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

        this._logSocket = io('http://localhost:2999/' + this._socketID);
        this._logSocket.on('connect', () => {
            this._logSocket.emit('logSession', {id:this._sessionID, user: this._userID, userAgent:userAgent, lang: language, states:[]});
        });

        this._logSocket.on('sendState', (message) => {
            console.log(' --> receiving state ' + message.hash);
            console.log(message);
            this._restoreState(message.state);
        });

        //triggered whenever user navigates through browser history
        window.onpopstate = (event) => {
            this._checkHistory(event);
        };

        let initialLocation = this._getCurrentHash();

        if(initialLocation !== '' && initialLocation !== sessionStorage.getItem('stateHash')) {
            console.log('[INFO] I need to restore state "' + initialLocation + '"');
            this._logSocket.emit('requestState', {hash:initialLocation, socket:this._socketID});
        } /*else {
            console.log(' --> a clean reload is requested')
        }*/
    }

    /**
     * This function checks if the currently active Redux state is worth to be stored in the browser history or not
     */
    _checkState() {
        let state = this._store.getState();

        if(!state.views.view1.temp && !state.views.view2.temp && !state.network.nolog) {
            sessionStorage.setItem('stateHash', this._getHash(state));
            this._storeState(state);

            //logs each change of the state into the console
            /*console.log('[LOG] preserving state ' + this._getHash(state));
            console.log(state);*/
        } else {
            //logs each change of the state into the console
            /*console.log('[LOG] temporary state ' + this._getHash(state));
            console.log(state);*/
        }
    }

    /**
     * This function creates a hash for the current state and adds both the hash and the state to the browser history.
     * Also logs the state on the server
     * @param {object} state reflects the current Redux state of the application
     */
    _storeState(state) {
        let hash = this._getHash(state);

        if(hash !== this._getCurrentHash()) {
            history.pushState(state, '', hash);

            this._logSocket.emit('logState', {id:hash, state:state, session: this._sessionID, timestamp: Date.now()});

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
     * function _getHash is used to calculate the hash for a given state
     * @param {Object} state the state to be hashed
     * @returns {string} the hash
     */
    _getHash(state) {
        let hash = shake128.create(32);
        hash.update(JSON.stringify(state));
        let hex = hash.hex();

        return hex;
    }

    /**
     * This function is called when the user navigates through browser history.
     * It checks if there is a valid state that can be restored. If so, calls _restoreState
     * @param {Object} event that is stored in the browser history
     */
    _checkHistory(event) {
        console.log('[LOG] browser history went to:');

        let state = event.state;
        if(state !== null) {
            try {
                this._restoreState(state);
            } catch(err) {
                console.log('[ERROR] Unable to restore state: ' + err);
                console.log(state)
            }


        }
    }

    /**
     * This function is called in order to restore a given state of the application
     * @param {Object} state of Redux to be restored by dispatching a corresponding action
     */
    _restoreState(state) {
        this._store.dispatch(receiveEditions(state.edition.editions));
        this._store.dispatch(activateEdition(state.edition.active));
        this._store.dispatch(restoreState(state));
        /*try {
            eohub.setEdition(state.edition.active, state.edition.revision);
        } catch(err) {
            console.log('[ERROR] Unable to restore state: ' + err);
            console.log(state)
        }*/
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

    /**
     * Returns the ID of the current socket connection;
     * @returns {string} the socket ID
     */
    getSocketID() {
        return this._socketID;
    }

};

export default VideHistoryManager;
