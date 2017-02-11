import VIDE_PROTOCOL from './vide-protocol';

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
    handleRequest(request) {
         //filled by inheriting module class
    }
    
};

/**
 * A Request is an object passed inside the EO environment
 */
const Request = class Request {
    
    /**
     * @constructs a Request
     * @param {string} containerID the ID of the HTML element where the result of the request shall be placed
     * @param {string} editionID the ID of the edition which contains the requested object
     * @param {Object} query is the core of the request, including info about the type and ID of the requested object, and potential contexts which have to be considered.
     */
    constructor(containerID = '', editionID = '', query = {objectType:'', objectID:'', contexts:[], perspective:'', operation: ''}) {
        if(containerID === '') {
            console.log('[ERROR] missing container ID for Request. Must be the ID of an HTML element where the results shall be shown.');
            return false;
        }
        
        if(editionID === '') {
            console.log('[ERROR] missing edition ID for Request. Requests require an ID for the edition where to look up the query.');
            return false;
        }
        
        if(query.objectID === '') {
            console.log('[ERROR] missing ID for Request object. Requests require an query.objectID parameter.');
            return false;
        }
        
        /*if(VIDE_PROTOCOL.PERSPECTIVE.keys().indexOf(query.perspective) === -1) {
            console.log('[ERROR]: perspective "' + perspective + '" is not allowed in VIDE_PROTOCOL.');
            return false;
        }
        
        if(VIDE_PROTOCOL.OBJECT.keys().indexOf(query.objectType) === -1) {
            console.log('[ERROR]: object "' + query.objectType + '" is not allowed in VIDE_PROTOCOL.');
            return false;
        }
        
        for (let context of query.contexts) {
            if(VIDE_PROTOCOL.CONTEXT.keys().indexOf(context) === -1) {
                console.log('[ERROR]: context "' + context + '" is not allowed in VIDE_PROTOCOL.');
                return false;
            }
        }
        
        if(VIDE_PROTOCOL.OPERATION.keys().indexOf(query.operation) === -1) {
            console.log('[ERROR]: operation "' + query.operation + '" is not allowed in VIDE_PROTOCOL.');
            return false;
        }*/
        
        this._perspective = query.perspective;
        this._query = query;
        this._containerID = containerID;
        this._editionID = editionID;
    }
    
    /**
     * This function returns a reduced version of the query which doesn't contain any IDs anymore, but only the types. This is used to decide whether a module supports this type of query or not. 
     * @returns {Object} A stripped down version of this request.
     */
    getQueryPrototype() {
        let contexts = [];
        this._query.contexts.forEach(function(context, i) {
            contexts.push(context.type); 
        });
        
        return {
            objectType: this._query.objectType,
            contexts: contexts,
            perspective: this._query.perspective,
            operation: this._query.operation
        };
    }
    
    /** 
     * This function returns the perspective required by the current request.
     * @returns {string} the perspective that is requested 
     */
    getPerspective() {
        return this._perspective;
    }
    
    /** 
     * This functions returns the HTML ID where the results of this request shall be placed.
     * @returns {string} the ID of an HTML element where the results shall be placed.
     */
    getContainerID() {
        return this._containerID;
    }
    
    /** 
     * This function sets the ID where the results of the requests shall be placed.
     * @param {string} containerID The ID of the HTML element where the results of this request shall be placed.
     * @returns {Object} Returns the request itself.
     */
    setContainerID(containerID) {
        this._containerID = containerID;
        return this;
    }
    
    /** 
     * This functions returns the ID of the requested object.
     * @returns {string} the ID of the requested object.
     */
    getObjectID() {
        return this._query.objectID;
    }
    
    /** 
     * This functions returns the edition, out of which an object is requested.
     * @returns {string} the ID of the edition.
     */
    getEditionID() {
        return this._editionID;
    }
    
    /** 
     * This functions returns the type of the requested object.
     * @returns {string} the type of the requested object.
     */
    getObjectType() {
        return this._query.objectType;
    }
    
    /** 
     * This functions returns an array of IDs of all context elements for a specific type of context for the current request
     * @param {string} type of context, according to VIDE_PROTOCOL
     * @returns {string[]} an array of context IDs
     */
    getContextsByType(type) {
        let contexts = this._query.contexts.filter(function(context) {
            return context.type === type;
        });
        
        let ids = [];
        contexts.forEach(function(context, i) {
            ids.push(context.id);
        });
        
        return ids;
    }
    
    /** 
     * Saves the key of the module that is supposed to handle the current request
     * @param {string} moduleKey which identifies the module 
     * @returns {object} the module
     */
    setModuleKey(moduleKey) {
        this._module = moduleKey;
        return this;
    }
    
    /** 
     * It returns the key of the module which is supposed to handle the current request.
     * @returns {string} the key of the module
     */
    getModuleKey() {
        return this._module;
    }
    
};

/**
 * A DataRequest is a request for EoHub to retrieve data from a given server 
 */
/*const DataRequest = class DataRequest {
    
    constructor(responseType = 'json', url, callback) {
        if(!(responseType === 'json' || responseType === 'text')) {
            console.log('[ERROR] Parameter "responseType" on DataRequest is incorrect. Allowed values are "json" and "text", value is ' + responseType);
            return false;
        }
            
        
        if(typeof url !== 'string' || url === ''){
            console.log('[ERROR] Parameter "url" on DataRequest is incorrect. Must be a string of positive length. url provided is ' + url);
            return false;
        }
            
        if(!(typeof callback === 'undefined' || typeof callback === 'function')){
            console.log('[ERROR] Parameter callback on DataRequest is incorrect. Must be a function, is ' + typeof callback);
            return false;
        }
    
        this.responseType = responseType;
        this.url = url;
        this.callback = callback;
        this.payload = new Map();
    }
    
    addPayload(key, payload) {
        this.payload.set(key, payload);
        return this;
    }
    
    getPayload(key) {
        return this.payload.get(key);
    }

};*/

export { EoModule, Request };