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
        
        //the label that labels the whole navBox
        let navOverviewLabel = document.createElement('div');
        navOverviewLabel.id = containerID + '_navOverviewLabel';
        navOverviewLabel.className = 'navLabel';
        let navOverviewLabelText = this._eohub.getI18nString('stateNav_textOverview');
        navOverviewLabel.setAttribute('data-i18n-text','stateNav_textOverview');
        navOverviewLabel.innerHTML = navOverviewLabelText;
        
        //the label that labels the whole navBox
        let navDetailLabel = document.createElement('div');
        navDetailLabel.id = containerID + '_navDetailLabel';
        navDetailLabel.classList.add('navLabel');
        navDetailLabel.classList.add('hidden');
        let navDetailLabelText = this._eohub.getI18nString('stateNav_scarDetail');
        navDetailLabel.innerHTML = '<span data-i18n-text="stateNav_scarDetail">' + navDetailLabelText + '</span> <span class="measureNumbers"></span>';
        
        let measuresBox = document.createElement('div');
        measuresBox.id = containerID + '_measuresBox';
        measuresBox.className = 'measuresBox';
        
        let currentMeasureIndicator = document.createElement('div');
        currentMeasureIndicator.id = containerID + '_currentMeasuresIndicator';
        currentMeasureIndicator.classList.add('currentMeasureIndicator');
        currentMeasureIndicator.classList.add('hidden');
        
        let braceBox = document.createElement('div');
        braceBox.id = containerID + '_braceBox';
        braceBox.className = 'braceBox';
        
        let scarBox = document.createElement('div');
        scarBox.id = containerID + '_scarBox';
        scarBox.className = 'scarBox';
        
        let statesBox = document.createElement('div');
        statesBox.id = containerID + '_statesBox';
        statesBox.className = 'statesBox';
        
        //this element gets animated when a scar is opened or closed
        let scarFrame = document.createElement('div');
        scarFrame.id = containerID + '_scarFrame';
        scarFrame.className = 'scarFrame';
        
        statesBox.appendChild(scarFrame);
        
        statenav.appendChild(navDetailLabel);
        scarBox.appendChild(measuresBox);
        scarBox.appendChild(currentMeasureIndicator);
        scarBox.appendChild(braceBox);
        statenav.appendChild(scarBox);
        statenav.appendChild(statesBox);
        
        let scarLabel = document.createElement('div');
        scarLabel.id = containerID + '_scarLabel';
        scarLabel.className = 'scarLabel';
        
        let closeScar = document.createElement('div');
        closeScar.className = 'closeScarBtn';
        closeScar.innerHTML = '<i class="fa fa-close" aria-hidden="true"></i>';
        let closeScarTitle = this._eohub.getI18nString('closeScarTooltip');
        closeScar.setAttribute('data-i18n-title','closeScarTooltip');
        closeScar.setAttribute('title',closeScarTitle);
        
        let prevScar = document.createElement('div');
        prevScar.className = 'prevScarBtn';
        prevScar.innerHTML = '<i class="fa fa-chevron-left" aria-hidden="true"></i>';
        let prevScarTitle = this._eohub.getI18nString('prevScarTooltip');
        prevScar.setAttribute('data-i18n-title','prevScarTooltip');
        prevScar.setAttribute('title',prevScarTitle);
        
        let nextScar = document.createElement('div');
        nextScar.className = 'nextScarBtn';
        nextScar.innerHTML = '<i class="fa fa-chevron-right" aria-hidden="true"></i>';
        let nextScarTitle = this._eohub.getI18nString('nextScarTooltip');
        nextScar.setAttribute('data-i18n-title','nextScarTooltip');
        nextScar.setAttribute('title',nextScarTitle);
        
        let categoryFilter = document.createElement('div');
        categoryFilter.className = 'categoryFilterBtn';
        categoryFilter.innerHTML = '<i class="fa fa-bars" aria-hidden="true"></i>';
        
        navOverlay.appendChild(navOverviewLabel);
        navOverlay.appendChild(closeScar);
        navOverlay.appendChild(prevScar);
        navOverlay.appendChild(nextScar);
        navOverlay.appendChild(scarLabel);
        navOverlay.appendChild(statenav);
        navOverlay.appendChild(categoryFilter);
        
        document.getElementById(containerID).appendChild(navOverlay);
        
        this._setupViewSelect(containerID + '_navOverlayMenu', containerID);
        
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
            let scarBoxHeight = 100; //this value is also used in _stateNavigation.scss!!!
            
            //total number of measures in the final text
            let measureCount = measureJson.measures.length;
            
            //this function inserts a measure number at the given index
            let measureNumberInsertionFunc = (index) => {
                index = Math.round(index);
                let measure = measureJson.measures[index];
                
                //try to avoid upbeats
                if(measure.label === '0') {
                    measureNumberInsertionFunc(index + 1);
                } else {
                    let measureNumberElem = document.createElement('div');
                    measureNumberElem.classList.add('measureNumber');
                    measureNumberElem.style.left = (100 / measureCount * index) + '%';
                    measureNumberElem.innerHTML = measure.label;
                    
                    measuresBox.appendChild(measureNumberElem)   
                }
            };
            
            //insert measure numbers for better orientation as appropriate
            if(measureCount < 10) {
                //have two measure numbers above
                measureNumberInsertionFunc(0);
                measureNumberInsertionFunc(measureCount / 2);
            } else if(measureCount < 20) {
                //have three measure numbers above
                measureNumberInsertionFunc(0);
                measureNumberInsertionFunc(measureCount / 3);
                measureNumberInsertionFunc(measureCount * 2 / 3);
            } else {
                //have four measure numbers above
                measureNumberInsertionFunc(0);
                measureNumberInsertionFunc(measureCount / 4);
                measureNumberInsertionFunc(measureCount * 2 / 4);
                measureNumberInsertionFunc(measureCount * 3 / 4);
            }
            
            //insert staves into preview for better orientation
            for(let index = 0; index < staffCount; index++) {
                let staff = measureJson.staves[index];
                
                let unit = scarBoxHeight / staffCount;
                let topDist = index * unit + .2 * unit;
                let staffHeight = unit * .6;
                
                let staffElem = document.createElement('div');
                staffElem.classList.add('staff');
                staffElem.style.top = topDist + 'px';
                staffElem.style.height = staffHeight + 'px';
                staffElem.setAttribute('data-label', (staff.label.length > 0) ? staff.label : index + 1);
                staffElem.setAttribute('data-index', index);
                scarBox.appendChild(staffElem)
            }
            
            
            /*let m=0;
            let n=measureJson.measures.length;*/
            
            //insert measures in scarBox
            /*for(m; m<n; m++) {
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
            */
            
            
            //generate boxes for scars
            this._getStateData(this._eohub.getEdition()).then((stateJson) => {
                for (let i = 0; i<stateJson.length;i++) {
                    let indizes = [];
                    let scar = stateJson[i];
                    for (let j=0; j < measureJson.measures.length;j++) {
                        if(scar.affectedMeasures.indexOf(measureJson.measures[j].id) !== -1) {
                            indizes.push(j);
                        }
                    }
                    
                    if(indizes.length > 0) {
                        let min = Math.min(...indizes);
                        let max = Math.max(...indizes);
                        
                        if(scar.complete) {
                            let scarElem = document.createElement('div');
                            scarElem.classList.add('scar');
                            scarElem.classList.add('complete');
                            scarElem.style.left = (100 / measureCount * min) + '%';
                            scarElem.style.right = (100 - (100 / measureCount * (max + 1))) + '%';
                            scarElem.setAttribute('data-scar',scar.id);
                            scarBox.append(scarElem);
                            
                            scarElem.addEventListener('click',(e) => {
                                let elem = e.currentTarget;
                                this._highlightScarForNav(containerID,scar.id);
                                //e.stopPropagation();
                            })
                        } else {
                            //scar affects only some staves
                             
                            let p = 0;
                            let q = scar.staves.length;
                            for(p; p<q; p++) {
                                let n = scar.staves[p] ;
                                let jsn = n - 1;
                                
                                let label = measureJson.staves[jsn].label;
                                if(label === '' || typeof label === 'undefined') {
                                    label = n;
                                }
                                
                                let unit = (scarBoxHeight / staffCount);
                                let top = jsn * unit + .1 * unit;
                                
                                let scarElem = document.createElement('div');
                                scarElem.classList.add('scar');
                                scarElem.classList.add('staff-only');
                                scarElem.setAttribute('data-scar',scar.id);
                                scarElem.setAttribute('data-staff-n',n);
                                scarElem.setAttribute('title',label);
                                scarElem.style.left = (100 / measureCount * min) + '%';
                                scarElem.style.right = (100 - (100 / measureCount * (max + 1))) + '%';
                                scarElem.style.top = top + '%';
                                scarElem.style.height = (unit * .8) + '%';
                                
                                /*let t = 0;
                                let s = scarObj.categories.length;
                                for(t; t < s; t++) {
                                    scarElem.classList.add(scarObj.categories[t]);
                                }*/
                                
                                scarBox.append(scarElem);
                                
                                scarElem.addEventListener('click',(e) => {
                                    let elem = e.currentTarget;
                                    this._highlightScarForNav(containerID,scar.id);
                                    //e.stopPropagation();
                                })
                                
                            }
                        }
                    //scar seems to affect only measures which aren't part of the final text
                    } else {
                        
                        let index = -1;
                        for(let j = 0; j< measureJson.measures.length;j++) {
                            if(measureJson.measures[j].id === scar.firstMeasure) {
                                index = j;
                                break;
                            }
                        }
                        
                        //check if firstMeasure has been found
                        if(index > -1) {
                            let scarElem = document.createElement('div');
                            scarElem.classList.add('scar');
                            scarElem.classList.add('intermediate');
                            //todo: check if only some staves are affected
                            scarElem.classList.add('complete');
                            scarElem.style.left = (100 / measureCount * index) + '%';
                            //scarElem.style.right = (100 - (100 / measureCount * (max + 1))) + '%';
                            scarElem.setAttribute('data-scar',scar.id);
                            scarBox.append(scarElem);
                            
                            scarElem.addEventListener('click',(e) => {
                                let elem = e.currentTarget;
                                this._highlightScarForNav(containerID,scar.id);
                                //e.stopPropagation();
                            })
                        } else {
                            console.log('[ERROR] Unable to render the following scar:')
                            console.log(scar)
                        }
                        
                    }
                    
                    
                }
            });
            
            //listener for clicks on measures
            let measureClickFunc = (e) => {
                
                e.preventDefault();
                e.stopPropagation();
                
                let totalWidth = scarBox.clientWidth;
                let layerX;
                
                if(e.target.id !== containerID + '_measuresBox') {
                    layerX = e.layerX + e.target.offsetLeft;
                } else {
                    layerX = e.layerX;
                }
                
                let index = Math.floor(measureCount / totalWidth * layerX);
                let measureObj = measureJson.measures[index];
                
                let req = {
                    id: measureObj.id,
                    object: VIDE_PROTOCOL.OBJECT.NOTATION,
                    contexts: [],
                    perspective: this._supportedPerspective,
                    operation: VIDE_PROTOCOL.OPERATION.VIEW,
                    state: {}
                };
                
                this._eohub.sendSelfRequest(req,this,containerID);
                
            };
            
            let measureHoverFunc = (e) => {
                /*console.log('mousemove')
                console.log(e)*/
                try {
                    currentMeasureIndicator.classList.remove('hidden');
                    
                    let layerX;
                    if(e.target.id !== measuresBox.id) {
                        layerX = e.layerX + e.target.offsetLeft;
                    } else {
                        layerX = e.layerX;
                    }
                    
                    let relativeX = (layerX + measuresBox.offsetLeft);
                    let totalWidth = scarBox.clientWidth;
                    let index = Math.floor(measureCount / totalWidth * layerX);
                    let measureObj = measureJson.measures[index];
                    
                    currentMeasureIndicator.innerHTML = measureObj.label;                    
                    currentMeasureIndicator.style.left = relativeX + 'px';    
                } catch(err) {
                    //console.log('[ERROR] Unable to show measure indicator')
                }
                
            };
            
            let measureLeaveFunc = (e) => {
                try {
                    currentMeasureIndicator.classList.add('hidden');                    
                } catch(err) {
                    //console.log('[ERROR] Unable to hide measure indicator')
                }
            };
            
            let scarBoxLeaveFunc = (e) => {
                
                try {
                    currentMeasureIndicator.classList.add('hidden');  
                
                    let oldStaff = document.querySelector('#' + containerID + ' .scarBox .staff.hovered');
                    if(oldStaff !== null) {
                        oldStaff.classList.remove('hovered');
                    }
                } catch(err) {
                    //console.log('[ERROR] Unable to hide measure indicator')
                }
            };
            
            let scarBoxHoverFunc = (e) => {
                try {
                    let layerX = e.layerX;
                    let layerY = e.layerY;
                    
                    if(e.target.id !== scarBox.id) {
                        layerX = layerX + e.target.offsetLeft;
                        layerY = layerY + e.target.offsetTop;
                    }
                    
                    if(e.target.id === measuresBox.id || e.target.classList.contains('measureNumber')) {
                        return false;
                    }
                    
                    //adjust measure indicator
                    let totalWidth = scarBox.clientWidth;
                    let measureIndex = Math.floor(measureCount / totalWidth * layerX);
                    let measureObj = measureJson.measures[measureIndex];
                    currentMeasureIndicator.innerHTML = measureObj.label;                    
                    currentMeasureIndicator.style.left = (layerX + measuresBox.offsetLeft) + 'px';
                    currentMeasureIndicator.classList.remove('hidden');
                    
                    //adjust staff highlight
                    let totalHeight = scarBox.clientHeight;
                    let staffIndex = Math.floor(staffCount / totalHeight * layerY);
                    
                    let oldStaff = document.querySelector('#' + containerID + ' .scarBox .staff.hovered');
                    if(oldStaff !== null/* && oldStaff.getAttribute('data-index' !== staffIndex)*/) {
                        oldStaff.classList.remove('hovered');
                    } 
                    
                    let newStaff = document.querySelector('#' + containerID + ' .scarBox .staff[data-index="' + staffIndex + '"]');
                    if(newStaff !== null) {
                        newStaff.classList.add('hovered')
                    }
                    
                } catch(err) {
                    //console.log('[ERROR] Unable to do proper highlighting')
                }
            }
            
            scarBox.addEventListener('mousemove',scarBoxHoverFunc);
            scarBox.addEventListener('mouseout',scarBoxLeaveFunc);
            
            measuresBox.addEventListener('click',measureClickFunc);
            measuresBox.addEventListener('mousemove',measureHoverFunc);
            measuresBox.addEventListener('mouseout',measureLeaveFunc);
            
            //todo: deal with navMode, and what is actually highlighted in here…
        });    
        
        this._getStateData(this._eohub.getEdition()).then((stateJson) => {
        
            
            if(stateJson.length > 1) {
                //listener for previous scar button
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
                    
                    //if a scar is open already, open the next one directly
                    if(navOverlay.classList.contains('scarOpen')) {
                        let firstState = stateJson[nextIndex].states[0];
                        let req = {
                            id: firstState.id,
                            object: VIDE_PROTOCOL.OBJECT.STATE,
                            contexts: [],
                            perspective: this._supportedPerspective,
                            operation: VIDE_PROTOCOL.OPERATION.VIEW,
                            state: this._getModuleState(containerID) //{}
                        };
                        this._eohub.sendSelfRequest(req,this,containerID);
                    //if no scar is open, move on to the next in preview mode
                    } else {
                        let nextScar = stateJson[nextIndex].id;
                        this._highlightScarForNav(containerID,nextScar);
                    }
                    
                });
                
                //listener for next scar button
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
                    
                    //if a scar is open already, open the next one directly
                    if(navOverlay.classList.contains('scarOpen')) {
                        let firstState = stateJson[nextIndex].states[0];
                        let req = {
                            id: firstState.id,
                            object: VIDE_PROTOCOL.OBJECT.STATE,
                            contexts: [],
                            perspective: this._supportedPerspective,
                            operation: VIDE_PROTOCOL.OPERATION.VIEW,
                            state: this._getModuleState(containerID) //{}
                        };
                        this._eohub.sendSelfRequest(req,this,containerID);
                    //if no scar is open, move on to the next in preview mode
                    } else {
                        let nextScar = stateJson[nextIndex].id;
                        this._highlightScarForNav(containerID,nextScar);
                    }
                    
                    
                });
            } else {
                prevScar.style.display = 'none';
                nextScar.style.display = 'none';
            }
            
            //listener for close scar button
            closeScar.addEventListener('click',(e) => {
                let currentScar = document.getElementById(containerID + '_scarLabel').getAttribute('data-scarId');
                
                this._highlightScarForNav(containerID,currentScar);
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
            
            //order states by simultaneous step
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
            let oldColumns = document.querySelectorAll('#' + containerID + ' .statesBox .timelineBox');
            for (let oldC of oldColumns) {
                //todo: remove listeners
                oldC.parentNode.removeChild(oldC);
            }
            
            //function for adding a state box
            let createStateBox = (container,stateObj) => {
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
                
                //todo: make this compatible with I18n
                stateBox.innerHTML = '<label>' + stateObj.label + '</label>';
                container.appendChild(stateBox);
                
                //define listener for clicking a variant or deletion state
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
                        try {
                            let queriedState = scar.states[p];
                            let queriedStateElem = document.getElementById(containerID + '_' + queriedState.id);
                            
                            //skip, because deletions aren't shown
                            if(queriedStateElem === null && !this._showDeletions) {
                                continue;
                            }
                            
                            let lesserPos = (queriedState.position < stateObj.position && !queriedState.deletion);
                            let isActive = ((queriedState.position <= stateObj.position || stateObj.deletion) && (queriedStateElem.classList.contains('active') || queriedStateElem.classList.contains('current')));
                            let isDeletion = stateObj.deletion && (queriedStateElem.classList.contains('active') || queriedStateElem.classList.contains('current')) && (queriedState.position <= stateObj.position);
                            
                            //console.log('state ' + queriedState.id + ' has lesser position: ' + lesserPos);
                            //console.log('state ' + queriedState.id + ' is already active: ' + isActive);
                            //console.log('state ' + queriedState.id + ' is an (activated) deletion: ' + isDeletion);
                            
                            if(lesserPos || isActive || isDeletion) {
                                
                                //console.log('…and accordingly, it should be kept active…')
                                requiredStates.push({id: queriedState.id, context: VIDE_PROTOCOL.CONTEXT.STATE});
                            }    
                        } catch(err) {
                            console.log('[ERROR] Unable to identify relevant states: ' + err)
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
              
            //add a single column for each simultaneous "step" 
            for(let n=0; n<columns; n++) {
                
                let variants = stateArray[n].filter((stateObj) => { return !stateObj.deletion });
                let deletions = stateArray[n].filter((stateObj) => { return stateObj.deletion });
                
                /*console.log('-----------------88')
                console.log('     In column ' + n + ', I have ' + variants.length + ' variants and ' + deletions.length + ' deletions')*/
                
                //distance from left side of box;
                let leftDist = (n * 50 + 10) + 'px';
                
                //insert a box for variants (if any)
                if(variants.length > 0) {
                    let variantsColumn = document.createElement('div');
                    variantsColumn.classList.add('variantsColumn');
                    variantsColumn.classList.add('timelineBox');
                    if(variants.length > 1) {
                        variantsColumn.classList.add('multipleVariants')
                    } else {
                        variantsColumn.classList.add('singleVariant')
                    }
                    variantsColumn.style.left = leftDist;
                    
                    //insert current variants
                    for (let i in variants) {
                        let stateObj = variants[i];
                        
                        createStateBox(variantsColumn,stateObj);
                        
                    }
                    
                    statesBox.appendChild(variantsColumn);
                }
                
                //insert a box for deletions (if any)
                if(deletions.length > 0 && this._showDeletions) {
                    let deletionsColumn = document.createElement('div');
                    deletionsColumn.classList.add('deletionsColumn');
                    deletionsColumn.classList.add('timelineBox');
                    if(deletions.length > 1) {
                        deletionsColumn.classList.add('multipleDeletions')
                    } else {
                        deletionsColumn.classList.add('singleDeletion')
                    }
                    deletionsColumn.style.left = leftDist;
                    
                    //insert current deletions
                    for (let i in deletions) {
                        let stateObj = deletions[i];
                        
                        createStateBox(deletionsColumn,stateObj);
                    }
                    
                    statesBox.appendChild(deletionsColumn);
                }
                
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
                
                let scarLabelKey = 'scarLabel';
                let scarLabel = this._eohub.getI18nString(scarLabelKey);
                
                let i18n = this._eohub.getI18nString(scarLabelKey);
                
                let statesKey = (scarObj.states.length === 1) ? this._stateLabelKeySingular : this._stateLabelKeyPlural;
                let statesLabel = this._eohub.getI18nString(statesKey);
                
                let detailsLinkKey = 'openScarDetails';
                let detailsLinkText = this._eohub.getI18nString(detailsLinkKey);
                
                let button = '<span class="openScarBtn"><span class="openScarBtnLabel" data-i18n-text="' + scarLabelKey + '">' + scarLabel + '</span> ' + scarObj.label + ' <span class="itemCount">(' + scarObj.states.length + ' <span data-i18n-text="' + statesKey + '">' + statesLabel + '</span>)</span></span><span class="detailsLink" data-i18n-text="' + detailsLinkKey + '">' + detailsLinkText + '</span>';
                
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
            
                let boxLabelOverview = document.getElementById(containerID + '_navOverviewLabel');
                let boxLabelDetail = document.getElementById(containerID + '_navDetailLabel');
                boxLabelOverview.classList.add('hidden');
                boxLabelDetail.classList.remove('hidden');
                
                try {
                    let highlightedScar = document.querySelector('#' + containerID + ' .scar.highlight');
                    let scarFrame = document.getElementById(containerID + '_scarFrame');
                    
                    let scarLabel = document.querySelector('#' + containerID + '_navDetailLabel .measureNumbers');
                    scarLabel.innerHTML = scarObj.label;
                    
                    scarFrame.classList.remove('animated');
                    scarFrame.style.top = highlightedScar.style.top;
                    scarFrame.setAttribute('data-top',highlightedScar.style.top);
                    scarFrame.style.left = highlightedScar.style.left;
                    scarFrame.setAttribute('data-left',highlightedScar.style.left)
                    scarFrame.style.right = highlightedScar.style.right;
                    scarFrame.setAttribute('data-right',highlightedScar.style.right)
                    scarFrame.style.height = highlightedScar.style.height;
                    scarFrame.setAttribute('data-height',highlightedScar.style.height)
                    scarFrame.classList.add('animated');
                } catch(err) {
                    console.log('[ERROR] Unable to catch position of highlighted scar: ' + err)
                }
                
                document.querySelector('#' + containerID + ' .navOverlay').classList.add('scarOpen')
                document.querySelector('#' + containerID + '_scarLabel .openScarBtnLabel').style.display = 'none';
                //document.querySelector('#' + containerID + '_scarLabel .itemCount').style.display = 'none';    
                document.querySelector('#' + containerID + ' .navOverlay').classList.remove('overview')
            } catch(err) {
                console.log('Unable to get ' + '#' + containerID + '_scarLabel .openScarBtnLabel: ' + err)
                console.log(document.querySelector('#' + containerID + '_scarLabel'))
            }
            
            
            document.getElementById(containerID + '_scarBox').style.visibility = 'hidden';
            document.getElementById(containerID + '_statesBox').style.visibility = 'visible';
        });
    }
    
    _closeSingleScar(containerID) {
    
        let boxLabelOverview = document.getElementById(containerID + '_navOverviewLabel');
        let boxLabelDetail = document.getElementById(containerID + '_navDetailLabel');
        boxLabelOverview.classList.remove('hidden');
        boxLabelDetail.classList.add('hidden');

        try {
        
            document.getElementById(containerID + '_scarBox').style.visibility = 'visible';
            document.getElementById(containerID + '_statesBox').style.visibility = 'hidden';
        
            document.querySelector('#' + containerID + ' .navOverlay').classList.remove('scarOpen')
            document.querySelector('#' + containerID + ' .navOverlay').classList.add('overview')
            document.querySelector('#' + containerID + '_scarLabel .openScarBtnLabel').style.display = 'inline';
            //document.querySelector('#' + containerID + '_scarLabel .itemCount').style.display = 'inline';   
        } catch(err) {
            console.log('Unable to get ' + '#' + containerID + '_scarLabel .openScarBtnLabel: ' + err)
            console.log(document.querySelector('#' + containerID + '_scarLabel'))
        }
        
    }
    
    //expected to be overwritten by instances
    _getModuleState(containerID) {
        return {};
    }
    
};

export { EoNavModule };