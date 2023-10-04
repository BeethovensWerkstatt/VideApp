import 'babel-polyfill';
import VIDE_PROTOCOL from './vide-protocol';
import {EoNavModule} from './vide-nav-module-blueprint';


/**
 * @extends EoNavModule
 */
const VideTranscriptionViewer = class VideTranscriptionViewer extends EoNavModule {

    /** Constructor method */
    constructor() {
        super();
        this._supportedPerspective = VIDE_PROTOCOL.PERSPECTIVE.TRANSCRIPTION;
        this._supportedRequests = [];

        //shows a complete state, without highlighting
        this._supportedRequests.push({object: VIDE_PROTOCOL.OBJECT.STATE, contexts:[VIDE_PROTOCOL.CONTEXT.STATE], perspective: this._supportedPerspective, operation: VIDE_PROTOCOL.OPERATION.VIEW});
        //highlights a note (or similar) within a state
        this._supportedRequests.push({object: VIDE_PROTOCOL.OBJECT.NOTATION, contexts:[VIDE_PROTOCOL.CONTEXT.STATE], perspective: this._supportedPerspective, operation: VIDE_PROTOCOL.OPERATION.VIEW});
        this._supportedRequests.push({object: VIDE_PROTOCOL.OBJECT.NOTATION, contexts:[], perspective: this._supportedPerspective, operation: VIDE_PROTOCOL.OPERATION.VIEW});
        this._supportedRequests.push({object: VIDE_PROTOCOL.OBJECT.LYRICS, contexts:[VIDE_PROTOCOL.CONTEXT.STATE], perspective: this._supportedPerspective, operation: VIDE_PROTOCOL.OPERATION.VIEW});
        this._supportedRequests.push({object: VIDE_PROTOCOL.OBJECT.DIR, contexts:[VIDE_PROTOCOL.CONTEXT.STATE], perspective: this._supportedPerspective, operation: VIDE_PROTOCOL.OPERATION.VIEW});

        this._key = 'VideTranscriptionViewer';

        this._baseDimensions = new Map();

        this._verovioOptions = {
            inputFormat: 'mei',
            border: 0,
            scale: 35,           //scale is in percent (1 - 100)
            ignoreLayout: 0,
            noLayout: 1          //results in a continuous system without page breaks
        };

        //colors used for highlighting
        //todo: make those interoperable with other modules and allow users to modify them
        this._colors = {
            random: ['#4e9bba', '#c380dd', '#c63e00', '#6fdb3d', '#b75122',
                '#5a6ece', '#c10937', '#cb25d1', '#ce6c5a', '#2140dd',
                '#2b88af', '#4e50c4', '#859900', '#33b0ea', '#268bd2',
                '#bc6827', '#2aa198', '#cb4b16', '#6c71c4', '#d33682',
                '#dc322f', '#b58900'],
            supplied: '#999999'
        }

        //used for I18n to identify how individual states are labeled
        this._stateLabelKeySingular = 'variant';
        this._stateLabelKeyPlural = 'variants';

        //whether genetic states which are pure deletions shall be rendered in navigation or not
        this._showDeletions = false;

        //whether invariance is available for the current edition or not; automatically set in blueprint
        //this._feature;

        return this;
    }

    /*
     * pulls the final state of the edition
     */
    _getFinalState(editionID) {

        let req = {id: editionID,type:'getFinalState'};
        return this.requestData(req,true);

    }

    /*
     * gets a given state, along some other states, as MEI for rendering with verovio
     */
    _getStateAsMEI(editionID,stateID,otherStates = []) {

        let req = {id: stateID, edition: editionID, otherStates: otherStates,type:'getState'};
        return this.requestData(req,true);

    }

    /*
     * this sets up the basic HTML
     */
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
        transcriptionNavMenu.id = containerID + '_navOverlayMenu';
        transcriptionNavMenu.className = 'transcriptionNavMenu';

        transcriptionNavMenu.innerHTML = '<div id="' + containerID + '_zoomIn" class="menuButton"><i class="fa fa-plus"></i></div>' +
            '<div id="' + containerID + '_zoomOut" class="menuButton"><i class="fa fa-minus"></i></div>' +
            '<div id="' + containerID + '_zoomHome" class="menuButton"><i class="fa fa-arrows-alt"></i></div>';

        container.appendChild(transcription);
        container.appendChild(transcriptionNavMenu);
        container.appendChild(overlayInserter);

        this._setupNavHtml(containerID);

        //render only when invariance is supported by current edition
        if(this._feature) {
            let invarianceBtn = document.createElement('div');
            invarianceBtn.id = containerID + '_activateInvariance';
            invarianceBtn.className = 'invarianceBtn toggleBtn';
            invarianceBtn.innerHTML = '<i class="fa fa-fw fa-square-o" aria-hidden="true"></i> <i class="fa fa-fw fa-check-square-o" aria-hidden="true"></i>  <span data-i18n-text="show_Invariance">' + this._eohub.getI18nString('show_Invariance') + '</span>';
            document.getElementById( containerID + '_navOverlayMenu').appendChild(invarianceBtn);
        }

        let scarBox = document.getElementById(containerID + '_stateNavigation');

        let transcriptionNavContainer = document.createElement('div');
        transcriptionNavContainer.className = 'transcriptionNavContainer';
        let transcriptionNav = document.createElement('div');
        transcriptionNav.className = 'transcriptionNav';
        transcriptionNav.id = containerID + '_transcriptionNavigator';
        transcriptionNavContainer.appendChild(transcriptionNav);

        scarBox.appendChild(transcriptionNavContainer);

    }

    /*
     * this is supposed to kill the current instance
     */
    unmount(containerID) {

        let viewer = this._cache.get(containerID + '_transcriptionViewer')
        viewer.destroy();
        this._cache.delete(containerID + '_transcriptionViewer');

        document.getElementById(containerID).innerHTML = '';
        //this._currentRenderingDimensions.delete(containerID);
    }

    /*
     * gets default view
     */
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

    /*
     * sets up the viewer, or retrieves it from cache when available
     */
    _setupViewer(containerID,request) {
        this._setupHtml(containerID);

        let editionID = this._eohub.getEdition();

        let stateDataPromise = this._getStateData(editionID);
        let measureDataPromise = this._getMeasureData(editionID);

        //let t0 = performance.now();
        return Promise.all([stateDataPromise,measureDataPromise]).then((results) => {
            //let finalState = results[0];
            let stateJson = results[0];
            let measureJson = results[1];

            let mode = stateJson.length > 1 ? 'multiScar' : 'singleScar';

            if(stateJson.length === 0) {
                console.log('[ERROR] The edition ' + editionID + ' apparently has no textual scar, and thus cannot be displayed with the current version of vide-module-transcription-viewer.js.')
            }

            //let t1 = performance.now();
            //console.log('[DEBUG] setupViewer took ' + (t1 - t0) + ' millisecs');

            //multiScar, already initialized
            if(this._cache.has(containerID + '_transcriptionViewer') && mode === 'multiScar') {
                console.log('getting viewer from cache')
                return Promise.resolve(this._cache.get(containerID + '_transcriptionViewer'))

            //singleScar, already initialized
            } else if(this._cache.has(containerID + '_transcriptionViewer') && mode === 'singleScar') {
                /*console.log('')
                console.log('\\\\\\\\\\\\////////////')
                console.log('there is already a viewer for singleScar, so I should not have to recreate it…')*/

                let viewer = this._cache.get(containerID + '_transcriptionViewer');
                let verovio = this._eohub.getVerovio();
                return new Promise((resolve,reject) => {
                    this._setupSingleScarViewer(stateJson,measureJson,verovio,editionID,containerID, request, resolve);
                });


            //needs to be initialized
            } else {

                /*console.log('')
                console.log('new request for viewer')*/

                return new Promise((resolve, reject) => {

                    //set up listener for invariance mode
                    if(this._feature) {

                        //prepare listener
                        let listener = (e) => {
                            e.preventDefault();
                            e.stopPropagation();

                            if(document.getElementById(containerID).getAttribute('data-invariance') === 'visible') {
                                this._deactivateInvariance(containerID);
                            } else {
                                this._activateInvariance(containerID);
                            }
                        }

                        //try to remove old listener, then add new listener
                        try {
                            document.getElementById(containerID + '_activateInvariance').removeEventListener('click',listener)
                        } catch(err) {
                            //console.log('-------nooo listener yet: ' + err)
                        }
                        document.getElementById(containerID + '_activateInvariance').addEventListener('click',listener)
                    }

                    //console.log('building new viewer')
                    let verovio = this._eohub.getVerovio();

                    //set things up as required –> if there's just one scar, use a special mode for that
                    if(mode === 'multiScar') {
                        this._setupMultiScarViewer(stateJson,measureJson,verovio,editionID,containerID,request,resolve)
                    } else {
                        /*console.log('')
                        console.log('        new singleScar')
                        console.log(stateJson)
                        console.log(measureJson)*/
                        this._setupSingleScarViewer(stateJson,measureJson,verovio,editionID,containerID,request,resolve)
                    }

                });

            }

        });
    }

    /*
     * render transcription with the last state of the work rendered as base text, and
     * individual states above (mode is used when there is more than one scar available)
     */
    _setupMultiScarViewer(stateJson,measureJson,verovio,editionID, containerID, request, resolve) {

        this._getFinalState(editionID).then((finalState) => {

            let svgString = verovio.renderData(finalState + '\n', this._verovioOptions);
            this._cache.set('finalState',svgString)

            let svg = new DOMParser().parseFromString(svgString, "image/svg+xml");
            let baseDimensions = this._getVerovioDimensions(svg);

            this._baseDimensions.set(editionID,baseDimensions);

            /*console.log('dimensions: ' + width + ' / ' + height);
            console.log(document.getElementById(containerID + '_verovioBox'))*/

            //OSD viewer with all properties
            let viewer = OpenSeadragon(this._setOsdOptions(containerID, baseDimensions));

            //store viewer for later use
            this._cache.set(containerID + '_transcriptionViewer', viewer)

            //add required handlers
            this._setOsdHandlers(containerID, viewer, request, stateJson, svgString, resolve, 'multiScar');

        });

    }

    /*
     * render only one state of the text, with no base text below. Mode is used when there is only
     * one textual scar. This means that there is no context shown.
     */
    _setupSingleScarViewer(stateJson,measureJson,verovio,editionID,containerID, request, resolve) {

        let type;

        if(request.object === VIDE_PROTOCOL.OBJECT.NOTATION && request.contexts.length === 0) {
            type = 'highlightMeasure';
        } else if(request.object === VIDE_PROTOCOL.OBJECT.NOTATION && request.contexts.length > 0) {
            type = 'highlightMusic';
        } else if(request.object === VIDE_PROTOCOL.OBJECT.LYRICS && request.contexts.length > 0) {
            type = 'highlightMusic';
        } else if(request.object === VIDE_PROTOCOL.OBJECT.DIR && request.contexts.length > 0) {
            type = 'highlightMusic';
        } else if(request.object === VIDE_PROTOCOL.OBJECT.STATE) {
            type = 'highlightState';
        }

        let mainState;
        let otherStates = [];
        let scar = stateJson[0];

        if(type === 'highlightMeasure') {

            console.log('---- DUNNO if this works properly – I doubt it')

            mainState = stateJson[0].states[0].id;
            for(let i=0; i < request.contexts.length; i++) {
                let context = request.contexts[i];
                if(context.context === VIDE_PROTOCOL.CONTEXT.STATE) {
                    otherStates.push(context.id);
                }
            }
        } else if(type === 'highlightState') {

            //console.log('----state')

            mainState = request.id;
            for(let i=0; i < request.contexts.length; i++) {
                let context = request.contexts[i];
                if(context.context === VIDE_PROTOCOL.CONTEXT.STATE) {
                    otherStates.push(context.id);
                }
            }
        } else if(type === 'highlightMusic') {

            //console.log('----music')

            mainState = request.contexts[0].id;
            let stateObj;

            loops:{
                for(let i = 0; i<stateJson.length;i++) {
                    let current = stateJson[i];

                    for(let j = 0; j<current.states.length;j++) {
                        let state = current.states[j];
                        if(state.id === mainState) {
                            scar = current;
                            stateObj = state;
                            break loops;
                        }
                    }
                }
            }

            //iterate over all states, identify the ones that need to be activated
            for(let p = 0; p<scar.states.length; p++) {
                let queriedState = scar.states[p];

                let lesserPos = (queriedState.position < stateObj.position && !queriedState.deletion);
                let isActive = (queriedState.position <= stateObj.position && (queriedState.id === stateObj.id));
                if(lesserPos || isActive) {

                    //console.log('…and accordingly, it should be kept active…')
                    otherStates.push(queriedState.id);
                }
            }
        }

        //console.log('------- // looking for state ' + mainState + ' based on ' + otherStates.length + ' other states (' + otherStates.join(', ') + ')')

        this._getStateAsMEI(editionID,mainState,otherStates).then((stateMEI) => {

            let svgString = verovio.renderData(stateMEI + '\n', this._verovioOptions);
            this._cache.set('firstState',svgString)

            let svg = new DOMParser().parseFromString(svgString, "image/svg+xml");
            let baseDimensions = this._getVerovioDimensions(svg);
            this._baseDimensions.set(editionID,baseDimensions);

            if(this._cache.has(containerID + '_transcriptionViewer')) {
                try {
                    let oldViewer = this._cache.get(containerID + '_transcriptionViewer');
                    let oldElem = oldViewer.getOverlayById(containerID + '_currentState');
                    if(oldElem !== null) {
                        oldViewer.removeOverlay(containerID + '_currentState');
                        //console.log('[INFO] Successfully removed previous state rendering')
                    }
                    oldViewer.destroy();
                } catch(err) {
                    console.log('[DEBUG] Unable to remove previous state rendering')
                }
            }


            //OSD viewer with all properties
            let viewer = OpenSeadragon(this._setOsdOptions(containerID, baseDimensions));

            //store viewer for later use
            this._cache.set(containerID + '_transcriptionViewer', viewer)

            //make sure only that scar is visible
            this._openSingleScar(containerID, scar.id,mainState,otherStates);
            document.querySelector('#' + containerID + ' .prevScarBtn').style.display = 'none';
            document.querySelector('#' + containerID + ' .nextScarBtn').style.display = 'none';

            //add required handlers
            this._setOsdHandlers(containerID, viewer, request, stateJson, svgString, resolve, 'singleScar');

        });
    }

    //sets all handlers required in OpenSeadragon. Called from _setupSingleScarViewer (and _setupMultiScarViewer)
    _setOsdHandlers(containerID, viewer, request, stateJson, svg, resolveFunc, mode = 'multiScar') {

        if(mode !== 'multiScar' && mode !== 'singleScar') {
            resolveFunc(viewer);
            return false;
        }

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

        //add boxes around scars when in multiScar mode
        if(mode === 'multiScar') {

            // as soon as the Verovio output is rendered, add scars
            viewer.addOnceHandler('add-overlay',(event) => {

                let tiledImage = viewer.world.getItemAt(0);
                let i = 0;
                let j = stateJson.length;

                //insert scars
                for(i; i<j; i++) {


                    let scar = stateJson[i];
                    let firstMeasure = scar.firstMeasure;
                    let firstState = scar.states[0];

                    //rectangle used as background for textual scars
                    //attention: positioning is broken

                    /*if(scar.id === 'newb2a2d9d8-4226-4d2f-b2e0-edfe27cd1bf2') {
                        console.log('\n\ngetting here')
                        console.log(scar)
                    }*/


                    window.setTimeout(() => {
                        let scarRect = this._createRect(viewer,containerID, scar.affectedNotes);

                        /*if(scar.id === 'newb2a2d9d8-4226-4d2f-b2e0-edfe27cd1bf2') {
                            console.log('\nscarRect')
                            console.log(scarRect)
                        }*/
                        if(typeof scarRect === 'undefined' || scarRect === false) {
                            //console.log('--------------66 lacking scarRect for ' + scar.label)

                            let baseDimensions = this._baseDimensions.get(this._eohub.getEdition());

                            let attachmentMeasureRect = document.querySelector('#' + containerID + ' svg #' +scar.firstMeasure).getBoundingClientRect();

                            if(scar.id === 'newb2a2d9d8-4226-4d2f-b2e0-edfe27cd1bf2') {
                                console.log('\nBaseDimensions | first measure element | its bounding box')
                                console.log(baseDimensions)
                                console.log(document.querySelector('#' + containerID + ' svg #' +scar.firstMeasure))
                                console.log(attachmentMeasureRect)
                            }
                            let ul = viewer.viewport.windowToViewportCoordinates(new OpenSeadragon.Point(attachmentMeasureRect.left, attachmentMeasureRect.top));
                            let lr = viewer.viewport.windowToViewportCoordinates(new OpenSeadragon.Point(attachmentMeasureRect.right, attachmentMeasureRect.bottom));

                            let height = lr.y - ul.y;
                            let dist = height * baseDimensions.relation;

                            scarRect = new OpenSeadragon.Rect(ul.x - dist, ul.y, dist * 2, height);

                        }
                        /*if(scar.id === 'newb2a2d9d8-4226-4d2f-b2e0-edfe27cd1bf2') {
                            console.log('\n final scarRect:')
                            console.log(scarRect)
                        }*/
                        let elem = document.createElement('div');
                        elem.className = 'scarHighlight';
                        elem.id = containerID + '_' + scar.id;
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
                        });

                        viewer.addOverlay({
                            element: elem,
                            location: scarRect,
                            checkResize: true
                        });
                    }, 1000)


                    let p = 0;
                    let q = scar.affectedNotes.length;

                    for(p; p<q; p++) {
                        try {
                            let elem = document.querySelector('#' + containerID + ' #' + scar.affectedNotes[p]);
                            elem.classList.add('affectedByScar');
                            /*elem.addEventListener('click',(e) => {

                                let req = {
                                    id: firstState.id,
                                    object: VIDE_PROTOCOL.OBJECT.STATE,
                                    contexts: [],
                                    perspective: this._supportedPerspective,
                                    operation: VIDE_PROTOCOL.OPERATION.VIEW,
                                    state: {}
                                };
                                this._eohub.sendSelfRequest(req,this,containerID);

                            })*/
                        } catch(err) {

                        }
                    }



                }


                //add contextMenu listeners for base text only
                let notes = document.querySelectorAll('#' + containerID + ' g.note, #' + containerID + ' g.rest');
                let notesArray = [...notes];

                let onClick = (e) => {
                    let note = e.currentTarget;
                    this._clickNote(containerID, viewer, note, e);
                    e.preventDefault();
                };

                notesArray.forEach(function(elem, i) {
                    elem.addEventListener('click',onClick,false)
                });

                // jump to first measure
                this._focusShape(containerID,viewer,stateJson[0].firstMeasure);

            });

        }

        //do internal setup after images are loaded
        viewer.addOnceHandler('open', (event) => {

            let svgBox = document.createElement('div');
            svgBox.className = 'svgBox' + (mode === 'singleScar' ? ' currentState' : '');
            if(mode === 'singleScar') {
                svgBox.id = containerID + '_currentState';
                console.log(' setting id')
            }
            svgBox.innerHTML= svg;

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

            if(mode === 'singleScar') {
                //add contextMenu listeners for base text only
                let notes = document.querySelectorAll('#' + containerID + ' svg g.note, #' + containerID + ' svg g.rest');
                let notesArray = [...notes];

                let onClick = (e) => {
                    let note = e.currentTarget;
                    this._clickNote(containerID, viewer, note, e);
                    e.preventDefault();
                };

                notesArray.forEach(function(elem, i) {
                    elem.addEventListener('click',onClick,false)
                });

            }

            resolveFunc(viewer);

        });

    }

    /*
     * main function
     */
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
        } else if(request.object === VIDE_PROTOCOL.OBJECT.NOTATION && request.contexts.length > 0) {
            type = 'highlightMusic';
        } else if(request.object === VIDE_PROTOCOL.OBJECT.LYRICS && request.contexts.length > 0) {
            type = 'highlightMusic';
        } else if(request.object === VIDE_PROTOCOL.OBJECT.DIR && request.contexts.length > 0) {
            type = 'highlightMusic';
        } else if(request.object === VIDE_PROTOCOL.OBJECT.STATE) {
            type = 'highlightState';
        } else {
            console.log('[ERROR] unable to determine the type of the following request in VideTranscriptionViewer:')
            console.log(request)
            return false;
        }
        try {
            this._setupViewer(containerID,request).then((viewer) => {

                let editionID = this._eohub.getEdition();

                /*if(typeof state.bounds !== 'undefined') {
                    try{
                        viewer.viewport.fitBoundsWithConstraints(state.bounds);
                        //this._confirmView(containerID,state);
                    } catch(err) {
                        console.log('[ERROR] Unable to move to rect: ' + err)
                        console.log(request)
                        console.log(state)
                    }

                } else*/ if(type === 'default') {

                    console.log('[DEBUG] default transcription loaded at ' + containerID);
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
                        let stateObj;
                        let i = 0;

                        loops:{
                            for(i; i<stateJson.length;i++) {
                                let current = stateJson[i];

                                let j = 0;
                                for(j; j<current.states.length;j++) {
                                    let state = current.states[j];
                                    if(state.id === request.id) {
                                        scar = current;
                                        stateObj = state;
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

                        if(typeof stateObj === 'object' && stateObj.deletion) {
                            console.log('[INFO] Cannot render state ' + request.id + ', as its a pure deletion.')
                            return false;
                        }

                        try {
                            this._openSingleScar(containerID,scar.id,request.id,activeStates);
                            //state needs to be rendered only if there is more than one scar

                            if(stateJson.length > 1) {
                                this._renderState(containerID,scar,viewer,request.id,activeStates);
                            }
                        } catch(err) {
                             console.log('[ERROR] Unable to resolve request for state ' + request.id + ': ' + err)
                        }


                    });

                } else if(type === 'highlightMusic') {

                    try {

                        let elem = document.querySelector('#' + containerID + ' #' + request.id);
                        elem.classList.add('highlight');
                        setTimeout(() => {
                            elem.classList.remove('highlight');
                        },10000);

                        this._focusShape(containerID,viewer,request.id);

                    } catch(err) {
                        console.log('[ERROR] Unable to highlight object ' + request.id + ': ' + err);
                    }

                } else {
                    console.log('Dunno how to handle request (yet)')
                }

                if(typeof request.state !== 'undefined' && request.state.invariance === true) {
                    //console.log('----------I need to activate invariance coloration')
                    this._activateInvariance(containerID, request);
                } else if(state.invariance === true) {
                    //console.log('----------I need to activate invariance coloration')
                    this._activateInvariance(containerID, request);
                }
                else {
                    //console.log('----------I need to turn off invariance coloration')
                    this._deactivateInvariance(containerID);
                }

            });
        } catch(err) {
            console.log('[ERROR] Unable to handle the following request: (' + err + ')')
            console.log(request)
            return false;
        }

    }

    _renderState(containerID, scar, viewer, stateID, activeStates = []) {

        try {
            let editionID = this._eohub.getEdition();
            //first state
            this._getStateAsMEI(editionID,stateID,activeStates).then((stateMEI) => {

                //get rid of old rendering (if any)
                try {

                    let list = document.querySelectorAll('#' + containerID + '_currentState');
                    /*console.log('removing ' + list.length + ' overlay(s)')
                    console.log(list);
                    */
                    for (let item of list) {
                        viewer.removeOverlay(containerID + '_currentState');
                        //console.log(item);
                        item.parentNode.removeChild(item);
                    }
                } catch(err) {
                    console.log('[INFO] There is no overlay to be removed: ' + err)
                }

                //the OSD dimensions of the base layer
                let allBounds = viewer.world.getItemAt(0).getBounds();

                //get Rendering as string and DOM
                let verovio = this._eohub.getVerovio();
                let stateSvgString = verovio.renderData(stateMEI + '\n', this._verovioOptions);
                let stateSvg = new DOMParser().parseFromString(stateSvgString, "image/svg+xml");

                //determine dimensions
                let dimensions = this._getVerovioDimensions(stateSvg);
                //if the state is "empty", it automatically gets a relation property of -1
                //so if relation is -1, there's really nothing to render…
                if(dimensions.relation === -1) {
                    //console.log('[DEBUG] Keep going, there is nothing to see here for state ' + stateID);
                    return false;
                }

                let baseDimensions = this._baseDimensions.get(editionID);

                let attachmentMeasureRect = document.querySelector('#' + containerID + ' svg #' +scar.firstMeasure).getBoundingClientRect();
                let ul = viewer.viewport.windowToViewportCoordinates(new OpenSeadragon.Point(attachmentMeasureRect.left, attachmentMeasureRect.top));
                let lr = viewer.viewport.windowToViewportCoordinates(new OpenSeadragon.Point(attachmentMeasureRect.right, attachmentMeasureRect.bottom));

                let dist = allBounds.height / (baseDimensions.viewBoxHeight / baseDimensions.staffHeight);


                //test for offsetting states by meterSig

                /*console.log('------------\n-----55-----\n------------')*/

                let meterSigX = stateSvg.querySelector('g.measure g.staff g.meterSig use').getAttribute('x');
                let allWidth = parseInt(stateSvg.querySelector('svg.definition-scale').getAttribute('viewBox').split(' ')[2],10)

                let offsetRatio = meterSigX / allWidth;

                /*console.log('')

                console.log(ul.x + ' ---- ' + meterSigX + ' ---- ' + allWidth + ' ---- ' + offsetRatio)

                console.log('------------\n-----55-----\n------------')*/
                //test end

                let ulx = ul.x;
                let uly = allBounds.y - (2 * dist);

                try {

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

                    //generate HTML container for Verovio

                    let stateBox = document.createElement('div');
                    stateBox.id = containerID + '_currentState';
                    stateBox.className = 'stateBox';
                    stateBox.innerHTML= stateSvgString;

                    //determine dimensions of Verovio container
                    let thisWidthFactor = 1 / baseDimensions.width * dimensions.width;

                    let rectWidth = allBounds.width * thisWidthFactor;
                    let rectHeight = rectWidth / dimensions.width * dimensions.height;

                    let rectBounds = new OpenSeadragon.Rect(ulx - rectWidth * offsetRatio, uly - rectHeight, rectWidth, rectHeight);

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

                    //add listeners for added states
                    let notes = stateBox.querySelectorAll('#' + containerID + ' g.note, #' + containerID + ' g.rest');
                    let notesArray = [...notes];

                    let onClick = (e) => {
                        let note = e.currentTarget;
                        this._clickNote(containerID, viewer, note, e);
                        e.preventDefault();
                    };

                    notesArray.forEach(function(elem, i) {
                        elem.addEventListener('click',onClick,false)
                    });

                    viewer.viewport.fitBoundsWithConstraints(rectBounds);
                    document.getElementById(containerID).setAttribute('data-activeState',stateID);
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

    prepareStateRequest(stateID, containerID) {
        //console.log('prepareStateRequest(' + stateID + ',' + containerID+')');

        let guiStates = document.querySelectorAll('#' + containerID + ' .stateBox.active');

        return Promise.resolve(this._getStateData(this._eohub.getEdition())
            .then((mapObject) => {
                let state = mapObject.stateMap.get(stateID);
                let requiredStates = this._getRequiredStates(state, mapObject.stateMap, []);
                let futureStates = this._getFutureStates(state, mapObject.stateMap, []);

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
                    object: VIDE_PROTOCOL.OBJECT.STATE,
                    objectID: stateID,
                    contexts: contexts,
                    perspective: this._supportedPerspective,
                    operation: VIDE_PROTOCOL.OPERATION.VIEW
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
    /*
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
            return (request.object === VIDE_PROTOCOL.OBJECT.NOTATION && request.perspective !== _this._supportedPerspective);
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
    */
    _getVerovioDimensions(renderedSvg) {

        /*console.log('')
        console.log('/////////////////////////////////////////// getVerovioDimensions param renderedSvg:')
        console.log(renderedSvg)
        console.log('')*/

        try {
            let viewBoxHeight = parseInt(renderedSvg.querySelector('svg.definition-scale').getAttribute('viewBox').split(' ')[3],10)
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
            console.log('')
            console.log('[ERROR] Unable to determine dimensions of rendered SVG: ' + err)
            console.log(renderedSvg)
            return {
                relation: -1
            }
        }

    }

    //listener that triggers the context menu
    _clickNote(containerID, viewer, note, e) {
        let supportedRequests = this._eohub.getSupportedRequests();
        let requests = [];
        let filteredRequests = supportedRequests.filter((request) => {
            return (request.object === VIDE_PROTOCOL.OBJECT.NOTATION && request.perspective !== this._supportedPerspective);
        });

        filteredRequests.forEach((request, j) => {
            let req = Object.assign({}, request);
            req.id = note.id;
            requests.push(req);
        });

        let closeFunc = () => {
            //console.log('nothing happened')
        };
        try {
            this._eohub._viewManager.setContextMenu(requests, e, containerID, closeFunc);
        } catch(err) {
            console.log('[ERROR] Unable to open context menu: ' + err);
        }

    }

    _createRect(viewer,containerID, shapesArray) {

        if(shapesArray.length === 0) {
            //console.log('[WARNING] no shapes provided that could be focussed on')
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

        //no element could be found
        if(elem === null) {
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

    _setOsdOptions(containerID, baseDimensions) {

        return {
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
            collectionImmediately: true,
            visibilityRatio: 0.2,
            constrainDuringPan: true
        }

    }

    _activateInvariance(containerID,request) {
        //console.log('--------------41.5 activating invariance')

        let req = {
            edition: this._eohub.getEdition(),
            version: this._eohub.getRevision(),
            type: 'getInvariance'
        }
        this.requestData(req,true).then((json) => {
            try {
                let activeState = document.getElementById(containerID).getAttribute('data-activeState');

                let list = document.querySelectorAll('#' + containerID + '_currentState svg g.note, #' + containerID + '_currentState svg g.rest, #' + containerID + '_currentState svg g.chord, #' + containerID + '_currentState svg g.beam');

                list.forEach((elem,i) => {
                    try {
                        let id = elem.id;
                        let state = json.baseStates[id];
                        let index = json.states.indexOf(state);
                        if(index !== -1) {
                            let color = this._colors.random[index];
                            elem.style.fill = color;
                            elem.style.stroke = color;
                        }

                        let relation = json.relations[id];
                        if(typeof relation !== 'undefined') {
                            let originState = relation.originState;
                            let originIndex = json.states.indexOf(originState);
                            if(originIndex !== -1) {
                                let originColor = this._colors.random[originIndex];
                                elem.style.fill = originColor;
                                elem.style.stroke = originColor;
                            }
                        }
                    } catch(err) {
                        console.log('[ERROR] Unable to highlight invariance of ' + id)
                    }


                });

                /*
                for(let i = 0; i < invarianceData.suppliedIDs.length; i++) {
                    try {
                        let elem = document.querySelector('#' + containerID + ' svg #' + invarianceData.suppliedIDs[i]);
                        if(elem !== null) {
                            elem.setAttribute('fill', suppliedColor);
                            elem.setAttribute('stroke', suppliedColor);
                        }
                    } catch(err) {
                        console.log('[ERROR] Unable to higlight suppliedID ' + invarianceData.suppliedIDs[i] + ' at index ' + i + ' | ' + err);
                    }
                }*/

                for(let i = 0; i < json.states.length; i++) {
                    let stateID = json.states[i];
                    try {
                        let elem = document.getElementById(containerID + '_' + stateID);
                        //only colorize when present -> deletions are omitted
                        if(elem !== null) {
                            //when a request is available, use that
                            if(typeof request !== 'undefined') {
                                let colorize = false;
                                if(request.id === stateID) {
                                    colorize = true;
                                }
                                if(!colorize) {
                                    for(let j = 0; j < request.contexts.length; j++) {
                                        if(request.contexts[j].context === VIDE_PROTOCOL.CONTEXT.STATE && request.contexts[j].id === stateID)
                                            colorize = true;
                                    }
                                }

                                if(colorize) {
                                    let color = this._colors.random[i];
                                    elem.style.backgroundColor = color;
                                } else {
                                    elem.style.backgroundColor = '#e5e5e533';
                                }

                            } else {
                            //fall back to simpler mechanism
                                if(elem.classList.contains('active') || elem.classList.contains('current')) {
                                    let color = this._colors.random[i];
                                    elem.style.backgroundColor = color;
                                } else {
                                    elem.style.backgroundColor = '#e5e5e533';
                                }

                            }

                        }
                    } catch(err) {
                        console.log('[ERROR] Unable to colorize state box for ' + stateID + ': ' + err)
                    }
                }

                //if everything went well, set the attribute to "visible"
                document.getElementById(containerID).setAttribute('data-invariance','visible');
            } catch(err) {
                console.log('[ERROR] Unable to activate invariance coloration')
            }
        });

    }

    _deactivateInvariance(containerID) {

        //remove color on all notes
        let list = document.querySelectorAll('#' + containerID + '_currentState svg g.note[style], #' + containerID + '_currentState svg g.rest[style], #' + containerID + '_currentState svg g.chord[style], #' + containerID + '_currentState svg g.beam[style]');
        list.forEach((elem,i) => {
            try {
                if(elem.hasAttribute('style')) {
                    elem.removeAttribute('style');
                }
            } catch(err) {
                //console.log('[ERROR] Unable to remove invariance highlighting on ' + id + ': ' + err)
            }
        });

        let stateBoxes = document.querySelectorAll('#' + containerID + '_statesBox .state');
        //console.log(' ------- try to remove ' + stateBoxes.length + ' things')
        stateBoxes.forEach((box,i) => {
            try {
                if(box.hasAttribute('style')) {
                    box.removeAttribute('style');
                }
            } catch(err) {
                //console.log('[ERROR] Unable to remove invariance highlighting on ' + id + ': ' + err)
            }
        });

        document.getElementById(containerID).setAttribute('data-invariance','hidden');
    }

    _getModuleState(containerID) {

        let invariance = document.getElementById(containerID).getAttribute('data-invariance') === 'visible';
        return {
            invariance: invariance
        }
    }

    //the following function removes renderings in single mode -> todo: fix that it only affects multi Scar mode
    /*_closeSingleScar(containerID) {
        super._closeSingleScar(containerID);

        //get rid of old rendering (if any)
        try {

            let list = document.querySelectorAll('#' + containerID + '_currentState');
            let viewer = this._cache.get(containerID + '_transcriptionViewer');
            for (let item of list) {
                viewer.removeOverlay(containerID + '_currentState');
                //console.log(item);
                item.parentNode.removeChild(item);
            }
        } catch(err) {
            //console.log('[INFO] There is no overlay to be removed: ' + err)
        }

    }*/

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
