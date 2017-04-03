import 'babel-polyfill';
import VIDE_PROTOCOL from './vide-protocol';
import {EoModule, Request} from './vide-module-blueprint';

const VideXmlViewer = class VideXMLviewer extends EoModule {

    /*Constructor method*/
    constructor() {
        super();
        this._supportedPerspective = VIDE_PROTOCOL.PERSPECTIVE.XML;
        let _this = this;
        this._aceStore = new Map();
        
        Object.values(VIDE_PROTOCOL.OBJECT).forEach((object, i) => {
            this._supportedRequests.push({object: object, contexts:[], perspective: this._supportedPerspective, operation: VIDE_PROTOCOL.OPERATION.VIEW});
        });
        
        this._key = 'VideXmlViewer';
        return this;
    }
    
    unmount(containerID) {
        //console.log('[DEBUG] Unmounting ' + this._key + ' at ' + containerID)
        let key = containerID + '_' + this._eohub.getEdition();
        
        let editor = this._aceStore.get(key);
        if(typeof editor !== 'undefined') {
            editor.destroy();
            editor = null;
        }
        
        this._aceStore.delete(key)
        
        document.getElementById(containerID).innerHTML = '';
    }
    
    _getEditor(containerID) {
        
        let key = containerID + '_' + this._eohub.getEdition();
        
        let editor = this._aceStore.get(key);
        if(typeof editor === 'undefined') {
            editor = this._setupHtml(containerID); 
            this._aceStore.set(key, editor);
        }
        return Promise.resolve(editor);        
        
    }
    
    _setupHtml(containerID) {
        
        
        //create html for menu
        let menuID = containerID + '_menu';
        let menuElem = document.createElement('div');
        menuElem.id = menuID;
        menuElem.classList.add('xmlMenu');
        document.getElementById(containerID).appendChild(menuElem);
        
        this._setupViewSelect(containerID + '_menu', containerID);
        
        //create html for editor
        let key = containerID + '_editor';
        let editorElem = document.createElement('div');
        editorElem.id = key;
        editorElem.classList.add('editor');
        document.getElementById(containerID).appendChild(editorElem);
        
        //ace setup
        let editor = ace.edit(key);
        editor.setTheme('ace/theme/chrome');
        editor.getSession().setMode('ace/mode/xml');
        editor.clearSelection();
        editor.setReadOnly(true);
        
        /*editor.getSession().on('changeScrollTop',() => {
            let state = this._getCurrentState(editor);
            this._confirmView(state,containerID)
        })*/
        
        return editor;
    }
    
    getDefaultView(containerID) {
        
        let editionID = this._eohub.getEdition();
        
        let req = {
            id: editionID,
            object: VIDE_PROTOCOL.OBJECT.EDITION, 
            contexts:[], 
            perspective: this._supportedPerspective,
            operation: VIDE_PROTOCOL.OPERATION.VIEW
        };
        
        this.handleRequest(req, containerID);        
    }
    
    _getCurrentState(containerID,editor) {
    
        let lastReq = this._getLastRequest(containerID);
    
        let line = editor.renderer.getFirstFullyVisibleRow();
        let selection = editor.getSelection();
        let search = editor.getLastSearchOptions();
        
        let state = Object.assign({}, lastReq,{state: {line:line}});
        
        return state;
    }
    
    /*_setClickHandler(editor, containerID) {
        editor.on('click', (event) => {
            var position = event.getDocumentPosition();
            var token = editor.session.getTokenAt(position.row, position.column);
            console.log(token);
            
            let shapeIDs = [];
            
            if(token.type === 'entity.other.attribute-name.xml' && token.value === 'facs') {
                console.log('clicked on facs attribute');
                let tokens = editor.session.getTokens(position.row);
                let index = token.index;
                if(tokens.length > index + 1) {
                    shapeIDs.push(tokens[index + 2].value.replace(/["#]+/g, ''));
                }
            }
            
            if(shapeIDs.length === 0) {
                return false;
            }
            
            //set up context menu
            let supportedRequests = this._eohub.getSupportedRequests();
        
            let responseType = 'json';
            let url = this._getBaseURI() + 'edition/' + this._eohub.getEdition() + '/shape/' + shapeIDs[0] + '/info.json';
            let _this = this;
            
            let dataRequest = new DataRequest(responseType, url);
            this._eohub.requestData(dataRequest)
                .then(
                    (json) => {
                        //console.log('[DEBUG]: There are ' + json.length + ' elems associated with this shape.')
                
                        let elem = json[0];
                        
                        console.log(json);
                        
                        let requests = [];
                        let filteredRequests = supportedRequests.filter(function(request){
                            return (request.objectType === elem.type && request.perspective !== _this._supportedPerspective);
                        }); 
                        
                        filteredRequests.forEach(function(request, j) {
                            let req = Object.assign({}, request);
                            req.objectID = elem.id;
                            
                            if(request.perspective === VIDE_PROTOCOL.PERSPECTIVE.TRANSCRIPTION) {
                                let states = elem.states.filter(function(state){
                                    return state.type !== 'del';
                                });
                                
                                states.forEach(function(state, k) {
                                    let reqCopy = Object.assign({}, req);
                                    reqCopy.contexts.length = 0;
                                    reqCopy.contexts.push({type: VIDE_PROTOCOL.CONTEXT.STATE, id: state.id});
                                    requests.push(reqCopy);
                                });
                            } else {
                                requests.push(req);
                            }
                        });
                        
                        try {
                            _this._eohub._viewManager.setContextMenu(requests, event, containerID, null);    
                        } catch(err) {
                            console.log('[ERROR] Unable to open context menu: ' + err);
                        }
                    }
                );
        });
            
            
            
            //return Promise.resolve(editor);
    }*/
    
    handleRequest(request,containerID) {
        
        console.log('[VideXmlViewer] received request')
        console.log(request)
        console.log(containerID)
        
        this._saveRequest(containerID,request);
        
        let req = {
            id: this._eohub.getEdition(),
            type: 'getXmlFile'
        }
        
        this._getEditor(containerID).then((editor) => {
        
            this.requestData(req, true).then((xml) => {
                
                editor.session.setValue(xml)
                //editor.setValue(xml);
                editor.clearSelection();
                
                if(request.object !== VIDE_PROTOCOL.OBJECT.EDITION) {
                    this._findString(editor, 'id="' + request.id + '"');
                }
                
                let state = this._getCurrentState(containerID,editor);
                this._confirmView(state,containerID);
            })
        })
           
                
        //return Promise.resolve(this._setClickHandler(editor, containerID));
         
        //todo: prüfen
        /*if(!this._aceStore.has(edition)) {
            this.getDefaultView(fullContainer).then(
                (editor) => {
                    return Promise.resolve(this._findString(editor, 'id="' + targetObject + '"'));
                }
            );
        } else if(htmlElem === null) {
            //console.log('[DEBUG] need to set up HTML first');
            let editor = this._setupHtml(fullContainer);
            editor.setValue(this._aceStore.get(edition).xml);
            editor.clearSelection();
            
            return Promise.resolve(this._findString(editor, 'id="' + targetObject + '"').then(this._setClickHandler(editor, fullContainer)));
        } else {
            return Promise.resolve(this._findString(this._aceStore.get(edition).editor, 'id="' + targetObject + '"'));
        }*/
    }
    
    _findString(editor, string) {
        editor.resize(true);
        editor.find(string, {}, true);
        
        return Promise.resolve(editor);
    }
    
};

export default VideXmlViewer;
