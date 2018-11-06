import 'babel-polyfill';
import { connect } from 'react-redux';
import fetch from 'isomorphic-fetch';
import verovio from 'verovio-dev';

//imported in HTML -> globally available
/*import io from 'socket.io';*/

let server = 'http://localhost:2999/';

/** generate UUIDs - unique identifiers */
Math.uuidCompact = function() {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
        let r = Math.random()*16|0;
        let v = c === 'x' ? r : (r&0x3|0x8);
        return v.toString(16);
    });
};

/** The EoHub class */
const EoHub = class EoHub {

    /**
     * @constructor
     * @param {Object} options provided for an EoHub instance
     */
    constructor(options = {database:
            {url:'', user: null, password: null},
        modules: [],
        editionID: null,
        revision:''}) {
        this.options = options;
        this._modules = new Map();
        this._viewManager = null;
        this._socketID;
        this._server = server;
        this.cache = new Map();

        this._vrvToolkit = new verovio.toolkit();
        this._vrvToolkit.setOptions({
                        inputFormat: 'mei',
                        border: 0,
                        scale: 35,           //scale is in percent (1 - 100)
                        ignoreLayout: 0,
                        noLayout: 1          //results in a continuous system without page breaks
                    });

        console.log('EoHub initialized');
    }

    getVerovio() {
        return this._vrvToolkit;
    }

    setLanguage(lang) {
        this._viewManager.setLanguage(lang);
    }

    getI18nString(key) {
        return this._viewManager.getI18nString(key);
    }

    confirmView(moduleKey, containerID, state) {
        this._viewManager.confirmView(moduleKey, containerID, state);
    }

    /**
     * sets the ID of the current edition
     * @param {string} id of the current edition (called by //todo, which coordinates with Redux)
     * @returns {Object} returns the EoHub instance
     *
     */
    setEdition(id, revision) {
        this.options.editionID = id;
        this.options.revision = revision;

        console.log('me here with ' + id + ' -- ' + revision)

        this.deactivateAllModules();

        let supportedViews = this._viewManager.getSupportedViews(id);

        for(let i=0; i<supportedViews.length; i++) {

            let appModule = supportedViews[i];

            let viewKey = appModule.id;

            //console.log('[eohub] activating module ' + viewKey + ' for edition ' + id)
            //console.log('has feature: ' + appModule.feature)

            if(typeof appModule.feature !== 'undefined') {
                this.activateModule(viewKey,appModule.feature);
            } else {
                this.activateModule(viewKey);
            }
        }

        return this;
    }

    /**
     * gets the ID of the current edition
     * @returns {string} the ID of the current edition
     */
    getEdition() {
        return this.options.editionID;
    }

    /**
     * gets the current revision of the current edition
     * @returns {string} the revision of the current edition
     */
    getRevision() {
        return this.options.revision;
    }

    /**
     * unsets the current edition
     * @returns {Object} the EoHub instance
     */
    unsetEdition() {
        console.log('unsetting')
        this.options.editionID = null;
        this.options.revision = '';
        return this;
    }

    /**
     * This function registers a module
     * @param {Object} module as instance of a module base on vide-module-blueprint
     * @returns {Object} the module
     */
    registerModule(module) {
        //console.log('------------- registering module ' + module.getKey())
        this._modules.set(module.getKey(), module);
        module.registerHub(this);
        return module;
    }

    /**
     * Function activateModule
     * This function is called to activate a specific module for
     * the current edition (i.e., turn on facsimile view)
     * @param {string} moduleKey specifies a module which needs to be available for the current edition
     */
    activateModule(moduleKey,feature) {
        try {
            this._modules.get(moduleKey).activate(feature);
        } catch(err) {
            console.log('[WARNING] Unable to activate module ' + moduleKey + ': ' + err + ' This is likely to be an error in the encded MEI file.');
        }
    }

    /**
     * Function deactivateModule
     * This function is called to deactivate a specific module for
     * the current edition (i.e., turn of facsimile view)
     * @param {string} moduleKey specifies a module which shouldn't be available for the current edition
     */
    deactivateModule(moduleKey) {
        this._modules.get(moduleKey).deactivate();
    }

    /**
     * Function deactivateAllModules
     * This function is called to turn off all modules
     */
    deactivateAllModules() {
        for (let eoModule of this._modules.values()) {
            eoModule.deactivate();
        }
    }

    /**
     * Function that returns a given module
     * @param {string} moduleKey identifies a module
     * @returns {Object} the module in question
     */
    getModule(moduleKey) {
        return this._modules.get(moduleKey);
    }

    /**
     * Function that returns a list of active modules
     * @returns {Object[]} the active modules
     */
    getActiveModules() {

        let moduleArray = [...this._modules.keys()].sort();
        moduleArray = ['VideTextViewer','VideFacsimileViewer','VideTranscriptionViewer','VideXmlViewer']

        let array = [];
        let i=0;
        for(i;i<moduleArray.length;i++) {
            let module = this.getModule(moduleArray[i]);
            if(module.isActive()) {
                array.push(module.getKey());
            }
        }

        return array;
    }

    /**
     * Function unmountModule
     * This function is called to clean up all listeners etc. before closing a view.
     * Every module decides if and how to use it.
     * @param {string} moduleKey identifies the module to be unmounted
     * @param {string} containerID identifies the HTML element which is supposed to be cleaned
     */
    unmountModule(moduleKey, containerID) {
        this._modules.get(moduleKey).unmount(containerID);
    }

    /**
     * Function requestDefault asks a module to deliver a vanilla view for the edition in the specified HTML container
     * @param {string} moduleKey identifies the module that shall provide a default view
     * @param {string} containerID identifies the HTML element which is supposed to hold the default view
     */
    requestDefault(moduleKey, containerID) {
        //console.log('[DEBUG] requesting default view for ' + moduleKey + ' in container ' + containerID);



        try {
            this.getModule(moduleKey).getDefaultView(containerID);
        }
        catch (e) {
            if(typeof this._modules.get(moduleKey) === 'undefined')
                console.log('[ERROR]: No module with key "' + moduleKey + '" registered in app.js');
            else
                console.log('[ERROR]: ' + e);
        }
    }

    /**
     * public function broadcastRequest
     * this function is called from within a client module to notify other modules
     * each module will then check if it's qualified to answer that request
     * @param {Object} req is sent to all modules
     * @returns {boolean} if there is no adequate module
     */
    broadcastRequest(object) {
        let req = object.req;
        let containerID = object.target;

        /*if(req instanceof Request) {
            request = req;
        } else {
            request = new Request(req.containerID, req.editionID, req.query);
        }*/

        let fittingModules = [];

        for (var eoModule of this._modules.values()) {
            try {
                let fits = eoModule.checkRequest(req);
                if(fits !== false && eoModule.isActive()) {
                    fittingModules.push(eoModule);
                }
            } catch(err) {
                console.log('[ERROR] Problems when checking for modules matching the following request (' + err + '):');
                console.log(request);
            }
        }

        if(fittingModules.length === 0) {
            console.log('[WARNING] No module available to resolve the following request:');
            console.log(req);
            console.log(this.getSupportedRequests());
            return false;
        }

        let module = fittingModules[0];

        this._viewManager.prepareView(containerID, module.getKey(), req);
    }


    changeView(containerID,targetView) {
        this._viewManager.prepareView(containerID, targetView);
    }

    notifyLoadingDataStart(key,type) {
        this._viewManager.notifyLoadingDataStart(key,type);
    }

    notifyLoadingDataStop(key,success) {
        this._viewManager.notifyLoadingDataStop(key,success);
    }

    /*
     * this function is used when a module "speaks to itself"
     */
    sendSelfRequest(req, module,containerID) {
        return Promise.resolve(this._viewManager.prepareView(containerID, module.getKey(), req));
    }

    /*
     * This function registers the viewManager
     */
    registerViewManager(manager) {
        this._viewManager = manager;
        this._socketID = manager.getSocketID();
        this._setupSocket(this._socketID);
    }

    /**
     * This function sets up the connection to server
     * @todo fetch hardcoded URL from server config
     */
    _setupSocket(socketID) {
        var socket = io('http://localhost:2999/' + socketID);
        /*socket.on('connect', function(){
             //console.log('eohub is entering connection')
        });*/
    }

    /**
     * This function asks the viewManager for available view slots
     * it is used from other views to build up a context menu or similar
     */
    getAvailableViewPositions() {
        let positions = [];

        try {
            positions = this._viewManager.getAvailableViewPositions();
        } catch (e) {
            console.log('[ERROR]: ' + e);
        }

        return positions;
    }

    /*
     * this function collects supported requests from all active modules
     */
    getSupportedRequests() {
        let reqArray = [];

        function mergeDedupe(...arr) {
            return [ ...new Set([].concat(...arr)) ];
        }

        for (var eoModule of this._modules.values()) {
            reqArray = mergeDedupe(reqArray, eoModule.getSupportedRequests());
        }

        return reqArray;
    }

    /*old from here*/
    /*request(id) {
        return fetch('http://localhost:32756')
            .then(response => response.text())
            .then(text => {

                document.getElementById(id).innerHTML = '<div id="viewID_editor" class="editor"></div>';


                var editor = ace.edit('viewID_editor');
                window.editor = editor;
                editor.setValue(text);
                editor.setTheme("ace/theme/ambiance");
                editor.getSession().setMode('ace/mode/xml');
                editor.clearSelection();

            }
            )
    }

    getFunction() {
        return fetch('http://localhost:8080/exist/apps/exist-module/listall.json')
            .then(response => response.json())
            .then(json =>
                console.log(json)
            )
    }*/

};

export let eohub = new EoHub();
