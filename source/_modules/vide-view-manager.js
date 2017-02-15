import 'babel-polyfill';
import {ViewTypes, ViewLayouts, openContextMenu, setFirstView, setSecondView} from './../redux/actions.redux';
import {Request} from './vide-module-blueprint';
import VideHistoryManager from './vide-history-manager';


const VideViewManager = class VideViewManager {

    /**
     * Constructor method
     * @constructs
     * @param {Object} store the Redux store of the application
     * @param {Object} eohub the interface to all vide modules
     */
    constructor(store, eohub) {
        this._store = store;
        this._eohub = eohub;
        this._history = new VideHistoryManager(this._store);
        
        eohub.registerViewManager(this);        
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
        
        let activeEdition = this._store.getState().activeEdition;
        let layout = this._store.getState().layout;
        let target;
        
        if(layout === ViewLayouts.SINGLE_VIEW) {target = 'firstView';} else if(originView.substr(0, 9) === 'firstView') {target = 'secondView';} else {target = 'firstView';}
        
        let requests = [];
        items.forEach(function(item, i) {
            let containerID= target;// + '_' + item.perspective;
            let editionID = activeEdition;
            let query = {objectType: item.objectType, objectID: item.objectID, contexts: item.contexts, perspective: item.perspective, operation: item.operation};
            let req = {containerID: containerID, editionID: editionID, query: query};
            requests.push(req);
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
    prepareView(target, moduleKey, request) {
        let viewType;
        if(moduleKey === 'videXMLviewer') {viewType = ViewTypes.VIEWTYPE_XMLVIEW;} else if(moduleKey === 'videTranscriptionViewer') {viewType = ViewTypes.VIEWTYPE_TRANSCRIPTIONVIEW;} else if(moduleKey === 'videFacsimileViewer') {viewType = ViewTypes.VIEWTYPE_FACSIMILEVIEW;} else if(moduleKey === 'videReconstructionViewer') {viewType = ViewTypes.VIEWTYPE_RECONSTRUCTIONVIEW;} else if(moduleKey === 'videInvarianceViewer') {viewType = ViewTypes.VIEWTYPE_INVARIANCEVIEW;} else {
            console.log('[ERROR] Dunno how to handle moduleKey ' + moduleKey + ' in videViewManager');
            return false;
        }
        
        let state = this._store.getState();
        
        /*console.log('-----------------------')
        console.log(request);
        console.log('-----------------------')*/
        
        try {
            if(target === 'firstView' && state.firstView.viewType !== viewType) {
                console.log('videViewManager.prepareView(): first view needs to be set');
                this._store.dispatch(setFirstView(viewType, request));
            } else if(target === 'secondView' && state.secondView.viewType !== viewType) {
                console.log('videViewManager.prepareView(): second view needs to be set');
                this._store.dispatch(setSecondView(viewType, request));                
            } else {
                console.log('videViewManager.prepareView(): view is available already');
                
                //view doesn't need to be changed (View.react will stop a re-rendering), but this will set the state of the view
                
                if(target === 'firstView') {
                    this._store.dispatch(setFirstView(viewType, request));
                } else if(target === 'secondView') {
                    this._store.dispatch(setSecondView(viewType, request));
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
};

export default VideViewManager;