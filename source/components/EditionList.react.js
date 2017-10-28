import React from 'react';
import PropTypes from 'prop-types';
import EditionListEntryController from './../containers/EditionListEntryController.react';
import { StatusCodes } from './../redux/actions.redux';
import I18n from './../containers/I18n.react';

const EditionList = ({ editions, revision, mode, highlighted, onSelect }) => {
    let classNames = 'editionList ' + mode;
    let noneHighlighted = highlighted === '';
    
    return (
        <div>
            <h2><I18n content="availableEditions"/></h2>
            <div className={classNames}>
                <div className="scrollContainer">
                    {
                    Object.keys(editions).map(function (id) {
                        let isHigh = (id === highlighted);
                        return <EditionListEntryController key={id} highlighted={isHigh} noneHighlighted={noneHighlighted} edition={editions[id]}/>;
                    })}
                </div>
            </div>
            {
                (highlighted !== '') && 
                    <div className="editionDetails">
                        <h2>{editions[highlighted].fullTitle}</h2>
                        <p>{editions[highlighted].desc}</p>
                        <div className="openButton" onClick={e => {
                            e.preventDefault();
                            onSelect(editions[highlighted].id);
                        }}>
                            <I18n content="open_edition"/>
                        </div>
                    </div>
                
            }
        </div>    
    );    
};

EditionList.propTypes = {
    editions: PropTypes.object.isRequired,
    revision: PropTypes.string.isRequired,
    highlighted: PropTypes.string.isRequired,
    mode: PropTypes.string.isRequired,
    onSelect: PropTypes.func.isRequired
};

export default EditionList;