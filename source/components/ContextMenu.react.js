import React, { PropTypes } from 'react';
import I18n from './../containers/I18n.react';
import PreviewItem from './PreviewItem.react';
import {eohub} from './../_modules/eo-hub';
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
        
        let key = Math.uuidCompact()
        let req = {
            id: items[0].req.id,
            edition: eohub.getEdition(),
            type: 'getElementDesc',
            key: key
        }
        
        let socket = io(eohub._server + eohub._socketID);
        
        socket.once(key,(json) => {
            
            try {
                document.getElementById(key + '_bravura').innerHTML = json[0].bravura;
                document.getElementById(key + '_desc').innerHTML = json[0].desc;
                document.getElementById(key + '_measure').innerHTML = json[0].measure;
                document.getElementById(key + '_position').innerHTML = json[0].position;
            } catch(err) {
                console.log('Unable to render results')
            }
        });
        
        socket.emit('requestData', req);
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
                    <div className="descBox" id={key}>
                        <div>
                            <div className="bravura" id={key + '_bravura'}></div>
                            <div className="desc" id={key + '_desc'}></div>
                        </div>
                        <div>
                            <div className="measure" id={key + '_measure'}></div>
                            <div className="position" id={key + '_position'}></div>
                        </div>
                    </div>
                </div>
            </div>
        );   
        
        /*return (
            <h1>HURZ!!!</h1>
        );*/
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