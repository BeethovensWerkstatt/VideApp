import React, { PropTypes } from 'react';
import I18n from './../containers/I18n.react';
import PreviewItem from './PreviewItem.react';
import {EoModule, DataRequest} from './../temp/eomodule';
const Slider = require('react-slick');


const ContextMenu = ({ items, visible, closeContextMenu, submitRequest, x, y }) => {
    if(visible) {
        let menuStyle = {top: (y + 10) + 'px', left: (x + 10) + 'px'};
        
        let sliderSettings = {
            dots: true,
            infinite: true,
            draggable: false,
            centerMode: true,
            slidesToShow: 1,
            slidesToScroll: 1,
            centerPadding: 0
        };
        
        let id = 'e' + Math.uuidCompact();
        let url = 'http://localhost:8080/exist/apps/exist-module/edition/' + items[0].editionID + '/element/' + items[0].query.objectID + '/en/description.json';
        let request = new DataRequest('json', url);
        window.EoHub.requestData(request).then(
            (json) => {
                console.log('-----------------url ' + url);
                console.log(json);
                document.getElementById(id + '_bravura').innerHTML = json[0].bravura;
                document.getElementById(id + '_desc').innerHTML = json[0].desc;
                document.getElementById(id + '_measure').innerHTML = json[0].measure;
                document.getElementById(id + '_position').innerHTML = json[0].position;
            }
        );
        
        
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
                                    return <div className="contextSliderItem" key={i} onClick={e => {
                                        e.preventDefault();
                                        submitRequest(item);
                                    }}> 
                                        <PreviewItem object={item}/>
                                    </div>;
                                })
                            }    
                        </Slider>
                    </div>
                    <div className="descBox" id={id}>
                        <div>
                            <div className="bravura" id={id + '_bravura'}></div>
                            <div className="desc" id={id + '_desc'}></div>
                        </div>
                        <div>
                            <div className="measure" id={id + '_measure'}></div>
                            <div className="position" id={id + '_position'}></div>
                        </div>
                    </div>
                </div>
            </div>
        );    
    }
    
    return null;
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