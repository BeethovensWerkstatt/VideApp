import React, { PropTypes } from 'react';

const TourSteps = {
    demo101: {
        title: 'hello 2',
        restrictsAction: true,
        content: (
            <div>
                <h1>Hallo Überschrift</h1>
                <p>content</p>
            </div>
        ),
        attachTo: '.editionPreview',
        attachWhere: 'right',
        next: 'demo404'
    },
    
    demo404: {
        title: 'hello 2',
        restrictsAction: false,
        text: 'hallo schritt',
        attachTo: '.editionList'
    }
};

export default TourSteps;