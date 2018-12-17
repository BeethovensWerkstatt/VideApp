import fetch from 'isomorphic-fetch';
import VIDE_PROTOCOL from '../_modules/vide-protocol';

import {ViewLayouts} from './layout.constants';

/**
 * Action types
 * @namespace
 */
const ActionTypes = {

    /** */
    SET_FIRST_VIEW: 'SET_FIRST_VIEW',
    /** */
    SET_SECOND_VIEW: 'SET_SECOND_VIEW',

    /** */
    SET_SYNC_VIEWS: 'SET_SYNC_VIEWS',

    /** */
    SET_VIEW_RATIO: 'SET_VIEW_RATIO',
    /** */
    SET_VIEW_LAYOUT: 'SET_VIEW_LAYOUT',

    /** */
    SWITCH_LANGUAGE: 'SWITCH_LANGUAGE',

    /** */
    SHOW_PREFERENCES: 'SHOW_PREFERENCES',
    /** */
    HIDE_PREFERENCES: 'HIDE_PREFERENCES',

    /** */
    SHOW_ABOUT: 'SHOW_ABOUT',
    /** */
    HIDE_ABOUT: 'HIDE_ABOUT',

    /** */
    REQUEST_EDITIONS: 'REQUEST_EDITIONS',
    /** */
    RECEIVE_EDITIONS: 'RECEIVE_EDITIONS',
    /** */
    RECEIVE_EDITIONS_FAILED: 'RECEIVE_EDITIONS_FAILED',

    /** */
    HIGHLIGHT_EDITION: 'HIGHLIGHT_EDITION',

    /** */
    ACTIVATE_EDITION: 'ACTIVATE_EDITION',
    /** */
    DEACTIVATE_EDITION: 'DEACTIVATE_EDITION',

    /** */
    OPEN_CONTEXTMENU: 'OPEN_CONTEXTMENU',
    /** */
    CLOSE_CONTEXTMENU: 'CLOSE_CONTEXTMENU',

    /** */
    RESTORE_STATE: 'RESTORE_STATE',
    /** */
    RESET_STATE: 'RESET_STATE',
    /** */
    CONFIRM_VIEW: 'CONFIRM_VIEW',

    /** */
    START_LOADING_DATA: 'START_LOADING_DATA',
    /** */
    STOP_LOADING_DATA: 'STOP_LOADING_DATA',

    /** */
    CLOSE_TOUR: 'CLOSE_TOUR',
    /** */
    LOAD_TOURSTEP: 'LOAD_TOURSTEP'
};
export { ActionTypes };

 /**
  * @module
  */

 /**
  * List of {@link VIDE_PROTOCOL.PERSPECTIVE}
  *
  * @todo do we need this? There is no reference in this file?
  *
  * <br /> $FILE
  */
 let Perspective = VIDE_PROTOCOL.PERSPECTIVE;

export /**
 * Function setFirstView specifies the view to be opened in view1
 * @param {string} perspective to be opened
 * @param {Object|null} viewState object when initializing the view
 * @returns {object} the information how view1.state needs to be modified
 */ function setFirstView(moduleKey = 'VideFacsimileViewer', request = null) {
    return { type: ActionTypes.SET_FIRST_VIEW, moduleKey, request };
}

export /**
 * Function setSecondView specifies the view to be opened in view2
 * @param {string} perspective to be opened
 * @param {Object|null} viewState object when initializing the view
 * @returns {object} the information how view2.state needs to be modified
 */ function setSecondView(moduleKey = 'VideTranscriptionViewer', request = null) {
    return { type: ActionTypes.SET_SECOND_VIEW, moduleKey, request };
}

export /**
 * Function setSyncViews determines whether views should be synced or not
 * @param {boolean} sync if views shall be synced or not
 * @returns {object} the information needed for reducers
 */ function setSyncViews(synced = false) {
    return { type: ActionTypes.SET_SYNC_VIEWS, synced };
}

export /**
 * Function confirmView confirms that a certain state has been reached by a view
 * @returns {object} the actionType that's required for Redux
 */ function confirmView(state = null,view = -1) {
    return {type: ActionTypes.CONFIRM_VIEW, state, view};
}

export function startLoadingData(key,type) {
    return {type: ActionTypes.START_LOADING_DATA, key, requestType: type};
}

export function stopLoadingData(key,success) {
    return {type: ActionTypes.STOP_LOADING_DATA, key, success};
}

/* *
 * Function logViewState is (indirectly) called by individual modules to
 * indicate that a requested state has been achieved. Mostly used to identify
 * what should be kept in the application history and what shouldn't.
 * @param {number} view that gets confirmed.
 * @returns {object} the information required for redux
 */
/*export function logViewState(view = 1) {
    return {type: ActionTypes.LOG_VIEW_STATE, view: view};
}*/

export /**
 * Function setViewLayout specifies the general layout of the app
 * @param {string} viewLayout to be used
 * @returns {object} the layout that shall be used
 */ function setViewLayout(viewLayout = ViewLayouts.INTRODUCTION) {
    return { type: ActionTypes.SET_VIEW_LAYOUT, viewLayout };
}

export /**
 * Function setViewRation defines the part that view1 occupies
 * @param {number} viewRatio to be used
 * @returns {object} the information about the share that view1 gets
 */ function setViewRatio(viewRatio = .5) {
    return { type: ActionTypes.SET_VIEW_RATIO, viewRatio };
}

export /**
 * Function switchLanguage sets the language of the app
 * @param {string} language code
 * @returns {object} the language that shall be used
 */ function switchLanguage(language = 'en') {
    return { type: ActionTypes.SWITCH_LANGUAGE, language };
}

export /**
 * Function showPreferences opens the preference window
 * @returns {object} the actionType that's required for Redux
 */ function showPreferences() {
    return { type: ActionTypes.SHOW_PREFERENCES };
}

export /**
 * Function hidePreferences closes the preference window
 * @returns {object} the actionType that's required for Redux
 */ function hidePreferences() {
    return { type: ActionTypes.HIDE_PREFERENCES };
}

export /**
 * Function showAbout opens the about window
 * @returns {object} the actionType that's required for Redux
 */ function showAbout() {
    return { type: ActionTypes.SHOW_ABOUT };
}

export /**
 * Function hideAbout opens the about window
 * @returns {object} the actionType that's required for Redux
 */ function hideAbout() {
    return { type: ActionTypes.HIDE_ABOUT };
}

//this is a think action creator; cf http://redux.js.org/docs/advanced/AsyncActions.html
//usage: store.dispatch(fetchEditions())
export /**
 * Function fetchEditions gets
 * @returns {function} a function that is used to fetch all editions
 */ function fetchEditions() {
    return function (dispatch) {
        dispatch(requestEditions());

        return fetch('http://172.17.0.2:8080/exist/apps/exist-module/listall.json')
            .then(response => response.json())
            .then(json =>
                dispatch(receiveEditions(json))
            );

        // todo: include error handling here
    };
}

export /**
 * Function requestEditions requests the editions available from the db
 * @returns {object} the actionType that's required for Redux
 */ function requestEditions() {
    return { type: ActionTypes.REQUEST_EDITIONS };
}

export /**
 * Function receiveEditions gets editions from the database
 * @param {Object[]} editions array
 * @returns {object} the editions that need to be added to the state
 */ function receiveEditions(editions = []) {
    return { type: ActionTypes.RECEIVE_EDITIONS, editions };
}

export /**
 * Function receiveEditionsFailed indicates that editions couldn't be loaded
 * @returns {object} the actionType that's required for Redux
 */ function receiveEditionsFailed() {
    return { type: ActionTypes.RECEIVE_EDITIONS_FAILED };
}


export /**
 * Function highlightEdition marks an edition and shows further details
 * @param {string} id of the edition to highlight
 * @returns {object} the actionType that's required for Redux
 */ function highlightEdition(id = '') {
    return { type: ActionTypes.HIGHLIGHT_EDITION, id };
}

export /**
 * Function activateEdition sets an edition as the active one
 * @param {string} id of the edition to activate
 * @returns {object} the actionType that's required for Redux
 */ function activateEdition(id = '', revision = '') {
    return { type: ActionTypes.ACTIVATE_EDITION, id, revision };
}

export /**
 * Function deActivateEdition closes the active edition and goes back to the start screen
 * @returns {object} the actionType that's required for Redux
 */ function deActivateEdition() {
    return { type: ActionTypes.DEACTIVATE_EDITION };
}

export /**
 * Function openContextMenu opens the context menu with the specified items at the specified x / y position
 * @param {Object[]} items to be displayed in the context menu
 * @param {number} x position of the context menu
 * @param {number} y position of the context menu
 * @returns {object} the actionType that's required for Redux
 */ function openContextMenu(items = [], x = 0, y = 0) {
    return { type: ActionTypes.OPEN_CONTEXTMENU, items, x, y };
}

export /**
 * Function closeContextMenu closes the context menu
 * @returns {object} the actionType that's required for Redux
 */ function closeContextMenu() {
    return { type: ActionTypes.CLOSE_CONTEXTMENU };
}

export /**
 * Function restoreState replaces the complete state object with a different state
 * @param {object} newState is the state that needs to be restored
 * @returns {object} the actionType that's required for Redux
 */ function restoreState(newState = {}) {
    //todo: move check if the state to be restored is valid over here
    //right now, it's checked by the reducers, but this means that
    //one reducer may decide that it's ok, while a second may reject
    //it, resulting in an inconsistent state
    return { type: ActionTypes.RESTORE_STATE, newState: newState };
}

export /**
 * Function resetState brings the application back to the starting point
 * @returns {object} the actionType that's required for Redux
 */ function resetState() {
    return {type: ActionTypes.RESET_STATE};
}

export /**
 * Function closeTour closes a currently rendered tour
 * @returns {object} the actionType that's required for Redux
 */ function closeTour() {
    return {type: ActionTypes.CLOSE_TOUR};
}

export /**
 * Function loadTourStep loads a step for a demo or explanatory tour
 * @returns {object} the actionType that's required for Redux
 */ function loadTourStep(stepId) {
    return {type: ActionTypes.LOAD_TOURSTEP,id:stepId};
}
