import VIDE_PROTOCOL from '../../_modules/vide-protocol';
import {ViewLayouts} from '../layout.constants';

jest.dontMock('../actions.redux');

let Perspective = VIDE_PROTOCOL.PERSPECTIVE;
let actionsFile = require('../actions.redux');

describe('Redux Action tests', function() {
    //tests for setFirstView action creator
    it('emits an action to set the first view', function() {
        
        //test default
        let defaultState = {
            type: actionsFile.ActionTypes.SET_FIRST_VIEW,
            perspective: Perspective.FACSIMILE,
            viewState: null
        };
        
        let actualDefaultState = actionsFile.setFirstView();
        expect(actualDefaultState).toEqual(defaultState);
        
        //test other value
        let testView = Perspective.XML;
        let state = {
            type: actionsFile.ActionTypes.SET_FIRST_VIEW,
            perspective: testView,
            viewState: null
        };
        let actualState = actionsFile.setFirstView(testView);
        expect(actualState).toEqual(state); 
        
    });
    
    //tests for setSecondView action creator
    it('emits an action to set the second view', function() {
        
        //test default
        let defaultState = {
            type: actionsFile.ActionTypes.SET_SECOND_VIEW,
            perspective: Perspective.TRANSCRIPTION,
            viewState: null
        };
        
        let actualDefaultState = actionsFile.setSecondView();
        expect(actualDefaultState).toEqual(defaultState);
        
        //test other value
        let testView = Perspective.XML;
        let state = {
            type: actionsFile.ActionTypes.SET_SECOND_VIEW,
            perspective: testView,
            viewState: null
        };
        let actualState = actionsFile.setSecondView(testView);
        expect(actualState).toEqual(state);
    });
    
    //tests for setViewLayouts action creator
    it('emits an action to set the layout of views', function() {
        
        //test default
        let defaultState = {
            type: actionsFile.ActionTypes.SET_VIEW_LAYOUT,
            viewLayout: ViewLayouts.INTRODUCTION
        };
        
        let actualDefaultState = actionsFile.setViewLayout();
        expect(actualDefaultState).toEqual(defaultState);
        
        //test other value
        let layout = ViewLayouts.VERTICAL_SPLIT;
        let state = {
            type: actionsFile.ActionTypes.SET_VIEW_LAYOUT,
            viewLayout: layout
        };
        let actualState = actionsFile.setViewLayout(layout);
        expect(actualState).toEqual(state);
    });
    
    //tests for setViewRatio action creator
    it('emits an action to set the ratio of views', function() {
        
        //test default
        let defaultState = {
            type: actionsFile.ActionTypes.SET_VIEW_RATIO,
            viewRatio: .5
        };
        
        let actualDefaultState = actionsFile.setViewRatio();
        expect(actualDefaultState).toEqual(defaultState);
        
        //test other value
        let ratio = .75;
        let state = {
            type: actionsFile.ActionTypes.SET_VIEW_RATIO,
            viewRatio: ratio
        };
        let actualState = actionsFile.setViewRatio(ratio);
        expect(actualState).toEqual(state);
    });
    
    
    //tests for setEdition action creator
    it('emits an action to set the active edition', function() {
        
        //test default
        let defaultState = {
            type: actionsFile.ActionTypes.ACTIVATE_EDITION,
            id: ''
        };
        let actualDefaultState = actionsFile.activateEdition();
        expect(actualDefaultState).toEqual(defaultState);
        
        //test with live id
        
        let testID = 'qwert';
        let state = {
            type: actionsFile.ActionTypes.ACTIVATE_EDITION,
            id: testID
        }; 
        let actualState = actionsFile.activateEdition(testID);
        
        expect(actualState).toEqual(state);
    });
    
    //tests for switchLanguage action creator
    it('emits an action to switch between languages', function() {
        
        //test default
        let defaultState = {
            type: actionsFile.ActionTypes.SWITCH_LANGUAGE,
            language: 'en'
        };
        
        let actualDefaultState = actionsFile.switchLanguage();
        expect(actualDefaultState).toEqual(defaultState);
        
        //test other value
        let lang = 'de';
        let state = {
            type: actionsFile.ActionTypes.SWITCH_LANGUAGE,
            language: lang
        };
        let actualState = actionsFile.switchLanguage(lang);
        expect(actualState).toEqual(state);
    });
    
    //tests for showPreferences action creator
    it('emits an action to show the preferences window', function() {
        
        //test default
        let defaultState = {
            type: actionsFile.ActionTypes.SHOW_PREFERENCES
        };
        
        let actualDefaultState = actionsFile.showPreferences();
        expect(actualDefaultState).toEqual(defaultState);
    });
    
    //tests for hidePreferences action creator
    it('emits an action to hide the preferences window', function() {
        
        //test default
        let defaultState = {
            type: actionsFile.ActionTypes.HIDE_PREFERENCES
        };
        
        let actualDefaultState = actionsFile.hidePreferences();
        expect(actualDefaultState).toEqual(defaultState);
    });
    
});