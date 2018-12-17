import React from 'react';
import PropTypes from 'prop-types';
import { ViewLayouts } from '../redux/layout.constants';

/**
 * @param hidden {bool}
 * @param synced {bool}
 * @param onClick {function}
 * @class
 */
const SyncViewsButton = ({ hidden, synced, onClick }) => {
    const classString = 'perspectiveButton syncViews' + (hidden ? ' hidden':'');

    var content;
    if(synced) {
        content = <i className="fa fa-link"></i>;
    } else {
        content = <i className="fa fa-unlink"></i>;
    }

    return (
    <div className={classString}
        onClick={e => {
            e.preventDefault();
            onClick(!synced);
        }}>
        {
            content
        }
    </div>

    );
};


SyncViewsButton.propTypes = {
    hidden: PropTypes.bool.isRequired,
    synced: PropTypes.bool.isRequired,
    onClick: PropTypes.func.isRequired

};

export default SyncViewsButton;
