import 'babel-polyfill';
import VIDE_PROTOCOL from './vide-protocol';
import {EoModule, Request} from './vide-module-blueprint';

const VideXmlViewer = class VideXMLviewer extends EoModule {

    /*Constructor method*/
    constructor() {
        super();
        this._supportedPerspective = EO_Protocol.Perspective.PERSPECTIVE_XML;
        this._supportedRequests = [];
        let _this = this;
        this._aceStore = new Map();
        
        Object.keys(EO_Protocol.Object).forEach(function(object, i) {
            _this._supportedRequests.push({objectType: object, contexts:[], perspective: _this._supportedPerspective, operation: EO_Protocol.Operation.OPERATION_VIEW});
        });
        
        this._key = 'videXMLviewer';
        this._serverConfig = {host: 'http://localhost', port: ':32756', basepath:'/'};
        return this;
    }
    
    unmount(containerID) {
        //console.log('[DEBUG] Unmounting ' + this._key + ' at ' + containerID)
        
        let editor = window.aceStore[_this._eohub.getEdition()].editor;
        if(typeof editor !== 'undefined') {
            editor.destroy();
            editor = null;
        }
            
    
        document.getElementById(containerID).innerHTML = '';
    }
    
    _setupHtml(containerID) {
        //console.log('_setupHtml with ' + containerID)
        let key = containerID + '_editor';
        document.getElementById(containerID).innerHTML = '<div id="' + key + '" class="editor"></div>';
        let editor = ace.edit(key);
        editor.setTheme('ace/theme/ambiance');
        editor.getSession().setMode('ace/mode/xml');
        editor.clearSelection();
        
        let aceStore = this._aceStore.get(this._eohub.getEdition());
        if(typeof aceStore === 'undefined') {
            this._aceStore.set(this._eohub.getEdition(), {editor: editor, containerID: containerID});
        } else {
            aceStore.editor = editor;
            aceStore.containerID = containerID;
        }
        
        return editor;
    }
    
    getDefaultView(containerID) {
        let responseType = 'text';
        let url = this._getBaseURI() + 'file/' + this._eohub.getEdition() + '.xml';
        
        //
        //if(typeof window.aceStore === 'undefined' || typeof window.aceStore[this._eohub.getEdition()] === 'undefined')
        
        let dataRequest = new DataRequest(responseType, url);
        
        this._eohub.requestData(dataRequest).then(
            (xml) => {
                containerID = containerID.replace(/videXMLviewer/, 'VIEWTYPE_XMLVIEW');
            
                let editor = this._setupHtml(containerID);
                
                //let key = containerID + '_editor';
                //let editor = ace.edit(key);
                
                //if(typeof window.aceStore === 'undefined')
                //    window.aceStore = {};
                
                this._aceStore.get(this._eohub.getEdition()).xml = xml; 
                
                editor.setValue(xml);
                editor.clearSelection();
                return Promise.resolve(this._setClickHandler(editor, containerID));
            });
    }
    
    _setClickHandler(editor, containerID) {
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
                            
                            if(request.perspective === EO_Protocol.Perspective.PERSPECTIVE_TRANSCRIPTION) {
                                let states = elem.states.filter(function(state){
                                    return state.type !== 'del';
                                });
                                
                                states.forEach(function(state, k) {
                                    let reqCopy = Object.assign({}, req);
                                    reqCopy.contexts.length = 0;
                                    reqCopy.contexts.push({type: EO_Protocol.Context.CONTEXT_STATE, id: state.id});
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
    }
    
    handleRequest(request) {
        let fullContainer = (request.getContainer() + '_' + this._key).replace(/videXMLviewer/, 'VIEWTYPE_XMLVIEW');
        
        let edition = this._eohub.getEdition();
        let targetObject = request.getObjectID();
        
        let htmlElem = document.getElementById(fullContainer + '_editor');
        
        if(!this._aceStore.has(edition)) {
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
        }
    }
    
    _findString(editor, string) {
        editor.resize(true);
        editor.find(string, {}, true);
        
        return Promise.resolve(editor);
    }
    
};

export default VideXmlViewer;
