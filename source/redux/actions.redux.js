import fetch from 'isomorphic-fetch';
import VIDE_PROTOCOL from '../_modules/vide-protocol';

import {ViewLayouts} from './layout.constants';

let Perspective = VIDE_PROTOCOL.PERSPECTIVE;



/**
 * Action types
 */
export const ActionTypes = {
    SET_FIRST_VIEW: 'SET_FIRST_VIEW',
    SET_SECOND_VIEW: 'SET_SECOND_VIEW',
    
    SET_VIEW_RATIO: 'SET_VIEW_RATIO',
    SET_VIEW_LAYOUT: 'SET_VIEW_LAYOUT',
    
    SWITCH_LANGUAGE: 'SWITCH_LANGUAGE',
    
    SHOW_PREFERENCES: 'SHOW_PREFERENCES',
    HIDE_PREFERENCES: 'HIDE_PREFERENCES',
    
    SHOW_ABOUT: 'SHOW_ABOUT',
    HIDE_ABOUT: 'HIDE_ABOUT',
    
    REQUEST_EDITIONS: 'REQUEST_EDITIONS',
    RECEIVE_EDITIONS: 'RECEIVE_EDITIONS',
    RECEIVE_EDITIONS_FAILED: 'RECEIVE_EDITIONS_FAILED',
    SET_EDITION: 'SET_EDITION',
    
    ACTIVATE_EDITION: 'ACTIVATE_EDITION',
    DEACTIVATE_EDITION: 'DEACTIVATE_EDITION',
    
    OPEN_CONTEXTMENU: 'OPEN_CONTEXTMENU',
    CLOSE_CONTEXTMENU: 'CLOSE_CONTEXTMENU',
    
    RESTORE_STATE: 'RESTORE_STATE'
};

/** 
 * Function setFirstView specifies the view to be opened in view1
 * @param {string} perspective to be opened
 * @param {Object|null} viewState object when initializing the view
 * @returns {object} the information how view1.state needs to be modified
 */ 
export function setFirstView(perspective = Perspective.FACSIMILE, viewState = null) {
    return { type: ActionTypes.SET_FIRST_VIEW, perspective, viewState };
}

/** 
 * Function setSecondView specifies the view to be opened in view2
 * @param {string} perspective to be opened
 * @param {Object|null} viewState object when initializing the view
 * @returns {object} the information how view2.state needs to be modified
 */ 
export function setSecondView(perspective = Perspective.TRANSCRIPTION, viewState = null) {
    return { type: ActionTypes.SET_SECOND_VIEW, perspective, viewState };
}

/** 
 * Function setViewLayout specifies the general layout of the app
 * @param {string} viewLayout to be used
 * @returns {object} the layout that shall be used
 */ 
export function setViewLayout(viewLayout = ViewLayouts.INTRODUCTION) {
    return { type: ActionTypes.SET_VIEW_LAYOUT, viewLayout };
} 

/** 
 * Function setViewRation defines the part that view1 occupies
 * @param {number} viewRatio to be used
 * @returns {object} the information about the share that view1 gets
 */ 
export function setViewRatio(viewRatio = .5) {
    return { type: ActionTypes.SET_VIEW_RATIO, viewRatio };
} 

/** 
 * Function switchLanguage sets the language of the app
 * @param {string} language code
 * @returns {object} the language that shall be used
 */ 
export function switchLanguage(language = 'en') {
    return { type: ActionTypes.SWITCH_LANGUAGE, language };
}

/** 
 * Function showPreferences opens the preference window
 * @returns {object} the actionType that's required for Redux
 */ 
export function showPreferences() {
    return { type: ActionTypes.SHOW_PREFERENCES };
}

/** 
 * Function hidePreferences closes the preference window
 * @returns {object} the actionType that's required for Redux
 */ 
export function hidePreferences() {
    return { type: ActionTypes.HIDE_PREFERENCES };
}

/** 
 * Function showAbout opens the about window
 * @returns {object} the actionType that's required for Redux
 */ 
export function showAbout() {
    return { type: ActionTypes.SHOW_ABOUT };
}

/** 
 * Function hideAbout opens the about window
 * @returns {object} the actionType that's required for Redux
 */ 
export function hideAbout() {
    return { type: ActionTypes.HIDE_ABOUT };
}

//this is a think action creator; cf http://redux.js.org/docs/advanced/AsyncActions.html
//usage: store.dispatch(fetchEditions())
/** 
 * Function fetchEditions gets 
 * @returns {function} a function that is used to fetch all editions 
 */
export function fetchEditions() {
    return function (dispatch) {
        dispatch(requestEditions());    
        
        return fetch('http://localhost:8080/exist/apps/exist-module/listall.json')
            .then(response => response.json())
            .then(json =>
                dispatch(receiveEditions(json))
            );
            
        // todo: include error handling here
    };
} 

/** 
 * Function requestEditions requests the editions available from the db
 * @returns {object} the actionType that's required for Redux
 */ 
export function requestEditions() {
    return { type: ActionTypes.REQUEST_EDITIONS };
} 

/** 
 * Function receiveEditions gets editions from the database
 * @param {Object[]} editions array
 * @returns {object} the editions that need to be added to the state
 */ 
export function receiveEditions(editions = []) {
    return { type: ActionTypes.RECEIVE_EDITIONS, editions };
} 

/** 
 * Function receiveEditionsFailed indicates that editions couldn't be loaded
 * @returns {object} the actionType that's required for Redux
 */ 
export function receiveEditionsFailed() {
    return { type: ActionTypes.RECEIVE_EDITIONS_FAILED };
} 

/** 
 * Function activateEdition sets an edition as the active one
 * @param {string} id of the edition to activate
 * @returns {object} the actionType that's required for Redux
 */ 
export function activateEdition(id = '') {
    return { type: ActionTypes.ACTIVATE_EDITION, id };
}

/** 
 * Function deActivateEdition closes the active edition and goes back to the start screen
 * @returns {object} the actionType that's required for Redux
 */ 
export function deActivateEdition() {
    return { type: ActionTypes.DEACTIVATE_EDITION };
}

/** 
 * Function openContextMenu opens the context menu with the specified items at the specified x / y position
 * @param {Object[]} items to be displayed in the context menu
 * @param {number} x position of the context menu
 * @param {number} y position of the context menu 
 * @returns {object} the actionType that's required for Redux
 */ 
export function openContextMenu(items = [], x = 0, y = 0) {
    return { type: ActionTypes.OPEN_CONTEXTMENU, items, x, y };
}

/** 
 * Function closeContextMenu closes the context menu
 * @returns {object} the actionType that's required for Redux
 */ 
export function closeContextMenu() {
    return { type: ActionTypes.CLOSE_CONTEXTMENU };
}

/** 
 * Function restoreState replaces the complete state object with a different state
 * @param {object} newState
 * @returns {object}
 */
 export function restoreState(newState = {}) {
     return { type: ActionTypes.RESTORE_STATE, newState: newState };
 }