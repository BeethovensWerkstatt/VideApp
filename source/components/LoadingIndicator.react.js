import React, { PropTypes } from 'react';
import I18n from './../containers/I18n.react';

const LoadingIndicator = ({ requests }) => {
    
    return (
        <div id="loadingIndicator">
            {
                requests.map(function(request, i) {
                    if(i === 0) {
                        return <div className="loadingItem" key={i}>
                            <i className="fa fa-cloud-download fa-fw"></i>
                            <I18n content={'loadData_' + request.type}/>
                        </div>;
                        
                        
                    }
                    return null;
                })
                
            }
        </div>
    );
};

LoadingIndicator.propTypes = {
    requests: PropTypes.array.isRequired
};

export default LoadingIndicator;