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
    },
	    
	
	tool007: {
        restrictsAction: true,
        allowedTargets: [
        {selector:'.openseadragon-container'},
        {selector:'.facsNav.navigator'},
	{selector:'.facsNavMenu'},
	{selector:'.navOverlay.overview'},
        {selector:'.navOverlay .scarLabel .detailsLink',state:'tool008'}
        ],
        content: {
            de: (
                <div>
                    <h1>Detailansicht</h1>
                    <p>Klicken sie "Detailansicht öffnen" um sich die Übersicht zu den einzelnen Textschichten innerhalb dieser 
		    Textnarbe anzeigen zu lassen.</p>
                </div>
            ),
            en: (
                <div>
                    <h1>Details</h1>
                    <p>Click on "Open Details" to open an overview of all the layer, that represent different states of the text scar.</p>
                </div>
            )
        },
        attachTo: '.navOverlay.overview',
        attachWhere: 'top'
    },


    tool008: {
        restrictsAction: true,
        allowedTargets: [
        {selector:'.openseadragon-container'},
        {selector:'.facsNav.navigator'},
	{selector:'.facsNavMenu'},
	{selector:'.scarFrame.animated'},
	{selector:'.navOverlay .stateNavigation .statesBox .timelineBox},
        {selector:'.navOverlay .stateNavigation .statesBox .timelineBox #view1_qwertz9.state',state:'tool009'}
        ],
        content: {
            de: (
                <div>
                    <h1>Detailansicht</h1>
                    <p>Die horizontale Anordnung innerhalb der Box spiegelt den chronologischen Verlauf des Prozesses wider, 
		    die vertikale Anordnung verdeutlicht das „Nicht-Bestimmen-Können“ einer zeitlichen Reihenfolge der Schichten. 
		    Durch das Anwählen der einzelnen Kästchen können Sie nun durch die einzelnen Schichten des Schreibprozesses 
		    navigieren, die aktuell ausgewählte Schicht wird durch einen roten Punkt markiert. Durchgestrichene Kästchen 
		    deuten eine Streichung an. Zum Fortfahren wählen Sie bitte den Schritt "j" in dem Verlauf aus.</p>
                </div>
            ),
            en: (
                <div>
                    <h1>Details</h1>
                    <p>...</p>
                </div>
            )
        },
        attachTo: '.navOverlay.scarOpen',
        attachWhere: 'top'
    },


 tool009: {
        restrictsAction: true,
        allowedTargets: [
        {selector:'.openseadragon-container'},
        {selector:'.facsNav.navigator'},
	{selector:'.facsNavMenu'},
	{selector:'.scarFrame.animated'},
	{selector:'.facsimile .svgBox #shape_6a65ba10-92ef-40cf-a3de-6bbad48829c1.current',state:'tool010'}
	{selector:'.facsimile .svgBox #shape_827f69ac-3f55-46e8-b5b5-1e4204246ec4.current',state:'tool010'}
	{selector:'.facsimile .svgBox #shape_bbe9206c-fc3b-4499-a3f9-5c9784834ac2.current',state:'tool010'}
	{selector:'.facsimile .svgBox #shape_881bcb75-a3af-4018-8031-fc382ccf7fee.current',state:'tool010'}
        ],
        content: {
            de: (
                <div>
                    <h1>Schieberegler</h1>
                    <p>Mit Hilfe des Schieberegles kann zwischen der Faksimile- und der Rekonstruktionsanschicht gewechselt werden. 
		    Wird innerhalb des Faksimiles auf ein Zeichen geklickt, öffnet sich eine Informationsbox. Wählen sie eine 
		    beliebige Note im Takt "130j" an um fortzufahren.</p>
                </div>
            ),
            en: (
                <div>
                    <h1>Slider</h1>
                    <p>...</p>
                </div>
            )
        },
        attachTo: '.facsNavMenu',
        attachWhere: 'below'
    },


 tool010: {
        restrictsAction: true,
        allowedTargets: [
        {selector:'.openseadragon-container'},
        {selector:'.facsNav.navigator'},
	{selector:'.facsNavMenu'},
	{selector:'.scarFrame.animated'},
	{selector:'.div.contextMenu .sliderFrame .contextSliderItem .sliderItemLabel .span.i18n',state:'tool011'}
        ],
        content: {
            de: (
                <div>
                    <h1>Informationsbox</h1>
                    <p>Diese Box enthält eine Beschreibung des angewählten Zeichens, die Transkriptionsansicht sowie die entsprechende Auszeichnung in MEI. Aus dieser Infobox heraus kann in eine andere Ansicht gewechselt werden, indem Sie auf "Transkription anzeigen" oder " XML anzeigen" klicken.</p>
                </div>
            ),
            en: (
                <div>
                    <h1>Information</h1>
                    <p>...</p>
                </div>
            )
        },
        attachTo: '.div.contextMenu',
        attachWhere: 'right'
    },


 tool011: {
        restrictsAction: true,
        allowedTargets: [
        {selector:'.openseadragon-container'},
        {selector:'.facsNav.navigator'},
	{selector:'.facsNavMenu'},
	{selector: '.scarFrame.animated'},
	{selector:'.view.VideTranscriptionViewer .invarianceBtn',state:'tool012'}
        ],
        content: {
            de: (
                <div>
                    <h1>Transkription</h1>
                    <p>Die Transkription-Ansicht enthält den transkribierten Notentext der einzelnen Schichten, gerendert mit Verovio. 
		    Die Navigationsbox ist also dieselbe wie in der Faksimile-Ansicht mit Ausnahme der Streichungen. 
		    Darüber hinaus bietet die Transkriptionsansicht die Möglichkeit zur Betrachtung der "Invarianzeinfärbung". 
		    Lassen Sie sich die Invarianzen anzeigen.</p>
                </div>
            ),
            en: (
                <div>
                    <h1>Transcription</h1>
                    <p>...</p>
                </div>
            )
        },
        attachTo: '.invarianceBtn',
        attachWhere: 'below'
    },




 tool012: {
        restrictsAction: true,
        allowedTargets: [
        {selector:'.openseadragon-container'},
        {selector:'.facsNav.navigator'},
	{selector:'.facsNavMenu'},
	{selector: '.scarFrame.animated'},
	{selector:'.perspectivesBar .perspectiveButton .fa ',state:'tool013'}
        ],
        content: {
            de: (
                <div>
                    <h1>Invarianz</h1>
                    <p>In dieser Ansicht werden die einzelnen Schichten der Transkription bunt eingefärbt. 
		    Änderungen die vorgenommen wurden bekommen eine neue Farbe, übernommene Zeichen behalten ihre Farbe.
		    Diese werden in den Kästchen der Navigationsbox ebenfalls entsprechend ihrer Schicht übernommen. 
		    Um zwei Ansichten gleichzeitig zu betrachten klicken Sie auf die Balken in der Kopfzeile oben rechts, 
		    um beispielsweise Faksimile- und Transkriptionsansicht nebeneinander oder übereinander zu legen. 
		    Tun Sie dies, um fortzufahren.</p>
                </div>
            ),
            en: (
                <div>
                    <h1>Transcription</h1>
                    <p>...</p>
                </div>
            )
        },
        attachTo: '.invarianceBtn',
        attachWhere: 'below'
    },

 tool013: {
        restrictsAction: true,
        allowedTargets: [
        {selector:'.openseadragon-container'},
        {selector:'.facsNav.navigator'},
	{selector:'.facsNavMenu'},
	{selector: '.scarFrame.animated'},
	{selector:'.perspectiveButton.syncViews',state:'tool014'}
        ],
        content: {
            de: (
                <div>
                    <h1>Parallelansicht</h1>
                    <p>Es erscheint ein zusätzliches Symbol, welches die Möglichkeit zur Synchronisation der Ansichten 
		    anbietet sodass mit der Navigation in einer Ansicht, die andere automatisch mitläuft. 
		    Nächster Schritt "Synchronisieren".</p>
                </div>
            ),
            en: (
                <div>
                    <h1>Parallel views</h1>
                    <p>...</p>
                </div>
            )
        },
        attachTo: '.perspectiveButton.syncViews',
        attachWhere: 'below'
    },


 tool014: {
        restrictsAction: true,
        allowedTargets: [
        {selector:'.openseadragon-container'},
        {selector:'.facsNav.navigator'},
	{selector:'.facsNavMenu'},
	{selector: '.scarFrame.animated'},

        ],
        content: {
            de: (
                <div>
                    <h1>Drop-Down-Menü</h1>
                    <p> In dem Drop-down-Menü auf der linken seite besteht die Möglichkeit zwischen Einführung, Faksimile, 
		    Trankription und XML-Ansicht zu wechseln.</p>
<p> Die Einführungs-Ansicht besteht aus einem Text, der Informationen zum Werk und zur Quelle gibt, außerdem die Variantenstelle, 
		    den zugrundeliegenden Schreibprozess und das kompositorische Problem detailliert erläutert. Entsprechende Stellen 
		    sind verlinkt, derzeit jedoch nicht aktiv.</p>
<p>In der XML-Ansicht befindet sich die MEI-Datei, welche sämtliche Daten enthält. Eine integrierte Suchfunktion 
		    öffnet sich durch das Tastaturkürzel cmd+F. Eine XPath-Anfrage oder die Suche nach Text ist hier erlaubt.</p>
<p>Um auf die Startseite zurück zu gelangen klicken Sie auf "VideApp“ oben links in der Kopfleiste</p>
                </div>
            ),
            en: (
                <div>
                    <h1>Drop-down-menu</h1>
                    <p>...</p>
                </div>
            )
        },
        attachTo: '.transcriptionNavMenu .select-target.select-theme-chosen',
        attachWhere: 'below'
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
