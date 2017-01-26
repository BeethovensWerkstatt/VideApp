import { ActionTypes } from './actions.redux';
import { ViewLayouts } from './layout.constants';
import VIDE_PROTOCOL from '../_modules/vide-protocol';
import { StatusCodes } from './networking.constants';
import { combineReducers } from 'redux';

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
                return {...state, language: action.language};
            }
            return state;
        
        case ActionTypes.RESTORE_STATE:
            let pref = action.newState.preferences;
            
            if(typeof pref !== 'object') {
return state;
}
            
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
             
            return pref;
            
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
    revision: 'latest'
    }, 
    action) {
    switch (action.type) {
        
        case ActionTypes.RECEIVE_EDITIONS:
            return Object.assign({}, state, {
                editions: action.editions
            });
            
        case ActionTypes.SET_EDITION:
            //todo: interface with AppManager
            //window.EoHub.setEdition(action.id);
            return {...state, active: action.id};
        case ActionTypes.ACTIVATE_EDITION:
            //todo: interface with AppManager
            //window.EoHub.setEdition(action.id);
            return {...state, active: action.id};
        case ActionTypes.DEACTIVATE_EDITION:
            //todo: interface with AppManager
            //window.EoHub.unsetEdition();
            return {...state, active: null};
            
        case ActionTypes.RESTORE_STATE:
            
            let edition = action.newState.edition;
            
            if(typeof edition !== 'object') {
return state;
}
            
            if(!(editions in edition) || typeof edition.editions !== 'object') {
return state;
}
                
            if(!(active in edition) || typeof edition.active !== 'string') {
return state;
}
                
            if(!(revision in edition) || typeof edition.revision !== 'string') {
return state;
}
             
            return edition;
            
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
        view1: {perspective: Perspectives.FACSIMILE, viewState: null},
        view2: {perspective: Perspectives.TRANSCRIPTION, viewState: null}
    }, action) {
    switch (action.type) {
        
        case ActionTypes.CHANGE_VIEWSRATIO:
            if(!Number.isNaN(action.viewsRatio) && action.viewsRatio > .1 && action.viewsRatio < .9) {
                return Object.assign({}, state, { ratio: action.viewsRatio });
            }
            return state;
            
        case ActionTypes.SET_VIEW_LAYOUT:
        
            if(action.viewLayout in ViewLayouts) {
                Object.assign({}, state, { layout: action.viewLayout });
            } 
            return state; 
            
        case ActionTypes.DEACTIVATE_EDITION:
        
            return Object.assign({}, state, { layout: ViewLayouts.EDITION_SELECTION });
        
        case ActionTypes.SET_FIRST_VIEW:
            if(action.perspective in Perspectives) {
                return Object.assign({}, state, { view1: {
                    perspective: action.perspective,
                    viewState: action.viewState
                } }); 
            } 
            return state;
            
            
        case ActionTypes.SET_SECOND_VIEW:
            if(action.perspective in Perspectives) {
                return Object.assign({}, state, { view2: {
                    perspective: action.perspective,
                    viewState: action.viewState
                } }); 
            }
            return state;
        
        case ActionTypes.DEACTIVATE_EDITION:
            return Object.assign({}, state, {
                view1: {perspective: Perspectives.FACSIMILE, viewState: null},
                view2: {perspective: Perspectives.TRANSCRIPTION, viewState: null}
            });
            
        case ActionTypes.RESTORE_STATE:
            
            let views = action.newState.views;
            
            if(typeof views !== 'object') {
return state;
}
            
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
            
            return views;
            
        default: 
            return state;
    
    }
}

/** 
 * handleContextMenu is a Redux reducer composition which opens up the context menu when necessary
 * @param {object} state the default state, overridden with reak object if specified
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
             
            return contextMenu;
        
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
    dataUrl: '',
    dataStatus: StatusCodes.NO_CONNECTION,
    rethinkUrl: '',
    rethinkStatus: StatusCodes.NO_CONNECTION,
    userID: '',
    sessionID: ''
}, action) {
    switch (action.type) {
        
        case ActionTypes.REQUEST_EDITIONS:
            return Object.assign({}, state, {
                dataStatus: StatusCodes.CODE_100
            });
            
        case ActionTypes.RECEIVE_EDITIONS:
            return Object.assign({}, state, {
                dataStatus: (Object.keys(action.editions).length > 0) ? StatusCodes.CODE_200 : StatusCodes.CODE_204
            });
        case ActionTypes.RECEIVE_EDITIONS_FAILED:
            return Object.assign({}, state, {
                dataStatus: StatusCodes.CODE_404
            });
           
        case ActionTypes.RESTORE_STATE:
            
            let network = action.newState.network;
            
            if(typeof network !== 'object') {
                return state;
            }
            
            if(!(userID in network) || typeof network.userID !== 'string') {
                return state;
            }
            
            if(!(sessionID in network) || typeof network.sessionID !== 'string') {
return state;
}
            
            return network;
        
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
    network: handleNetwork
});

export default VideAppState;
