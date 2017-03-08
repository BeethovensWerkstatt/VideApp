import React, { PropTypes } from 'react';
import I18n from './../containers/I18n.react';
import VIDE_PROTOCOL from './../_modules/vide-protocol';
import {eohub} from './../_modules/eo-hub';
import {EoModule, DataRequest} from './../_modules/vide-module-blueprint';

Math.uuidCompact = function() {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
      let r = Math.random()*16|0, v = c == 'x' ? r : (r&0x3|0x8);
      return v.toString(16);
    });
};

const PreviewItem = ({ object }) => {

    //facsimiles
    if(object.req.perspective === VIDE_PROTOCOL.PERSPECTIVE.FACSIMILE) {
        
        let key = Math.uuidCompact()
        let req = {
            id: object.req.id,
            edition: eohub.getEdition(),
            type: 'getElementFacsimileInfo',
            key: key
        }
        
        let socket = io(eohub._server + eohub._socketID);
        
        socket.once(key,(json) => {
            let img = document.createElement('img');
            img.setAttribute('src', json.pages[0].uri);
            img.setAttribute('alt', json.pages[0].label);
            document.getElementById('img' + key).appendChild(img);
            document.getElementById('label' + key).innerHTML = json.pages[0].label;
        });
        
        socket.emit('requestData', req);
        
        
        return (
            <div className='previewItem facs'>
                <div className='imgBox' id={'img' + key}></div>
                <span className='sliderItemLabel' id={'label' + key}></span>
            </div>
        );
    } else if(object.req.perspective === VIDE_PROTOCOL.PERSPECTIVE.XML) {
        
        let key = Math.uuidCompact()
        let req = {
            id: object.req.id,
            edition: eohub.getEdition(),
            type: 'getElementXml',
            key: key
        }
        
        let socket = io(eohub._server + eohub._socketID);
        
        socket.once(key,(xml) => {
            let editor = ace.edit(key);
                editor.setTheme('ace/theme/textmate');
                editor.getSession().setMode('ace/mode/xml');
                editor.getSession().setUseWrapMode(true);
                editor.setReadOnly(true);
                editor.setShowInvisibles(false);
                editor.setDisplayIndentGuides(false);
                editor.renderer.setShowGutter(false);
                editor.setShowPrintMargin(false);
                editor.setHighlightActiveLine(false);
                editor.setValue(xml);
                editor.clearSelection();
                editor.scrollToLine(0, false, false, function () {});
                editor.scrollPageUp();
        });
        
        socket.emit('requestData', req);
        
        return (
            <div className='previewItem xml'>
                <div className='editorBox' id={key}>
                    
                </div>
                <span className='sliderItemLabel'><I18n content={'contextMenu_showIn_' + object.req.perspective}/></span>
            </div>
        );
    } else if(object.query.perspective === EO_Protocol.Perspective.PERSPECTIVE_TRANSCRIPTION) {
        let id = 'x' + Math.uuidCompact();
        
        let states = [];
        for(let i=0, ii=object.query.contexts.length; i<ii; i++) {
            let context = object.query.contexts[i];
            if(typeof context === 'object' && context.type === EO_Protocol.Context.CONTEXT_STATE) {
                states.push(context.id);
            }
        }
        let statesString = states.length === 0 ? '_' : states.join('___');
        
        let url = 'http://localhost:8080/exist/apps/exist-module/edition/' + object.editionID + '/element/' + object.query.objectID + '/states/' + statesString + '/preview.xml';
        
        let request = new DataRequest('text', url);
        window.EoHub.requestData(request).then(
            (mei) => {
                let vrvToolkit = window.vrvStore.vrvToolkit;
            
                var options = JSON.stringify({
                    inputFormat: 'mei',
                    border: 0,
                    scale: 35,           //scale is in percent (1 - 100)
                    ignoreLayout: 0,
                    noLayout: 1          //results in a continuous system without page breaks
                });
                
                vrvToolkit.setOptions(options);
                let svg = vrvToolkit.renderData(mei + '\n', '');
                
                document.getElementById(id).innerHTML = svg;
                document.querySelector('#' + id + ' svg #' + object.query.objectID).classList.add('highlighted');
            }
        );
    
        return (
            <div className='previewItem transcriptionPreview'>
                <div className='renderingBox' id={id}><I18n content={'networkStatus_100'}/></div>
                <span className='sliderItemLabel'><I18n content={'contextMenu_showIn_' + object.query.perspective}/></span>
            </div>
        );
    } else if(object.query.perspective === EO_Protocol.Perspective.PERSPECTIVE_RECONSTRUCTION) {
        //todo: add preview for reconstruction
        return (
            <div className='previewItem reconstructionPreview'>
                <I18n content={'no_preview_available'}/>
                <span className='sliderItemLabel'><I18n content={'contextMenu_showIn_' + object.query.perspective}/></span>
            </div>
        );
    } else if(object.query.perspective === EO_Protocol.Perspective.PERSPECTIVE_TEXT) {
        //todo: add preview for text
        return (
            <div className='previewItem textPreview'>
                <I18n content={'no_preview_available'}/>
                <span className='sliderItemLabel'><I18n content={'contextMenu_showIn_' + object.query.perspective}/></span>
            </div>
        );
    } else {
        return (
            <div className='previewItem unknown'>
                <I18n content={'no_preview_available'}/>
            </div>
        );
    }
};

PreviewItem.propTypes = {
  object: PropTypes.object.isRequired
};

export default PreviewItem;