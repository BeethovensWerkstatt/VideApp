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
        this._pageMap = new Map();
        
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
        
        this._overlayDefaultOpacity = .7;
        this._showMeasureNumbersMinimumSize = .3;
        
        return this;
    }
    
    unmount(containerID) {
        //console.log('---------- Unmounting facsimileViewer')
        let viewer = this._cache.get(containerID + '_facsViewer')
        viewer.destroy();
        this._tiledImages.clear();
        this._cache.delete(containerID + '_facsViewer');
        
        document.getElementById(containerID).innerHTML = '';
        //console.log('---------- Unmounted facsimileViewer: ' + containerID + '_facsViewer | ' + this._cache.has(containerID + '_facsViewer'))
        
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
                    let uri = page.facsRef + '/info.json';
                    this._pageMap.set(uri,page);
                    
                    //retrieve page shapes SVGs
                    if(page.shapesRef !== '') {
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
                    
                    //retrieve page background SVGs
                    if(page.pageRef !== '') {
                        //let s0 = performance.now();
                        let svgPromise = new Promise((resolve, reject) => {
                            
                            let svgReq = {id: page.pageRef,type:'getPageShapesSvg'};
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
                    
                    for(let p=0;p<page.patches.length;p++) {
                        for(let q=0;q<page.patches[p].pages.length;q++) {
                            
                            let patch = page.patches[p].pages[q];
                            let uri = patch.facsRef + '/info.json';
                            this._pageMap.set(uri,patch);
                            
                            if(patch.shapesRef !== '') {
                                //let s0 = performance.now();
                                let svgPromise = new Promise((resolve, reject) => {
                                    
                                    let svgReq = {id: patch.shapesRef,type:'getPageShapesSvg'};
                                    resolve(
                                        this.requestData(svgReq, true).then(
                                            (svg) => {
                                                //let s1 = performance.now();
                                                //console.log('[DEBUG] loading svg for ' + page.label + ' took ' + (s1 - s0) + ' millisecs');
                                                return Promise.resolve(patch.id);
                                            }
                                        )
                                    );
                                });
                            
                                promises.push(svgPromise);
                            }
                            
                            if(patch.pageRef !== '') {
                                //let s0 = performance.now();
                                let svgPromise = new Promise((resolve, reject) => {
                                    
                                    let svgReq = {id: patch.pageRef,type:'getPageShapesSvg'};
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
        
        let facsMenu = document.createElement('div');
        facsMenu.id = containerID + '_navOverlayMenu';
        facsMenu.className = 'viewMenu';
        
        facsNavMenu.innerHTML = '<div id="' + containerID + '_zoomIn" class="menuButton"><i class="fa fa-plus"></i></div>' +
            '<div id="' + containerID + '_zoomOut" class="menuButton"><i class="fa fa-minus"></i></div>' + 
            '<div id="' + containerID + '_zoomHome" class="menuButton"><i class="fa fa-arrows-alt"></i></div>' + 
            '<div id="' + containerID + '_rotateLeft" class="menuButton"><i class="fa fa-rotate-left"></i></div>' + 
            '<div id="' + containerID + '_rotateRight" class="menuButton"><i class="fa fa-rotate-right"></i></div>' +
            '<input id="' + containerID + '_visSlider" class="visSlider" type="range" name="vis" min="0" max="1" step="0.1" value="' + this._overlayDefaultOpacity + '">' + 
            '<div id="' + containerID + '_showMeasureNumbersBtn" class="menuRow"><i class="fa fa-fw fa-check-square-o" aria-hidden="true"></i> <span data-i18n-text="show_MeasureNumbers">' + this._eohub.getI18nString('show_MeasureNumbers') + '</span></div>';
        
        container.appendChild(facs);
        container.appendChild(facsNav);
        container.appendChild(facsNavMenu);
        container.appendChild(facsMenu);
        
        this._setupNavHtml(containerID);
        
        //show measure numbers btn
        let showMeasureNumbersBtn = document.getElementById(containerID + '_showMeasureNumbersBtn');
        
        showMeasureNumbersBtn.addEventListener('click',(e) => {
            this._toggleMeasureNumbers(containerID);
        })
        
        //listeners for background slider
        document.getElementById(containerID + '_visSlider').addEventListener('change', (e) => {
            let val = document.getElementById(containerID + '_visSlider').value;
            let boxes = document.querySelectorAll('#' + containerID + ' .svgBox, #' + containerID + ' .pageBack');
            
            for(let i = 0; i<boxes.length; i++) {
                boxes[i].style.opacity = val;
            }
            
            this._confirmView(containerID,this._getModuleState(containerID));
        });
        
        document.getElementById(containerID + '_visSlider').addEventListener('input', (e) => {
            let val = document.getElementById(containerID + '_visSlider').value;
            let boxes = document.querySelectorAll('#' + containerID + ' .svgBox, #' + containerID + ' .pageBack');
            
            for(let i = 0; i<boxes.length; i++) {
                boxes[i].style.opacity = val;
            }
            
            //this._confirmView(containerID,this._getModuleState(containerID));
        });
    }
    
    _toggleMeasureNumbers(containerID) {
        document.getElementById(containerID).classList.toggle('hideMeasureNumbers');
        document.querySelector('#' + containerID + '_showMeasureNumbersBtn .fa').classList.toggle('fa-square-o');
        document.querySelector('#' + containerID + '_showMeasureNumbersBtn .fa').classList.toggle('fa-check-square-o');
    }
    
    _openSingleScar(containerID, scarId, currentState = '', activeStates = [],overlayOpacity = this._overlayDefaultOpacity) {
        super._openSingleScar(containerID, scarId, currentState,activeStates);
        
        //console.log('-----calling openSingleScar with value: ' + overlayOpacity)
        if(this._feature) {
            document.getElementById(containerID + '_visSlider').value = overlayOpacity;
            document.getElementById(containerID + '_visSlider').dispatchEvent(new Event('change'));
            document.getElementById(containerID + '_visSlider').classList.add('visible');    
        }
    }
    
    _closeSingleScar(containerID) {
        super._closeSingleScar(containerID);
        
        if(this._feature) {
           document.getElementById(containerID + '_visSlider').value = 0;
           document.getElementById(containerID + '_visSlider').dispatchEvent(new Event('change'));
           document.getElementById(containerID + '_visSlider').classList.remove('visible');
        }
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
        
        //let t0 = performance.now();
        return Promise.all([pageData, stateData,measureData]).then((results) => {
            let pageJson = results[0];
            let stateJson = results[1];
            let measureJson = results[2];
            
            //let t1 = performance.now();
            //    console.log('[DEBUG] setupViewer took ' + (t1 - t0) + ' millisecs');
            
            if(this._cache.has(containerID + '_facsViewer') && this._cache.get(containerID + '_facsViewer') !== null) {
                
                //console.log('%%% Re-using existing viewer: ' + containerID + '_facsViewer')
            
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
                            
                            this._animatePage(containerID,tiledImage,newPos);
                            
                        }
                    } else {
                    
                        //add pages or patches which aren't on stage yet
                        
                        this._addPage(containerID,newPos);
                        
                    }
                    
                }
                
                //remove things which aren't required anymore
                for(let [uri, existingImage] of this._tiledImages.entries()) {
                    if(!newPositions.positions.has(uri)) {
                        this._removePage(containerID,existingImage,uri);
                    }
                }
                
                //
                return Promise.resolve(this._cache.get(containerID + '_facsViewer'))
            
            //set up new viewer
            } else {
            
                //console.log('%%% Setting up new viewer: ' + containerID + '_facsViewer')
                
                let positions = this._getRequiredPositions(containerID, activeStateID, otherStates,pageJson).positions;
                this._initializeViewer(containerID,positions,pageJson).then(
                    //console.log('____________________ this._initializeViewer complete __________________')
                )
            }
        });
        
    }
    
    _addPage(containerID,positionObject) {
    
        //code here doubles parts of initializeViewer -> improve that?
        
        let viewer = this._cache.get(containerID + '_facsViewer');
        
        //insert page on the left margin, slightly above the final position, then animate to final position
        viewer.addTiledImage({
            tileSource: positionObject.uri,
            x: - 100,
            y: positionObject.y - 100,
            width: positionObject.width,
            success: (e) => {
                
                this._tiledImages.set(positionObject.uri,e.item);
                e.item.setPosition(new OpenSeadragon.Point(positionObject.x,positionObject.y),false);
                
                //adding labels etc. from here on
                let page = this._pageMap.get(positionObject.uri);
                let bounds = e.item.getBounds();
                
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
                
                this._loadMeasureLabels(page,bounds,viewer,containerID);
                
                //if possible, load svg overlays for page background
                if(page.pageRef !== '') {
                    let cacheKeyPage = JSON.stringify({id: page.pageRef,type:'getPageShapesSvg'});
                    if(this._cache.has(cacheKeyPage)) {
                        let svgBox = document.createElement('div');
                        svgBox.className = 'pageBack';
                        svgBox.id = containerID + '_' + page.id + '_pageBack';
                        svgBox.innerHTML = this._cache.get(cacheKeyPage);
                        if(!this._feature) {
                            svgBox.style.opacity = this._overlayDefaultOpacity;
                        }
                        viewer.addOverlay({
                            element: svgBox,
                            y: bounds.y,
                            x: bounds.x,
                            width: bounds.width,
                            height: bounds.height,
                            placement: 'TOP_LEFT'
                        });
                        
                    } else {
                        console.log('[ERROR] failed to load things in correct order – svg page backgorund not available for ' + page.id + ' (yet)');
                    }
                } else {
                    console.log('no page background to retrieve for page ' + page.label);
                }
                
                //if possible, load svg overlays
                if(page.shapesRef !== '') {
                    let cacheKey = JSON.stringify({id: page.shapesRef,type:'getPageShapesSvg'});
                    if(this._cache.has(cacheKey)) {
                        let svgBox = document.createElement('div');
                        svgBox.className = 'svgBox';
                        svgBox.id = containerID + '_' + page.id + '_shapes';
                        svgBox.innerHTML = this._cache.get(cacheKey);
                        if(!this._feature) {
                            svgBox.style.opacity = this._overlayDefaultOpacity;
                        }
                        viewer.addOverlay({
                            element: svgBox,
                            y: bounds.y,
                            x: bounds.x,
                            width: bounds.width,
                            height: bounds.height,
                            placement: 'TOP_LEFT'
                        });
                        
                        //handler for svg shapes being clicked
                        let onClick = (event) => {
                            let shape = event.target;
                            this._clickShape(containerID, viewer, shape, event);
                            event.preventDefault(); 
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
        });
    }
    
    _removePage(containerID,tiledImage,uri) {
        try {
            //get required objects
            let viewer = this._cache.get(containerID + '_facsViewer'); 
            let page = this._pageMap.get(uri);
            
            this._tiledImages.delete(uri);
            
            viewer.world.removeItem(tiledImage);
            viewer.removeOverlay(containerID + '_pageLabel_' + page.id);
            viewer.removeOverlay(containerID + '_' + page.id + '_shapes');
            viewer.removeOverlay(containerID + '_' + page.id + '_pageBack');
            this._removeMeasureLabels(page,viewer,containerID);
            
            
        } catch(err) {
            console.log('[ERROR] Failed to remove page ' + uri + ' from ' + containerID + ': ' + err);
        }
        
    }
    
    _animatePage(containerID,tiledImage,positionObject) {
    
        try {
            let viewer = this._cache.get(containerID + '_facsViewer'); 
            let page = this._pageMap.get(positionObject.uri);
    
            let oldBounds = tiledImage.getBounds();
            let x = typeof positionObject.newX === 'number' ? positionObject.newX : positionObject.x;
            let y = typeof positionObject.newY === 'number' ? positionObject.newY : positionObject.y;
            
            let pageLabel = viewer.getOverlayById(containerID + '_pageLabel_' + page.id);
            let pageOverlay = viewer.getOverlayById(containerID + '_' + page.id + '_pageBack');
            let shapesOverlay = viewer.getOverlayById(containerID + '_' + page.id + '_shapes');
            
            let labelBounds = pageLabel.getBounds(viewer.viewport);
            let labelX = labelBounds.x - oldBounds.x + x;
            let labelY = labelBounds.y - oldBounds.y + y;
            
            let shapesBounds = shapesOverlay.getBounds(viewer.viewport);
            let shapesX = shapesBounds.x - oldBounds.x + x;
            let shapesY = shapesBounds.y - oldBounds.y + y;
            
            let pageBounds = pageOverlay.getBounds(viewer.viewport);
            let pageX = pageBounds.x - oldBounds.x + x;
            let pageY = pageBounds.y - oldBounds.y + y;
            
            this._removeMeasureLabels(page,viewer,containerID);
            
            tiledImage.setPosition(new OpenSeadragon.Point(x,y),false);
            pageLabel.update(new OpenSeadragon.Point(labelX,labelY));
            pageOverlay.update(new OpenSeadragon.Point(shapesX,shapesY));
            shapesOverlay.update(new OpenSeadragon.Point(shapesX,shapesY));
            
            let newPageBounds = {x: pageX,y: pageY}
            this._loadMeasureLabels(page,newPageBounds,viewer,containerID);
            
        } catch(err) {
            console.log('[ERROR] Unable to animate page ' + positionObject.uri + ': ' + err);
        }
        
        
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
    _initializeViewer(containerID,positions,pageJson) {
        
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
                animationTime: 1.5,
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
            this._cache.set(containerID + '_facsViewer', viewer)
            
            //log position of view when view changes
            viewer.addHandler('animation-finish',(event) => {
                
                this._confirmView(containerID,this._getModuleState(containerID));
                
                this._adjustMeasureNumberDisplay(containerID,viewer);
            });
            
            //do internal setup after images are loaded
            viewer.addHandler('open', (event) => {
                let i=0;
                let pageCount = 0;
                
                for(i; i<pageJson.sources.length; i++) {
                    let source = pageJson.sources[i];
                    for(let j=0; j<source.pages.length; j++) {
                        let page = source.pages[j];
                        
                        let tiledImage = this._tiledImages.get(page.facsRef + '/info.json');
                        let bounds = tiledImage.getBounds();
                        
                        pageCount++;
                        
                        //set source label
                        
                        let rasterY = pageJson.maxDimensions.height + 50;
                         
                        if(j===0) {
                            
                            let sourceLabel = document.createElement('div');
                            sourceLabel.id = containerID + '_pageLabel_' + source.id;
                            sourceLabel.className = 'pageLabel';
                            sourceLabel.innerHTML = source.label;
                            
                            viewer.addOverlay({
                                element: sourceLabel,
                                y: i * rasterY + (rasterY / 2),
                                x: -10,
                                placement: 'RIGHT'
                            });
                            
                        }
                        
                        //set page label
                        let existingLabel = viewer.getOverlayById(containerID + '_pageLabel_' + page.id);
                        //add label only once (in case of moving pages)
                        if(existingLabel === null) {
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
                        }
                        
                        //if possible, load svg overlays for page backgrounds                        
                        let existingPage = viewer.getOverlayById(containerID + '_' + page.id + '_pageBack');
                        if(page.pageRef !== '' && existingPage === null) {
                            let cacheKeyPage = JSON.stringify({id: page.pageRef,type:'getPageShapesSvg'});
                            if(this._cache.has(cacheKeyPage)) {
                                let svgBox = document.createElement('div');
                                svgBox.className = 'pageBack';
                                svgBox.id = containerID + '_' + page.id + '_pageBack';
                                svgBox.innerHTML = this._cache.get(cacheKeyPage);
                                if(!this._feature) {
                                    svgBox.style.opacity = this._overlayDefaultOpacity;
                                } 
                                viewer.addOverlay({
                                    element: svgBox,
                                    y: bounds.y,
                                    x: bounds.x,
                                    width: bounds.width,
                                    height: bounds.height,
                                    placement: 'TOP_LEFT'
                                });
                                
                            } else {
                                console.log('[ERROR] failed to load things in correct order – svg page backgorund not available for ' + page.id + ' (yet)');
                            }
                        } else {
                            console.log('no page background to retrieve for page ' + page.label);
                        }
                        
                        //if possible, load svg overlays
                        let existingShapes = viewer.getOverlayById(containerID + '_' + page.id + '_shapes');
                        if(page.shapesRef !== '' && existingShapes === null) {
                            let cacheKey = JSON.stringify({id: page.shapesRef,type:'getPageShapesSvg'});
                            if(this._cache.has(cacheKey)) {
                            
                                let svgBox = document.createElement('div');
                                svgBox.className = 'svgBox';
                                svgBox.id = containerID + '_' + page.id + '_shapes';
                                svgBox.innerHTML = this._cache.get(cacheKey);
                                if(!this._feature) {
                                    svgBox.style.opacity = this._overlayDefaultOpacity;
                                } 
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
                                    let shape = e.currentTarget;
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
                        
                        this._loadMeasureLabels(page,bounds,viewer,containerID);
                        
                    }
                }
                
                resolve(viewer);
            });
            
            
        });
    }
    
    //load measure overlays
    _loadMeasureLabels(page,bounds,viewer,containerID) {
        
        //decide what to render initially
        let keys = [...this._tiledImages.keys()];
        let image = this._tiledImages.get(keys[0]);
        let ratio = image.getBounds().width * viewer.viewport.getZoom();
        let showSummary = (ratio < this._showMeasureNumbersMinimumSize);
        
        //prepare for summary
        let lowestMeasure = { n: parseInt(page.measures[0].n), label: page.measures[0].label }
        let highestMeasure = { n: parseInt(page.measures[0].n), label: page.measures[0].label }
        
        for(let i=0;i<page.measures.length;i++) {
            let measure = page.measures[i];
            
            //prepare for summary
            if(parseInt(measure.n) <= lowestMeasure.n) {
                lowestMeasure.n = parseInt(measure.n);
                lowestMeasure.label = ((measure.label !== '') ? measure.label : measure.n);
            }            
            if(parseInt(measure.n) >= highestMeasure.n) {
                highestMeasure.n = parseInt(measure.n);
                highestMeasure.label = ((measure.label !== '') ? measure.label : measure.n);
            }
            
            let measureLabel = document.createElement('div');
            measureLabel.className = 'measureLabel';
            measureLabel.id = containerID + '_measureLabel_' + measure.zone;
            if(showSummary) {
                measureLabel.style.display = 'none';   
            }
            let label = '' + ((measure.label !== '') ? measure.label : measure.n);
            if(label === '') {
                label = 'ERROR';
            }
            measureLabel.innerHTML = label;
            
            let x = bounds.x + ((measure.ulx + measure.width / 2) / page.dpm);
            let y = bounds.y + ((measure.uly + measure.height / 2) / page.dpm);
            
            viewer.addOverlay({
                element: measureLabel,
                x: x,
                y: y,
                placement: 'CENTER'
            });
            
            measureLabel.addEventListener('mouseenter', (e) => {
                
                if(document.getElementById(containerID + '_measureRect') !== null) {
                    viewer.removeOverlay(containerID + '_measureRect');
                }
                
                let measureRect = document.createElement('div');
                measureRect.className = 'measureRect';
                measureRect.id = containerID + '_measureRect';
                
                let x = bounds.x + (measure.ulx / page.dpm);
                let y = bounds.y + (measure.uly / page.dpm);
                let width = measure.width / page.dpm;
                let height = measure.height / page.dpm;
                
                viewer.addOverlay({
                    element: measureRect,
                    x: x,
                    y: y,
                    width: width,
                    height: height,
                    placement: 'TOP_LEFT'
                });
                
                measureRect.addEventListener('mouseleave', (e) => {
                
                    viewer.removeOverlay(containerID + '_measureRect');
                    
                });
            });
            
        }
        
        //create summary of measures on page
        let measuresSummary = document.createElement('div');
        measuresSummary.className = 'measureSummary';
        measuresSummary.id = containerID + '_measuresSummary_' + page.id;
        if(!showSummary) {
                measuresSummary.style.display = 'none';   
            }
        let label = lowestMeasure.label + ' – ' + highestMeasure.label;
        measuresSummary.innerHTML = label;
        let x = bounds.x + (bounds.width / 2);
        let y = bounds.y + (bounds.height / 2);
        
        viewer.addOverlay({
            element: measuresSummary,
            x: x,
            y: y,
            placement: 'CENTER'
        });
    }
    
    _removeMeasureLabels(page,viewer,containerID) {
        
        for(let i=0;i<page.measures.length;i++) {
            try {
                let measure = page.measures[i];
                viewer.removeOverlay(containerID + '_measureLabel_' + measure.zone);
                //console.log('removed ' + containerID + '_measureLabel_' + measure.zone)
            } catch(err) {
                console.log('[ERROR] Unable to remove measure label for ' + measure.n)
            }
            
        }
    }
    
    //removes measure numbers if pages are too small
    _adjustMeasureNumberDisplay(containerID,viewer) {
        let keys = [...this._tiledImages.keys()];
        let image = this._tiledImages.get(keys[0]);
        
        let ratio = image.getBounds().width * viewer.viewport.getZoom();
        //console.log('--------------------- ratio is ' + ratio)
        
        if(ratio < this._showMeasureNumbersMinimumSize) {
            let labels = document.querySelectorAll('#' + containerID + ' .measureLabel');
            for(let i=0;i<labels.length;i++) {
                labels[i].style.display = 'none';
            }            
            let summaries = document.querySelectorAll('#' + containerID + ' .measureSummary');
            for(let i=0;i<summaries.length;i++) {
                summaries[i].style.display = 'block';
            }
        } else {
            let labels = document.querySelectorAll('#' + containerID + ' .measureLabel');
            for(let i=0;i<labels.length;i++) {
                labels[i].style.display = 'block';
            }
            let summaries = document.querySelectorAll('#' + containerID + ' .measureSummary');
            for(let i=0;i<summaries.length;i++) {
                summaries[i].style.display = 'none';
            }
        }
    }
        
    
/* **************************************************************************************** */
    
    _focusShape(containerID, viewer, shape) {
        let rect = this._getShapeRect(containerID, viewer, shape);
        //console.log('[DEBUG] clicked on shape ' + shape.id);
        
        if(rect !== null) {
            /*viewer.viewport.fitBoundsWithConstraints(rect);
            let oldState = this._getLastRequest(containerID);
            let newState = Object.assign({}, oldState, {state: {bounds: rect}})
            
            this._confirmView(newState,containerID);*/
            
            //console.log('---------------- missing a rect')
        }
    }
    
    _clickShape(containerID, viewer, shape, event) {
        let supportedRequests = this._eohub.getSupportedRequests();
        
        let shapeReq = {id: shape.id, edition: this._eohub.getEdition(), type: 'getShapeInfo'}
                
        this.requestData(shapeReq,false)
            .then(
                (json) => {
                    
                    console.log('--------------776')
                    console.log(json)
                    console.log('')
                    
                    let elem = json[0];
                    
                    let requests = [];
                    let filteredRequests = supportedRequests.filter((request) => {
                        return (request.object === elem.type && request.perspective !== this._supportedPerspective);
                    }); 
                    
                    console.log('---------------777 filtered requests:')
                    console.log(filteredRequests)
                    
                    
                    filteredRequests.forEach((request, j) => {
                        let req = Object.assign({}, request);
                        req.id = elem.id;
                        if(request.perspective === VIDE_PROTOCOL.PERSPECTIVE.TRANSCRIPTION) {
                            let states = elem.states.filter(function(state){
                                return state.type !== 'del';
                            });
                            
                            //handle notes that are part of a state
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
                            
                            //handle notes which aren't part of a state'
                            if(elem.states.length === 0) {
                                let reqCopy = {
                                    object: req.object, 
                                    id: req.id,
                                    operation: req.operation,
                                    perspective: req.perspective,
                                    contexts: []
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
    
    _highlightState(state, containerID, className = 'active') {
        
        let viewer = this._cache.get(containerID + '_facsViewer');
        
        if(state.shapes.length === 0) {
            return false;
        }
        
        try {
            let baseRect = this._getShapeRect(containerID, viewer, document.querySelector('#' + containerID + ' #' + state.shapes[0]));
            
            let problems = [];
            
            for(let i=0; i<state.shapes.length; i++) {
                let shape = document.querySelector('#' + containerID + ' #' + state.shapes[i]);
                try {
                    shape.classList.add(className);
                    let rect = this._getShapeRect(containerID, viewer, shape);
                    baseRect = baseRect.union(rect);  
                } catch(error) {
                    problems.push({shape:state.shapes[i],state: state.id,error: error})
                }
            }
            
            if(problems.length > 0) {
                console.log('[ERROR] found ' + problems.length + ' problems when highlighting state ' + state.label);                
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
        
        setTimeout(() => {
            for(let i=0; i<shapesArray.length; i++) {
                try {
                    let shape = document.querySelector('#' + containerID + ' #' + shapesArray[i]);
                    shape.classList.remove('current');    
                } catch(err) {
                    console.log('[ERROR] invalid shape ' + shapesArray[i] + ': ' + err);
                }
                
            }
        },10000);
        
        viewer.viewport.fitBoundsWithConstraints(baseRect);
    }
    
    _getShapeRect(containerID, viewer, input) {
        //decide if I have an ID or the element itself already
        
        if(input === null) {
            console.log('[ERROR] Unable to retrieve shapeRect for input of type ' + typeof input + ':')
            console.log(input)
            return null;
        }
        
        let elem;
        if(typeof input === 'string') {
            input = input.replace(/#/, '');
            elem = document.querySelector('#' + containerID + ' #' + input);
            if(elem === null) {
                console.log('[ERROR] Unable to retrieve shapeRect for input of type ' + typeof input + ':')
                console.log(input)
                return null;
            }
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
    
    _getModuleState(containerID) {
        
        let obj = {};
        
        let viewer = this._cache.get(containerID + '_facsViewer');
        if(typeof viewer !== 'undefined') {
            obj.bounds = viewer.viewport.getBounds();
        }
        
        if(document.getElementById(containerID + '_navOverlay').classList.contains('scarOpen')) {
            try {
                let overlayOpacity = document.getElementById(containerID + '_visSlider').value;
                obj.overlayOpacity = overlayOpacity;
                obj.mode = 'scar';
            } catch(err) {
                console.log('Unable to retrieve overlay opacity')
            }
        } else {
            obj.mode = 'overview';
        }
        
        return obj;
        
    }
    
    handleRequest(containerID,request,state = {}) {
        
        /*console.log('[INFO] received the following request for VideFacsimileViewer at ' + containerID + ':')
        console.log(containerID)
        console.log(request)
        console.log(state)*/
        
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
            
            //todo: should this happen later?
            //this._confirmView(containerID,this._getModuleState(containerID));
            
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
                        //TODO
                        /*console.log('')
                        console.log('I need to highlight rect: ')
                        console.log(json.dimensions);*/
                    } else {
                        try {
                            setTimeout(()=> {
                                let viewer = this._cache.get(containerID + '_facsViewer');
                                
                                this.highlightItem(viewer,containerID,json.shapes);
                                
                            }, 1000)    
                        } catch(err) {
                            console.log('[ERROR] Unable to highlight ' + request.id)
                            console.log(json)
                        }
                        
                          
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
                    
                    //restore overlay opacity
                    if(typeof request.state !== 'undefined' && typeof request.state.overlayOpacity !== 'undefined') {
                        this._openSingleScar(containerID,scar.id,request.id,activeStates,request.state.overlayOpacity);
                    } else {
                        this._openSingleScar(containerID,scar.id,request.id,activeStates);
                    }
                    
                    //highlight states in facsimile
                    
                    this._removeSvgHighlights(containerID);
                    i=0; 
                    let currentHandled = false;
                    
                    for(i;i<activeStates.length;i++) {
                        
                        let stateObj = scar.states.find((obj) => {
                            return obj.id === activeStates[i]; 
                        });
                        
                        if(stateObj.id !== request.id) {
                            this._highlightState(stateObj, containerID, 'active')
                        } else {
                            currentHandled = true;
                            this._highlightState(stateObj, containerID, 'current')
                        }
                    }
                    
                    if(!currentHandled) {
                        let stateObj = scar.states.find((obj) => {
                            return obj.id === request.id; 
                        });
                        this._highlightState(stateObj, containerID, 'current')
                    }
                    
                });
            }
        });
        
        
    }
    
};

export default VideFacsimileViewer;
