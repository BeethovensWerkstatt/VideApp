import React from 'react';
import PropTypes from 'prop-types';

const TourSteps = {
    
    tool001: {
        restrictsAction: true,
        allowedTargets: [
            {selector:'.editionPreview[data-editionID = "Codierung_op.75.2"]',state:'tool002'}
        ],
        content: {
            de: (
                <div>
                    <h1>Willkommen in der VideApp</h1>
                    <p>Diese Tour wird Sie mit der Bedienung der VideApp vertraut machen. Um zu beginnen, klicken Sie bitte auf Op. 75,2 in der unten stehenden Liste.</p>
                </div>
            ),
            en: (
                <div>
                    <h1>Welcome to the VideApp</h1>
                    <p>This tour will introduce you with the functionality of the VideApp. To get started, please click on Op. 75,2 in the list below.</p>
                </div>
            )
        },
        attachTo: '.editionPreview[data-editionID = "Codierung_op.75.2"]',
        attachWhere: 'top right'
    },
    
    tool002: {
        restrictsAction: true,
        allowedTargets: [
            {selector:'.editionPreview[data-editionID = "Codierung_op.75.2"]',state:'tool003'},//these objects may have a state property
            {selector:'.editionDetails .openButton',state:'tool003'},
        ],
        content: {
            de: (
                <div>
                    <h1>Vorschau der Fallstudie</h1>
                    <p>Sie sehen nun eine kurze Beschreibung dessen, was die Fallstudie zu Op. 75,2 auszeichnet. Um sie zu öffnen, klicken Sie bitte entweder
                        erneut auf den Faksimile-Ausschnitt, oder auf die Schaltfläche "Öffne Edition" rechts unten.</p>
                </div>
            ),
            en: (
                <div>
                    <h1>Preview of the Case Study</h1>
                    <p>You now see a brief description of the specifics of this case study. For the time being, all contents are available in german only. 
                        In order to open this case study in the VideApp, either click on its facsimile again or on the button "Open Edition" in the lower right.</p>
                </div>
            )
        },
        attachTo: '.introduction > div',
        attachWhere: 'bottom'
    },
    
    tool003: {
        restrictsAction: true,
        allowedTargets: [
            {selector:'.openseadragon-container',state: 'tool003'},
            {selector:'.facsNav.navigator',state: 'tool003'},
            {selector:'.facsNavMenu .menuRow',state:'tool004'}//these objects may have a state property
        ],
        content: {
            de: (
                <div>
                    <h1>Faksimile-Ansicht</h1>
                    <p>Die Fallstudie öffnet sich in der Faksimile-Ansicht. TODO. Aufgabe: Taktzahlen ausblenden</p>
                </div>
            ),
            en: (
                <div>
                    <h1>Facsimile View</h1>
                    <p>TODO. Next step: Hide Measure Numbers.</p>
                </div>
            )
        },
        attachTo: '.facsNavMenu',
        attachWhere: 'left'
    },
    
    tool004: {
        restrictsAction: true,
        allowedTargets: [
            {selector:'.openseadragon-container'},
            {selector:'.facsNav.navigator'},
            {selector:'.facsNavMenu .menuRow',state:'tool005'}//these objects may have a state property
        ],
        content: {
            de: (
                <div>
                    <h1>Faksimile-Ansicht</h1>
                    <p>Herzlichen Glückwunsch – Sie haben die richtige Schaltfläche gefunden. Bitte blenden Sie die Taktzahlen nun wieder ein. </p>
                </div>
            ),
            en: (
                <div>
                    <h1>Facsimile View</h1>
                    <p>Congrats, you've found the right button. Now please turn the measure numbers back on.</p>
                </div>
            )
        },
        attachTo: '.facsNavMenu',
        attachWhere: 'left'
    },
    
    tool005: {
        restrictsAction: true,
        allowedTargets: [
            {selector:'.openseadragon-container'},
            {selector:'.facsNav.navigator'},
	        {selector:'.facsNavMenu'},
            {selector:'.facsNavMenu #view1_zoomHome.menuButton',state:'tool006'}
        ],
        content: {
            de: (
                <div>
                    <h1>Faksimile-Menü</h1>
                    <p>In diesem Menü haben Sie die Möglichkeit zu zoomen, das Faksimile zu drehen, oder wieder zu maximieren. Während sie an das 
                    Faksimile heranzoomen zeigt Ihnen ein rotes Kästchen in dem Menü an, wo sie sich in dem Werk befinden. 
                    Darüber hinaus haben Sie die Möglichkeit das Faksimile innerhalb des Hauptfensters beliebig hin- und her zu bewegen. 
                    Probieren Sie die Funktionen aus und klicken Sie dann auf die "Maximieren" Taste, sobald Sie die Tour fortsetzen wollen.</p>
                </div>
            ),
            en: (
                <div>
                    <h1>Facsimile Menu</h1>
                    <p>In this menu you can use different tools, to zoom in and out of the facsimile...</p>
                </div>
            )
        },
        attachTo: '.facsNavMenu',
        attachWhere: 'left'
    },
    
    tool006: {
        restrictsAction: true,
        allowedTargets: [
            {selector:'.openseadragon-container'},
            {selector:'.facsNav.navigator'},
	        {selector:'.facsNavMenu'},
	        {selector:'.navOverlay.overview'},
            {selector:'.navOverlay .stateNavigation .measuresBox',state:'tool007'}
        ],
        content: {
            de: (
                <div>
                    <h1>Werkübersicht</h1>
                    <p>Diese Navigationsbox zeigt eine Übersicht der vorkommenden Textnarben innerhalb der Fallstudie an. 
                    Alle im Werk vorhandenen Textnarben sind mit einem roten Kästchen versehen.
                    Die Taktzahlen sind über der Box in grau hinterlegt. Wird mit der Maus über die Navigationsbox gefahren, 
                    erscheinen die genauen Taktzahlen, die durch einen Klick ausgewählt werden können. 
                    Nächster Schritt: Wählen Sie einen Takt innerhalb der Textnarbe aus.</p>
                </div>
            ),
            en: (
                <div>
                    <h1>Overview of musical text</h1>
                    <p>Here you can view the musical text... Next Step: Open any measure you want from the text scar.</p>
                </div>
            )
        },
        attachTo: '.navOverlay.overview',
        attachWhere: 'top'
    }

    /*nav1: {
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
    }*/
};

export default TourSteps;