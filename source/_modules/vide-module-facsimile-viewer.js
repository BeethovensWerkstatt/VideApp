import 'babel-polyfill';
import VIDE_PROTOCOL from './vide-protocol';
import {EoModule, Request} from './vide-module-blueprint';



const VideFacsimileViewer = class VideFacsimileViewer extends EoModule {

    /*Constructor method*/
    constructor() {
        super();
        this._supportedPerspective = VIDE_PROTOCOL.PERSPECTIVE.FACSIMILE;
        this._supportedRequests = [];
        this._viewerStore = new Map();
        
        let stateReq = {objectType: VIDE_PROTOCOL.OBJECT.STATE, 
            contexts:[], 
            perspective: this._supportedPerspective, 
            operation: VIDE_PROTOCOL.OPERATION.VIEW};
        let notationReq = {objectType: VIDE_PROTOCOL.OBJECT.NOTATION, 
            contexts:[], 
            perspective: this._supportedPerspective, 
            operation: VIDE_PROTOCOL.OPERATION.VIEW};
        let lyricReq = {objectType: VIDE_PROTOCOL.OBJECT.LYRICS, 
            contexts:[], 
            perspective: this._supportedPerspective, 
            operation: VIDE_PROTOCOL.OPERATION.VIEW};
        let metaReq = {objectType: VIDE_PROTOCOL.OBJECT.METAMARK, 
            contexts:[], 
            perspective: this._supportedPerspective, 
            operation: VIDE_PROTOCOL.OPERATION.VIEW};
        let dirReq = {objectType: VIDE_PROTOCOL.OBJECT.DIR, 
            contexts:[], 
            perspective: this._supportedPerspective, 
            operation: VIDE_PROTOCOL.OPERATION.VIEW};
        let delReq = {objectType: VIDE_PROTOCOL.OBJECT.DEL, 
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
        return this;
    }
    
    unmount(containerID) {
        let viewer = this._viewerStore.get(containerID);
        viewer.destroy();
        this._viewerStore.delete(containerID);
        document.getElementById(containerID).innerHTML = '';
    }
    
    /** 
     * This function loads a JSON object with info about the pages available in all sources, 
     * and also loads corresponding SVG shapes, putting them in the local this._cache.
     * @param {string} editionID is the edition for which page data shall be loaded
     * returns {Object} a Promise with the json object containing info about all pages 
     */
    _getPageData(editionID) {
    
        let req = {id:editionID,type:'getPages'};
        return this.requestData(req,true).then((pageJson) => {
            
            let promises = [];
            for(let i=0; i<pageJson.sources.length; i++) {
                let source = pageJson.sources[i];
                
                for(let j=0; j<source.pages.length; j++) {
                    let page = source.pages[j];
                        
                    if(page.shapes !== '') {
                        let svgPromise = new Promise((resolve, reject) => {
                            
                            let svgReq = {id: page.shapes,type:'getPageShapesSvg'};
                            resolve(
                                this.requestData(svgReq, true).then(
                                    (svg) => {
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
        })
        
    }
    
    /** 
     * retrieves basic information about the states and scars available in the edition
     * @param {string} editionID describes the edition in question
     */
    _getStateData(editionID) {
        
        let req = {id: editionID,type:'getStates'};
        return this.requestData(req,true);
        
    }
    
    /** 
     * retrieves basic information about the measures available in the edition,
     * including info about the scars that affect a specific measure
     * @param {string} editionID describes the edition in question
     */
    _getMeasureData(editionID) {
        
        let req = {id: editionID,type:'getMeasures'};
        return this.requestData(req,true);
        
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
        
        let navOverlay = document.createElement('div');
        navOverlay.id = containerID + '_navOverlay';
        navOverlay.className = 'navOverlay';
        
        let statenav = document.createElement('div');
        statenav.id = containerID + '_stateNavigation';
        statenav.className = 'stateNavigation';
        
        let scarBox = document.createElement('div');
        scarBox.id = containerID + '_scarBox';
        scarBox.className = 'scarBox';
        
        statenav.appendChild(scarBox);
        
        let scarLabel = document.createElement('div');
        scarLabel.id = containerID + '_scarLabel';
        scarLabel.className = 'scarLabel';
        
        let prevScar = document.createElement('div');
        prevScar.className = 'prevScarBtn';
        prevScar.innerHTML = '<i class="fa fa-chevron-left" aria-hidden="true"></i>';
        
        let nextScar = document.createElement('div');
        nextScar.className = 'nextScarBtn';
        nextScar.innerHTML = '<i class="fa fa-chevron-right" aria-hidden="true"></i>';
        
        navOverlay.appendChild(prevScar);
        navOverlay.appendChild(nextScar);
        navOverlay.appendChild(scarLabel);
        navOverlay.appendChild(statenav);
        
        container.appendChild(facs);
        container.appendChild(facsNav);
        container.appendChild(facsNavMenu);
        container.appendChild(navOverlay);
        
        this._setupViewSelect(containerID + '_navOverlay', containerID);
    }
    
    /** 
     * This function sets up the Openseadragon viewer
     * @param {string} containerID describes the HTML element that contains the facsimile
     * @param {Object} json the pageJson object with info about the pages
     */
    _setupViewer(containerID) {
        
        this._setupHtml(containerID);
        
        let editionID = this._eohub.getEdition();
        let pageData = this._getPageData(editionID);
        let stateData = this._getStateData(editionID);
        let measureData = this._getMeasureData(editionID);
        
        return Promise.all([pageData, stateData,measureData]).then((results) => {
            let pageJson = results[0];
            let stateJson = results[1];
            let measureJson = results[2];
           
            if(this._cache.has(containerID + '_viewer')) {
                return Promise.resolve(this._cache.get(containerID + '_viewer'))
            } else {
                return new Promise((resolve, reject) => {
                    let pageURIs = [];
                    let i=0;
                    for(i; i<pageJson.sources.length; i++) {
                        let source = pageJson.sources[i];
                        let j=0;
                        for(j; j<source.pages.length; j++) {
                            let page = source.pages[j];
                            let uri = page.uri + '/info.json';
                            pageURIs.push(uri);
                        }
                    }
                    
                    //OSD viewer with all properties
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
                    
                    //store viewer for later use
                    this._cache.set(containerID + '_viewer', viewer)
                    
                    //do internal setup after images are loaded
                    viewer.addHandler('open', (event) => {
                        let i=0;
                        
                        for(i; i<pageJson.sources.length; i++) {
                            let source = pageJson.sources[i];
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
                                
                                let cacheKey = JSON.stringify({id: page.shapes,type:'getPageShapesSvg'});
                                
                                //if possible, load svg overlays
                                if(page.shapes !== '') {
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
                        
                        //load scar overview
                        
                        let staffCount = measureJson.staves.length;
                        
                        let m=0;
                        let n=measureJson.measures.length;
                        let scarBox = document.getElementById(containerID + '_scarBox');
                        
                        //insert measures in scarBox
                        for(m; m<n; m++) {
                            let measure = measureJson.measures[m]
                            let elem = document.createElement('div');
                            elem.classList.add('measure');
                            elem.setAttribute('title',(measure.label !== '') ? measure.label : measure.n);
                            elem.setAttribute('data-id',measure.id);
                            scarBox.append(elem);
                            
                            //handler to jump to individual measures
                            elem.addEventListener('click',(e) => {
                                console.log('please goto measure ' + measure.id);
                                let req = {
                                    id: measure.id,
                                    object: VIDE_PROTOCOL.OBJECT.NOTATION,
                                    contexts: [],
                                    perspective: VIDE_PROTOCOL.PERSPECTIVE.FACSIMILE,
                                    operation: VIDE_PROTOCOL.OPERATION.VIEW,
                                    state: {}
                                };
                                this.handleRequest(req,containerID);
                            })
                            
                            //insert overlays for scars 
                            let k=0;
                            let l=measure.scars.length;
                            for(k;k<l;k++) {
                                
                                let scar = measure.scars[k];
                                elem.classList.add('unflex')
                                
                                if(scar.complete) {
                                    let scarElem = document.createElement('div');
                                    scarElem.classList.add('scar');
                                    scarElem.classList.add('complete');
                                    scarElem.setAttribute('data-scar',scar.scar);
                                    elem.append(scarElem);
                                    
                                    //handler to jump to a specific scar
                                    scarElem.addEventListener('click',(e) => {
                                        let elem = e.currentTarget;
                                        let scarId = elem.getAttribute('data-scar');
                                        highlightScar(scarId);
                                        e.stopPropagation();
                                    })
                                } else {
                                    let p = 0;
                                    let q = scar.staves.length;
                                    for(p; p<q; p++) {
                                        let n = scar.staves[p] ;
                                        let jsn = n - 1;
                                        
                                        let label = measureJson.staves[jsn].label;
                                        if(label === '' || typeof label === 'undefined') {
                                            label = n;
                                        }
                                        
                                        let unit = (90 / staffCount);
                                        let top = jsn * unit + 5;
                                        
                                        let scarElem = document.createElement('div');
                                        scarElem.classList.add('scar');
                                        scarElem.classList.add('staff');
                                        scarElem.setAttribute('data-scar',scar.scar);
                                        scarElem.setAttribute('data-staff-n',n);
                                        scarElem.setAttribute('title',label);
                                        scarElem.style.top = top + '%';
                                        scarElem.style.height = unit + '%';
                                        
                                        elem.append(scarElem);
                                        
                                        scarElem.addEventListener('click',(e) => {
                                            let elem = e.currentTarget;
                                            let scarId = elem.getAttribute('data-scar');
                                            highlightScar(scarId);
                                            e.stopPropagation();
                                        })
                                    }
                                   
                                }
                                
                            }
                        }
                        
                        //listener for next scar button
                        document.querySelector('#' + containerID + ' .prevScarBtn').addEventListener('click',(e) => {
                            let currentScar = document.getElementById(containerID + '_scarLabel').getAttribute('data-scarId');
                            let index = stateJson.findIndex((elem) => {
                                return elem.id === currentScar;
                            });
                            let nextIndex;
                            if(index === 0) {
                                nextIndex = stateJson.length -1;
                            } else {
                                nextIndex = index - 1;
                            }
                            
                            let nextScar = stateJson[nextIndex].id;
                            this._highlightScarForNav(containerID,nextScar);
                            
                        });
                        
                        //listener for previous scar button
                        document.querySelector('#' + containerID + ' .nextScarBtn').addEventListener('click',(e) => {
                            let currentScar = document.getElementById(containerID + '_scarLabel').getAttribute('data-scarId');
                            let index = stateJson.findIndex((elem) => {
                                return elem.id === currentScar;
                            });
                            let nextIndex;
                            if(index === stateJson.length-1) {
                                nextIndex = 0;
                            } else {
                                nextIndex = index + 1;
                            }
                            
                            let nextScar = stateJson[nextIndex].id;
                            this._highlightScarForNav(containerID,nextScar);
                        });
                        
                        //listener for activating a scar
                        document.getElementById(containerID + '_scarLabel').addEventListener('click',(e) => {
                            let scarId = e.currentTarget.getAttribute('data-scarId');
                            if(scarId === null) {
                                return false;
                            }
                            
                            let scar = stateJson.find((elem) => {
                                return elem.id === scarId;  
                            });
                            
                            let firstState = scar.states[0];
                            let req = {
                                id: firstState.id,
                                object: VIDE_PROTOCOL.OBJECT.STATE,
                                contexts: [],
                                perspective: VIDE_PROTOCOL.PERSPECTIVE.FACSIMILE,
                                operation: VIDE_PROTOCOL.OPERATION.VIEW,
                                state: {}
                            };
                            //this request needs to go through vide-view-manager???           
                            this.handleRequest(req,containerID);      
                                       
                        });
                        
                        this._highlightScarForNav(containerID,stateJson[0].id);    
                        
                        resolve(viewer);
                    });
                
                //return viewer;
                });
            
            }
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
        let supportedRequests = this._eohub.getSupportedRequests();
        
        let shapeReq = {id: shape.id, edition: this._eohub.getEdition(), type: 'getShapeInfo'}
        
        this.requestData(shapeReq,false)
            .then(
                (json) => {
                    //console.log('[DEBUG]: There are ' + json.length + ' elems associated with this shape.')
                    
                    let elem = json[0];
                    
                    let requests = [];
                    let filteredRequests = supportedRequests.filter((request) => {
                        return (request.objectType === elem.type && request.perspective !== this._supportedPerspective);
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
                    
                    let closeFunc = function() {
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
        
        this._setupViewer(containerID);
        
    }
    
    _hightlightScarForNav(containerID, scarId) {
        this._removeScarHighlightForNav(containerID);
        
        let editionID = this._eohub.getEdition();
        this._getStateData(editionID).then((stateJson) => {
            let scarObj = stateJson.find((elem) => {
                return elem.id === scarId;
            });
            
            try {
                let label = document.getElementById(containerID + '_scarLabel');
                label.innerHTML = scarObj.label;
                label.setAttribute('data-scarId',scarId);
            } catch(err) {
                console.log('[ERROR] unable to highlight scar ' + scarId + ': ' + err)
            }
            
            let matchedElems = document.querySelectorAll('#' + containerID + ' .scarBox .scar[data-scar="' + scarId + '"]');
            for (let match of matchedElems) {
                match.classList.add('highlight');
            }
        });
        
    }
    
    _removeScarHighlightForNav(containerID) {
        let label = document.getElementById(containerID + '_scarLabel');
        label.innerHTML = '';
        label.removeAttribute('data-scarId');
        
        let matchedElems = document.querySelectorAll('#' + containerID + ' .scarBox .scar.highlight');
        for (let match of matchedElems) {
            match.classList.remove('highlight');
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
    
    handleRequest(request,containerID) {
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
