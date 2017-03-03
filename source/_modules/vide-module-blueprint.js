import VIDE_PROTOCOL from './vide-protocol';
let Select = require('tether-select');

Math.uuidCompact = function() {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
        let r = Math.random()*16|0;
        let v = c === 'x' ? r : (r&0x3|0x8);
        return v.toString(16);
    });
};

/** Generic class for EoModules. */
const EoModule = class EoModule {

    /**
     * @constructs EoModules
     */
    constructor() {
        this._supportedPerspective = '';
        this._supportedRequests = [];
        this._key = '';
        this._active = true;
        this._eohub = null;
        this._socketID;
        this._server;
        this._socket;
        this._cache = new Map();
    }
    
    /**
     * This function returns the key of the current module
     * @abstract
     * @return {string} The key of the current module.
     */
    getKey() {
        return this._key;
    }
    
    /** 
     * This function registers the communication hub with this module.
     * @param {Object} eohub as instance of EoHub
     */
    registerHub(eohub) {
        this._eohub = eohub;
        this._server = eohub._server;
        this._socketID = eohub._socketID;
        
        this._socket = io(this._server + this._socketID);
    }
    
    /**
     * This function activates the current module and returns it.
     * @return {Object} returns current module
     */
    activate() {
        this._active = true;
        return this;
    }
    
    /**
     * This function deactivates the current module and returns it.
     * @return {Object} returns current module
     */
    deactivate() {
        this._active = false;
        return this;
    }
    
    /**
     * This function can be called to ask whether the current module is active.
     * @return {Boolean} Indicates if current module is available for handling requests.
     */
    isActive() {
        return this._active;
    }
    
    /** 
     * This vanilla function is used to request data from the server. It adds a unique key to 
     * the request object, which is then used to receive the corresponding server answer and
     * return it as a Promise. 
     * @param {Object} requestObject specified by individual module
     * @returns {Object} a Promise with the server answer
     */
    requestData(requestObject, cache = false) {
        
        return new Promise((resolve) => {
            
            let key = JSON.stringify(requestObject)
            let cached = this._cache.get(key);
            
            if(typeof cached === 'undefined') {
                let enhancedRequest = Object.assign({},requestObject);
                enhancedRequest.key = Math.uuidCompact();
                enhancedRequest.state = {};
                
                this._socket.once(enhancedRequest.key,(data) => {
                    this._cache.set(key,data);
                    resolve(data);
                });
                
                this._socket.emit('requestData', enhancedRequest);
                
            } else {
                resolve(cached);
            }
        
            
            
        });
        
    }
    
    /**
     * This is a prototype function that handles incoming requests.
     * @param {Object} request to be checked
     * @return {Boolean} if request can be handled or not.
     */
    checkRequest(request) {
        if(!this._active) {
            return false;
        }
        
        if(request.getPerspective() !== this._supportedPerspective) {
            return false;
        }
        
        let query = request.getQueryPrototype();
        let isSupported = false;
        
        for (let req of this._supportedRequests) {
            let reqTest;
            
            if(req.contexts.length > 0 && typeof req.contexts[0] === 'object') {
                let contextsPlain = [];
                for(let i = 0; i < req.contexts.length; i++) {
                    contextsPlain.push(req.contexts[i].type);
                }
                reqTest = Object.assign(req, {contexts:contextsPlain});
            } else {
                reqTest = req;
            }
            
            
            if(JSON.stringify(reqTest) === JSON.stringify(query)) {
                isSupported = true;
                break;
            }
        }
        
        if(!isSupported) {
            return false;
        }
        
        if(typeof this._eohub === 'undefined') {
            console.log('[ERROR] Module ' + this._key + ' not properly registered in eohub. Disregarding request.');
            return false;
        }
            
        return true;
    }
    
    /** 
     * If module is active, provides an array of supported request types
     * @return {Object[]} supported requests
     */
    getSupportedRequests() {
        if(!this._active) {
            return [];
        }
        
        return this._supportedRequests;
    }
    
    /** 
     * This function is used to 
     * @param {string} parentID of parent element where <select> will be inserted
     * @param {string} containerID ID of the whole view
     */
    _setupViewSelect(parentID, containerID) {
        let sel = document.createElement('select');
        sel.classList.add('viewSelect');
        
        let modules = this._eohub.getActiveModules();
        
        let i=0;
        
        for(i;i<modules.length;i++) {
            let opt = document.createElement('option');
            let key = modules[i];
            opt.value = key;
            opt.setAttribute('data-i18n-text',key)
            opt.innerHTML = this._eohub.getI18nString(key);
            sel.appendChild(opt);
        }
        
        document.getElementById(parentID).appendChild(sel);
        
        let selectInstance = new Select({
            el: sel,
            className: 'select-theme-chosen'
        });
        
        selectInstance.change(this._key);
        selectInstance.on('change',(e) => {
            console.log('----------------X11')
            console.log('vide-module-blueprint.js: _setupViewSelect')
            console.log(e);
        });
    }
    
    
    /**
     * This function is used to remove all listeners and content when closing a view.
     * It is expected to be overridden by each module.
     * @abstract
     * @param {string} containerID as reference to a specific view.
     */
    unmount(containerID) {
        //filled by inheriting module class
        
    }
    
    /**
     * This function gets the default view for the current module.
     * It is expected to be overwritten by an inheriting module.
     * @abstract
     * @param {string} containerID as ID of HTML element where content shall be placed
     */
    getDefaultView(containerID) {
         //filled by inheriting module class
    }
    
    /**
     * This function handles a specific request for the current module.
     * It is expected to be overwritten by an inheriting module.
     * @abstract
     * @param {Object} request that shall be handled.
     */
    handleRequest(vontainerID,request) {
        //filled by inheriting module class
        
    }
    
    _confirmView(state, containerID) {
        this._eohub.confirmView(state, containerID, this._key);
    }
    
};

export { EoModule };