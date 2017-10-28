import React from 'react';
import PropTypes from 'prop-types';

const TourSteps = {
    nav1: {
        restrictsAction: true,
        allowedTargets: [
            {selector:'.editionPreview:first-child',state:'nav2'}//these objects may have a state property
        ],
        content: {
            de: (
                <div>
                    <h1>Willkommen in der VideApp</h1>
                    <p>Klicke auf Op.75.2</p>
                </div>
            ),
            en: (
                <div>
                    <h1>Welcome to the VideApp</h1>
                    <p>Click on Op.75.2</p>
                </div>
            )
        },
        attachTo: '.editionList',
        attachWhere: 'top'
    },
    
    nav2: {
        restrictsAction: true,
        allowedTargets: [
            {selector:'.editionPreview:first-child',state:'nav3'},//these objects may have a state property
            {selector:'.editionDetails .openButton',state:'nav3'},
        ],
        content: {
            de: (
                <div>
                    <h1>Werk markiert</h1>
                    <p>Infotext, nochmal klicken</p>
                </div>
            ),
            en: (
                <div>
                    <h1>Work selected</h1>
                    <p>Information visible, now click once more</p>
                </div>
            )
        },
        attachTo: '.introduction > div',
        attachWhere: 'bottom'
    },
    
    nav3: {
        restrictsAction: true,
        allowedTargets: [
            {selector:'#uniqueID1',state:'nav4'},
            {selector:'.openseadragon-container'},
            {selector:'.facsNav.navigator'}//these objects may have a state property
        ],
        content: {
            de: (
                <div>
                    <h1>Faksimile-Ansicht, allgemein erklärt</h1>
                    <p>Interaktion mit Faksimile allgemein erlaubt, weiter <span id='uniqueID1'>hier</span></p>
                </div>
            ),
            en: (
                <div>
                    <h1>Facsimile View</h1>
                    <p>Interaction possible, go on with click <span id='uniqueID1'>here</span></p>
                </div>
            )
        },
        attachTo: '.appHeader',
        attachWhere: 'bottom left'
    },
    
    nav4: {
        restrictsAction: true,
        allowedTargets: [
            {selector:'.scarLabel',state:'nav5'}//these objects may have a state property
        ],
        content: {
            de: (
                <div>
                    <h1>Hallo Navigationskiste</h1>
                    <p>Ich bin die Erklärung</p>
                </div>
            ),
            en: (
                <div>
                    <h1>Hello Navigation Box</h1>
                    <p>I'm the explanation</p>
                </div>
            )
        },
        attachTo: '.navOverlay',
        attachWhere: 'top'
    },
    
    nav5: {
        restrictsAction: true,
        allowedTargets: [
            {selector:'.singleVariant'}//these objects may have a state property
        ],
        content: {
            de: (
                <div>
                    <h1>Hallo Navigationskiste</h1>
                    <p>Ich bin die Erklärung</p>
                </div>
            ),
            en: (
                <div>
                    <h1>Hello Navigation Box</h1>
                    <p>I'm the explanation</p>
                </div>
            )
        },
        attachTo: '.scarFrame',
        attachWhere: 'top'
    }
};

export default TourSteps;