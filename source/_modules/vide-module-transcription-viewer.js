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
        
        this._stateStore = new Map();
        this._currentRendering = new Map();
        
        //used for I18n to identify how individual states are labeled
        this._stateLabelKeySingular = 'variant';
        this._stateLabelKeyPlural = 'variants';
        
        return this;
    }
    
    _getFinalState(editionID) {
        
        let req = {id: editionID,type:'getFinalState'};
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
        
        let transcriptionNavMenu = document.createElement('div');
        transcriptionNavMenu.id = containerID + '_transcriptionNavMenu';
        transcriptionNavMenu.className = 'transcriptionNavMenu';
        
        transcriptionNavMenu.innerHTML = '<div id="' + containerID + '_zoomIn" class="menuButton"><i class="fa fa-plus"></i></div>' +
            '<div id="' + containerID + '_zoomOut" class="menuButton"><i class="fa fa-minus"></i></div>' + 
            '<div id="' + containerID + '_zoomHome" class="menuButton"><i class="fa fa-arrows-alt"></i></div>' + 
            '<div id="' + containerID + '_rotateLeft" class="menuButton"><i class="fa fa-rotate-left"></i></div>' + 
            '<div id="' + containerID + '_rotateRight" class="menuButton"><i class="fa fa-rotate-right"></i></div>';
        
        container.appendChild(transcription);
        container.appendChild(transcriptionNavMenu);
        
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
        this._currentRendering.delete(containerID);
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
        
        this._setupViewer(containerID);
        
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
                return Promise.resolve(this._cache.get(containerID + '_viewer'))
            } else {
                return new Promise((resolve, reject) => {
                    
                    let verovio = this._eohub.getVerovio();
                    
                    let options = JSON.stringify({
                        inputFormat: 'mei',
                        border: 0,
                        scale: 35,           //scale is in percent (1 - 100)
                        ignoreLayout: 0,
                        noLayout: 1          //results in a continuous system without page breaks
                    });
                    
                    this._getFinalState(editionID).then((finalState) => {
                        
                        let svgString = verovio.renderData(finalState + '\n', options);
                        this._cache.set('finalState',svgString)
                        
                        let svg = new DOMParser().parseFromString(svgString, "image/svg+xml");
                        
                        let widthAttr = svg.childNodes[0].getAttribute('width');
                        let width = widthAttr.substring(0,widthAttr.indexOf("px"))
                        
                        let heightAttr = svg.childNodes[0].getAttribute('height');
                        let height = heightAttr.substring(0,heightAttr.indexOf("px"))
                        
                        console.log('dimensions: ' + width + ' / ' + height);
                        console.log(document.getElementById(containerID + '_verovioBox'))
                        
                        
                        //OSD viewer with all properties
                        let viewer = OpenSeadragon({
                            id: containerID + '_verovioBox',
                            tileSources: {
                                height: parseInt(height,10),
                                width:  parseInt(width,10),
                                tileSize: 16,
                                //type: 'image',
                                //url:  'data:image/png;base64,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',//'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQAQMAAAAlPW0iAAAAA1BMVEX///+nxBvIAAAAAXRSTlMAQObYZgAAAAxJREFUCB1jYCANAAAAMAABhKzxegAAAABJRU5ErkJggg==',
                                //buildPyramid: false
                                
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
                            
                            visibilityRatio: 0.7,
                            constrainDuringPan: true
                            
                        });
                        
                        console.log('------viewer is really there')
                        
                        //store viewer for later use
                        this._cache.set(containerID + '_viewer', viewer)
                        
                        //log position of view when view changes
                        /*viewer.addHandler('animation-finish',(event) => {
                            this._confirmView({bounds:viewer.viewport.getBounds()},containerID);
                        });*/
                        
                        //do internal setup after images are loaded
                        viewer.addHandler('open', (event) => {
                            
                            let svgBox = document.createElement('div');
                            svgBox.className = 'svgBox';
                            svgBox.innerHTML= svgString;
                            
                            let bounds = viewer.world.getItemAt(0).getBounds();
                            
                            console.log('-------------DINGELINGELING')
                            console.log(viewer.world.getItemAt(0));
                            console.log(bounds)
                            viewer.addOverlay({
                                element: svgBox,
                                y: bounds.y,
                                x: bounds.x,
                                width: bounds.width,
                                height: bounds.height,
                                checkResize: true,
                                placement: 'TOP_LEFT'
                            });
                            
                            //todo: extract into separate function
                            let i = 0;
                            let j = measureJson.measures.length;
                            for(i; i<j; i++) {
                                let measure = measureJson.measures[i]; 
                                if(measure.scars.length > 0) {
                                    try {
                                        let rect = this._getShapeRect(containerID, viewer, measure.id);
                                        viewer.addOverlay({
                                            className: 'scarOverlay ' + measure.n + ' ' + measure.id,
                                            location: rect,
                                            checkResize: true,
                                            placement: 'TOP_LEFT'
                                        });
                                    } catch(err) {
                                        console.log('[ERROR] unable to get scar highlight in measure ' + measure.n + ': ' + err)
                                    }
                                }
                            }
                            
                            
                            
                            /*let max = viewer.viewport.getMaxZoom();
                            viewer.viewport.zoomTo(max,new OpenSeadragon.Point(bounds.x,bounds.y),true);*/
                            
                            //jump to first measure
                            this._focusShape(containerID,viewer,measureJson.measures[0].id);
                            
                            resolve(viewer);
                        });
                        
                    });
                    
                    
                    
                    
                    
                    
                });
            
            }    
                
        });
    }
    
    handleRequest(request, containerID) {
        
        console.log('[INFO] received the following request for VideFacsimileViewer at ' + containerID + ':')
        console.log(request)
        
        if(request.perspective !== this._supportedPerspective) {
            console.log('[ERROR] unable to handle the following request in VideFacsimileViewer: perspective not supported')
            console.log(request)
            return false;
        }
        
        if(request.operation !== VIDE_PROTOCOL.OPERATION.VIEW) {
            console.log('[ERROR] unable to handle the following request in VideFacsimileViewer: only allowed operation is "VIEW"')
            console.log(request)
            return false;
        }
        
        let type;
        
        if(request.object === VIDE_PROTOCOL.OBJECT.NOTATION && request.contexts.length === 0) {
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
            
            if(type === 'highlightMeasure') {
                try {
                    this._focusShape(containerID,viewer,request.id);    
                } catch(err) {
                    console.log('[ERROR] Unable to highlight measure ' + request.id + ': ' + err);
                }
                
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
    
    highlightItem(viewer,containerID, shapesArray) {
    
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
    }
    
    _focusShape(containerID, viewer, shape) {
        let rect = this._getShapeRect(containerID, viewer, shape);
        console.log('[DEBUG] clicked on shape ' + shape.id);
        
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
        
        console.log('____x_____x_____x____x____ prepareRendering')
        
        let vrvToolkit = window.vrvStore.vrvToolkit;
            
        var options = JSON.stringify({
            inputFormat: 'mei',
            border: 0,
            scale: 35,           //scale is in percent (1 - 100)
            ignoreLayout: 0,
            noLayout: 1          //results in a continuous system without page breaks
        });
            
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
