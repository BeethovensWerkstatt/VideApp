import React from 'react';
import PropTypes from 'prop-types';
import I18n from './../containers/I18n.react';
import PreviewItem from './PreviewItem.react';
import {eohub} from './../_modules/eo-hub';
import VIDE_PROTOCOL from './../_modules/vide-protocol';
import Slider from 'react-slick';

/**
 * @module components/ContextMenu
 */

 /** */
const ContextMenu = ({ items, visible, closeContextMenu, submitRequest, x, y }) => {

    if(visible) {
        let menuStyle = {top: (y + 10) + 'px', left: (x + 10) + 'px'};

        let sliderSettings;

        if(items.length > 1) {
            sliderSettings = {
                dots: true,
                infinite: true,
                draggable: false,
                centerMode: true,
                slidesToShow: 1,
                slidesToScroll: 1,
                centerPadding: 0
            };
        } else {
            sliderSettings = {
                dots: false,
                infinite: true,
                draggable: false,
                centerMode: true,
                slidesToShow: 1,
                slidesToScroll: 1,
                centerPadding: 0,
                arrows: false,
                swipeToSlide: false,
                autoplay: false
            };
        }

        let key = Math.uuidCompact()
        let req = {
            id: items[0].req.id,
            edition: eohub.getEdition(),
            type: 'getElementDesc',
            key: key
        }

        let socket = io(eohub._server + eohub._socketID);

        socket.once(key,(json) => {

            //only the first response will be used
            let res = json[0];

            console.log('\n resolving context menu item:')
            console.log(res)

            try {
                document.getElementById(key + '_bravura').innerHTML = res.bravura;
                document.getElementById(key + '_desc').innerHTML = res.desc;
                document.getElementById(key + '_measure').innerHTML = res.measure;
                document.getElementById(key + '_position').innerHTML = res.position;

                if(res.supplied) {
                    document.getElementById(key + '_supplied').innerHTML = '<i class="fa fa-pencil"></i><span data-i18n-text="supplied">' + eohub.getI18nString('supplied') + '</span>';
                }

                if(res.unclear) {
                    document.getElementById(key + '_unclear').innerHTML = '<i class="fa fa-question"></i><span data-i18n-text="unclearReading">' + eohub.getI18nString('unclearReading') + '</span>';
                }

                //in case of links, make them accessible
                if(typeof res.target !== 'undefined' && res.target !== '') {

                    let link = document.createElement('span');
                    link.classList.add('metaMarkLink');
                    link.innerHTML = '<span data-i18n-text="followMetaMarkLink">' + eohub.getI18nString('followMetaMarkLink') + '</span>';

                    let div = document.getElementById(key + '_desc');
                    div.appendChild(link)

                    link.addEventListener('click',(e) => {

                        let metaMarkReq = {
                            object: VIDE_PROTOCOL.OBJECT.METAMARK,
                            id: res.target,
                            operation: VIDE_PROTOCOL.OPERATION.VIEW,
                            perspective: VIDE_PROTOCOL.PERSPECTIVE.FACSIMILE,
                            contexts: []
                        };

                        let wrapper = {
                            target: items[0].target, //open link where context menu item would have been opened
                            req: metaMarkReq
                        }
                        submitRequest(wrapper);
                    });

                }

            } catch(err) {
                //console.log('[ERROR] Unable to render results')
            }
        });

        socket.emit('requestData', req);
        items.reverse();

        //filter out duplicate requests for transcription view
        items = filterDuplicateRequests(items);

        return (

            <div className="contextMenuBack" onClick={e => {
                e.preventDefault();
                closeContextMenu();
            }}>
                <div className="contextMenu" style={menuStyle} onClick={e => {e.stopPropagation();}}>
                    <div className="sliderFrame">

                        <Slider {...sliderSettings}>
                            {
                                items.map(function(item, i) {
                                    return <div className="contextSliderItem" key={i}>
                                        <PreviewItem object={item} clickFunc={submitRequest}/>
                                    </div>;
                                })
                            }
                        </Slider>
                    </div>
                    <div className="descBox" id={key}>
                        <div>
                            <div className="bravura" id={key + '_bravura'}></div>
                            <div className="desc" id={key + '_desc'}></div>
                        </div>
                        <div>
                            <div className="measure" id={key + '_measure'}></div>
                            <div className="position" id={key + '_position'}></div>
                        </div>
                        <div>
                            <div className="supplied" id={key + '_supplied'}></div>
                            <div className="unclear" id={key + '_unclear'}></div>
                        </div>
                    </div>
                </div>
            </div>
        );

    }

    return null;
};

let filterDuplicateRequests = (items) => {

    items = items.filter((item, index, self) =>
        index === self.findIndex((i) => (
            i.target === item.target &&
            i.req.id === item.req.id &&
            i.req.object === item.req.object &&
            i.req.perspective === item.req.perspective &&
            i.req.operation === item.req.operation &&
            i.req.contexts.length === item.req.contexts.length
        ))
    )

    return items;
};

ContextMenu.propTypes = {
    items: PropTypes.array.isRequired,
    visible: PropTypes.bool.isRequired,
    closeContextMenu: PropTypes.func.isRequired,
    submitRequest: PropTypes.func.isRequired,
    x: PropTypes.number.isRequired,
    y: PropTypes.number.isRequired

};

export default ContextMenu;
