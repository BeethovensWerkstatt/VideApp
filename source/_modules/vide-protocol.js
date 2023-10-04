
/**
 * Protocol constants
 * @namespace
 */
const VIDE_PROTOCOL = {

    /**
     * @namespace
     */
    OBJECT: {
        /** */
        EDITION: 'VIDE_PROTOCOL_OBJECT_EDITION', //this is a frequent request for default / start views
        /** */
        PAGE: 'VIDE_PROTOCOL_OBJECT_PAGE',
        /** */
        NOTATION: 'VIDE_PROTOCOL_OBJECT_NOTATION', //this includes mei:note, mei:rest, mei:chord, mei:beam, mei:fTrem etc.
        /** */
        LYRICS: 'VIDE_PROTOCOL_OBJECT_LYRICS',
        /** */
        METAMARK: 'VIDE_PROTOCOL_OBJECT_METAMARK',
        /** */
        DIR: 'VIDE_PROTOCOL_OBJECT_DIR',
        /** */
        STATE: 'VIDE_PROTOCOL_OBJECT_STATE',
        /** */
        DEL: 'VIDE_PROTOCOL_OBJECT_DEL',
        /** */
        ADD: 'VIDE_PROTOCOL_OBJECT_ADD',
        /** */
        SUPPLIED: 'VIDE_PROTOCOL_OBJECT_SUPPLIED',
        /** */
        UNCLEAR: 'VIDE_PROTOCOL_OBJECT_UNCLEAR',
        /** */
        CHOICECHILD: 'VIDE_PROTOCOL_OBJECT_CHOICECHILD',
        /** */
        ANNOTATION: 'VIDE_PROTOCOL_OBJECT_ANNOTATION'
    },

    /**
     * @namespace
     */
    CONTEXT: {
        /** */
        FILE: 'VIDE_PROTOCOL_CONTEXT_FILE',
        /** */
        PAGE: 'VIDE_PROTOCOL_CONTEXT_PAGE',
        /** */
        MEASURE: 'VIDE_PROTOCOL_CONTEXT_MEASURE',
        /** */
        STAFF: 'VIDE_PROTOCOL_CONTEXT_STAFF',
        /** */
        LAYER: 'VIDE_PROTOCOL_CONTEXT_LAYER',
        /** */
        STATE: 'VIDE_PROTOCOL_CONTEXT_STATE',
        /** */
        CHOICECHILD: 'VIDE_PROTOCOL_CONTEXT_CHOICECHILD'
    },

    /**
     * @namespace
     */
    PERSPECTIVE: {
        /** */
        FACSIMILE: 'VIDE_PROTOCOL_PERSPECTIVE_FACSIMILE',
        /** */
        XML: 'VIDE_PROTOCOL_PERSPECTIVE_XML',
        /** */
        TRANSCRIPTION: 'VIDE_PROTOCOL_PERSPECTIVE_TRANSCRIPTION',
        /** */
        RECONSTRUCTION: 'VIDE_PROTOCOL_PERSPECTIVE_RECONSTRUCTION',
        /** */
        INVARIANCE: 'VIDE_PROTOCOL_PERSPECTIVE_INVARIANCE',
        /** */
        TEXT: 'VIDE_PROTOCOL_PERSPECTIVE_TEXT'
    },

    /**
     * @namespace
     */
    OPERATION: {
        /** */
        VIEW: 'VIDE_PROTOCOL_OPERATION_VIEW' //delete, update, change, modify, whatsoever… 
    }

};

export default VIDE_PROTOCOL;
