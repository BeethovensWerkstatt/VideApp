import VIDE_PROTOCOL from '../../_modules/vide-protocol';
import {ViewLayouts} from '../layout.constants';

jest.dontMock('../reducers.redux');

let Perspective = VIDE_PROTOCOL.PERSPECTIVE;
let actionsFile = require('../actions.redux');
let reducersFile = require('../reducers.redux');

describe('Redux Reducer tests', function() {
    //tests for handlePreferences reducer
    it('decides if preferences window will be shown', function() {
        let defaultValue = {showPreferences: false, language: 'en', showAbout: false};
        let actualDefaultValue = reducersFile.handlePreferences(undefined, {type: actionsFile.ActionTypes.DEACTIVATE_EDITION});
        expect(actualDefaultValue).toEqual(defaultValue);
        
        let expectedFalse = false;
        let actualFalse = reducersFile.handlePreferences(undefined, {type: actionsFile.ActionTypes.HIDE_PREFERENCES}).showPreferences;
        expect(actualFalse).toEqual(expectedFalse);
        
        let expectedTrue = true;
        let actualTrue = reducersFile.handlePreferences(undefined, {type: actionsFile.ActionTypes.SHOW_PREFERENCES}).showPreferences;
        expect(actualTrue).toEqual(expectedTrue);
    });
    
    //tests for handleAbout reducer
    it('decides if about window will be shown', function() {
        let expectedFalse = false;
        let actualFalse = reducersFile.handlePreferences(undefined, {type: actionsFile.ActionTypes.HIDE_ABOUT}).showAbout;
        expect(actualFalse).toEqual(expectedFalse);
        
        let expectedTrue = true;
        let actualTrue = reducersFile.handlePreferences(undefined, {type: actionsFile.ActionTypes.SHOW_ABOUT}).showAbout;
        expect(actualTrue).toEqual(expectedTrue);
    });
    
    
    //tests for switchLanguage reducer
    it('changes the currently active language', function() {
        let defaultValue = 'en';
        let actualDefaultValue = reducersFile.handlePreferences(undefined, {type: actionsFile.ActionTypes.LOAD_EDITION}).language;
        expect(actualDefaultValue).toEqual(defaultValue);
        
        let newValue = 'de';
        let actualNewValue = reducersFile.handlePreferences('en', {type: actionsFile.ActionTypes.SWITCH_LANGUAGE, language: newValue}).language;
        expect(actualNewValue).toEqual(newValue);
    });
    
    //tests for setEdition reducer
    it('sets the currently active edition id', function() {
        let defaultValue = {editions: {}, active: '', revision: 'latest'};
        let actualDefaultValue = reducersFile.handleEdition(undefined, {type: actionsFile.ActionTypes.SWITCH_LANGUAGE});
        expect(actualDefaultValue).toEqual(defaultValue);
        
        let newValue = 'qwert';
        let actualNewValue = reducersFile.handleEdition(undefined, actionsFile.activateEdition(newValue)).active;
        expect(actualNewValue).toEqual(newValue);
    });
    
    //tests for changeRatio reducer
    it('changes the ratio of two views', function() {
        let defaultValue = {
            layout: ViewLayouts.INTRODUCTION,
            ratio: .5,
            view1: {perspective: Perspective.FACSIMILE, viewState: null},
            view2: {perspective: Perspective.TRANSCRIPTION, viewState: null}
        };
        let actualDefaultValue = reducersFile.handleViews(actionsFile.showPreferences());
        expect(actualDefaultValue).toEqual(defaultValue);
        
        let expectedValue = .43;
        let actualValue = reducersFile.handleViews(actionsFile.setViewRatio(expectedValue)).ratio;
        expect(actualValue).toEqual(expectedValue);
        
        let wrongInput = 'a';
        actualValue = reducersFile.handleViews(actionsFile.setViewRatio(wrongInput)).ratio;
        expect(actualValue).toEqual(defaultValue);
        
        wrongInput = 1;
        actualValue = reducersFile.handleViews(actionsFile.setViewRatio(wrongInput)).ratio;
        expect(actualValue).toEqual(defaultValue);
        
        wrongInput = -1;
        actualValue = reducersFile.handleViews(actionsFile.setViewRatio(wrongInput)).ratio;
        expect(actualValue).toEqual(defaultValue);
    });
    
    //tests for changeLayout reducer
    it('sets the layout of views', function() {
        let input = ViewLayouts.HORIZONTAL_SPLIT;
        let actualValue = reducersFile.handleViews(actionsFile.setViewLayout(input)).layout;
        expect(actualValue).toEqual(input);
        
        let wrongInput = 'test';
        let defaultValue = ViewLayouts.INTRODUCTION;
        actualValue = reducersFile.handleViews(actionsFile.setViewLayout(input)).layout;
        expect(actualValue).toEqual(defaultValue);
    });
    
    //tests for setFirstView reducer
    it('sets the first view', function() {
        let input = Perspective.TEXT;
        let actualValue = reducersFile.handleViews(actionsFile.setFirstView(input)).view1.perspective;
        expect(actualValue).toEqual(input);
        
        let wrongInput = 'asd';
        actualValue = reducersFile.handleViews(actionsFile.setFirstView(wrongInput)).view1.perspective;
        expect(actualValue).toEqual(Perspective.FACSIMILE);
    });
    
    //tests for setFirstView reducer
    it('sets the second view', function() {
        let input = Perspective.TEXT;
        let actualValue = reducersFile.handleViews(actionsFile.setSecondView(input)).view2.perspective;
        expect(actualValue).toEqual(input);
        
        let wrongInput = 'asd';
        actualValue = reducersFile.handleViews(actionsFile.setSecondView(wrongInput)).view2.perspective;
        expect(actualValue).toEqual(Perspective.TRANSCRIPTION);
    });
});