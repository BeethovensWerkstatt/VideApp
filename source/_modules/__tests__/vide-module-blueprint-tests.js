import {EoModule, Request} from '../vide-module-blueprint';
import VIDE_PROTOCOL from '../vide-protocol';

jest.dontMock('../vide-module-blueprint');

describe('Vide module blueprint', function() {
    let containerID = 'containerID';
    let editionID = 'editionID';
    let query = {
        objectType: VIDE_PROTOCOL.OBJECT.NOTATION,
        objectID: 'objectID',
        contexts: [],
        perspective: 'facsimile',
        operation: VIDE_PROTOCOL.OPERATION.VIEW
    };
    
    
    let module = new EoModule();
    let request = new Request(containerID, editionID, query);
    
    it('module blueprints work correctly', function() {
        expect(module.isActive()).toBe(true);
        expect(module.deactivate().isActive()).toBe(false);
        expect(module.deactivate().activate().isActive()).toBe(true);
        expect(module.deactivate().checkRequest(request)).toBe(false);
    });
    
    it('Requests work properly', function() {
        expect(typeof request.getQueryPrototype()).toBe('object');
        expect(request.getPerspective()).toBe('facsimile');
        expect(request.getContainerID()).toBe(containerID);
        expect(request.setContainerID('hurz').getContainerID()).toBe('hurz');
        expect(request.getObjectID()).toBe('objectID');
        expect(request.getEditionID()).toBe(editionID);
        expect(request.getObjectType()).toBe(VIDE_PROTOCOL.OBJECT.NOTATION);
        expect(request.setModuleKey('key').getModuleKey()).toBe('key');
        expect(request.getContextsByType('none').length).toBe(0);
    });
});