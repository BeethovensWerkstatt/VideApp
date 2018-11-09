import React from 'react';
import PropTypes from 'prop-types';
import I18n from './../containers/I18n.react';

/**
 * One edition
 */
class EditionListEntry extends React.Component {

    render() {
        let allClasses = 'editionPreview' + (this.props.highlighted ? ' highlighted' : '');
        let uri = (this.props.highlighted || this.props.noneHighlighted) ? this.props.edition.previewUri : this.props.edition.previewUri.replace('/default.jpg', '/gray.jpg');
        return (
            <div className={allClasses} data-editionID={this.props.edition.id} onClick={e => {
                e.preventDefault();
                this.props.onSelect();
            }}>
                <img className="previewImage" src={uri}/>
                <h1 className="editionTitle">{this.props.edition.title}</h1>
                <h2 className="editionOpus">{this.props.edition.opus}</h2>
            </div>
        );
    }
};



EditionListEntry.propTypes = {
    edition: PropTypes.object.isRequired,
    highlighted: PropTypes.bool.isRequired,
    noneHighlighted: PropTypes.bool.isRequired,
    onSelect: PropTypes.func.isRequired
  /*
   *    id
   *    identifier (for opus number etc.)
   *    composer
   *    title
   *    sources[]
   */
};

export default EditionListEntry;
