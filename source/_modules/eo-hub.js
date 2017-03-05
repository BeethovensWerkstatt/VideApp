import 'babel-polyfill';
import { connect } from 'react-redux';
import fetch from 'isomorphic-fetch';
import {Request, DataRequest} from './vide-module-blueprint';

//imported in HTML -> globally available
/*import io from 'socket.io';*/

let server = 'http://localhost:2999/';

Math.uuidCompact = function() {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
        let r = Math.random()*16|0;
        let v = c === 'x' ? r : (r&0x3|0x8);
        return v.toString(16);
    });
};

const EoHub = class EoHub {

    /** 
     * Constructor of an EoHub instance
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
        
        console.log('EoHub initialized');
    }
    
    setLanguage(lang) {
        this._viewManager.setLanguage(lang);
    }
    
    getI18nString(key) {
        return this._viewManager.getI18nString(key);
    }
    
    confirmView(state, containerID, moduleKey) {
        this._viewManager.confirmView(state, containerID, moduleKey);
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
        
        let supportedViews = this._viewManager.getSupportedViews(id);
        
        let _this = this;
        for(let i=0; i<supportedViews.length; i++) {
            let viewKey = supportedViews[i].id;
            //console.log('[eohub] activating module ' + viewKey + ' for edition ' + id)
            _this.activateModule(viewKey);
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
    activateModule(moduleKey) {
        try {
            this._modules.get(moduleKey).activate();    
        } catch(err) {
            console.log('[WARNING] Unable to activate module ' +moduleKey + ': ' + err);
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
        
        this.getModule(moduleKey).getDefaultView(containerID);
        
        /*try {
            this._modules.get(moduleKey).getDefaultView(containerID);
        }
        catch (e) {
            if(typeof this._modules.get(moduleKey) === 'undefined')
                console.log('[ERROR]: No module with key "' + moduleKey + '" registered in app.js');
            else
                console.log('[ERROR]: ' + e);
        }*/
    }
    
    /**
     * public function broadcastRequest
     * this function is called from within a client module to notify other modules
     * each module will then check if it's qualified to answer that request
     * @param {Object} req is sent to all modules
     * @returns {boolean} if there is no adequate module
     */
    broadcastRequest(req) {
        let request;
        
        if(req instanceof Request) {
            request = req;
        } else {
            request = new Request(req.containerID, req.editionID, req.query);
        }
        
        let fittingModules = [];
        
        for (var eoModule of this._modules.values()) {
            try {
                let fits = eoModule.checkRequest(request);
                if(fits !== false) {
                    fittingModules.push(fits);
                }
            } catch(err) {
                console.log('[ERROR] Problems when checking for modules matching the following request (' + err + '):');
                console.log(request);
            }    
        }
        
        if(fittingModules.length === 0) {
            console.log('[WARNING] No module available to resolve the following request:');
            console.log(request);
            console.log(this.getSupportedRequests());
            console.log(request.getQueryPrototype());
            console.log('index: ' + this.getSupportedRequests().indexOf(request.getQueryPrototype()));
            return false;
        }
        
        let module = fittingModules[0];
        request.addModuleKey(module.getKey());
        
        this._viewManager.prepareView(request.getContainer(), module.getKey(), request);
    }
    
    
    changeView(containerID,targetView) {
        this._viewManager.prepareView(containerID, targetView);
    }
    
    /*
     * this function is used when a module "speaks to itself"
     */
    sendSelfRequest(req, module) {
        req.addModuleKey(module.getKey());
        let underscorePos = req.getContainer().indexOf('_');
        let target = underscorePos !== -1 ? req.getContainer().slice(0, underscorePos) : req.getContainer();
        return Promise.resolve(this._viewManager.prepareView(target, module.getKey(), req));
    }
    
    /*
     * public function requestData
     * this function is called from individual modules and takes care
     * of the network communication. 
     * If required, add socket.io support in here
     */
    requestData(dataRequest, containerID) {
        //console.log('[INFO] requesting data')
        if(dataRequest.responseType === 'json') {
            return fetch(dataRequest.url)
                .then(response => response.json())
                .catch(error => console.log('[ERROR] Network error: ' + error))
                .then(text => {
                    return Promise.resolve((typeof text === 'string') ? JSON.parse(text) : text);  
                });
        } else if(dataRequest.responseType === 'text') {
            return fetch(dataRequest.url)
                .then(response => response.text())
                .catch(error => console.log('[ERROR] Network error: ' + error));
                //.then(text => dataRequest.callback(dataRequest,text,containerID))
        }
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
     */
    _setupSocket(socketID) {
        var socket = io('http://localhost:2999/' + socketID);
        socket.on('connect', function(){
             //console.log('eohub is entering connection')
        });
    }
    
    /*
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
