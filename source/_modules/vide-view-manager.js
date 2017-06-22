import 'babel-polyfill';
import {openContextMenu, setFirstView, setSecondView, confirmView, startLoadingData, stopLoadingData} from './../redux/actions.redux';
import {ViewLayouts} from './../redux/layout.constants';
import VIDE_PROTOCOL from './vide-protocol';
import VideHistoryManager from './vide-history-manager';
import {eohub} from './eo-hub';
import * as langfile from '../i18n/i18n.json';

const VideViewManager = class VideViewManager {

    /**
     * Constructor method
     * @constructs
     * @param {Object} store the Redux store of the application
     * @param {Object} eohub the interface to all vide modules
     */
    constructor(store) {
        this._store = store;
        this._history = new VideHistoryManager(this._store);
        this._langfile = langfile;
        this._currentLang = this._store.getState().preferences.language;
        eohub.registerViewManager(this);        
    }
    
    setLanguage(lang) {
        this._currentLang = lang;
        let elems = document.querySelectorAll('*[data-i18n-text], *[data-i18n-title]');
        
        for (let elem of elems) {
            if(elem.hasAttribute('data-i18n-text')) {
                let key = elem.getAttribute('data-i18n-text');
                let obj = this._langfile[key]
                elem.innerHTML = obj[lang];    
            }
            
            if(elem.hasAttribute('data-i18n-title')) {
                let key = elem.getAttribute('data-i18n-title');
                let obj = this._langfile[key];
                elem.setAttribute('title',obj[lang]);    
            }
        }
    }
    
    getI18nString(key) {
        let object = this._langfile[key];
        if(typeof object !== 'undefined') {
            return object[this._currentLang];    
        }
        return 'I18N ERROR: ' + key;
    }
    
    confirmView(moduleKey, containerID, state) {
        if(containerID === 'view1') {
            this._store.dispatch(confirmView(state, 1));
        } else if(containerID === 'view2') {
            this._store.dispatch(confirmView(state, 2));
        } else {
            console.log('[ERROR] unable to determine target that wanted to confirm its view: ' + containerID)
        }
    }
    
    notifyLoadingDataStart(key,type) {
        this._store.dispatch(startLoadingData(key,type));
    }
    
    notifyLoadingDataStop(key,success) {
        this._store.dispatch(stopLoadingData(key,success));
    }
    
    //todo: remove this
    /*getAvailableViewPositions() {
        let viewPositions = [];
        viewPositions.push('firstView_singleView');
        viewPositions.push('firstView');
        viewPositions.push('secondView');
        
        return viewPositions;
    }*/
    
    /** 
     * setContextMenu is called from individual modules (through eohub) and displays items provided by eohub
     * @param {Object[]} items is an array of items to be displayed in the context menu
     * @param {Object} event is the original browser click event
     * @param {Object} originView is the vide module where the event originated
     * @param {Function} closeFunc is a function to be executed when the contextMenu is closed
     * @returns {boolean} false if no items are specified or other problems occur
     */
    setContextMenu(items = [], event, originView, closeFunc) {
        /*
         * prepare items: 
         *      Generate an i18n key for display
         *      generate a func that gets called when menu opens
         * 
         */
        if(items.length === 0) {
            return false;
        }
        let unsubscribe;
        
        if(typeof closeFunc === 'function') {
            unsubscribe = this._store.subscribe(() => {
                let state = this._store.getState();
                if(!state.contextMenu.visible) {
                    closeFunc();
                    unsubscribe();
                }
            });
        }
        
        let activeEdition = this._store.getState().edition.active;
        let layout = this._store.getState().views.layout;
        let target;
        
        if(layout === ViewLayouts.SINGLE_VIEW) {
            target = 'view1';
        } else if(originView.substr(0, 9) === 'firstView') {
            target = 'view2';
        } else {
            target = 'view1';
        }
        
        let requests = [];
        items.forEach((item, i) => {
            let containerID= target;// + '_' + item.perspective;
            let editionID = activeEdition;
            let query = {
                target: target,
                req: {
                    id: item.id,
                    object: item.object,
                    contexts: item.contexts,
                    perspective: item.perspective,
                    operation: item.operation,
                    state: {}
                }
            }    
            requests.push(query);
        });
        
        try{
            this._store.dispatch(openContextMenu(requests, event.clientX, event.clientY)); 
        } catch(err) {
            console.log('[ERROR] Unable to open context menu: ' + err);
        }
    }
        
    /**
     * prepareView
     * @param {string} target as HTML id
     * @param {string} moduleKey is the vide module that's supposed to handle a request
     * @param {Object} request to be handled
     * @returns {boolean} false if there are errors
     */
    prepareView(containerID, moduleKey, request = null) {
        
        let perspective = (request !== null) ? request.perspective : null;
        let appState = this._store.getState();
        
        try {
            if(containerID === 'view1' && request === null) {
                console.log('videViewManager.prepareView(): requesting new perspective for view 1');
                this._store.dispatch(setFirstView(moduleKey));
            } else if(containerID === 'view2' && request === null) {
                console.log('videViewManager.prepareView(): requesting new perspective for view 2');
                this._store.dispatch(setSecondView(moduleKey));
            } else if(containerID === 'view1' && perspective !== appState.views.view1.perspective) {
                console.log('videViewManager.prepareView(): first view needs to be set');
                this._store.dispatch(setFirstView(moduleKey, request));
            } else if(containerID === 'view2' && perspective !== appState.views.view2.perspective) {
                console.log('videViewManager.prepareView(): second view needs to be set');
                this._store.dispatch(setSecondView(moduleKey, request));                
            } else {
                console.log('videViewManager.prepareView(): view is available already');
                
                //view doesn't need to be changed (View.react will stop a re-rendering), but this will set the state of the view
                
                if(containerID === 'view1') {
                    this._store.dispatch(setFirstView(moduleKey, request));
                } else if(containerID === 'view2') {
                    this._store.dispatch(setSecondView(moduleKey, request));
                }
                
                //this is done through View.react
                /*let module = this._eohub.getModule(moduleKey);
                module.handleRequest(request);*/
            }
        } catch(err) {
            console.log('[ERROR]: Unable to change view (' + err + ')');
            return false;
        }
        
        return true;
    }
    
    /** 
     * Returns the ID of the current socket connection;
     * @returns {string} the socket ID
     */
    getSocketID() {
        return this._history.getSocketID();
    }
    
    /** 
     * Returns all views supported by a specified edition
     * @param {string} id of the edition
     * @returns {[Object]} the array of supported views 
     */
    getSupportedViews(id) {
        //todo: include revision of the edition
        
        console.log('requesting views for id ' + id)
        console.log(this._store.getState())
        return this._store.getState().edition.editions[id].supportedViews;
    }

};

export default VideViewManager;