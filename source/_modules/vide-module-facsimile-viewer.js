import 'babel-polyfill';
import VIDE_PROTOCOL from './vide-protocol';
import {EoNavModule} from './vide-nav-module-blueprint';



const VideFacsimileViewer = class VideFacsimileViewer extends EoNavModule {

    /*Constructor method*/
    constructor() {
        super();
        this._supportedPerspective = VIDE_PROTOCOL.PERSPECTIVE.FACSIMILE;
        this._supportedRequests = [];
        this._viewerStore = new Map();
        //a store that holds all page positions
        this._tiledImages = new Map();
        
        let stateReq = {object: VIDE_PROTOCOL.OBJECT.STATE, 
            contexts:[], 
            perspective: this._supportedPerspective, 
            operation: VIDE_PROTOCOL.OPERATION.VIEW};
        let notationReq = {object: VIDE_PROTOCOL.OBJECT.NOTATION, 
            contexts:[], 
            perspective: this._supportedPerspective, 
            operation: VIDE_PROTOCOL.OPERATION.VIEW};
        let lyricReq = {object: VIDE_PROTOCOL.OBJECT.LYRICS, 
            contexts:[], 
            perspective: this._supportedPerspective, 
            operation: VIDE_PROTOCOL.OPERATION.VIEW};
        let metaReq = {object: VIDE_PROTOCOL.OBJECT.METAMARK, 
            contexts:[], 
            perspective: this._supportedPerspective, 
            operation: VIDE_PROTOCOL.OPERATION.VIEW};
        let dirReq = {object: VIDE_PROTOCOL.OBJECT.DIR, 
            contexts:[], 
            perspective: this._supportedPerspective, 
            operation: VIDE_PROTOCOL.OPERATION.VIEW};
        let delReq = {object: VIDE_PROTOCOL.OBJECT.DEL, 
            contexts:[], 
            perspective: this._supportedPerspective, 
            operation: VIDE_PROTOCOL.OPERATION.VIEW};
        this._supportedRequests.push(stateReq);
        this._supportedRequests.push(notationReq);
        this._supportedRequests.push(lyricReq);
        this._supportedRequests.push(metaReq);
        this._supportedRequests.push(dirReq);
        this._supportedRequests.push(delReq);
        
        this._key = 'VideFacsimileViewer';
        
        //used for I18n to identify how individual states are labeled
        this._stateLabelKeySingular = 'writingLayer';
        this._stateLabelKeyPlural = 'writingLayers';
        
        return this;
    }
    
    unmount(containerID) {
        
        let viewer = this._cache.get(containerID + '_viewer', viewer)
        viewer.destroy();
        this._cache.delete(containerID + '_viewer');
        
        this._positionsMap.clear();
        
        document.getElementById(containerID).innerHTML = '';
    }
    
    /** 
     * This function loads a JSON object with info about the pages available in all sources, 
     * and also loads corresponding SVG shapes, putting them in the local this._cache.
     * @param {string} editionID is the edition for which page data shall be loaded
     * returns {Object} a Promise with the json object containing info about all pages 
     */
    _getPageData(editionID) {
        //let t0 = performance.now();
        let req = {id:editionID,type:'getPages'};
        return this.requestData(req,true).then((pageJson) => {
            
            let promises = [];
            
            
            for(let i=0; i<pageJson.sources.length; i++) {
                let source = pageJson.sources[i];
                
                for(let j=0; j<source.pages.length; j++) {
                    let page = source.pages[j];
                        
                    if(page.shapes !== '') {
                        //let s0 = performance.now();
                        let svgPromise = new Promise((resolve, reject) => {
                            
                            let svgReq = {id: page.shapesRef,type:'getPageShapesSvg'};
                            resolve(
                                this.requestData(svgReq, true).then(
                                    (svg) => {
                                        //let s1 = performance.now();
                                        //console.log('[DEBUG] loading svg for ' + page.label + ' took ' + (s1 - s0) + ' millisecs');
                                        return Promise.resolve(page.id);
                                    }
                                )
                            );
                        });
                    
                        promises.push(svgPromise);
                    }
                }
            }
            
            return Promise.all(promises).then((results) => {
                //let t1 = performance.now();
                //console.log('[DEBUG] getPageData took ' + (t1 - t0) + ' millisecs');
                return Promise.resolve(pageJson);
            });
        })
        
    }
    
    /** 
     * This function builds the required HTML, with no data being involved
     * @param {string} containerID denotes the HTML element in which everything will be placed.
     */
    _setupHtml(containerID) {
    
        if(document.getElementById(containerID + '_scarBox') !== null) {
            return true;
        }
    
        let container = document.getElementById(containerID);
        
        container.innerHTML = '';
        
        let facs = document.createElement('div');
        facs.id = containerID + '_facsimile';
        facs.className = 'facsimile';
        
        let facsNav = document.createElement('div');
        facsNav.id = containerID + '_facsimileNavigator';
        facsNav.className = 'facsNav';
        
        let facsNavMenu = document.createElement('div');
        facsNavMenu.id = containerID + '_facsNavMenu';
        facsNavMenu.className = 'facsNavMenu';
        
        facsNavMenu.innerHTML = '<div id="' + containerID + '_zoomIn" class="menuButton"><i class="fa fa-plus"></i></div>' +
            '<div id="' + containerID + '_zoomOut" class="menuButton"><i class="fa fa-minus"></i></div>' + 
            '<div id="' + containerID + '_zoomHome" class="menuButton"><i class="fa fa-arrows-alt"></i></div>' + 
            '<div id="' + containerID + '_rotateLeft" class="menuButton"><i class="fa fa-rotate-left"></i></div>' + 
            '<div id="' + containerID + '_rotateRight" class="menuButton"><i class="fa fa-rotate-right"></i></div>';
        
        
        
        container.appendChild(facs);
        container.appendChild(facsNav);
        container.appendChild(facsNavMenu);
        
        this._setupNavHtml(containerID);        
    }
    
    /** 
     * This function sets up the Openseadragon viewer
     * @param {string} containerID describes the HTML element that contains the facsimile
     */
    _setupViewer(containerID,request) {
        
        this._setupHtml(containerID);
        
        let editionID = this._eohub.getEdition();
        let pageData = this._getPageData(editionID);
        let stateData = this._getStateData(editionID);
        let measureData = this._getMeasureData(editionID);
        
        let otherStates = [];
        for(let i = 0; i<request.contexts.length;i++) {
            let context = request.contexts[i];
            if(context.context === VIDE_PROTOCOL.CONTEXT.STATE) {
                otherStates.push(context.id);
            }
        }
        let activeStateID = (request.object === VIDE_PROTOCOL.OBJECT.STATE) ? request.id : null;
        
        let t0 = performance.now();
        return Promise.all([pageData, stateData,measureData]).then((results) => {
            let pageJson = results[0];
            let stateJson = results[1];
            let measureJson = results[2];
            
            let t1 = performance.now();
                console.log('[DEBUG] setupViewer took ' + (t1 - t0) + ' millisecs');
            
            if(this._cache.has(containerID + '_viewer')) {
                let newPositions = this._getRequiredPositions(containerID, activeStateID, otherStates,pageJson);
                
                for(let [uri, newPos] of newPositions.positions.entries()) {
                    /*console.log('working on an image ' + uri + ':')*/
                    /*console.log(tiledImage);*/
                    
                    if(this._tiledImages.has(uri)) {
                        let tiledImage = this._tiledImages.get(uri);
                        let currentBounds = tiledImage.getBounds() 
                        
                        if((typeof newPos.newX === 'number' 
                            && typeof newPos.newY === 'number' 
                            && (newPos.newX !== currentBounds.x || newPos.newY !== currentBounds.y))
                            || (newPos.x !== currentBounds.x || newPos.y !== currentBounds.y)) {
                            
                            if(typeof newPos.newX !== 'undefined' && typeof newPos.newY !== 'undefined') {
                                tiledImage.setPosition(new OpenSeadragon.Point(newPos.newX,newPos.newY),false);    
                            } else {
                                tiledImage.setPosition(new OpenSeadragon.Point(newPos.x,newPos.y),false);
                            }
                            
                        }
                    } else {
                    
                        console.log('calling add for ' + newPos.uri)
                        //add things pages or patches which aren't on stage yet
                        this._cache.get(containerID + '_viewer').addTiledImage({
                            tileSource: newPos.uri,
                            x: - 100,
                            y: newPos.y - 100,
                            width: newPos.width,
                            success: (e) => {
                                this._tiledImages.set(newPos.uri,e.item);
                                e.item.setPosition(new OpenSeadragon.Point(newPos.x,newPos.y),false)
                            }
                        });
                    }
                    
                }
                
                //remove things which aren't required anymore
                for(let [uri, existingImage] of this._tiledImages.entries()) {
                    if(!newPositions.positions.has(uri)) {
                        
                        console.log('calling destroy for ' + uri)
                        this._tiledImages.delete(uri);
                        this._cache.get(containerID + '_viewer').world.removeItem(existingImage);
                    }
                }
                
                //
                
                return Promise.resolve(this._cache.get(containerID + '_viewer'))
            } else {
                let positions = this._getRequiredPositions(containerID, activeStateID, otherStates,pageJson).positions;
                this._initializeViewer(containerID,positions).then(
                    console.log('____________________ this._initializeViewer complete __________________')
                )
            }
        });
        
    }
    
    //this function determines the positions necessary for the current request
    _getRequiredPositions(containerID, activeStateID, otherStates, pageJson) {
        
        let rasterX = pageJson.maxDimensions.width + 50;
        let rasterY = pageJson.maxDimensions.height + 50;
        
        let newPosMap = new Map();
        let animations = {
            remove: [],
            add: [],
            move: []
        }
        let index = {n: 0};
        
        
        for(let i = 0; i<pageJson.sources.length; i++) {
            let source = pageJson.sources[i];
            for(let j = 0; j<source.pages.length; j++) {
                let page = source.pages[j];
                
                this._evaluatePage(newPosMap,page,index,i,j,activeStateID,otherStates,animations,rasterX,rasterY,null)
                
            }
        }
        
        return {
            positions: newPosMap,
            animations: animations
        }
        
    }
    
    _evaluatePage(positionMap,page,totalIndex,sourceIndex,pageInSourceIndex,activeStateID,otherStates = [],animations,rasterX,rasterY,patch) {
    
        //decide whether this page needs to be rendered
        let showThis = page.visible;
        let currentAdd = false;
        let currentRemove = false;
        
        //page has been added in a state that is supposed to be rendered
        if(page.added !== '' && otherStates.indexOf(page.added) !== -1) {
            showThis = true;
        }
        
        //page gets added in current state -> animate there, don't show immediately
        if(page.added !== '' && page.added === activeStateID) {
            showThis = true;
            currentAdd = true;
        }
        
        //page is a patch added in an earlier state
        if(patch !== null && patch.isAdded && otherStates.indexOf(patch.enterState) !== -1) {
            showThis = true;
        }
        
        //page is a patch added in an earlier state
        if(patch !== null && patch.isAdded && patch.enterState === activeStateID) {
            showThis = true;
            currentAdd = true;
        }
        
        //page has been removed in the past
        if(page.removed !== '' && otherStates.indexOf(page.removed) !== -1) {
            showThis = false;
        }
        
        //page gets removed in current state -> animate to new position, don't remove immediately
        if(page.removed !== '' && page.removed === activeStateID) {
            showThis = true;
            currentRemove = true;
        }
        
        //todo: are there patches witch can be removed?
        
        if(showThis) {
            
            let uri = page.facsRef + '/info.json';
            
            if(positionMap.has(uri)) {
                //page has been set at a different position already
                 
                let positionObject = positionMap.get(uri);
                
                //page gets added here
                if(currentAdd) {
                    //page has been removed elsewhere already
                    if(positionObject.currentRemove) {
                        let newX = pageInSourceIndex * rasterX;
                        let newY = (sourceIndex * rasterY) + ((rasterY - page.height_mm) / 2);
                        
                        if(page.type === 'verso') {
                            newX = newX + (rasterX - page.width_mm)
                        }
                        
                        if(patch !== null && typeof patch.offsetY === 'number' && typeof patch.offsetY === 'number') {
                            newX = newX + patch.offsetX;
                            newY = (sourceIndex * rasterY) + ((rasterY - patch.parentPage.height_mm) / 2) + patch.offsetY;
                        }
                        
                        positionObject.currentAdd = true;
                        positionObject.newX = newX;
                        positionObject.newY = newY;
                        animations.move.push(positionObject);
                    
                    //page is completely new and needs to come from the "outside"
                    } else {
                        console.log('------//-------//-------// I do not know why this could happen')
                    }
                    
                }
                
                //page gets removed
                if(currentRemove) {
                
                    //page will be added elsewhere
                    if(positionObject.currentAdd) {
                        let oldX = pageInSourceIndex * rasterX;
                        let oldY = (sourceIndex * rasterY) + ((rasterY - page.height_mm) / 2);
                        
                        if(page.type === 'verso') {
                            oldX = oldX + (rasterX - page.width_mm)
                        }
                        
                        if(patch !== null && typeof patch.offsetY === 'number' && typeof patch.offsetY === 'number') {
                            oldX = oldX + patch.offsetX;
                            oldY = (sourceIndex * rasterY) + ((rasterY - patch.parentPage.height_mm) / 2) + patch.offsetY;
                        }
                        
                        positionObject.currentRemove = true;
                        positionObject.newX = positionObject.x;
                        positionObject.newy = positionObject.y;
                        positionObject.x = oldX;
                        positionObject.y = oldY;
                        animations.move.push(positionObject);
                    
                    //page gets removed completely
                    } else {
                        console.log('------//-------//-------// I do not know why this could happen')
                    }
                    
                }
            
            } else if(patch !== null && page.type === 'verso') {
                //page is the backside of a patch -> ignored for now
                //todo: allow flipping of patches
                
            } else {
                //page will be added to new layout    
                
                let baseX = pageInSourceIndex * rasterX;
                let baseY = sourceIndex * rasterY;
                
                let x;
                let y = baseY + ((rasterY - page.height_mm) / 2);
                
                if(page.type === 'recto') {
                    x = baseX;
                } else {
                    x = baseX + (rasterX - page.width_mm);
                }
                
                if(patch !== null && typeof patch.offsetY === 'number' && typeof patch.offsetY === 'number') {
                    x = x + patch.offsetX;
                    y = baseY + ((rasterY - patch.parentPage.height_mm) / 2) + patch.offsetY;
                }
                
                let positionObject = {
                    id: page.id,
                    uri: uri,
                    x: x,
                    y: y,
                    width: page.width_mm,
                    index: totalIndex.n
                }
                
                if(currentAdd) {
                    positionObject.currentAdd = true;
                }
                
                if(currentRemove) {
                    positionObject.currentRemove = true;
                }
                
                positionMap.set(uri, positionObject)
                totalIndex.n++;
                
                //deal with patches
                for(let n = 0; n < page.patches.length; n++) {
                    let childPatch = page.patches[n];
                    childPatch.parentPage = page;
                    for (let m = 0; m < childPatch.pages.length; m++) {
                        this._evaluatePage(positionMap,childPatch.pages[m],totalIndex,sourceIndex,pageInSourceIndex,activeStateID,otherStates,animations,rasterX,rasterY,childPatch)
                        //todo: right now, patches on patches don't use the right offsets; they are always relative to the underlying page, but not the intermediate patch
                    }
                }
                
            }
            
        }
    }
    
    //this function initializes the OSD viewer
    _initializeViewer(containerID,positions) {
        
        return new Promise((resolve, reject) => {
            let tileSources = [];
            
            for(let positionedObject of positions.values()) {
                tileSources.push({
                    tileSource: positionedObject.uri,
                    x: positionedObject.x,
                    y: positionedObject.y,
                    width: positionedObject.width,
                    success: (e) => {
                        this._tiledImages.set(positionedObject.uri,e.item);
                    }
                });
            }
            
            //OSD viewer with all properties
            let viewer = OpenSeadragon({
                id: containerID + '_facsimile',
                tileSources: tileSources,
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
                collectionMode: false/*,
                collectionRows: 1, 
                collectionTileSize: 1200,
                collectionTileMargin: 0*/
            });
            
            //store viewer for later use
            this._cache.set(containerID + '_viewer', viewer)
            
            //log position of view when view changes
            viewer.addHandler('animation-finish',(event) => {
                
                let newState = {bounds: viewer.viewport.getBounds()};
                
                this._confirmView(containerID,newState);
                
            });
            
            //do internal setup after images are loaded
            viewer.addHandler('open', (event) => {
                /*let i=0;
                let pageCount = 0;
                
                for(i; i<pageJson.sources.length; i++) {
                    let source = pageJson.sources[i];
                    for(let j=0; j<source.pages.length; j++) {
                        let page = source.pages[j];
                        
                        let bounds = viewer.world.getItemAt(pageCount).getBounds();
                        pageCount++;
                        
                        //set source label
                        if(j===0) {
                            
                            let sourceLabel = document.createElement('div');
                            sourceLabel.id = containerID + '_pageLabel_' + source.id;
                            sourceLabel.className = 'pageLabel';
                            sourceLabel.innerHTML = source.label;
                            
                            viewer.addOverlay({
                                element: sourceLabel,
                                y: bounds.y + (bounds.height / 2),
                                x: -10,
                                placement: 'RIGHT'
                            });
                            
                        }
                        
                        //set page label
                        let pageLabel = document.createElement('div');
                        pageLabel.id = containerID + '_pageLabel_' + page.id;
                        pageLabel.className = 'pageLabel';
                        pageLabel.innerHTML = page.label;
                        
                        viewer.addOverlay({
                            element: pageLabel,
                            y: bounds.y + bounds.height,
                            x: bounds.x + (bounds.width / 2),
                            placement: 'TOP'
                        });
                        
                        let cacheKey = JSON.stringify({id: page.shapesRef,type:'getPageShapesSvg'});
                        
                        //if possible, load svg overlays
                        if(page.shapesRef !== '') {
                            if(this._cache.has(cacheKey)) {
                                let svgBox = document.createElement('div');
                                svgBox.className = 'svgBox';
                                svgBox.innerHTML = this._cache.get(cacheKey);
                                viewer.addOverlay({
                                    element: svgBox,
                                    y: bounds.y,
                                    x: bounds.x,
                                    width: bounds.width,
                                    height: bounds.height,
                                    placement: 'TOP_LEFT'
                                });
                                
                                //handler for svg shapes being clicked
                                let onClick = (e) => {
                                    let shape = e.target;
                                    this._clickShape(containerID, viewer, shape, e);
                                    e.preventDefault(); 
                                };
                                let paths = svgBox.querySelectorAll('path');
                                
                                //adding the handler to each svg shape
                                for(let x=0; x < paths.length; x++) {
                                    let path = paths[x];
                                    path.addEventListener('click', onClick, false);
                                }
                            } else {
                                console.log('[ERROR] failed to load things in correct order – svg shapes not available for ' + page.id + ' (yet)');
                            }
                        } else {
                            console.log('no shapes to retrieve for page ' + page.label);
                        }
                        
                        
                    }
                }
                */
                
                console.log('is this event firing?')
                //todo: load all events
                
                
                resolve(viewer);
            });
            
            
        });
    }
    
    _animatePage() {
        
    }
    
    
    
/* **************************************************************************************** */
    
    _focusShape(containerID, viewer, shape) {
        let rect = this._getShapeRect(containerID, viewer, shape);
        console.log('[DEBUG] clicked on shape ' + shape.id);
        
        if(rect !== null) {
            /*viewer.viewport.fitBoundsWithConstraints(rect);
            let oldState = this._getLastRequest(containerID);
            let newState = Object.assign({}, oldState, {state: {bounds: rect}})
            
            this._confirmView(newState,containerID);*/
            
            console.log('---------------- missing a rect')
        }
    }
    
    _clickShape(containerID, viewer, shape, event) {
        let supportedRequests = this._eohub.getSupportedRequests();
        
        let shapeReq = {id: shape.id, edition: this._eohub.getEdition(), type: 'getShapeInfo'}
        
        this.requestData(shapeReq,false)
            .then(
                (json) => {
                    
                    let elem = json[0];
                    
                    let requests = [];
                    let filteredRequests = supportedRequests.filter((request) => {
                        return (request.object === elem.type && request.perspective !== this._supportedPerspective);
                    }); 
                    
                    filteredRequests.forEach((request, j) => {
                        let req = Object.assign({}, request);
                        req.id = elem.id;
                        if(request.perspective === VIDE_PROTOCOL.PERSPECTIVE.TRANSCRIPTION) {
                            let states = elem.states.filter(function(state){
                                return state.type !== 'del';
                            });
                            
                            for(let k=0; k<states.length; k++) {
                                let reqCopy = {
                                    object: req.object, 
                                    id: req.id,
                                    operation: req.operation,
                                    perspective: req.perspective,
                                    contexts: [{id: states[k].id, context:VIDE_PROTOCOL.CONTEXT.STATE}]
                                };
                                
                                requests.push(reqCopy);
                            }
                        } else {
                            requests.push(req);
                        }
                    });
                    
                    let closeFunc = () => {
                        this._focusShape(containerID, viewer, shape);
                    };
                    try {
                        this._eohub._viewManager.setContextMenu(requests, event, containerID, closeFunc);    
                    } catch(err) {
                        console.log('[ERROR] Unable to open context menu: ' + err);
                    }
                }
            );
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
        
        this.handleRequest(containerID,req,{});  
        
    }
    
    _highlightState(state, containerID, viewer,className = 'active') {
        
        if(state.shapes.length === 0) {
            return false;
        }
        
        try {
            let baseRect = this._getShapeRect(containerID, viewer, document.querySelector('#' + containerID + ' #' + state.shapes[0]));
            
            for(let i=0; i<state.shapes.length; i++) {
                let shape = document.querySelector('#' + containerID + ' #' + state.shapes[i]);
                try {
                    shape.classList.add(className);
                    let rect = this._getShapeRect(containerID, viewer, shape);
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
    
    _removeSvgHighlights(containerID) {
        let elems = document.querySelectorAll('#' + containerID + ' svg path.active, #' + containerID + ' svg path.current');
        
        for (let elem of elems) {
           elem.classList.remove('active');
           elem.classList.remove('current');
        }
    }
    
    highlightItem(viewer,containerID, shapesArray) {
    
        if(shapesArray.length === 0) {
            console.log('[WARNING] no shapes provided that could be focussed on')
        }
    
        let oldHighlights = document.querySelectorAll('#' + containerID + ' path.active, #' + +containerID + ' path.current');
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
    
    handleRequest(containerID,request,state = {}) {
        
        /*console.log('[INFO] received the following request for VideFacsimileViewer at ' + containerID + ':')
        console.log(containerID)
        console.log(request)*/
        
        //determine type of request
        let type;
            
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
        
        if(state !== null && typeof state.bounds !== 'undefined') {
            type = 'getRect';
        } else if(request.object === VIDE_PROTOCOL.OBJECT.NOTATION && request.contexts.length === 0) {
            type = 'highlightMusic';
        } else if(request.object === VIDE_PROTOCOL.OBJECT.LYRICS && request.contexts.length === 0) {
            type = 'highlightMusic';
        } else if(request.object === VIDE_PROTOCOL.OBJECT.METAMARK && request.contexts.length === 0) {
            type = 'highlightMusic';
        } else if(request.object === VIDE_PROTOCOL.OBJECT.DIR && request.contexts.length === 0) {
            type = 'highlightMusic';    
        } else if(request.object === VIDE_PROTOCOL.OBJECT.DEL && request.contexts.length === 0) {
            type = 'highlightMusic';    
        } else if(request.object === VIDE_PROTOCOL.OBJECT.STATE) {
            type = 'highlightState';
        } else if(request.object === VIDE_PROTOCOL.OBJECT.EDITION) {
            type = 'showAll';
        }else {
            console.log('[ERROR] unable to determine the type of the following request in VideFacsimileViewer:')
            console.log(request)
            return false;
        }
        
        this._setupViewer(containerID,request).then((viewer) => {
            
            //todo: add more complex object when confirming state?
            this._confirmView(containerID,{});
            
            let editionID = this._eohub.getEdition();
            
            if(type === 'getRect') {
                
                try {
                    let input = state.bounds;
                    let rect = new OpenSeadragon.Rect(input.x, input.y, input.width, input.height,input.degrees);
                
                    viewer.viewport.fitBoundsWithConstraints(rect);    
                } catch(err) {
                    console.log('[ERROR]: Unable to center the following rectangle (' + err + '):');
                    console.log(state.bounds);
                }
                
            } else if(type === 'highlightMusic') {
                let req = {
                    id: request.id,
                    edition: editionID,
                    type: 'getShapesForObject'
                };
                
                this.requestData(req,false).then((json) => {
                    if(typeof json.dimensions !== 'undefined') {
                        console.log('I need to highlight rect: ')
                        console.log(json.dimensions);
                    } else {
                        this.highlightItem(viewer,containerID,json.shapes);  
                    }
                });    
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
                    
                    //highlight states in facsimile
                    
                    this._removeSvgHighlights(containerID);
                    i=0; 
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
                    }
                    
                });
            }
        });
        
        
    }
    
};

export default VideFacsimileViewer;
