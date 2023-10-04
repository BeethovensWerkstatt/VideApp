import React from 'react';
import PropTypes from 'prop-types';
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

/**
 * @param object {object}
 * @param clickFunc {function}
 * @class
 */
const PreviewItem = ({ object, clickFunc }) => {

    try {
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
                try {
                    let img = document.createElement('img');
                    img.setAttribute('src', json.pages[0].uri);
                    img.setAttribute('alt', json.pages[0].label);
                    document.getElementById('img' + key).appendChild(img);
                } catch(err) {
                    //console.log('[ERROR] Context Menu has been closed too early')
                }
            });

            socket.emit('requestData', req);


            return (
                <div className='previewItem facs'>
                    <div className='imgBox' id={'img' + key} onClick={e => {
                            e.preventDefault();
                            clickFunc(object);
                        }}></div>
                    <span className='sliderItemLabel' id={'label' + key} onClick={e => {
                            e.preventDefault();
                            clickFunc(object);
                        }}>
                        <I18n content={'contextMenu_showIn_' + object.req.perspective}/>
                    </span>
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
                try {
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
                } catch(err) {
                    //console.log('[ERROR] Context Menu has been closed too early')
                }
            });

            socket.emit('requestData', req);

            return (
                <div className='previewItem xml'>
                    <div className='editorBox' id={key}>

                    </div>
                    <span className='sliderItemLabel' onClick={e => {
                            console.log('-----------------71 onClick XML labels')
                            e.preventDefault();
                            clickFunc(object);
                        }}><I18n content={'contextMenu_showIn_' + object.req.perspective}/></span>
                </div>
            );

        //Transcription Preview
        } else if(object.req.perspective === VIDE_PROTOCOL.PERSPECTIVE.TRANSCRIPTION) {

            let key = 'x' + Math.uuidCompact();

            let states = [];
            for(let i=0, ii=object.req.contexts.length; i<ii; i++) {
                let context = object.req.contexts[i];
                if(typeof context === 'object' && context.type === VIDE_PROTOCOL.CONTEXT.STATE) {
                    states.push(context.id);
                }
            }

            let req = {
                id: object.req.id,
                edition: eohub.getEdition(),
                otherStates: states,
                type: 'getTranscriptionPreview',
                key: key
            }

            let socket = io(eohub._server + eohub._socketID);

            socket.once(key,(mei) => {
                try {

                    let verovio = eohub.getVerovio();

                    var options = {
                        inputFormat: 'mei',
                        border: 0,
                        scale: 35,           //scale is in percent (1 - 100)
                        ignoreLayout: 0,
                        noLayout: 1          //results in a continuous system without page breaks
                    };

                    //verovio.setOptions(options);
                    let svg = verovio.renderData(mei + '\n', options);

                    document.getElementById(key).innerHTML = svg;
                    document.querySelector('#' + key + ' svg #' + object.req.id).classList.add('highlighted');

                } catch(err) {
                    //console.log('[ERROR] Context Menu has been closed too early')
                }
            });

            socket.emit('requestData', req);

            return (
                <div className='previewItem transcriptionPreview'>
                    <div className='renderingBox' id={key} onClick={e => {
                            e.preventDefault();
                            clickFunc(object);
                        }}>
                        <I18n content={'networkStatus_100'}/>
                    </div>
                    <span className='sliderItemLabel' onClick={e => {
                            e.preventDefault();
                            clickFunc(object);
                        }}>
                        <I18n content={'contextMenu_showIn_' + object.req.perspective}/>
                    </span>
                </div>
            );

        } else if(object.req.perspective === VIDE_PROTOCOL.PERSPECTIVE.TEXT) {
            //todo: add preview for text
            return (
                <div className='previewItem textPreview'>
                    <I18n content={'no_preview_available'}/>
                    <span className='sliderItemLabel'><I18n content={'contextMenu_showIn_' + object.req.perspective}/></span>
                </div>
            );

        } else {
            return (
                <div className='previewItem unknown'>
                    <I18n content={'no_preview_available'}/>
                </div>
            );
        }
    } catch(err) {
        console.log('[Problem with PreviewItem for ' + object.req.perspective + '] ' + err);
        console.log(object)
        return (
            <div className='previewItem unknown'>
                <I18n content={'no_preview_available'}/>
            </div>
        );
    }
};

PreviewItem.propTypes = {
  object: PropTypes.object.isRequired,
  clickFunc: PropTypes.func.isRequired
};

export default PreviewItem;
