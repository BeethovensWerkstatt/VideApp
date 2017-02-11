import 'babel-polyfill';
import VIDE_PROTOCOL from './vide-protocol';
import {EoModule, Request} from './vide-module-blueprint';


const VideReconstructionViewer = class VideReconstructionViewer extends EoModule {

    /*Constructor method*/
    constructor() {
        super();
        this._supportedPerspective = EO_Protocol.Perspective.PERSPECTIVE_RECONSTRUCTION;
        this._supportedRequests = [];
        
        this._viewerStore = new Map();
        this._stateStore = new Map();
        this._pageJsonStore = new Map();
        this._svgStore = new Map();
        
        this._key = 'videReconstructionViewer';
        this._serverConfig = {host: 'http://localhost', port: ':3549', basepath:'/'};
        return this;
    }
    
    unmount(containerID) {
        containerID = containerID.replace(/videReconstructionViewer/, 'VIEWTYPE_RECONSTRUCTIONVIEW');    
        console.log('----------unmounting reconstructionView at ' + containerID);
        
        try {
            if(this._viewerStore.has(containerID)) {
                let viewer = this._viewerStore.get(containerID);
                viewer.destroy();
            }
        } catch(err) {
            console.log('[ERROR] Unable to destroy viewer for reconstructionView: ' + err);
        }
        
        document.getElementById(containerID).innerHTML = '';
    }
    
    _prepareHTML(containerID) {
        let container = document.getElementById(containerID);
        
        if(container.querySelector('.reconstructionView') !== null) {
            return Promise.resolve(container);    
        } else {
            let vb = document.createElement('div');
            vb.className = 'reconstructionBox';
            vb.id = containerID + '_reconstructionBox'; 
            
            
            let vn = document.createElement('div');
            vn.className = 'viewNavigation';
            vn.id = containerID + '_viewNavigation'; 
            
            let navigator = document.createElement('div');
            navigator.id = containerID + '_reconstructionNavigator';
            navigator.className = 'reconstructionNavigator';
            
            vn.appendChild(navigator);
            
            let menubar = document.createElement('div');
            menubar.id = containerID + '_menubar';
            menubar.className = 'menubar';
            
            menubar.innerHTML = '<div id="' + containerID + '_zoomIn" class="menuButton"><i class="fa fa-plus"></i></div>' +
                '<div id="' + containerID + '_zoomOut" class="menuButton"><i class="fa fa-minus"></i></div>' + 
                '<div id="' + containerID + '_zoomHome" class="menuButton"><i class="fa fa-arrows-alt"></i></div>' + 
                '<div id="' + containerID + '_rotateLeft" class="menuButton"><i class="fa fa-rotate-left"></i></div>' + 
                '<div id="' + containerID + '_rotateRight" class="menuButton"><i class="fa fa-rotate-right"></i></div>' + 
                '<input id="' + containerID + '_visSlider" type="range" name="vis" min="0" max="1" step="0.1" value="0">';
            
            vn.appendChild(menubar);
            
            let vnScarSel = document.createElement('div');
            vnScarSel.className = 'scarSelection';
            
            let vnDropdown = document.createElement('select');
            vnDropdown.id = containerID + '_dropdown';
            
            vnScarSel.appendChild(vnDropdown);
            vn.appendChild(vnScarSel);
            
            let scarBox = document.createElement('div');
            scarBox.className = 'scarBox';
            scarBox.id = containerID + '_scarBox';
            
            vn.appendChild(scarBox);
            
            let tv = document.createElement('div');
            tv.className = 'reconstructionView';
            
            tv.appendChild(vb);
            tv.appendChild(vn);
            
            document.getElementById(containerID).innerHTML = '';
            document.getElementById(containerID).appendChild(tv);
            
            document.getElementById(containerID + '_visSlider').addEventListener('change', (e) => {
                let val = 1 - document.getElementById(containerID + '_visSlider').value;
                let boxes = document.querySelectorAll('#' + containerID + ' .svgBox');
                
                for(let i = 0; i<boxes.length; i++) {
                    boxes[i].style.opacity = val;
                }
            });
            
            document.getElementById(containerID + '_visSlider').addEventListener('input', (e) => {
                let val = 1 - document.getElementById(containerID + '_visSlider').value;
                let boxes = document.querySelectorAll('#' + containerID + ' .svgBox');
                
                for(let i = 0; i<boxes.length; i++) {
                    boxes[i].style.opacity = val;
                }
            });
            
            return Promise.resolve(tv);
        }
    }
    
    _setupViewer(containerID, sources, activeStateIDs, mainStateID, stateMap) {
        let self = this;
        let getSVG = this._getSVG.bind(this);
        
        let invisiblePageOpacity = 0;
        
        let viewer;
        
        //get or create new viewer
        if(this._viewerStore.has(containerID)) {
            viewer = this._viewerStore.get(containerID);
        } else {
            viewer = OpenSeadragon({
                id: containerID + '_reconstructionBox',
                tileSources: [],
                sequenceMode: false,
                showReferenceStrip: true,
                showRotationControl: true,
                showNavigator: true,
                navigatorRotate: false,
                navigatorId: containerID + '_reconstructionNavigator',
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
                }
            });
        }
        
        let pageSetup = [];
        let pageIndex = new Map();
        
        // set up pages
        if(typeof viewer.pageIndex === 'undefined') {
            //get max sizes for pages
            if(typeof sources.maxWidth === 'undefined') {
                let maxWidth = 0;
                let maxHeight = 0;
                
                for(let i=0; i<sources.length; i++) {
                    let source = sources[i];
                    for(let j=0; j<source.pages.length; j++) {
                        let page = source.pages[j];
                        maxHeight = Math.max(maxHeight, page.height_mm);
                        maxWidth = Math.max(maxWidth, page.width_mm);
                    }
                }
                
                sources.maxWidth = maxWidth;
                sources.maxHeight = maxHeight;
            }
            
            let pageCounter = 0;
            
            //load images to pageSetup
            for(let i=0; i<sources.length; i++) {
                let source = sources[i];
                
                for(let j=0; j<source.pages.length; j++) {
                    let page = source.pages[j];
                
                    pageIndex.set(source.id + '_' + page.id, pageCounter);
                    pageCounter++;
                    
                    let baseXpos = j * sources.maxWidth;
                
                    let xPos = (page.type === 'recto') ? baseXpos : (baseXpos + sources.maxWidth - page.width_mm); 
                    let yPos = (i) * (sources.maxHeight * 1.1) + sources.maxHeight - (page.height_mm / 2);
                    
                    let isVisible = page.visible ? true : false;
                    
                    //iterate all states if page is visible
                    for(let k=0; k<activeStateIDs.length; k++) {
                        let state = stateMap.get(activeStateIDs[k]);
                        for(let l=0; l<state.transfers.length; l++) {
                            if(state.transfers[l].originSource === source.id) {
                                if(state.transfers[l].surfaces.indexOf(page.id) !== -1) {
                                    isVisible = false;
                                }
                            }
                            
                            if(state.transfers[l].targetSource === source.id) {
                                if(state.transfers[l].surfaces.indexOf(page.id) !== -1) {
                                    isVisible = true;
                                }
                            }
                        }
                    }
                    
                    //check current state for visibility
                    let mainState = stateMap.get(mainStateID);
                    for(let l=0; l<mainState.transfers.length; l++) {
                        if(mainState.transfers[l].originSource === source.id) {
                            if(mainState.transfers[l].surfaces.indexOf(page.id) !== -1) {
                                isVisible = false;
                            }
                        }
                        
                        if(mainState.transfers[l].targetSource === source.id) {
                            if(mainState.transfers[l].surfaces.indexOf(page.id) !== -1) {
                                isVisible = true;
                            }
                        }
                    }
                    
                    pageSetup.push({
                        tileSource: page.facsRef + '/info.json',
                        x: xPos,
                        y: yPos,
                        width:page.width_mm,
                        opacity: (isVisible) ? 1 : invisiblePageOpacity
                    });    
                    
                    //check for patches
                    //todo: as of yet, only a single-page patch is supported
                    
                    for(let p = 0; p<page.patches.length; p++) {
                        let patch = page.patches[p];
                        
                        let patchVisible = patch.isAdded ? false : true;
                        let patchOffX = patch.offsetX;
                        let patchOffY = patch.offsetY;
                        
                        if(activeStateIDs.indexOf(patch.enterState) !== -1) {
                            patchVisible = true;
                        }
                        
                        //todo: animating patch needs to be inserted here
                        if(mainStateID === patch.enterState) {
                            patchVisible = true;
                        }
                        
                        let patchedPage;
                        for(let l = 0; l<patch.pages.length; l++) {
                            if(patch.pages[l].type === 'recto') {
                                patchedPage = patch.pages[l];
                            }
                        }
                        
                        pageIndex.set(source.id + '_' + patchedPage.id, pageCounter);
                        pageCounter++;
                        
                        pageSetup.push({
                            tileSource: patchedPage.facsRef + '/info.json',
                            x: xPos + patchOffX,
                            y: yPos + patchOffY,
                            width: patchedPage.width_mm,
                            opacity: (patchVisible) ? 1 : invisiblePageOpacity
                        });
                    }
                }
            }
        } else {
 //adjust existing page setup
            
            pageIndex = viewer.pageIndex;
            let stateArray = activeStateIDs.slice(0);
            stateArray.push(mainStateID);
            
            for(let i=0; i<sources.length; i++) {
                let source = sources[i];
                
                for(let j=0; j<source.pages.length; j++) {
                    let page = source.pages[j];
                    
                    let isVisible = page.visible ? true : false;
                    let isOnCurrentState = false;
                    
                    //iterate all states if page is visible
                    for(let k=0; k<stateArray.length; k++) {
                        let state = stateMap.get(stateArray[k]);
                        for(let l=0; l<state.transfers.length; l++) {
                            if(state.transfers[l].originSource === source.id) {
                                if(state.transfers[l].surfaces.indexOf(page.id) !== -1) {
                                    isVisible = false;
                                }
                            }
                            
                            if(state.transfers[l].targetSource === source.id) {
                                if(state.transfers[l].surfaces.indexOf(page.id) !== -1) {
                                    isVisible = true;
                                    if(stateArray[k] === mainStateID) {
                                        isOnCurrentState = true;
                                    }
                                }
                            }
                        }
                    }
                    
                    if(isOnCurrentState) {
                        console.log('[INFO] page should be moved now!');
                    }
                    
                    let viewerItem = viewer.world.getItemAt(pageIndex.get(source.id + '_' + page.id)); 
                    
                    if(isVisible) {
                        let svgUrl = this._getBaseURI() + 'file/' + page.shapesRef + '.svg';
                        let pageUrl = this._getBaseURI() + 'file/' + page.pageRef + '.svg';
                        
                        let bounds = viewerItem.getBounds();
                        
                        let temp = document.createElement('div');
                        temp.id = containerID + '_tempOverlay';
                        //temp.style.backgroundColor = 'rgba(255,0,0,0.5)';
                        viewer.addOverlay({
                            element: temp,
                            y: bounds.y,
                            x: bounds.x,
                            width: bounds.width,
                            height: bounds.height,
                            placement: 'TOP_LEFT'
                        });
                        
                        let placed = document.getElementById(containerID + '_tempOverlay');
                        
                        let pageOverlay = document.getElementById(containerID + '_' + page.pageRef);
                        //let shapeOverlay = viewer.getOverlayById(containerID + '_' + page.shapesRef);
                        
                        if(placed.style.top !== pageOverlay.style.top || placed.style.left !== pageOverlay.style.left) {
                            //console.log('-------------------need to move ' + page.id + ' at ' + source.id)
                            //console.log(page.id + ' at ' + source.id + ' | top:' + placed.style.top + ', left:' + placed.style.left)
                            
                            /* TODO: ANIMATION GOES HERE
                             * 
                             * OSD has a .setPosition() on tiledImage, which can be immediate _or not_!!!
                             * This requires that we reduce the moving pages to only one occurence (right now, they're available in both places, and only visibility changes), and we hide the overlays during transition.
                             */ 
                            
                            //Velocity(document.getElementById(containerID + '_' + page.pageRef), {top: placed.style.top, left: placed.style.left, translateZ: 0 }, { duration: 500, queue: false });
                            //Velocity(document.getElementById(containerID + '_' + page.shapesRef), {top: placed.style.top, left: placed.style.left, translateZ: 0 }, { duration: 500, queue: false });
                            
                            viewer.updateOverlay(containerID + '_' + page.pageRef, bounds, 'TOP_LEFT');
                            viewer.updateOverlay(containerID + '_' + page.shapesRef, bounds, 'TOP_LEFT');
                        }
                        
                        //remove the temporary "placed" overlay
                        viewer.getOverlayById(containerID + '_tempOverlay').destroy();
                        
                        
                        //deal with patch
                        for(let p = 0; p<page.patches.length; p++) {
                            let patch = page.patches[p];
                            let patchVisible = patch.isAdded ? false : true;
                            
                            if(activeStateIDs.indexOf(patch.enterState) !== -1) {
                                patchVisible = true;
                            }
                            
                            //todo: animating patch needs to be inserted here
                            if(mainStateID === patch.enterState) {
                                patchVisible = true;
                            }
                            
                            let patchedPage;
                            for(let l = 0; l<patch.pages.length; l++) {
                                if(patch.pages[l].type === 'recto') {
                                    patchedPage = patch.pages[l];
                                }
                            }
                            
                            let patchItem = viewer.world.getItemAt(pageIndex.get(source.id + '_' + patchedPage.id)); 
                            patchItem.setOpacity(patchVisible ? 1 : invisiblePageOpacity);
                            
                            try {
                                if(patchVisible) {
                                    document.getElementById(containerID + '_' + patchedPage.shapesRef).classList.remove('hiddenPatch');
                                    document.getElementById(containerID + '_' + patchedPage.pageRef).classList.remove('hiddenPatch');
                                } else {
                                    document.getElementById(containerID + '_' + patchedPage.shapesRef).classList.add('hiddenPatch');
                                    document.getElementById(containerID + '_' + patchedPage.pageRef).classList.add('hiddenPatch');
                                }
                            } catch(err) {
                                console.log('[ERROR] Unable to change hiddenPatch class for ' + patchedPage.id + ': ' +err + ' | ' + containerID + '_' + patchedPage.shapesRef);
                            }
                        }
                    }
                    
                    viewerItem.setOpacity(isVisible ? 1 : invisiblePageOpacity);
                }
            }
        
            this._colorShapes(containerID, stateMap, mainStateID, activeStateIDs);
        }
        
        
        return new Promise((resolve, reject) => {
            //what happens when images are loaded for the first time
            viewer.addHandler('open', (event) => {
                let promises = [];
                
                for(let i=0; i<sources.length; i++) {
                    let source = sources[i];
                    
                    let sourceLabel = document.createElement('div');
                    sourceLabel.id = containerID + '_sourceLabel_' + source.id;
                    sourceLabel.className = 'pageLabel';
                    sourceLabel.innerHTML = source.label;
                    
                    //let bounds = viewer.world.getItemAt(j).getBounds()
                    
                    //create source label
                    viewer.addOverlay({
                        element: sourceLabel,
                        y: (i) * (sources.maxHeight * 1.1) + sources.maxHeight,
                        x: 0,
                        placement: 'TOP_RIGHT'
                    });
                    
                    //get and position all svg overlays
                    for(let j=0; j<source.pages.length; j++) {
                        let page = source.pages[j];
                        
                        let viewerItem = viewer.world.getItemAt(pageIndex.get(source.id + '_' + page.id)); 
                        
                        if(viewerItem.opacity === 1) {
                            let bounds = viewerItem.getBounds();
                            
                            let svgUrl = self._getBaseURI() + 'file/' + page.shapesRef + '.svg';
                            let pageUrl = self._getBaseURI() + 'file/' + page.pageRef + '.svg';
                            
                            //overlay has to be loaded
                            if(viewer.getOverlayById(containerID + '_' + page.shapesRef) === null) {
                                let svgPromise = new Promise(function(resolve, reject) {
                                    resolve(getSVG(svgUrl)
                                        .then((svg) => {
                                            let svgBox = document.createElement('div');
                                            svgBox.classList.add('svgBox', 'shapes');
                                            svgBox.id = containerID + '_' + page.shapesRef;
                                            svgBox.innerHTML = svg;
                                            viewer.addOverlay({
                                                element: svgBox,
                                                y: bounds.y,
                                                x: bounds.x,
                                                width: bounds.width,
                                                height: bounds.height,
                                                placement: 'TOP_LEFT'
                                            });
                                            return true;
                                        }));    
                                });
                                
                                promises.push(svgPromise);
                                
                                //deal with patch
                                for(let p = 0; p<page.patches.length; p++) {
                                    let patch = page.patches[p];
                                    let patchVisible = patch.isAdded ? false : true;
                                    
                                    if(activeStateIDs.indexOf(patch.enterState) !== -1) {
                                        patchVisible = true;
                                    }
                                    
                                    //todo: animating patch needs to be inserted here
                                    if(mainStateID === patch.enterState) {
                                        patchVisible = true;
                                    }
                                    
                                    let patchedPage;
                                    for(let l = 0; l<patch.pages.length; l++) {
                                        if(patch.pages[l].type === 'recto') {
                                            patchedPage = patch.pages[l];
                                        }
                                    }
                                    
                                    let patchItem = viewer.world.getItemAt(pageIndex.get(source.id + '_' + patchedPage.id)); 
                                    let patchBounds = patchItem.getBounds();
                                    
                                    let patchShapeUrl = self._getBaseURI() + 'file/' + patchedPage.shapesRef + '.svg';
                                    let patchPageUrl = self._getBaseURI() + 'file/' + patchedPage.pageRef + '.svg';
                                    
                                    let patchShapePromise = new Promise(function(resolve, reject) {
                                        resolve(getSVG(patchShapeUrl)
                                            .then((svg) => {
                                                let svgBox = document.createElement('div');
                                                svgBox.classList.add('svgBox', 'shapes', 'patch');
                                                if(!patchVisible) {
                                                    svgBox.classList.add('hiddenPatch');
                                                }
                                                svgBox.id = containerID + '_' + patchedPage.shapesRef;
                                                svgBox.innerHTML = svg;
                                                viewer.addOverlay({
                                                    element: svgBox,
                                                    y: patchBounds.y,
                                                    x: patchBounds.x,
                                                    width: patchBounds.width,
                                                    height: patchBounds.height,
                                                    placement: 'TOP_LEFT'
                                                });
                                                return true;
                                            }));    
                                    }); 
                                    
                                    promises.push(patchShapePromise);
                                    
                                    let patchPagePromise = new Promise(function(resolve, reject) {
                                        resolve(getSVG(patchPageUrl)
                                            .then((svg) => {
                                                let svgBox = document.createElement('div');
                                                svgBox.classList.add('svgBox', 'page', 'patch');
                                                if(!patchVisible) {
                                                    svgBox.classList.add('hiddenPatch');
                                                }
                                                svgBox.id = containerID + '_' + patchedPage.pageRef;
                                                svgBox.innerHTML = svg;
                                                viewer.addOverlay({
                                                    element: svgBox,
                                                    y: patchBounds.y,
                                                    x: patchBounds.x,
                                                    width: patchBounds.width,
                                                    height: patchBounds.height,
                                                    placement: 'TOP_LEFT'
                                                });
                                                return true;
                                            }));    
                                    });                                    
                                    promises.push(patchPagePromise);
                                }
                            } else {
 //overlay is available already
                                
                                let overlay = viewer.getOverlayById(containerID + '_' + page.shapesRef);
                                console.log(overlay);
                                console.log('[ERROR] Unexpected case in videReconstructionViewer.js / function: _setupViewer()');
                            }
                            
                            //overlay has to be loaded
                            if(viewer.getOverlayById(containerID + '_' + page.pageRef) === null) {
                                let pagePromise = new Promise(function(resolve, reject) {
                                    resolve(getSVG(pageUrl)
                                        .then((svg) => {
                                            let svgBox = document.createElement('div');
                                            svgBox.classList.add('svgBox', 'page');
                                            svgBox.id = containerID + '_' + page.pageRef;
                                            svgBox.innerHTML = svg;
                                            viewer.addOverlay({
                                                element: svgBox,
                                                y: bounds.y,
                                                x: bounds.x,
                                                width: bounds.width,
                                                height: bounds.height,
                                                placement: 'TOP_LEFT'
                                            });
                                            return true;
                                        }));    
                                });
                                
                                promises.push(pagePromise);
                            } else {
 //overlay is available already
                                
                                let overlay = viewer.getOverlayById(containerID + '_' + page.pageRef);
                                console.log(overlay);
                            }
                        }
                    }
                }
                resolve(Promise.all(promises).then((results) => {
                    this._colorShapes(containerID, stateMap, mainStateID, activeStateIDs);
                    
                    return Promise.resolve(true);
                }));
            });
            
            //open pageSetup
            if(typeof viewer.pageIndex === 'undefined') {
                viewer.pageIndex = pageIndex;
            
                let res = viewer.open(pageSetup);
                this._viewerStore.set(containerID, viewer);
            } else {
                resolve(true);
            }
        });
    }
    
    _colorShapes(containerID, stateMap, mainStateID, activeStateIDs) {
        let visibleShapes = document.querySelectorAll('#' + containerID + ' svg path.visible');
        for (var shape of visibleShapes) {
            shape.classList.remove('visible', 'current');
        }
        
        let failedShapes = new Map();
        
        for(let i=0; i<activeStateIDs.length; i++) {
            let state = stateMap.get(activeStateIDs[i]);
            
            for(let j=0; j<state.shapes.length; j++) {
                let shapeID = state.shapes[j];
                //console.log(shapeID)
                let shape = document.querySelector('#' + containerID + ' svg path#' + shapeID);
                try {
                    //console.log('changing ' + shapeID)
                    shape.classList.add('visible');
                } catch(err) {
                    if(!failedShapes.has(state.id)) {
                        failedShapes.set(state.id, []);  
                    } 
                    failedShapes.get(state.id).push(shapeID);
                }
            }
        }
        
        let mainState = stateMap.get(mainStateID);
        
        for(let j=0; j<mainState.shapes.length; j++) {
            let shapeID = mainState.shapes[j];
            let shape = document.querySelector('#' + containerID + ' svg path#' + shapeID);
            try {
                //console.log('now ' + shapeID)
                shape.classList.add('visible', 'current');
            } catch(err) {
                if(!failedShapes.has(mainState.id)) {
                    failedShapes.set(mainState.id, []);  
                } 
                failedShapes.get(mainState.id).push(shapeID);
            }
        }
        
        for(let [stateID, array] of failedShapes) {
            console.log('[ERROR] The following ' + array.length + ' (out of ' + stateMap.get(stateID).shapes.length + ') shapes for state ' + stateID + ' could not be colored:');
            console.log(array);
        }
    }
    
    _getSVG(url) {
        if(this._svgStore.has(url)) {
            return Promise.resolve(this._svgStore.get(url));
        } else {
            let request = new DataRequest('text', url);
            return this._eohub.requestData(request)
                .then((svg) => {
                    this._svgStore.set(url, svg);
                    return Promise.resolve(svg);
                });
        }
    }
    
    _getStateData(editionID) {
        if(this._stateStore.has(editionID)) {
            return Promise.resolve(this._stateStore.get(editionID));
        } else {
            let responseType = 'json';
            let url = this._getBaseURI() + 'edition/' + editionID + '/' + 'reconstructionSetup.json';
            
            let request = new DataRequest(responseType, url);
            return this._eohub.requestData(request)
                .then(json => {
                    let stateMap = new Map();
                    let scarMap = new Map();
                    let firstScarID;
                    let firstStateID;
                    
                    json.scars.forEach((scar, i) => {
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
                    
                    
                    
                    let mapObject = {stateMap: stateMap, scarMap: scarMap, firstScarID: firstScarID, firstStateID: firstStateID, sources: json.sources};
                    this._stateStore.set(editionID, mapObject); 
                    
                    return Promise.resolve(mapObject);
                });
        }
    }
    
    /*
     * todo: restrict view to only one available scar
     */
    _setupMenu(containerID, activeStateIDs = [], mainStateID) {
        return Promise.resolve(this._prepareHTML(containerID)
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
                            console.log('[ERROR] Unable to find scar ' + scarToActivateID);
                            return false;
                        }
                        
                        let func = (e) => {
                            let i = selectBox.selectedIndex;
                            let scar = scars[i];
                            
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
                                    let state = stateArray[n][m];
                                    
                                    let stateBox = document.createElement('div');
                                    stateBox.classList.add('stateBox');
                                    stateBox.setAttribute('data-stateid', state.id);
                                    stateBox.id = containerID + '_' + state.id;
                                    if(activeStateIDs.indexOf(state.id) !== -1) {
                                        stateBox.classList.add('active');
                                    }
                                    if(mainStateID === state.id) {
                                        stateBox.classList.add('current', 'active');
                                    }
                                    //todo: make this compatible with I18n
                                    
                                    if(!state.deletion) {
                                        stateBox.innerHTML = 'Schicht ' + state.label;
                                    } else {
                                        stateBox.innerHTML = 'Streichung';
                                    }
                                        
                                        
                                    rowBox.appendChild(stateBox);
                                    
                                    let stateSelect = (event) => {
                                        this._prepareStateRequest(state.id, containerID)
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
    
    _prepareStateRequest(stateID, containerID) {
        //console.log('[DEBUG] prepareStateRequest(' + stateID + ',' + containerID+')')
        
        let guiStates = document.querySelectorAll('#' + containerID + ' .stateBox.active');
        
        return Promise.resolve(this._getStateData(this._eohub.getEdition())
            .then((mapObject) => {
                let state = mapObject.stateMap.get(stateID);
                let requiredStates = this._getRequiredStates(state, mapObject.stateMap, []);
                let futureStates = this._getFutureStates(state, mapObject.stateMap, []);
                
                let requestedStates = requiredStates.slice(0);
                
                //combine definitely needed states with optional ones selected in the UI
                for(let i=0; i<guiStates.length; i++) {
                    //it's neither included already, nor following the current state
                    
                    let toCheck = guiStates[i].dataset.stateid;
                    
                    if(requestedStates.indexOf(toCheck) === -1 && futureStates.indexOf(toCheck) === -1 && toCheck !== stateID) {
                        requestedStates.push(guiStates[i].dataset.stateid);
                    }   
                }
                
                //create contexts for each state
                let contexts = [];
                for(let i=0; i<requestedStates.length; i++) {
                    contexts.push({type:EO_Protocol.Context.CONTEXT_STATE, id:requestedStates[i]});                       
                }
                
                let query = {
                    objectType: EO_Protocol.Object.OBJECT_STATE,
                    objectID: stateID,
                    contexts: contexts,
                    perspective: this._supportedPerspective,
                    operation: EO_Protocol.Operation.OPERATION_VIEW
                };
                
                let request = new Request(containerID, this._eohub.getEdition(), query);
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
    
    getDefaultView(containerID) {
        containerID = containerID.replace(/videReconstructionViewer/, 'VIEWTYPE_RECONSTRUCTIONVIEW');
        let editionID = this._eohub.getEdition();
        
        this._getStateData(editionID)
            .then(mapObject => {
                return this._prepareStateRequest(mapObject.firstStateID, containerID);
            })
            .then((request) => {
                return Promise.resolve(this._eohub.sendSelfRequest(request, this));
            });
    }
    
    handleRequest(request) {
        let reqContainer = request.getContainer();
        
        let containerID = (reqContainer.endsWith('_VIEWTYPE_RECONSTRUCTIONVIEW')) ? reqContainer : reqContainer + '_VIEWTYPE_RECONSTRUCTIONVIEW';
        let activeStateIDs = request.getContextsByType(EO_Protocol.Context.CONTEXT_STATE);
        let mainStateID = (request.getObjectType() === EO_Protocol.Object.OBJECT_STATE) ? request.getObjectID() : null;
        
        return Promise.resolve(this._setupMenu(containerID, activeStateIDs, mainStateID)
            .then((mapObject) => {
                this._setupViewer(containerID, mapObject.sources, activeStateIDs, mainStateID, mapObject.stateMap)
                    .then((viewer) => {
                        
                    }).catch((err) => {
                        console.log(err);
                    });
            }).catch((err2) => {
                console.log(err2);
            }));
    }
    
};

export default VideReconstructionViewer;
