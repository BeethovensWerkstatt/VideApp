import { ActionTypes } from './actions.redux';
import { ViewLayouts } from './layout.constants';
import VIDE_PROTOCOL from '../_modules/vide-protocol';
import { StatusCodes } from './networking.constants';
import { combineReducers } from 'redux';

import { eohub } from '../_modules/eo-hub'; 

var semver = require('semver');


let Perspectives = VIDE_PROTOCOL.PERSPECTIVE;

/** 
 * handlePreferences is a Redux reducer composition which deals with all
 * preferences for the application, that is, which overlays are openend
 * program language etc. 
 * @param {object} state the default state, overridden with real object if specified
 * @param {object} action the action that modifies the current state
 * @returns {object} the (potentially modified) state object
 */
export function handlePreferences(state = {
    showPreferences: false,
    language: 'en',
    showAbout: false
},
    action) {
    switch (action.type) {

        case ActionTypes.SHOW_PREFERENCES:
            return {...state, showPreferences: true};
        case ActionTypes.HIDE_PREFERENCES:
            return {...state, showPreferences: false};
            
        case ActionTypes.SHOW_ABOUT:
            return {...state, showAbout: true};
        case ActionTypes.HIDE_ABOUT:
            return {...state, showAbout: false};
        
        case ActionTypes.SWITCH_LANGUAGE:
            //todo: check if language is supported  
            if(action.language) {
                eohub.setLanguage(action.language);
                return {...state, language: action.language};
            }
            return state;
        
        case ActionTypes.RESTORE_STATE:
            let pref = action.newState.preferences;
            
            if(typeof pref !== 'object') {
                return state;
            }
            /*
            if(!(showPreferences in pref) || typeof pref.showPreferences !== 'boolean') {
                return state;
            }
            
            if(!(showAbout in pref) || typeof pref.showAbout !== 'boolean') {
                return state;
            }
                
            //todo: check if language is supported
            if(!(language in pref) || typeof pref.language !== 'string') {
                return state;
            }
            */
            return pref;
        
        case ActionTypes.RESET_STATE:
            
            return {
                showPreferences: false,
                language: state.language,
                showAbout: false
            };
        
        default: 
            return state;
    
    }
}

/** 
 * handleEdition is a Redux reducer composition which holds the available
 * editions, as well as a pointer to the active edition and which revision
 * of this edition is displayed
 * @param {object} state the default state, overridden with real object if specified
 * @param {object} action the action that modifies the current state
 * @returns {object} the (potentially modified) state object
 */
export function handleEdition(state = {
    editions: {},
    active: '',
    highlighted: '',
    revision: ''
}, 
    action) {
    switch (action.type) {
        
        case ActionTypes.RECEIVE_EDITIONS:
            return Object.assign({}, state, {
                editions: action.editions
            });
            
        /*case ActionTypes.SET_EDITION:
            //todo: interface with AppManager
            //window.EoHub.setEdition(action.id);
            return {...state, active: action.id};*/
            
        case ActionTypes.HIGHLIGHT_EDITION:
            return {...state, highlighted: action.id};
            
        case ActionTypes.ACTIVATE_EDITION:
            
            let version = action.revision !== '' ? action.revision : semver.maxSatisfying(state.editions[action.id].revisions, '*');
            eohub.setEdition(action.id, version);
            
            return {...state, active: action.id, highlighted: '', revision: version};
        case ActionTypes.DEACTIVATE_EDITION:
            
            eohub.unsetEdition();
            return {...state, active: null, revision: ''};
            
        case ActionTypes.RESTORE_STATE:
            
            let edition = action.newState.edition;
            
            if(typeof edition !== 'object') {
                return state;
            }
            /*
            if(!(editions in edition) || typeof edition.editions !== 'object') {
                return state;
            }
                
            if(!(active in edition) || typeof edition.active !== 'string') {
                return state;
            }
                
            if(!(revision in edition) || typeof edition.revision !== 'string') {
                return state;
            }
            */
            return edition;
        case ActionTypes.RESET_STATE:
            
            return Object.assign({}, state, { active: '', highlighted: '', revision: '' });
            
        default: 
            return state;
    
    }
}

/** 
 * handleViews is a Redux reducer composition, which deals with everything related to 
 * the views on the current edition
 * @param {object} state the default state, overridden with real object if specified
 * @param {object} action the action that modifies the current state
 * @returns {object} the (potentially modified) state object
 */
export function handleViews(state = {
    layout: ViewLayouts.INTRODUCTION,
    ratio: .5,
    synced: false,
    view1: {moduleKey: 'VideTextViewer', request: null, state: null, log: false},
    view2: {moduleKey: 'VideXmlViewer', request: null, state: null, log: false}
}, action) {
    switch (action.type) {
        
        
        /* 
         * INFO
         * 
         * cap of viewRatio to be .1 <= viewRatio <= .9 also enforced in Views.react.js
         */
        
        case ActionTypes.SET_VIEW_RATIO:
            if(!Number.isNaN(action.viewRatio)) {
                let ratio = action.viewRatio;
                if(ratio < .1) {
                    ratio = .1;
                }
                if(ratio > .9) {
                    ratio = .9;
                }
                return Object.assign({}, state, { ratio: ratio });
            }
            return state;
            
        case ActionTypes.SET_VIEW_LAYOUT:
            
            if(action.viewLayout in ViewLayouts) {
                return Object.assign({}, state, { layout: action.viewLayout });
            } 
            return state; 
        
        case ActionTypes.SET_FIRST_VIEW:
            if(action.request === null && typeof action.moduleKey === 'string') {
                return Object.assign({}, state, { 
                    view1: Object.assign({}, state.view1, {moduleKey: action.moduleKey, request: action.request, state: null, log: false}) 
                }); 
            } else if(Object.values(Perspectives).indexOf(action.request.perspective) !== -1){
                return Object.assign({}, state, { 
                    view1: Object.assign({}, state.view1, {moduleKey: action.moduleKey, request: action.request, state: null, log: false}) 
                }); 
            } 
            return state;
            
        case ActionTypes.SET_SECOND_VIEW:
            if(action.request === null && typeof action.moduleKey === 'string') {
                return Object.assign({}, state, { 
                    view2: Object.assign({}, state.view2, {moduleKey: action.moduleKey, request: action.request, state: null, log: false}) 
                }); 
            } else if(Object.values(Perspectives).indexOf(action.request.perspective) !== -1){
                return Object.assign({}, state, { 
                    view2: Object.assign({}, state.view2, {moduleKey: action.moduleKey, request: action.request, state: null, log: false}) 
                }); 
            } 
            return state;
        
        case ActionTypes.SET_SYNC_VIEWS: 
            
            if(typeof action.synced !== 'boolean') {
                return state;
            }
            
            return Object.assign({}, state, { synced: action.synced });
        
        case ActionTypes.CONFIRM_VIEW:
            
            if(action.view === 1) {
                let newState = Object.assign({}, state, { view1:
                    Object.assign({}, state.view1, {state: action.state, log: true})
                });    
                
                return newState; 
                
            } else if(action.view === 2) {
                let newState = Object.assign({}, state, { view2:
                    Object.assign({}, state.view2, {state:action.state, log: true})
                });    
                
                return newState; 
            }
            
            return state; 
        
        case ActionTypes.ACTIVATE_EDITION:
        
            return Object.assign({}, state, { layout: ViewLayouts.SINGLE_VIEW });
        
        
        case ActionTypes.DEACTIVATE_EDITION:
            return Object.assign({}, state, {
                view1: {moduleKey: 'VideTextViewer', request: null, state: null, log: false},
                view2: {moduleKey: 'VideXmlViewer', request: null, state: null, log: false}
                /*view1: {perspective: Perspectives.FACSIMILE, target: null, temp: false},
                view2: {perspective: Perspectives.TRANSCRIPTION, target: null, temp: false}*/
            });
            
        case ActionTypes.RESTORE_STATE:
            
            let views = action.newState.views;
            
            if(typeof views !== 'object') {
                return state;
            }
            /*
            if(!(layout in views) || !(views.layout in ViewLayouts)) {
                return state;
            }
                
            if(!(ratio in views) || typeof views.ratio !== 'number' || views.ratio <= .1 || views.ratio >= .9) {
                return state;
            }
            
            if(!(view1 in views) || typeof views.view1 !== 'object' || !(views.view1.perspective in Perspectives) || typeof views.view1.viewState !== 'object') {
                return state;
            }
            
            if(!(view2 in views) || typeof views.view2 !== 'object' || !(views.view2.perspective in Perspectives) || typeof views.view2.viewState !== 'object') {
                return state;
            }
            */
            let fixedViews = Object.assign({}, views, {
                view1: Object.assign({}, views.view1, {temp: false}),
                view2: Object.assign({}, views.view2, {temp: false})
            })
            
            return fixedViews;
        
        case ActionTypes.RESET_STATE:
            
            return {
                layout: ViewLayouts.INTRODUCTION,
                ratio: .5,
                synced: false,
                view1: {moduleKey: 'VideTextViewer', request: null, state: null, log: false},
                view2: {moduleKey: 'VideXmlViewer', request: null, state: null, log: false}
            };
            
        default: 
            return state;
    
    }
}

/** 
 * handleContextMenu is a Redux reducer composition which opens up the context menu when necessary
 * @param {object} state the default state, overridden with real object if specified
 * @param {object} action the action that modifies the current state
 * @returns {object} the (potentially modified) state object
 */
export function handleContextMenu(state = {visible: false, items:[], x: 0, y: 0}, action) {
    switch (action.type) {
        
        case ActionTypes.OPEN_CONTEXTMENU:   
            return {visible: true, items: action.items, x: action.x, y: action.y};
        
        case ActionTypes.RESTORE_STATE:
            
            let contextMenu = action.newState.contextMenu;
            
            if(typeof contextMenu !== 'object') {
                return state;
            }
            /*
            if(!(visible in contextMenu) || typeof contextMenu.visible !== 'boolean') {
                return state;
            }
                
            if(!(items in contextMenu) || !Array.isArray(contextMenu.items)) {
                return state;
            }
                
            if(!(x in contextMenu) || typeof contextMenu.x !== 'number') {
                return state;
            }
                
            if(!(y in contextMenu) || typeof contextMenu.y !== 'number') {
                return state;
            }
            */ 
            return contextMenu;
        
        case ActionTypes.RESET_STATE:
            
            return {visible: false, items: [], x: 0, y: 0};
        
        //closing the context menu is no different from the default…
        default: 
            return {visible: false, items: [], x: 0, y: 0};
    
    }
}

/** 
 * handleNetwork is a Redux reducer composition that handles all aspects of networking
 * and user identification.
 * @param {object} state the default state, overridden with reak object if specified
 * @param {object} action the action that modifies the current state
 * @returns {object} the (potentially modified) state object
 */
export function handleNetwork(state = {
    dataStatus: StatusCodes.NO_CONNECTION,
    activeRequests: [],
    nolog: false,
}, action) {
    switch (action.type) {
        
        case ActionTypes.REQUEST_EDITIONS:
            return Object.assign({}, state, {
                dataStatus: StatusCodes.CODE_100,
                nolog: true
            });
            
        case ActionTypes.RECEIVE_EDITIONS:
            return Object.assign({}, state, {
                dataStatus: (Object.keys(action.editions).length > 0) ? StatusCodes.CODE_200 : StatusCodes.CODE_204,
                nolog: false
            });
        case ActionTypes.RECEIVE_EDITIONS_FAILED:
            return Object.assign({}, state, {
                dataStatus: StatusCodes.CODE_404
            });
            
        case ActionTypes.HIGHLIGHT_EDITION: 
            return Object.assign({}, state, {
                nolog: true
            });
            
        case ActionTypes.START_LOADING_DATA:
        
            let newRequests = [...state.activeRequests];
            newRequests.push({key: action.key, type: action.requestType});
            return Object.assign({}, state, {
                activeRequests: newRequests,
                nolog: true
            });
            
        case ActionTypes.STOP_LOADING_DATA:
        
            let index = state.activeRequests.findIndex((request,index) => {
                return request.key === action.key;
            })
            let cleanedRequests = [...state.activeRequests];
            if(index > -1) {
                cleanedRequests.splice(index,1);
            }
        
            return Object.assign({}, state, {
                activeRequests: cleanedRequests,
                nolog: true
            });
           
        case ActionTypes.RESTORE_STATE:
            
            let network = action.newState.network;
            
            if(typeof network !== 'object') {
                return state;
            }
            /*
            if(!(userID in network) || typeof network.userID !== 'string') {
                return state;
            }
            
            if(!(sessionID in network) || typeof network.sessionID !== 'string') {
                return state;
            }
            */
            return network;
        
        case ActionTypes.RESET_STATE:
            
            return {
                dataStatus: StatusCodes.NO_CONNECTION,
                activeRequests: [],
                nolog: false,
            };
        
        default: 
            return Object.assign({}, state, {
                nolog: false
            });
    
    }
}

/** 
 * handleTour is a Redux reducer composition which takes care of application tours
 * @param {object} state the default state, overridden with real object if specified
 * @param {object} action the action that modifies the current state
 * @returns {object} the (potentially modified) state object
 */
export function handleTour(state = '', action) {
    
    console.log('')
    console.log('ACTION: ' + action.type)
    
    switch (action.type) {
        
        case ActionTypes.CLOSE_TOUR:   
            return '';
            
        case ActionTypes.LOAD_TOURSTEP:
        
            return action.id;
        
        case ActionTypes.RESTORE_STATE:
            
            let tour = action.newState.tour;
            
            if(typeof tour !== 'string') {
                return state;
            }
            
            return tour;
        
        case ActionTypes.RESET_STATE:
            
            return state;//this is required to go across the start menu with a tour.
        
        //closing the context menu is no different from the default…
        default: 
            return state;
    
    }
}

/**
 * This function pulls together the different bits and pieces and builds the complete state object
 */
const VideAppState = combineReducers({
    preferences: handlePreferences,
    edition: handleEdition,
    views: handleViews,
    contextMenu: handleContextMenu,
    network: handleNetwork,
    tour: handleTour
});

export default VideAppState;
