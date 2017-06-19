import 'babel-polyfill';
import VIDE_PROTOCOL from './vide-protocol';
import {EoModule} from './vide-module-blueprint';
let Drop = require('tether-drop');

const EoNavModule = class EoNavModule extends EoModule {

    /*Constructor method*/
    constructor() {
        super();
                
        //used for I18n to identify how individual states are labeled
        this._stateLabelKeySingular = '';
        this._stateLabelKeyPlural = '';
        
        //whether genetic states which are pure deletions shall be rendered in navigation or not
        this._showDeletions = true;
        
        return this;
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
    
    _getScarCategories(editionID) {
        let req = {id: editionID,type:'getScarCategories'};
        return this.requestData(req,true);
    }
    
    _setupNavHtml(containerID) {
    
        let navOverlay = document.createElement('div');
        navOverlay.id = containerID + '_navOverlay';
        navOverlay.className = 'navOverlay overview';
        
        let statenav = document.createElement('div');
        statenav.id = containerID + '_stateNavigation';
        statenav.className = 'stateNavigation';
        
        let scarBox = document.createElement('div');
        scarBox.id = containerID + '_scarBox';
        scarBox.className = 'scarBox';
        
        let statesBox = document.createElement('div');
        statesBox.id = containerID + '_statesBox';
        statesBox.className = 'statesBox';
        
        statenav.appendChild(scarBox);
        statenav.appendChild(statesBox);
        
        let scarLabel = document.createElement('div');
        scarLabel.id = containerID + '_scarLabel';
        scarLabel.className = 'scarLabel';
        
        let prevScar = document.createElement('div');
        prevScar.className = 'prevScarBtn';
        prevScar.innerHTML = '<i class="fa fa-chevron-left" aria-hidden="true"></i>';
        
        let nextScar = document.createElement('div');
        nextScar.className = 'nextScarBtn';
        nextScar.innerHTML = '<i class="fa fa-chevron-right" aria-hidden="true"></i>';
        
        let categoryFilter = document.createElement('div');
        categoryFilter.className = 'categoryFilterBtn';
        categoryFilter.innerHTML = '<i class="fa fa-bars" aria-hidden="true"></i>';
        
        navOverlay.appendChild(prevScar);
        navOverlay.appendChild(nextScar);
        navOverlay.appendChild(scarLabel);
        navOverlay.appendChild(statenav);
        navOverlay.appendChild(categoryFilter);
        
        document.getElementById(containerID).appendChild(navOverlay);
        
        this._setupViewSelect(containerID + '_navOverlay', containerID);
        
        //setup scar selector box
        this._getScarCategories(this._eohub.getEdition()).then((categories) => {
        
            let div = document.createElement('div');
            div.classList.add('scarCategories');
            let header = document.createElement('h1');
            let headerString = this._eohub.getI18nString('categories');
            header.setAttribute('data-i18n-text','categories');
            header.innerHTML = headerString;
            
            let ul = document.createElement('ul');
            let i=0;
            let j=categories.length;
            
            //todo: turn these into check boxes…
            for(i;i<j;i++) {
                let li = document.createElement('li');
                let key = categories[i];
                try {
                    let value = this._eohub.getI18nString(key);
                    let icon = document.createElement('i');
                    icon.classList.add('fa-check-square-o','fa');
                    icon.setAttribute('aria-hidden','true');
                    li.appendChild(icon);
                    let content = document.createElement('span');
                    content.innerHTML = value;
                    content.setAttribute('data-i18n-text',key);
                    content.classList.add('content')
                    li.appendChild(content);
                    li.addEventListener('click',(e) => {
                        icon.classList.toggle('fa-check-square-o');
                        icon.classList.toggle('fa-square-o');
                        
                        let list = document.querySelectorAll('#' + containerID + ' .scarBox .scar.' + key)
                        
                        for (var item of list) {
                            item.style.visibility = 'hidden';
                        }
                        
                    });
                } catch(err) {
                    console.log('ERROR: Unable to resolve ' + key + ': ' + err)
                }
                
                ul.appendChild(li);
            }
        
            div.appendChild(header);
            div.appendChild(ul);
            
            //console.log(div)
            
            let drop;
    
            drop = new Drop({
              target: categoryFilter,
              content: div,
              //position: 'bottom center',
              openOn: 'click',
              constrainToWindow: true,
              classes: 'drop-theme-arrows',
              tetherOptions: {
                attachment: 'top center',
                targetAttachment: 'bottom center',
                constraints: [
                  {
                    to: 'window',
                    pin: true,
                    attachment: 'both'
                  }
                ]
              }
            });
        });
        
        this._getMeasureData(this._eohub.getEdition()).then((measureJson) => {
            
            //load scar overview
            let staffCount = measureJson.staves.length;
            
            let m=0;
            let n=measureJson.measures.length;
            
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
                    let req = {
                        id: measure.id,
                        object: VIDE_PROTOCOL.OBJECT.NOTATION,
                        contexts: [],
                        perspective: this._supportedPerspective,
                        operation: VIDE_PROTOCOL.OPERATION.VIEW,
                        state: {}
                    };
                    
                    this._eohub.sendSelfRequest(req,this,containerID);
                })
                            
                //insert overlays for scars 
                let k=0;
                let l=measure.scars.length;
                for(k;k<l;k++) {
                    
                    let scar = measure.scars[k];
                    let scarObj = measureJson.scars.find((obj) => {
                        return obj.id === scar.scar;  
                    });
                    
                    elem.classList.add('unflex')
                    
                    if(scar.complete) {
                        let scarElem = document.createElement('div');
                        scarElem.classList.add('scar');
                        scarElem.classList.add('complete');
                        scarElem.setAttribute('data-scar',scar.scar);
                        
                        let t = 0;
                        let s = scarObj.categories.length;
                        for(t; t < s; t++) {
                            scarElem.classList.add(scarObj.categories[t]);
                        }
                        
                        elem.append(scarElem);
                        
                        //handler to jump to a specific scar
                        scarElem.addEventListener('click',(e) => {
                            let elem = e.currentTarget;
                            this._highlightScarForNav(containerID,scar.scar);
                            //e.stopPropagation();
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
                            
                            let t = 0;
                            let s = scarObj.categories.length;
                            for(t; t < s; t++) {
                                scarElem.classList.add(scarObj.categories[t]);
                            }
                            
                            elem.append(scarElem);
                            
                            scarElem.addEventListener('click',(e) => {
                                let elem = e.currentTarget;
                                this._highlightScarForNav(containerID,scar.scar);
                                e.stopPropagation();
                            })
                        }
                       
                    }
                    
                }
            }
            
            //todo: deal with navMode, and what is actually highlighted in here…
        });    
        
        this._getStateData(this._eohub.getEdition()).then((stateJson) => {
        
            //listener for next scar button
            prevScar.addEventListener('click',(e) => {
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
            nextScar.addEventListener('click',(e) => {
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
            scarLabel.addEventListener('click',(e) => {
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
                    perspective: this._supportedPerspective,
                    operation: VIDE_PROTOCOL.OPERATION.VIEW,
                    state: this._getModuleState(containerID) //{}
                };
                this._eohub.sendSelfRequest(req,this,containerID);
                           
            });
            
        
            this._highlightScarForNav(containerID,stateJson[0].id);   
        });
        
    }
    
    _setupStatesNav(containerID, scar, currentState = '', activeStates = []) {
        
        let columns = 0;
        let stateArray = [];
        
        let statesBox = document.getElementById(containerID + '_statesBox');
        let previousScarId = statesBox.getAttribute('data-scarId');
        
        //generate new HTML for this scar
        if(previousScarId !== scar.id) {
        
            statesBox.setAttribute('data-scarId',scar.id);
            
            for(let i in scar.states) {
                let state = scar.states[i];
                
                columns = (state.position > columns) ? state.position : columns;
                
                if(columns > stateArray.length) {
                    let newArray = [];
                    stateArray.push(newArray);
                }
                stateArray[columns - 1].push(state);    
            }
                
            //empty states from former scar
            //todo: remove listeners
            statesBox.innerHTML = '';
                
            //add a single column for each simultaneous "step" 
            for(let n=0; n<columns; n++) {
                let columnsBox = document.createElement('div');
                columnsBox.classList.add('columnsBox');
                    
                //within each column, add corresponding states
                for(let m=0; m<stateArray[n].length; m++) {
                    let stateObj = stateArray[n][m];
                    
                    //skip the box when necessary
                    if(!this._showDeletions && stateObj.deletion) {
                        //console.log('no show for ' + n + ' / ' + m)
                        continue;
                    }
                    
                    //console.log('---- show ' + n + ' / ' + m)
                    
                    let stateBox = document.createElement('div');
                    stateBox.classList.add('state');
                    stateBox.setAttribute('data-stateid', stateObj.id);
                    stateBox.setAttribute('data-statePos', stateObj.position);
                    
                    stateBox.id = containerID + '_' + stateObj.id;
                    
                    if(stateObj.id === currentState) {
                        stateBox.classList.add('current');
                    }
                    
                    if(activeStates.indexOf(stateObj.id) !== -1) {
                        stateBox.classList.add('active');
                    }
                    
                    if(stateObj.deletion) {
                        stateBox.classList.add('deletion');
                    }
                    
                    //todo: make this compatible with I18n
                    stateBox.innerHTML = '<label>' + stateObj.label + '</label>';
                    columnsBox.appendChild(stateBox);
                    
                    let stateSelect = (event) => {
                        
                        let requiredStates = [];
                        //todo: add possibility to deactivate state
                        /* 
                            keep var toBeDeactivated when iterating over states, 
                            when stateObj.id === current state, set to true
                            problem: request object needs an active object! 
                        */
                        let p = 0;
                        let q = scar.states.length;
                        
                        //iterate over all states, identify the ones that need to be activated
                        for(p; p<q; p++) {
                            let queriedState = scar.states[p];
                            let queriedStateElem = document.getElementById(containerID + '_' + queriedState.id);
                            
                            //skip, because deletions aren't shown
                            if(queriedStateElem === null && !this._showDeletions) {
                                continue;
                            }
                            
                            let lesserPos = (queriedState.position < stateObj.position && !queriedState.deletion);
                            let isActive = (queriedState.position <= stateObj.position && (queriedStateElem.classList.contains('active') || queriedStateElem.classList.contains('current')));
                            let isDeletion = stateObj.deletion && (queriedStateElem.classList.contains('active') || queriedStateElem.classList.contains('current')) && (queriedState.position <= stateObj.position);
                            
                            //console.log('state ' + queriedState.id + ' has lesser position: ' + lesserPos);
                            //console.log('state ' + queriedState.id + ' is already active: ' + isActive);
                            //console.log('state ' + queriedState.id + ' is an (activated) deletion: ' + isDeletion);
                            
                            if(lesserPos || isActive || isDeletion) {
                                
                                //console.log('…and accordingly, it should be kept active…')
                                requiredStates.push({id: queriedState.id, context: VIDE_PROTOCOL.CONTEXT.STATE});
                            }
                        }
                        
                        let req = {
                            id: stateObj.id,
                            object: VIDE_PROTOCOL.OBJECT.STATE,
                            contexts: requiredStates,
                            perspective: this._supportedPerspective,
                            operation: VIDE_PROTOCOL.OPERATION.VIEW,
                            state: this._getModuleState(containerID) //{}
                        }
                        
                        this._eohub.sendSelfRequest(req,this,containerID);
                    };
                    stateBox.addEventListener('click', stateSelect);
                }
                
                statesBox.appendChild(columnsBox);
            };
        } else {
        
            let p = 0;
            let q = scar.states.length;
            for(p; p<q; p++) {
                let queriedState = scar.states[p];
                let queriedStateElem = document.getElementById(containerID + '_' + queriedState.id);
                
                //skip, because deletions aren't shown
                if(queriedStateElem === null && !this._showDeletions) {
                    continue;
                }
                
                if(queriedState.id === currentState) {
                    queriedStateElem.classList.add('current');
                } else {
                    queriedStateElem.classList.remove('current');
                }
                
                if(activeStates.indexOf(queriedState.id) !== -1) {
                    queriedStateElem.classList.add('active');
                } else {
                    queriedStateElem.classList.remove('active');
                }
                
            }
        }
        
        
        
    }
    
    
    _highlightScarForNav(containerID, scarId) {
        this._removeScarHighlightForNav(containerID);
        this._closeSingleScar(containerID);
        
        let editionID = this._eohub.getEdition();
        this._getStateData(editionID).then((stateJson) => {
            
            let scarObj = stateJson.find((elem) => {
                return elem.id === scarId;
            });
            
            try {
                let label = document.getElementById(containerID + '_scarLabel');
                
                //opt.setAttribute('data-i18n-text',key)
                //opt.innerHTML = this._eohub.getI18nString(key);
                
                let openKey = 'open';
                let openLabel = this._eohub.getI18nString(openKey);
                
                let i18n = this._eohub.getI18nString(openKey);
                
                let statesKey = (scarObj.states.length === 1) ? this._stateLabelKeySingular : this._stateLabelKeyPlural;
                let statesLabel = this._eohub.getI18nString(statesKey);
                
                let button = '<span class="openScarBtn"><span class="openScarBtnLabel" data-i18n-text="' + openKey + '">' + openLabel + '</span> ' + scarObj.label + ' <span class="itemCount">(' + scarObj.states.length + ' <span data-i18n-text="' + statesKey + '">' + statesLabel + '</span>)</span></span>';
                
                label.innerHTML = button;
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
    
    _openSingleScar(containerID, scarId, currentState = '', activeStates = []) {
        let editionID = this._eohub.getEdition();
        this._highlightScarForNav(containerID, scarId);
        this._getStateData(editionID).then((stateJson) => {
            let scarObj = stateJson.find((elem) => {
                return elem.id === scarId;
            });
            
            this._setupStatesNav(containerID, scarObj, currentState, activeStates);
            
            try {
                document.querySelector('#' + containerID + ' .navOverlay').classList.add('scarOpen')
                document.querySelector('#' + containerID + '_scarLabel .openScarBtnLabel').style.display = 'none';
                document.querySelector('#' + containerID + '_scarLabel .itemCount').style.display = 'none';    
                document.querySelector('#' + containerID + ' .navOverlay').classList.remove('overview')
            } catch(err) {
                console.log('Unable to get ' + '#' + containerID + '_scarLabel .openScarBtnLabel')
                console.log(document.querySelector('#' + containerID + '_scarLabel'))
            }
            
            
            document.getElementById(containerID + '_scarBox').style.visibility = 'hidden';
            document.getElementById(containerID + '_statesBox').style.visibility = 'visible';
        });
    }
    
    _closeSingleScar(containerID) {
        document.getElementById(containerID + '_scarBox').style.visibility = 'visible';
        document.getElementById(containerID + '_statesBox').style.visibility = 'hidden';
        
        try {
            document.querySelector('#' + containerID + ' .navOverlay').classList.remove('scarOpen')
            document.querySelector('#' + containerID + ' .navOverlay').classList.add('overview')
            document.querySelector('#' + containerID + '_scarLabel .openScarBtnLabel').style.display = 'inline';
            document.querySelector('#' + containerID + '_scarLabel .itemCount').style.display = 'inline';   
        } catch(err) {
            console.log('Unable to get ' + '#' + containerID + '_scarLabel .openScarBtnLabel')
            console.log(document.querySelector('#' + containerID + '_scarLabel'))
        }
        
    }
    
    //expected to be overwritten by instances
    _getModuleState(containerID) {
        return {};
    }
    
};

export { EoNavModule };