import 'babel-polyfill';
import VIDE_PROTOCOL from './vide-protocol';
import {EoModule, Request} from './vide-module-blueprint';



const VideFacsimileViewer = class VideFacsimileViewer extends EoModule {

    /*Constructor method*/
    constructor() {
        super();
        this._supportedPerspective = EO_Protocol.Perspective.PERSPECTIVE_FACSIMILE;
        this._supportedRequests = [];
        let _this = this;
        this._viewerStore = new Map();
        this._stateStore = new Map();
        this._pageJsonStore = new Map();
        this._svgStore = new Map();
        
        let stateReq = {objectType: EO_Protocol.Object.OBJECT_STATE, 
            contexts:[], 
            perspective: _this._supportedPerspective, 
            operation: EO_Protocol.Operation.OPERATION_VIEW};
        let notationReq = {objectType: EO_Protocol.Object.OBJECT_NOTATION, 
            contexts:[], 
            perspective: _this._supportedPerspective, 
            operation: EO_Protocol.Operation.OPERATION_VIEW};
        let lyricReq = {objectType: EO_Protocol.Object.OBJECT_LYRICS, 
            contexts:[], 
            perspective: _this._supportedPerspective, 
            operation: EO_Protocol.Operation.OPERATION_VIEW};
        let metaReq = {objectType: EO_Protocol.Object.OBJECT_METAMARK, 
            contexts:[], 
            perspective: _this._supportedPerspective, 
            operation: EO_Protocol.Operation.OPERATION_VIEW};
        let dirReq = {objectType: EO_Protocol.Object.OBJECT_DIR, 
            contexts:[], 
            perspective: _this._supportedPerspective, 
            operation: EO_Protocol.Operation.OPERATION_VIEW};
        let delReq = {objectType: EO_Protocol.Object.OBJECT_DEL, 
            contexts:[], 
            perspective: _this._supportedPerspective, 
            operation: EO_Protocol.Operation.OPERATION_VIEW};
        _this._supportedRequests.push(stateReq);
        _this._supportedRequests.push(notationReq);
        _this._supportedRequests.push(lyricReq);
        _this._supportedRequests.push(metaReq);
        _this._supportedRequests.push(dirReq);
        _this._supportedRequests.push(delReq);
        
        this._key = 'videFacsimileViewer';
        this._serverConfig = {host: 'http://localhost', port: ':34466', basepath:'/'};
        
        return this;
    }
    
    unmount(containerID) {
        let viewer = this._viewerStore.get(containerID);
        viewer.destroy();
        this._viewerStore.delete(containerID);
        document.getElementById(containerID).innerHTML = '';
    }
    
    _getPageData(editionID) {
        if(this._pageJsonStore.has(editionID)) {
            return Promise.resolve(this._pageJsonStore.get(editionID));
        } else {
            let responseType = 'json';
            let url = this._getBaseURI() + 'edition/' + editionID + '/pages.json';
            
            let dataRequest = new DataRequest(responseType, url);
            return this._eohub.requestData(dataRequest).then(
                (json) => {
                    let pageJson = (typeof json === 'object') ? json : JSON.parse(json);
                    this._pageJsonStore.set(editionID, pageJson);
                    
                    let promises = [];
                    
                    for(let i=0; i<pageJson.sources.length; i++) {
                        let source = pageJson.sources[i];
                        
                        for(let j=0; j<source.pages.length; j++) {
                            let page = source.pages[j];
                                
                            if(page.shapes !== '') {
                                let self = this;
                                
                                let svgPromise = new Promise(function(resolve, reject) {
                                    let svgResponseType = 'text';
                                    let svgUrl = self._getBaseURI() + 'file/' + page.shapes + '.svg';
                                    
                                    let svgRequest = new DataRequest(svgResponseType, svgUrl);
                                    resolve(
                                        self._eohub.requestData(svgRequest).then(
                                            (svg) => {
                                                self._svgStore.set(page.id, svg);
                                                return Promise.resolve(page.id);
                                            }
                                        )
                                    );
                                });
                            
                                promises.push(svgPromise);
                            }
                        }
                    }
                    
                    return Promise.all(promises).then((results) => {return Promise.resolve(pageJson);});
                }
            );
        }
    }
    
    _setupHtml(containerID) {
        let container = document.getElementById(containerID);
        
        container.innerHTML = '';
        
        let facs = document.createElement('div');
        facs.id = containerID + '_facsimile';
        facs.className = 'facsimile';
        
        let sidebar = document.createElement('div');
        sidebar.id = containerID + '_facsimile';
        sidebar.className = 'facsimileSidebar';
        
        let navigator = document.createElement('div');
        navigator.id = containerID + '_facsimileNavigator';
        navigator.className = 'navigatorBox';
        
        let menubar = document.createElement('div');
        menubar.id = containerID + '_menubar';
        menubar.className = 'menubar';
        
        menubar.innerHTML = '<div id="' + containerID + '_zoomIn" class="menuButton"><i class="fa fa-plus"></i></div>' +
            '<div id="' + containerID + '_zoomOut" class="menuButton"><i class="fa fa-minus"></i></div>' + 
            '<div id="' + containerID + '_zoomHome" class="menuButton"><i class="fa fa-arrows-alt"></i></div>' + 
            '<div id="' + containerID + '_rotateLeft" class="menuButton"><i class="fa fa-rotate-left"></i></div>' + 
            '<div id="' + containerID + '_rotateRight" class="menuButton"><i class="fa fa-rotate-right"></i></div>';
        
        
        let statenav = document.createElement('div');
        statenav.id = containerID + '_stateNavigation';
        statenav.className = 'stateNavigation';
        
        let scarSelect = document.createElement('select');
        scarSelect.id = containerID + '_scarSelect';
        scarSelect.className = 'scarSelect';
        
        let scarBox = document.createElement('div');
        scarBox.id = containerID + '_scarBox';
        scarBox.className = 'scarBox';
        
        statenav.appendChild(scarSelect);
        statenav.appendChild(scarBox);
        
        sidebar.appendChild(navigator);
        sidebar.appendChild(menubar);
        sidebar.appendChild(statenav);
        
        container.appendChild(facs);
        container.appendChild(sidebar);
    }
    
    _setupViewer(containerID, json) {
        let self = this;
        
        return new Promise(function(resolve, reject) {
            let pageURIs = [];
            for(let i=0; i<json.sources.length; i++) {
                let source = json.sources[i];
                for(let j=0; j<source.pages.length; j++) {
                    let page = source.pages[j];
                    let uri = page.uri + '/info.json';
                    pageURIs.push(uri);
                }
            }
            
            let viewer = OpenSeadragon({
                id: containerID + '_facsimile',
                tileSources: pageURIs,
                sequenceMode: false,
                showReferenceStrip: true,
                showRotationControl: true,
                showNavigator: true,
                navigatorRotate: false,
                navigatorId: containerID + '_facsimileNavigator',
                showFullPageControl: false,
                zoomInButton: containerID + '_zoomIn',
                zoomOutButton: containerID + '_zoomOut',
                homeButton: containerID + '_zoomHome',
                rotateLeftButton: containerID + '_rotateLeft',
                rotateRightButton: containerID + '_rotateRight',
                //toolbar: containerID + '_menubar',
                pixelsPerWheelLine: 60,
                // Enable touch rotation on tactile devices
                gestureSettingsTouch: {
                    pinchRotate: true
                },
                gestureSettingsMouse: {
                    clickToZoom: false,
                    dblClickToZoom: true
                },
                collectionMode: true,
                collectionRows: 1, 
                collectionTileSize: 1200,
                collectionTileMargin: 0
            });
            
            self._viewerStore.set(containerID, viewer);
            
            //do internal setup after images are loaded
            viewer.addHandler('open', (event) => {
                for(let i=0; i<json.sources.length; i++) {
                    let source = json.sources[i];
                    for(let j=0; j<source.pages.length; j++) {
                        let page = source.pages[j];
                        let pageLabel = document.createElement('div');
                        pageLabel.id = containerID + '_pageLabel_' + page.id;
                        pageLabel.className = 'pageLabel';
                        pageLabel.innerHTML = page.label;
                        
                        let bounds = viewer.world.getItemAt(j).getBounds();
                        
                        //create page label
                        viewer.addOverlay({
                            element: pageLabel,
                            //location: new OpenSeadragon.Rect(0.33, 0.75, 1.2, 1.25)
                            y: bounds.y + bounds.height,
                            x: bounds.x + (bounds.width / 2),
                            placement: 'TOP'
                        });
                        
                        //if possible, load svg overlays
                        if(page.shapes !== '') {
                            if(self._svgStore.has(page.id)) {
                                let svgBox = document.createElement('div');
                                svgBox.className = 'svgBox';
                                svgBox.innerHTML = self._svgStore.get(page.id);
                                viewer.addOverlay({
                                    element: svgBox,
                                    y: bounds.y,
                                    x: bounds.x,
                                    width: bounds.width,
                                    height: bounds.height,
                                    placement: 'TOP_LEFT'
                                });
                                
                                
                                let onClick = (e) => {
                                    let shape = e.target;
                                    
                                    self._clickShape(containerID, viewer, shape, e);
                                    
                                    e.preventDefault(); 
                                };
                                let paths = svgBox.querySelectorAll('path');
                                
                                for(let x=0; x < paths.length; x++) {
                                    let path = paths[x];
                                    path.addEventListener('click', onClick, false);
                                }
                            } else {
                                console.log('[ERROR] failed to load things in correct order – svg shapes not available for ' + page.id + ' (yet)');
                                /*let svgResponseType = 'text';
                                let svgUrl = facsViewer._getBaseURI() + 'file/' + page.shapes + '.svg';
                                let svgCallback = function(origSvgRequest,svg) {
                                    
                                    facsViewer._svgStore.set(page.id,svg)
                                    
                                    let svgBox = document.createElement('div');
                                    svgBox.className = 'svgBox'
                                    svgBox.innerHTML = svg;
                                    viewer.addOverlay({
                                        element: svgBox,
                                        y: bounds.y,
                                        x: bounds.x,
                                        width: bounds.width,
                                        height: bounds.height,
                                        placement: 'TOP_LEFT'
                                    });
                                    
                                    
                                    let onClick = function(event) {
                                        let shape = event.target;
                                        
                                        facsViewer._clickShape(containerID, viewer, shape, event);
                                        
                                        event.preventDefault(); 
                                    }
                                    let paths = svgBox.querySelectorAll('path');
                                    
                                    for(let x=0;x < paths.length;x++) {
                                        let path = paths[x];
                                        path.addEventListener('click',onClick,false);
                                    }
                                };
                                
                                let svgRequest = new DataRequest(svgResponseType,svgUrl,svgCallback);
                                facsViewer._eohub.requestData(svgRequest);*/
                            }
                        } else {
                            console.log('no shapes to retrieve for page ' + page.label);
                        }
                    }
                }
                
                resolve(viewer);
            });
        
        //return viewer;
        });
    }
    
    _focusShape(containerID, viewer, shape) {
        let rect = this._getShapeRect(containerID, viewer, shape);
        console.log('[DEBUG] clicked on shape ' + shape.id);
        
        if(rect !== null) {
            viewer.viewport.fitBoundsWithConstraints(rect);
        }
    }
    
    _clickShape(containerID, viewer, shape, event) {
        let supportedRequests = window.EoHub.getSupportedRequests();
        
        let responseType = 'json';
        let url = this._getBaseURI() + 'edition/' + this._eohub.getEdition() + '/shape/' + shape.id + '/info.json';
        let _this = this;
        
        let dataRequest = new DataRequest(responseType, url);
        this._eohub.requestData(dataRequest)
            .then(
                (json) => {
                    //console.log('[DEBUG]: There are ' + json.length + ' elems associated with this shape.')
            
                    let elem = json[0];
                    
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
                            
                            for(let k=0; k<states.length; k++) {
                                let reqCopy = {
                                    objectType: req.objectType, 
                                    objectID: req.objectID,
                                    operation: req.operation,
                                    perspective: req.perspective,
                                    contexts: [{id: states[k].id, type:EO_Protocol.Context.CONTEXT_STATE}]
                                };
                                
                                requests.push(reqCopy);
                            }
                        } else {
                            requests.push(req);
                        }
                    });
                    
                    let closeFunc = function() {
                        _this._focusShape(containerID, viewer, shape);
                    };
                    try {
                        _this._eohub._viewManager.setContextMenu(requests, event, containerID, closeFunc);    
                    } catch(err) {
                        console.log('[ERROR] Unable to open context menu: ' + err);
                    }
                }
            );
    }
    
    _setupStatesNav(containerID, json) {
        let selectBox = document.getElementById(containerID + '_scarSelect');
        
        //let json = (typeof jsonRaw === 'object') ? jsonRaw : JSON.parse(jsonRaw);
        
        for(let i in json) {
            let scar = json[i];
            let option = document.createElement('option');
            option.innerHTML = scar.label + ' [' + scar.states.length + ' states]';
            selectBox.appendChild(option);
        }
        
        let _this = this;
        
        let func = function(event) {
            let i = selectBox.selectedIndex;
            let scar = json[i];
            
            let rows = 0;
            let stateArray = [];
            
            for(let j in scar.states) {
                let state = scar.states[j];
                
                rows = (state.position > rows) ? state.position : rows;
                
                if(rows > stateArray.length) {
                    let newArray = [];
                    stateArray.push(newArray);
                }
                stateArray[rows - 1].push(state);    
            }
            
            //empty states from former scar
            let scarBox = document.getElementById(containerID + '_scarBox');
            scarBox.innerHTML = '';
            
            //add a single row for each simultaneous "step" 
            for(let n=0; n<rows; n++) {
                let rowBox = document.createElement('div');
                rowBox.classList.add('rowBox');
                
                //within each row, add corresponding states
                for(let m=0; m<stateArray[n].length; m++) {
                    let stateBox = document.createElement('div');
                    stateBox.classList.add('stateBox');
                    stateBox.setAttribute('data-stateid', stateArray[n][m].id);
                    stateBox.id = containerID + '_' + stateArray[n][m].id;
                    //todo: make this compatible with I18n
                    stateBox.innerHTML = 'Schreibschicht ' + stateArray[n][m].label;
                    rowBox.appendChild(stateBox);
                    
                    let stateSelect = function(event) {
                        let currentState = stateArray[n][m];
                        
                        //_this.highlightState(currentState,containerID,_this);
                        
                        let query = {
                            objectType: EO_Protocol.Object.OBJECT_STATE,
                            objectID: currentState.id,
                            contexts: [],
                            perspective: _this._supportedPerspective,
                            operation: EO_Protocol.Operation.OPERATION_VIEW
                        };
                        
                        let request = new Request(containerID, _this._eohub.getEdition(), query);
                        _this._eohub.sendSelfRequest(request, _this);
                    };
                    stateBox.addEventListener('click', stateSelect);
                }
                
                scarBox.appendChild(rowBox);
            }
        };
        
        selectBox.addEventListener('change', func);
        selectBox.selectedIndex = 0;
        func(null);
    }
    
    getDefaultView(containerID) {
        let editionID = this._eohub.getEdition();
        
        let responseType = 'json';
        let url = this._getBaseURI() + 'edition/' + editionID + '/pages.json';
        
        containerID = containerID.replace(/videFacsimileViewer/, 'VIEWTYPE_FACSIMILEVIEW');
        this._setupHtml(containerID);
        
        this._getPageData(editionID)
            .then(
                (pageJson) => {
                    this._setupViewer(containerID, pageJson);
                });
        
        if(this._stateStore.has(editionID)) {
            return Promise.resolve(this._setupStatesNav(containerID, this._stateStore.get(editionID)));    
        } else {
            let statesResponseType = 'json';
            let statesUrl = this._getBaseURI() + 'edition/' + editionID + '/states/overview.json';
            
            let stateRequest = new DataRequest(statesResponseType, statesUrl);
            this._eohub.requestData(stateRequest)
                .then(
                (json) => {
                    this._stateStore.set(editionID, json);
                    return Promise.resolve(this._setupStatesNav(containerID, json));
                });
        }
    }
    
    highlightState(state, containerID, facsViewer) {
        let currentState = document.querySelectorAll('#' + containerID + ' .stateBox.current');
        
        if(currentState.length > 0) {
            [...currentState][0].classList.remove('current');
            
            let oldShapes = document.querySelectorAll('#' + containerID + ' path.highlighted, #' + containerID + ' path.active');
            for (let shape of oldShapes) {
                shape.classList.remove('highlighted', 'active');
            }
            
            if([...currentState][0].getAttribute('data-stateid') === state.id) {
                return false;
            }
        }
        
        document.getElementById(containerID + '_' + state.id).classList.add('current');
        
        let viewer = facsViewer._viewerStore.get(containerID);
        
        if(state.shapes.length === 0) {
            return false;
        }
        
        try {
            let baseRect = facsViewer._getShapeRect(containerID, viewer, document.querySelector('#' + containerID + ' #' + state.shapes[0]));
            
            for(let i=0; i<state.shapes.length; i++) {
                let shape = document.querySelector('#' + containerID + ' #' + state.shapes[i]);
                try {
                    shape.classList.toggle('highlighted');
                    let rect = facsViewer._getShapeRect(containerID, viewer, shape);
                    baseRect = baseRect.union(rect);  
                } catch(error) {
                    console.log('[ERROR] invalid shape ' + state.shapes[i] + ' in state ' + state.label + ': ' + error);
                }
            }
            viewer.viewport.fitBoundsWithConstraints(baseRect);
        } catch(err) {
            console.log('[ERROR] Unable to highlight state ' + state.id + ' in facsimile: ' + err);
        }
    }
    
    highlightItem(containerID, shapesArray) {
        let oldHighlights = document.querySelectorAll('#' + containerID + ' path.active, #' + +containerID + ' path.highlighted');
        for (let shape of oldHighlights) {
            shape.classList.remove('active', 'highlighted');
        }
        
        if(shapesArray.length === 0) {
            return false;
        }
        
        let viewer = this._viewerStore.get(containerID);
        
        let baseRect = this._getShapeRect(containerID, viewer, document.querySelector('#' + containerID + ' #' + shapesArray[0]));
        
        for(let i=0; i<shapesArray.length; i++) {
            let shape = document.querySelector('#' + containerID + ' #' + shapesArray[i]);
            try {
                shape.classList.add('active');
                let rect = this._getShapeRect(containerID, viewer, shape);
                baseRect = baseRect.union(rect);  
            } catch(error) {
                console.log('[ERROR] invalid shape ' + shapesArray[i] + ': ' + error);
            } 
        }
        
        viewer.viewport.fitBoundsWithConstraints(baseRect);
    }
    
    _getShapeRect(containerID, viewer, input) {
        //decide if I have an ID or the element itself already
        
        let elem;
        if(typeof input === 'string') {
            input = input.replace(/#/, '');
            elem = document.querySelector('#' + containerID + ' #' + input);
        } else if(typeof input === 'object') {
            elem = input;
        } else {
            console.log('[ERROR] problem with input of type ' + (typeof input));
            console.log(input);
            return null;
        }
        
        let windowRect = elem.getBoundingClientRect();
                                    
        let ul = viewer.viewport.windowToViewportCoordinates(new OpenSeadragon.Point(windowRect.left, windowRect.top));
        let lr = viewer.viewport.windowToViewportCoordinates(new OpenSeadragon.Point(windowRect.right, windowRect.bottom));
        
        let rect = new OpenSeadragon.Rect(ul.x, ul.y, lr.x - ul.x, lr.y - ul.y);
        
        return rect;
    }
    
    handleRequest(request) {
        let reqContainer = request.getContainer();
        
        let containerID = (reqContainer.endsWith('_VIEWTYPE_FACSIMILEVIEW')) ? reqContainer : reqContainer + '_VIEWTYPE_FACSIMILEVIEW';
        let container = document.getElementById(containerID);
        
        let _this = this;
        
        let func = function() {
            console.log('[DEBUG] handling facsimile request');    
        
            let type = JSON.stringify(request.getQueryPrototype());
        
            let stateProto = JSON.stringify({objectType: EO_Protocol.Object.OBJECT_STATE, contexts: [], perspective: _this._supportedPerspective, operation: EO_Protocol.Operation.OPERATION_VIEW});
            let notationProto = JSON.stringify({objectType: EO_Protocol.Object.OBJECT_NOTATION, contexts: [], perspective: _this._supportedPerspective, operation: EO_Protocol.Operation.OPERATION_VIEW});
            let lyricProto = JSON.stringify({objectType: EO_Protocol.Object.OBJECT_LYRICS, contexts: [], perspective: _this._supportedPerspective, operation: EO_Protocol.Operation.OPERATION_VIEW});
            let dirProto = JSON.stringify({objectType: EO_Protocol.Object.OBJECT_DIR, contexts: [], perspective: _this._supportedPerspective, operation: EO_Protocol.Operation.OPERATION_VIEW});
            let delProto = JSON.stringify({objectType: EO_Protocol.Object.OBJECT_DEL, contexts: [], perspective: _this._supportedPerspective, operation: EO_Protocol.Operation.OPERATION_VIEW});
            let metaProto = JSON.stringify({objectType: EO_Protocol.Object.OBJECT_METAMARK, contexts: [], perspective: _this._supportedPerspective, operation: EO_Protocol.Operation.OPERATION_VIEW});
            
            //highlight a single state
            if(type === stateProto) {
                let stateObj = null;
                let target = request.getObjectID();
                
                for (let scar of _this._stateStore.get(request.getEditionID())) {
                    for (let state of scar.states) {
                        if(state.id === target) {
                            stateObj = state;
                        }
                    } 
                }
                
                _this.highlightState(stateObj, request.getContainer(), _this);
            } else if(type === notationProto || type === lyricProto || type === dirProto || type === delProto || type === metaProto) {
                let responseType = 'json';
                let url = _this._getBaseURI() + 'edition/' + _this._eohub.getEdition() + '/object/' + request.getObjectID() + '/shapes.json';
                
                let shapeRequest = new DataRequest(responseType, url);
                _this._eohub.requestData(shapeRequest).then(
                    (json) => {
                        _this.highlightItem(containerID, json);
                    });
            } else {
                console.log('[WARNING] Dunno how to handle the following request:');
                console.log(request);
            }
        };
        
        
        if(container.innerHTML === '' || !this._viewerStore.has(containerID)) {
            this.getDefaultView(containerID).then(func());
        } else {
            func();
        }
        
        
        /*if(this._stateStore.has(_this._eohub.getEdition())) {
            this._setupStatesNav(containerID, this._stateStore.get(_this._eohub.getEdition()));    
        } else {
            let statesResponseType = 'json';
            let statesUrl = this._getBaseURI() + 'edition/' + this._eohub.getEdition() + '/states/overview.json';
            let statesCallback = function(originalRequest,json) {
                _this._stateStore.set(_this._eohub.getEdition(),json)
                _this._setupStatesNav(containerID, json);
            }
            let stateRequest = new DataRequest(statesResponseType,statesUrl,statesCallback);
            this._eohub.requestData(stateRequest);
        
        }*/
    }
    
};

export default VideFacsimileViewer;
