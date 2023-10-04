import React from 'react';
import PropTypes from 'prop-types';
import I18n from './../containers/I18n.react';

/**
 * @param requests {array}
 * @class
 */
const LoadingIndicator = ({ requests }) => {

    if(requests.length === 0) {
        return null;
    }

    return (

        <div id="loadingIndicator">
            <div className="loadingItem">
                <i className="fa fa-spinner fa-pulse fa-fw"></i>
                <I18n content={'loadData_' + requests[0].type}/>
            </div>;
        </div>

    )


};

LoadingIndicator.propTypes = {
    requests: PropTypes.array.isRequired
};

export default LoadingIndicator;
