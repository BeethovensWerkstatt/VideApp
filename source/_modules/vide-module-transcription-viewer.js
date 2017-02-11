import 'babel-polyfill';
import VIDE_PROTOCOL from './vide-protocol';
import {EoModule, Request} from './vide-module-blueprint';


const VideTranscriptionViewer = class VideTranscriptionViewer extends EoModule {

    /*Constructor method*/
    constructor() {
        super();
        this._supportedPerspective = EO_Protocol.Perspective.PERSPECTIVE_TRANSCRIPTION;
        this._supportedRequests = [];
        let _this = this;
        
        //shows a complete state, without highlighting
        _this._supportedRequests.push({objectType: EO_Protocol.Object.OBJECT_STATE, contexts:[EO_Protocol.Context.CONTEXT_STATE], perspective: this._supportedPerspective, operation: EO_Protocol.Operation.OPERATION_VIEW});
        //highlights a note (or similar) within a state
        _this._supportedRequests.push({objectType: EO_Protocol.Object.OBJECT_NOTATION, contexts:[EO_Protocol.Context.CONTEXT_STATE], perspective: this._supportedPerspective, operation: EO_Protocol.Operation.OPERATION_VIEW});
        _this._supportedRequests.push({objectType: EO_Protocol.Object.OBJECT_LYRICS, contexts:[EO_Protocol.Context.CONTEXT_STATE], perspective: this._supportedPerspective, operation: EO_Protocol.Operation.OPERATION_VIEW});
        _this._supportedRequests.push({objectType: EO_Protocol.Object.OBJECT_DIR, contexts:[EO_Protocol.Context.CONTEXT_STATE], perspective: this._supportedPerspective, operation: EO_Protocol.Operation.OPERATION_VIEW});
        
        this._key = 'videTranscriptionViewer';
        this._serverConfig = {host: 'http://localhost', port: ':32105', basepath:'/'};
        
        this._stateStore = new Map();
        this._currentRendering = new Map();
        
        return this;
    }
    
    _prepareHTML(containerID) {
        let vb = document.createElement('div');
        vb.className = 'verovioBox';
        vb.id = containerID + '_verovioBox'; 
        
        let vn = document.createElement('div');
        vn.className = 'viewNavigation';
        vn.id = containerID + '_viewNavigation'; 
        
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
        tv.className = 'transcriptionView';
        
        tv.appendChild(vb);
        tv.appendChild(vn);
        
        document.getElementById(containerID).innerHTML = '';
        document.getElementById(containerID).appendChild(tv);
        
        return Promise.resolve(tv);
    }
    
    unmount(containerID) {
        document.getElementById(containerID).innerHTML = '';
        this._currentRendering.delete(containerID);
    }
    
    _getStateData(editionID) {
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
    }
    
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
        /*
        let responseType = 'text';
        let url = this._getBaseURI() + 'edition/' + this._eohub.getEdition() + '/' + 'firstState/' + 'meiSnippet.xml';
        */
        
        let editionID = this._eohub.getEdition();
        
        this._getStateData(editionID)
            .then(mapObject => {
                return this.prepareStateRequest(mapObject.firstStateID, containerID);
            })
            .then((request) => {
                return Promise.resolve(this._eohub.sendSelfRequest(request, this));
            });
    }
    
    handleRequest(request) {
        let reqContainer = request.getContainer();
        
        let containerID = (reqContainer.endsWith('_VIEWTYPE_TRANSCRIPTIONVIEW')) ? reqContainer : reqContainer + '_VIEWTYPE_TRANSCRIPTIONVIEW';
        let activeStateIDs = request.getContextsByType(EO_Protocol.Context.CONTEXT_STATE);
        let mainStateID = (request.getObjectType() === EO_Protocol.Object.OBJECT_STATE) ? request.getObjectID() : null;
        
        return Promise.resolve(
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
                    if(request.getObjectType() !== EO_Protocol.Object.OBJECT_STATE) {
                        let targets = document.querySelectorAll('#' + containerID + ' svg #' + request.getObjectID());
                        for (let target of targets) {
                            target.classList.add('highlight');
                        }
                    }
                
                    if(request.getObjectType() !== EO_Protocol.Object.OBJECT_STATE && request.getObjectType() !== EO_Protocol.Object.OBJECT_NOTATION) {
                        console.log('[WARNING] No support for handling ' + request.getObjectType() + ' in videTranscriptionViewer.js yet.');
                    }
                
                    return Promise.resolve(true);
                }));
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
            return (request.objectType === EO_Protocol.Object.OBJECT_NOTATION && request.perspective !== _this._supportedPerspective);
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
