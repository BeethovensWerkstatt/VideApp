import 'babel-polyfill';
import VIDE_PROTOCOL from './vide-protocol';
import {EoNavModule} from './vide-nav-module-blueprint';


const VideTranscriptionViewer = class VideTranscriptionViewer extends EoNavModule {

    /*Constructor method*/
    constructor() {
        super();
        this._supportedPerspective = VIDE_PROTOCOL.PERSPECTIVE.TRANSCRIPTION;
        this._supportedRequests = [];
        let _this = this;
        
        //shows a complete state, without highlighting
        _this._supportedRequests.push({objectType: VIDE_PROTOCOL.OBJECT.STATE, contexts:[VIDE_PROTOCOL.CONTEXT.STATE], perspective: this._supportedPerspective, operation: VIDE_PROTOCOL.OPERATION.VIEW});
        //highlights a note (or similar) within a state
        _this._supportedRequests.push({objectType: VIDE_PROTOCOL.OBJECT.NOTATION, contexts:[VIDE_PROTOCOL.CONTEXT.STATE], perspective: this._supportedPerspective, operation: VIDE_PROTOCOL.OPERATION.VIEW});
        _this._supportedRequests.push({objectType: VIDE_PROTOCOL.OBJECT.LYRICS, contexts:[VIDE_PROTOCOL.CONTEXT.STATE], perspective: this._supportedPerspective, operation: VIDE_PROTOCOL.OPERATION.VIEW});
        _this._supportedRequests.push({objectType: VIDE_PROTOCOL.OBJECT.DIR, contexts:[VIDE_PROTOCOL.CONTEXT.STATE], perspective: this._supportedPerspective, operation: VIDE_PROTOCOL.OPERATION.VIEW});
        
        this._key = 'VideTranscriptionViewer';
        
        this._baseDimensions = new Map();
        
        this._verovioOptions = {
            inputFormat: 'mei',
            border: 0,
            scale: 35,           //scale is in percent (1 - 100)
            ignoreLayout: 0,
            noLayout: 1          //results in a continuous system without page breaks
        };
        
        //used for I18n to identify how individual states are labeled
        this._stateLabelKeySingular = 'variant';
        this._stateLabelKeyPlural = 'variants';
        
        return this;
    }
    
    _getFinalState(editionID) {
        
        let req = {id: editionID,type:'getFinalState'};
        return this.requestData(req,true);
        
    }
    
    _getStateAsMEI(editionID,stateID,otherStates = []) {
        
        let req = {id: stateID, edition: editionID, otherStates: otherStates,type:'getState'};
        return this.requestData(req,true);
        
    }
    
    _setupHtml(containerID) {
    
        if(document.getElementById(containerID + '_scarBox') !== null) {
            return true;
        }
        
        let container = document.getElementById(containerID);
        
        container.innerHTML = '';
        
        let transcription = document.createElement('div');
        transcription.className = 'verovioBox';
        transcription.id = containerID + '_verovioBox'; 
        
        let overlayInserter = document.createElement('div');
        overlayInserter.className = 'overlayInserter';
        overlayInserter.id = containerID + '_overlayInserter';
        
        let transcriptionNavMenu = document.createElement('div');
        transcriptionNavMenu.id = containerID + '_transcriptionNavMenu';
        transcriptionNavMenu.className = 'transcriptionNavMenu';
        
        transcriptionNavMenu.innerHTML = '<div id="' + containerID + '_zoomIn" class="menuButton"><i class="fa fa-plus"></i></div>' +
            '<div id="' + containerID + '_zoomOut" class="menuButton"><i class="fa fa-minus"></i></div>' + 
            '<div id="' + containerID + '_zoomHome" class="menuButton"><i class="fa fa-arrows-alt"></i></div>';
            
        container.appendChild(transcription);
        container.appendChild(transcriptionNavMenu);
        container.appendChild(overlayInserter);
        
        this._setupNavHtml(containerID);
        
        let scarBox = document.getElementById(containerID + '_stateNavigation');
        
        let transcriptionNavContainer = document.createElement('div');
        transcriptionNavContainer.className = 'transcriptionNavContainer';
        let transcriptionNav = document.createElement('div');
        transcriptionNav.className = 'transcriptionNav';
        transcriptionNav.id = containerID + '_transcriptionNavigator';
        transcriptionNavContainer.appendChild(transcriptionNav);
        
        scarBox.appendChild(transcriptionNavContainer);
        
    }
    
    unmount(containerID) {
        document.getElementById(containerID).innerHTML = '';
        //this._currentRenderingDimensions.delete(containerID);
    }
    
    /*_getStateData(editionID) {
        if(this._stateStore.has(editionID)) {
            return Promise.resolve(this._stateStore.get(editionID));
        } else {
            let responseType = 'json';
            let url = this._getBaseURI() + 'edition/' + editionID + '/' + 'states/' + 'overview.json';
            
            let request = new DataRequest(responseType, url);
            return this._eohub.requestData(request)
                .then(json => {
                    let stateMap = new Map();
                    let scarMap = new Map();
                    let firstScarID;
                    let firstStateID;
                    
                    json.forEach((scar, i) => {
                        scarMap.set(scar.id, scar);
                        let _i = i;
                        
                        scar.states.forEach((state, j) => {
                            state.scarID = scar.id;
                            stateMap.set(state.id, state);
                            let _j = j;
                            
                            if(i === 0 && j === 0) {
                                firstScarID = scar.id;
                                firstStateID = state.id;
                            }
                        });
                    });
                    
                    
                    let mapObject = {stateMap: stateMap, scarMap: scarMap, firstScarID: firstScarID, firstStateID: firstStateID};
                    this._stateStore.set(editionID, mapObject); 
                    
                    return Promise.resolve(mapObject);
                });
        }
    }*/
    
    _setupMenu(containerID, activeStateIDs = [], mainStateID) {
        return Promise.resolve(this._setupHtml(containerID)
            .then(() => {
                return Promise.resolve(this._getStateData(this._eohub.getEdition())
                    .then(mapObject => {
                        let scars = [...mapObject.scarMap.values()];
                        let selectBox = document.getElementById(containerID + '_dropdown');
                        selectBox.innerHTML = '';
                        
                        let scarToActivateIndex = -1;
                        let scarToActivateID = (typeof mainStateID === 'string') ? mapObject.stateMap.get(mainStateID).scarID : mapObject.stateMap.get(activeStateIDs[0]).scarID;
                        
                        for(let i in scars) {
                            let scar = scars[i];
                            let option = document.createElement('option');
                            option.innerHTML = scar.label + ' [' + scar.states.length + ' states]';
                            selectBox.appendChild(option);
                            if(scar.id === scarToActivateID) {
                                scarToActivateIndex = i;
                            }
                        }
                        
                        if(scarToActivateIndex === -1) {
                            console.log('[ERROR] Unable to find ' + scarToActivateID);
                            return false;
                        }
                        
                        let func = (e) => {
                            let i = selectBox.selectedIndex;
                            let scar = scars[i];
                            
                            let rows = 0;
                            let stateArray = [];
                            
                            for(let j in scar.states) {
                                let state = scar.states[j];
                                
                                //ignore states which are pure deletions
                                if(!state.deletion) {
                                    rows = (state.position > rows) ? state.position : rows;
                                
                                    if(rows > stateArray.length) {
                                        let newArray = [];
                                        stateArray.push(newArray);
                                    }
                                    stateArray[rows - 1].push(state); 
                                }
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
                                    let state = stateArray[n][m];
                                    
                                    let stateBox = document.createElement('div');
                                    stateBox.classList.add('stateBox');
                                    stateBox.setAttribute('data-stateid', state.id);
                                    stateBox.id = containerID + '_' + state.id;
                                    if(activeStateIDs.indexOf(state.id) !== -1) {
                                        stateBox.classList.add('active');
                                    }
                                    if(mainStateID === state.id) {
                                        stateBox.classList.add('current');
                                    }
                                    //todo: make this compatible with I18n
                                    stateBox.innerHTML = 'Variante ' + state.label;
                                    rowBox.appendChild(stateBox);
                                    
                                    let stateSelect = (event) => {
                                        this.prepareStateRequest(state.id, containerID)
                                            .then((request) => {
                                                return Promise.resolve(this._eohub.sendSelfRequest(request, this));
                                            });
                                    };
                                    stateBox.addEventListener('click', stateSelect);
                                }
                                
                                scarBox.appendChild(rowBox);
                            }
                            
                            //html zur navigation aufbauen
                        };
                        
                        selectBox.addEventListener('change', func);
                        selectBox.selectedIndex = scarToActivateIndex;
                        func(null);
                        
                        return mapObject;
                    }
            
                    )
        
                );
            }));
    }
    
    getDefaultView(containerID) {
        
        //this._setupViewer(containerID);
        
        let editionID = this._eohub.getEdition();
        
        let req = {
            id: editionID,
            object: VIDE_PROTOCOL.OBJECT.EDITION, 
            contexts:[], 
            perspective: this._supportedPerspective,
            operation: VIDE_PROTOCOL.OPERATION.VIEW
        };
        
        this.handleRequest(containerID,req,{});  
        
    }
    
    _setupViewer(containerID) {
        this._setupHtml(containerID);
        
        let editionID = this._eohub.getEdition();
        
        let stateDataPromise = this._getStateData(editionID);
        let measureDataPromise = this._getMeasureData(editionID);
        
        let t0 = performance.now();
        return Promise.all([stateDataPromise,measureDataPromise]).then((results) => {
            //let finalState = results[0];
            let stateJson = results[0];
            let measureJson = results[1];
            
            let t1 = performance.now();
                console.log('[DEBUG] setupViewer took ' + (t1 - t0) + ' millisecs');
                
            if(this._cache.has(containerID + '_viewer')) {
                console.log('getting viewer from cache')
                return Promise.resolve(this._cache.get(containerID + '_viewer'))
            } else {
                return new Promise((resolve, reject) => {
                    console.log('building new viewer')
                    let verovio = this._eohub.getVerovio();
                    
                    this._getFinalState(editionID).then((finalState) => {
                        
                        let svgString = verovio.renderData(finalState + '\n', this._verovioOptions);
                        this._cache.set('finalState',svgString)
                        
                        let svg = new DOMParser().parseFromString(svgString, "image/svg+xml");
                        let baseDimensions = this._getVerovioDimensions(svg);
                        
                        this._baseDimensions.set(editionID,baseDimensions);
                        
                        /*console.log('dimensions: ' + width + ' / ' + height);
                        console.log(document.getElementById(containerID + '_verovioBox'))*/
                        
                        //OSD viewer with all properties
                        let viewer = OpenSeadragon({
                            id: containerID + '_verovioBox',
                            tileSources: {
                                height: parseInt(baseDimensions.height,10),
                                width:  parseInt(baseDimensions.width,10),
                                tileSize: 1024,
                                x: 0,
                                y: 0,
                                getTileUrl: function( level, x, y ){
                                    //transparent png
                                    return 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQAQMAAAAlPW0iAAAAA1BMVEX///+nxBvIAAAAAXRSTlMAQObYZgAAAAxJREFUCB1jYCANAAAAMAABhKzxegAAAABJRU5ErkJggg==';
                                    //red: 
                                    //return 'data:image/png;base64,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'
                                }
                            },
                            sequenceMode: false,
                            showReferenceStrip: true,
                            showRotationControl: false,
                            showNavigator: true,
                            navigatorRotate: false,
                            navigatorId: containerID + '_transcriptionNavigator',
                            showFullPageControl: false,
                            zoomInButton: containerID + '_zoomIn',
                            zoomOutButton: containerID + '_zoomOut',
                            homeButton: containerID + '_zoomHome',
                            //rotateLeftButton: containerID + '_rotateLeft',
                            //rotateRightButton: containerID + '_rotateRight',
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
                            collectionTileMargin: 0,
                            
                            visibilityRatio: 0.2,
                            constrainDuringPan: true
                            
                        });
                        
                        //store viewer for later use
                        this._cache.set(containerID + '_viewer', viewer)
                        
                        //log position of view when view changes
                        viewer.addHandler('animation-finish',(event) => {
                            let newState = {bounds: viewer.viewport.getBounds()};
                            this._confirmView(containerID,newState);
                        });
                        
                        viewer.addHandler('zoom',(event) => {
                            let scaleRatioFix = 1 / viewer.viewport.getMaxZoom();
                            /*console.log(event.zoom + ' – ' + viewer.viewport.getMaxZoom() + ' – ' + viewer.viewport.getMinZoom())
                            console.log('zoomin to ' + (event.zoom * scaleRatioFix))*/
                            let infos = document.querySelectorAll('#' + containerID + ' .scarInfoContent *');
                            for (let info of infos) {
                                info.style.transform = 'scale(' + (event.zoom * scaleRatioFix) + ')';
                            }
                        });
                        
                        // as soon as the Verovio output is rendered, add scars
                        viewer.addOnceHandler('add-overlay',(event) => {
                            
                            let tiledImage = viewer.world.getItemAt(0);
                            let i = 0;
                            let j = stateJson.length;
                            
                            //insert scars
                            for(i; i<j; i++) {
                            
                                console.log('--23---- adding listeners')
                            
                                let scar = stateJson[i]; 
                                let firstMeasure = scar.firstMeasure;
                                let firstState = scar.states[0];
                                
                                let scarRect = this._createRect(viewer,containerID, scar.affectedNotes);
                                viewer.addOverlay({
                                    id: containerID + '_' + scar.id,
                                    className: 'scarHighlight',
                                    location: scarRect,
                                    checkResize: true
                                });
                                
                                let p = 0;
                                let q = scar.affectedNotes.length;
                                
                                for(p; p<q; p++) {
                                    try {
                                        let elem = document.querySelector('#' + containerID + ' #' + scar.affectedNotes[p]);
                                        elem.classList.add('affectedByScar');
                                        elem.addEventListener('click',(e) => {
                                            
                                            let req = {
                                                id: firstState.id,
                                                object: VIDE_PROTOCOL.OBJECT.STATE,
                                                contexts: [],
                                                perspective: this._supportedPerspective,
                                                operation: VIDE_PROTOCOL.OPERATION.VIEW,
                                                state: {}
                                            };
                                            this._eohub.sendSelfRequest(req,this,containerID);
                                            
                                        })
                                    } catch(err) {
                                        
                                    }
                                }
                                
                            }
                            
                            // jump to first measure
                            this._focusShape(containerID,viewer,measureJson.measures[0].id);
                            
                        });
                        
                        //do internal setup after images are loaded
                        viewer.addHandler('open', (event) => {
                            
                            let svgBox = document.createElement('div');
                            svgBox.className = 'svgBox';
                            svgBox.innerHTML= svgString;
                            
                            let bounds = viewer.world.getItemAt(0).getBounds();
                            
                            //place Verovio
                            viewer.addOverlay({
                                element: svgBox,
                                y: bounds.y,
                                x: bounds.x,
                                width: bounds.width,
                                height: bounds.height,
                                checkResize: true,
                                placement: 'TOP_LEFT'
                            });
                            
                            resolve(viewer);
                        });
                        
                    });
                    
                });
            
            }    
                
        });
    }
    
    handleRequest(containerID,request,state = {}) {
        
        if(request.perspective !== this._supportedPerspective) {
            console.log('[ERROR] unable to handle the following request in VideTranscriptionViewer: perspective not supported')
            console.log(request)
            return false;
        }
        
        if(request.operation !== VIDE_PROTOCOL.OPERATION.VIEW) {
            console.log('[ERROR] unable to handle the following request in VideTranscriptionViewer: only allowed operation is "VIEW"')
            console.log(request)
            return false;
        }
        
        let type;
        if(request.object === VIDE_PROTOCOL.OBJECT.EDITION && request.contexts.length === 0) {
            type = 'default'
        } else if(request.object === VIDE_PROTOCOL.OBJECT.NOTATION && request.contexts.length === 0) {
            type = 'highlightMeasure';
        } else if(request.object === VIDE_PROTOCOL.OBJECT.LYRICS && request.contexts.length === 0) {
            type = 'highlightMusic';
        } else if(request.object === VIDE_PROTOCOL.OBJECT.DIR && request.contexts.length === 0) {
            type = 'highlightMusic';    
        } else if(request.object === VIDE_PROTOCOL.OBJECT.STATE) {
            type = 'highlightState';
        } else {
            console.log('[ERROR] unable to determine the type of the following request in VideFacsimileViewer:')
            console.log(request)
            return false;
        }
        
        this._setupViewer(containerID).then((viewer) => {
            
            let editionID = this._eohub.getEdition();
            
            if(typeof state.bounds !== 'undefined') {
                try{
                    viewer.viewport.fitBoundsWithConstraints(state.bounds);
                    //this._confirmView(containerID,state);
                } catch(err) {
                    console.log('[ERROR] Unable to move to rect: ' + err)
                    console.log(request)
                    console.log(state)
                }
                
            } else if(type === 'default') {
                
                //console.log('[DEBUG] default transcription loaded at ' + containerID);
                //todo: have more complex object
                //this._confirmView(containerID,{});
                
            } else if(type === 'highlightMeasure') {
                
                try {
                    this._focusShape(containerID,viewer,request.id);
                    //todo: have more complex object
                    //this._confirmView(containerID,{});
                } catch(err) {
                    console.log('[ERROR] Unable to highlight measure ' + request.id + ': ' + err);
                }
                
            } else if(type === 'highlightState') {
                
                let editionID = this._eohub.getEdition();
                this._getStateData(editionID).then((stateJson) => {
                    let scar;
                    let i = 0;
                    
                    loops:{
                        for(i; i<stateJson.length;i++) {
                            let current = stateJson[i];
                            
                            let j = 0;
                            for(j; j<current.states.length;j++) {
                                let state = current.states[j];
                                if(state.id === request.id) {
                                    scar = current;
                                    break loops;
                                }
                            }
                        }
                    }
                    
                    let activeStates = [];
                    i = 0;
                    for(i;i<request.contexts.length;i++) {
                        activeStates.push(request.contexts[i].id)
                    }
                    
                    this._openSingleScar(containerID,scar.id,request.id,activeStates);
                    console.log('---------------------------------------------------')
                    console.log('---------------------------------------------------')
                    console.log('---------------------------------------------------')
                    this._renderState(containerID,scar,viewer,request.id,activeStates);
                    
                    /*i=0; 
                    let currentHandled = false;
                    
                    for(i;i<activeStates.length;i++) {
                        
                        let stateObj = scar.states.find((obj) => {
                            return obj.id === activeStates[i]; 
                        });
                        
                        if(stateObj.id !== request.id) {
                            this._highlightState(stateObj, containerID, viewer,'active')
                        } else {
                            currentHandled = true;
                            this._highlightState(stateObj, containerID, viewer,'current')
                        }
                    }
                    
                    if(!currentHandled) {
                        let stateObj = scar.states.find((obj) => {
                            return obj.id === request.id; 
                        });
                        this._highlightState(stateObj, containerID, viewer,'current')
                    }*/
                    
                    
                });
                
            } else {
                console.log('Dunno how to handle request (yet)')
            }
            
        });
        
        /*return Promise.resolve(
            this._setupMenu(containerID, activeStateIDs, mainStateID)
                .then((mapObject) => {
                //prepare url
                    let mainState = (mainStateID !== null) ? mainStateID : activeStateIDs[activeStateIDs.length -1];
                
                    let requiredStateIDs = this._getRequiredStates(mapObject.stateMap.get(mainState), mapObject.stateMap, []);
                    let futureStateIDs = this._getFutureStates(mapObject.stateMap.get(mainState), mapObject.stateMap, []);
                                
                    let requestableStateIDs = requiredStateIDs.slice(0);
                
                    for(let i=0; i<activeStateIDs.length; i++) {
                    //it's neither included already, nor folowing the current state
                        if(requestableStateIDs.indexOf(activeStateIDs[i]) === -1 && futureStateIDs.indexOf(activeStateIDs[i] === -1)) {
                            requestableStateIDs.push(activeStateIDs[i]);
                        }   
                    }
                
                    for(let i=0; i>requestableStateIDs; i++) {
                        try {
                            document.querySelector('#' + containerID + ' div.stateBox[data-stateid~="' + requestableStateIDs[i] + '"]').classList.add('active');   
                        } catch(err) {
                            console.log('[WARNING] Unable to highlight button for state ' + requestableStateIDs[i]);
                        }
                    }
                
                    let otherStates = (requestableStateIDs.length > 0) ? requestableStateIDs.join('___') : '_'; 
                
                    let responseType = 'text';
                    let url = this._getBaseURI() + 'edition/' + this._eohub.getEdition() + '/state/' + mainState + '/otherStates/' + otherStates + '/meiSnippet.xml';
                
                //if requested states are already displayed, skip loading fresh MEI and rendering by Verovio
                    if(this._currentRendering.has(containerID) && this._currentRendering.get(containerID) === url) {
                        let svg = document.querySelector('#' + containerID + ' svg');
                        let existingHighlights = svg.querySelectorAll('.highlight');
                        for (let existingHighlight of existingHighlights) {
                            existingHighlight.classList.remove('highlight');
                        }
                        return Promise.resolve(svg);
                    } else {
                        let dataRequest = new DataRequest(responseType, url);
                        return this._eohub.requestData(dataRequest, containerID).then(
                        (mei) => {
                            return this._prepareRendering(mei, containerID);
                        }
                    );
                    }
                })
                .then((svg) => {
                //check if something needs to be highlighted 
                    if(request.getObjectType() !== VIDE_PROTOCOL.OBJECT.STATE) {
                        let targets = document.querySelectorAll('#' + containerID + ' svg #' + request.getObjectID());
                        for (let target of targets) {
                            target.classList.add('highlight');
                        }
                    }
                
                    if(request.getObjectType() !== VIDE_PROTOCOL.OBJECT.STATE && request.getObjectType() !== VIDE_PROTOCOL.OBJECT.NOTATION) {
                        console.log('[WARNING] No support for handling ' + request.getObjectType() + ' in videTranscriptionViewer.js yet.');
                    }
                
                    return Promise.resolve(true);
                }));*/
    }
    
    //is this still used? 
    /*highlightItem(viewer,containerID, shapesArray) {
    
        if(shapesArray.length === 0) {
            console.log('[WARNING] no shapes provided that could be focussed on')
        }
    
        let oldHighlights = document.querySelectorAll('#' + containerID + ' .active, #' + +containerID + ' .current');
        for (let shape of oldHighlights) {
            shape.classList.remove('current');
        }
        
        if(shapesArray.length === 0) {
            return false;
        }
        
        let baseRect = this._getShapeRect(containerID, viewer, document.querySelector('#' + containerID + ' #' + shapesArray[0]));
        
        for(let i=0; i<shapesArray.length; i++) {
            let shape = document.querySelector('#' + containerID + ' #' + shapesArray[i]);
            try {
                shape.classList.add('current');
                let rect = this._getShapeRect(containerID, viewer, shape);
                baseRect = baseRect.union(rect);  
            } catch(error) {
                console.log('[ERROR] invalid shape ' + shapesArray[i] + ': ' + error);
            } 
        }
        viewer.viewport.fitBoundsWithConstraints(baseRect);
    }*/
    
    _renderState(containerID,scar,viewer,stateID,activeStates = []) {
        
        console.log('RENDERING STATE ' + stateID)
        
        try {
            console.log('starting')
            let editionID = this._eohub.getEdition();
            
            //first state
            this._getStateAsMEI(editionID,stateID,activeStates).then((stateMEI) => {
                console.log('--------21')
                //the OSD dimensions of the base layer
                let allBounds = viewer.world.getItemAt(0).getBounds();
                
                //get Rendering as string and DOM
                let verovio = this._eohub.getVerovio();
                let stateSvgString = verovio.renderData(stateMEI + '\n', this._verovioOptions);
                let stateSvg = new DOMParser().parseFromString(stateSvgString, "image/svg+xml");
                
                //determine dimensions
                let dimensions = this._getVerovioDimensions(stateSvg);
                let baseDimensions = this._baseDimensions.get(editionID);
                /*
                console.log('----------------- scar ' + scar.label + ' staffHeight: ' + dimensions.staffHeight + ' (' + baseDimensions.staffHeight + '), relation: ' + dimensions.relation + ' (' + baseDimensions.relation + ')')
                console.log(dimensions)
                console.log(baseDimensions)
                */                                     
                let attachmentMeasureRect = document.querySelector('#' + containerID + ' svg #' +scar.firstMeasure).getBoundingClientRect();
                
                let ul = viewer.viewport.windowToViewportCoordinates(new OpenSeadragon.Point(attachmentMeasureRect.left, attachmentMeasureRect.top));
                let lr = viewer.viewport.windowToViewportCoordinates(new OpenSeadragon.Point(attachmentMeasureRect.right, attachmentMeasureRect.bottom));
                
                let rect = new OpenSeadragon.Rect(ul.x, ul.y, lr.x - ul.x, lr.y - ul.y);
                
                let dist = allBounds.height / (baseDimensions.viewBoxHeight / baseDimensions.staffHeight);
                /*
                console.log('allBounds.height: ' + allBounds.height + ' | ratio: ' + (baseDimensions.viewBoxHeight / baseDimensions.staffHeight) + ' | dist: ' + dist)
                */
                let ulx = ul.x;
                let uly = allBounds.y - (2 * dist);
                /*
                console.log('-------11')
                */
                try {
                    /*
                    console.log('----------12')
                    console.log(ulx)
                    console.log(uly)
                    console.log(rect)
                    console.log(viewer)
                    */
                    
                    //place Label
                    /*viewer.addOverlay({
                        id: containerID + '_' + scar.id,
                        x: ulx,
                        y: uly,
                        width: rect.width * 2,
                        height: rect.height,
                        placement: 'BOTTOM_RIGHT',
                        checkResize: true
                    });*/
                    
                    /*
                    console.log('-----------13')
                    */
                    //generate HTML container for Verovio
                    console.log('--------22') 
                    
                    try {
            
                        let list = document.querySelectorAll('#' + containerID + '_currentState');
                        console.log('removing ' + list.length + ' overlay(s)')
                        
                        for (let item of list) {
                            viewer.removeOverlay(containerID + '_currentState');
                            item.parentNode.removeChild(elem);
                        }
                    } catch(err) {
                        console.log('[INFO] There is no overlay to be removed: ' + err)
                    }
                    
                    let stateBox = document.createElement('div');
                    stateBox.id = containerID + '_currentState';
                    stateBox.className = 'stateBox';
                    stateBox.innerHTML= stateSvgString;
                    
                    //determine dimensions of Verovio container
                    let thisWidthFactor = 1 / baseDimensions.width * dimensions.width;
                    /*
                    console.log(baseDimensions)
                    console.log(allBounds)
                    console.log('---------------14 ' + thisWidthFactor)
                    */
                    //let stateRect = tiledImage.imageToViewportRectangle(rect.x,rect.y,svgWidth * .035,svgHeight * .035);
                    
                    let rectWidth = allBounds.width * thisWidthFactor;
                    let rectHeight = rectWidth / dimensions.width * dimensions.height;
                    
                    let rectBounds = new OpenSeadragon.Rect(ulx, uly - rectHeight, rectWidth, rectHeight);
                    console.log('--------23')
                    //place Verovio
                    viewer.addOverlay({
                        element: stateBox,
                        /*x: ulx,
                        y: uly,
                        width: allBounds.width * thisWidthFactor,
                        //height: allBounds.heigth,*/
                        location: rectBounds,
                        checkResize: true,
                        placement: 'BOTTOM_LEFT'
                    });
                    console.log('--------24')
                    viewer.viewport.fitBoundsWithConstraints(rectBounds);
                    console.log('--------25')
                } catch(err) {
                    console.log('problems at: ' + err)
                }
                
                
            });
            
            
        } catch(err) {
            console.log('[ERROR] failed to render state ' + stateID + ': ' + err);
        }
        
    }
    
    _focusShape(containerID, viewer, shape) {
        let rect = this._getShapeRect(containerID, viewer, shape);
        //console.log('[DEBUG] clicked on shape ' + shape.id);
        
        if(rect !== null) {
            viewer.viewport.fitBoundsWithConstraints(rect);
        }
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
    
    prepareStateRequest(stateID, containerID) {
        console.log('prepareStateRequest(' + stateID + ',' + containerID+')');
        
        let guiStates = document.querySelectorAll('#' + containerID + ' .stateBox.active');
        
        return Promise.resolve(this._getStateData(this._eohub.getEdition())
            .then((mapObject) => {
                let state = mapObject.stateMap.get(stateID);
                let requiredStates = this._getRequiredStates(state, mapObject.stateMap, []);
                let futureStates = this._getFutureStates(state, mapObject.stateMap, []);
                
                console.log('-------------------------56');
                console.log(state);
                console.log(requiredStates);
                console.log(futureStates);
                
                let requestedStates = requiredStates.slice(0);
                
                //combine definitely needed states with optional ones selected in the UI
                for(let i=0; i<guiStates.length; i++) {
                    //it's neither included already, nor folowing the current state
                    if(requestedStates.indexOf(guiStates[i].id) === -1 && futureStates.indexOf(guiStates[i].id === -1)) {
                        requestedStates.push(guiStates[i].id);
                    }   
                }
                
                //create contexts for each state
                let contexts = [];
                for(let i=0; i<requestedStates.length; i++) {
                    contexts.push({type:VIDE_PROTOCOL.CONTEXT.STATE, id:requestedStates[i]});                       
                }
                
                let query = {
                    objectType: VIDE_PROTOCOL.OBJECT.STATE,
                    objectID: stateID,
                    contexts: contexts,
                    perspective: this._supportedPerspective,
                    operation: VIDE_PROTOCOL.OPERATION.VIEW
                };
                
                let request = new Request(containerID, this._eohub.getEdition(), query);
                console.log('-----------------request:');
                console.log(request);
                return request;
            })
        );
    }
    
    _getRequiredStates(state, stateMap, coveredArray) {
        coveredArray.push(state.id);
        let array = state.follows.concat(state.prev);
        let _this = this;
        
        for(let p = 0; p<array.length; p++) {
            if(coveredArray.indexOf(array[p]) === -1) {
                let nextState = stateMap.get(array[p]);
                let recurseArray = _this._getRequiredStates(nextState, stateMap, coveredArray);
                array = array.concat(recurseArray);    
            }                                    
        }
        let newArray = [];
        for(let q = 0; q<array.length; q++) {
            if(newArray.indexOf(array[q]) === -1) {
                newArray.push(array[q]);
            }
        }
        
        return newArray;
    }
    
    _getFutureStates(state, stateMap, coveredArray) {
        let array = state.precedes.concat(state.next);
        let _this = this;
        
        for(let p = 0; p<array.length; p++) {
            if(coveredArray.indexOf(array[p]) === -1) {
                let nextState = stateMap.get(array[p]);
                let recurseArray = _this._getFutureStates(nextState, stateMap, coveredArray);
                array = array.concat(recurseArray);    
            }                                    
        }
        let newArray = [];
        for(let q = 0; q<array.length; q++) {
            if(newArray.indexOf(array[q]) === -1) {
                newArray.push(array[q]);
            }
        }
        
        return newArray;
    }
    
    _prepareRendering(mei, containerID) {
        let _this = this;
        
        let vrvToolkit = window.vrvStore.vrvToolkit;
            
        var options = {
            inputFormat: 'mei',
            border: 0,
            scale: 35,           //scale is in percent (1 - 100)
            ignoreLayout: 0,
            noLayout: 1          //results in a continuous system without page breaks
        };
            
        vrvToolkit.setOptions(options);
        let svg = vrvToolkit.renderData(mei + '\n', '');
        let target = document.getElementById(containerID + '_verovioBox');
        target.innerHTML = svg;
            
            //todo: remove this – it's better to let the videViewManager decide what to do
            //let viewPositions = _this._eohub.getAvailableViewPositions();
        let supportedRequests = window.EoHub.getSupportedRequests();
            
            //filter for notation
        let filteredRequests = supportedRequests.filter(function(request){
            return (request.objectType === VIDE_PROTOCOL.OBJECT.NOTATION && request.perspective !== _this._supportedPerspective);
        });
            
        let notes = document.querySelectorAll('#' + containerID + ' g.note, #' + containerID + ' g.rest');
            
        let notesArray = [...notes];
            
            
        notesArray.forEach(function(elem, i) {
            elem.addEventListener('click', function(e) {
                e.preventDefault();
                elem.classList.add('highlight');
                    
                let closeFunc = function() {
                    elem.classList.remove('highlight');
                };
                    
                let requests = [];
                    //todo: how to set contexts?
                filteredRequests.forEach(function(request, j) {
                    let req = Object.assign({}, request);
                    req.objectID = elem.id;
                    requests.push(req);
                });
                    
                try {
                    _this._eohub._viewManager.setContextMenu(requests, e, containerID, closeFunc);    
                } catch(err) {
                    console.log('[ERROR] Unable to open context menu: ' + err);
                }
            });
        });
            
        return Promise.resolve(svg);
    }
    
    _getVerovioDimensions(renderedSvg) {
        try {
            let viewBoxHeight = parseInt(renderedSvg.querySelector('svg#definition-scale').getAttribute('viewBox').split(' ')[3],10)
            let firstStaffLineYPos = parseInt(renderedSvg.querySelector('g.measure g.staff path:first-of-type').getAttribute('d').split(' ')[1],10)
            let lastStaffLineYPos = parseInt(renderedSvg.querySelector('g.measure g.staff path:last-of-type').getAttribute('d').split(' ')[1],10)
            
            let staffHeight = lastStaffLineYPos - firstStaffLineYPos;
            let staffHeightRelation = staffHeight / viewBoxHeight;
            
            let widthAttr = renderedSvg.childNodes[0].getAttribute('width');
            let width = parseInt(widthAttr,10);
            
            let heightAttr = renderedSvg.childNodes[0].getAttribute('height');
            let height = parseInt(heightAttr,10);
            
            return {
                relation: staffHeightRelation,
                staffHeight: staffHeight,
                viewBoxHeight: viewBoxHeight,
                width: width,
                height: height
            }
        } catch(err) {
            console.log('[ERROR] Unable to determine dimensions of rendered SVG: ' + err)
            return {
                relation: -1
            }
        }
        
    }
    
    _createRect(viewer,containerID, shapesArray) {
    
        if(shapesArray.length === 0) {
            console.log('[WARNING] no shapes provided that could be focussed on')
            return false;
        }
    
        let oldHighlights = document.querySelectorAll('#' + containerID + ' path.active, #' + +containerID + ' path.current');
        for (let shape of oldHighlights) {
            shape.classList.remove('current');
        }
        
        let rects = [];
        let returnRect;
        for(let i=0; i<shapesArray.length; i++) {
            let shape = document.querySelector('#' + containerID + ' #' + shapesArray[i]);
            try {
                shape.classList.add('current');
                let rect = this._getShapeRect(containerID, viewer, shape);
                if(rect !== false) {
                    rects.push(rect);    
                }
                  
            } catch(error) {
                //console.log('[ERROR] invalid shape ' + shapesArray[i] + ': ' + error);
            } 
        }
        
        returnRect = rects[0];
        for(let i=1; i<rects.length;i++) {
            returnRect = returnRect.union(rects[i]);
        }
        
        return returnRect;
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
            return false;
        }
        
        try {
            
            /* 
            
            console.log('elem.getBoundingClientRect() – elem.getBBox()')
            console.log(elem.getBoundingClientRect())
            console.log(elem.getBBox())
            
             */
            
            let windowRect = elem.getBoundingClientRect();
                                        
            let ul = viewer.viewport.windowToViewportCoordinates(new OpenSeadragon.Point(windowRect.left, windowRect.top));
            let lr = viewer.viewport.windowToViewportCoordinates(new OpenSeadragon.Point(windowRect.right, windowRect.bottom));
            
            /*let windowRect = elem.getBBox();
            
            let ul = viewer.world.getItemAt(0).imageToViewportCoordinates(windowRect.left, windowRect.top);
            let lr = viewer.world.getItemAt(0).imageToViewportCoordinates(windowRect.left + windowRect.width, windowRect.top + windowRect.height);
            */
            
            let rect = new OpenSeadragon.Rect(ul.x, ul.y, lr.x - ul.x, lr.y - ul.y);
            
            return rect;    
        } catch(err) {
            console.log('What is wrong? Show me please: ' + err)
            return false;
        }
        
    }
    
    /*
    
    function play_midi() {
        var base64midi = vrvToolkit.renderToMidi();
        var song = 'data:audio/midi;base64,' + base64midi;
        $("#player").show();
        $("#play-button").hide();
        $("#player").midiPlayer.play(song);
    }
    
    var midiUpdate = function(time) {
        var vrvTime = Math.max(0, 2 * time - 800);
        var elementsattime = JSON.parse(vrvToolkit.getElementsAtTime(vrvTime))
        if (elementsattime.page > 0) {
            if (elementsattime.page != page) {
                page = elementsattime.page;
                load_page();
            }
            if ((elementsattime.notes.length > 0) && (ids != elementsattime.notes)) {
                ids.forEach(function(noteid) {
                    if ($.inArray(noteid, elementsattime.notes) == -1) {
                        $("#" + noteid ).attr("fill", "#000");
                        $("#" + noteid ).attr("stroke", "#000"); 
                        //$("#" + noteid ).removeClassSVG("highlighted"); 
                    }
                });
                ids = elementsattime.notes;
                ids.forEach(function(noteid) {
                    if ($.inArray(noteid, elementsattime.notes) != -1) {
                    //console.log(noteid);
                        $("#" + noteid ).attr("fill", "#c00");
                        $("#" + noteid ).attr("stroke", "#c00");; 
                        //$("#" + noteid ).addClassSVG("highlighted"); 
                    }
                }); 
            }
        }
    }
    
    var midiStop = function() {
        ids.forEach(function(noteid) {
            $("#" + noteid ).attr("fill", "#000");
            $("#" + noteid ).attr("stroke", "#000"); 
            //$("#" + noteid ).removeClassSVG("highlighted"); 
        });
        $("#player").hide();
        $("#play-button").show();
    }
    
    
     */
    
};

export default VideTranscriptionViewer;
