import React from 'react';
import PropTypes from 'prop-types';

const TourSteps = {
    
    tool001: {
        restrictsAction: true,
        allowedTargets: [
            {selector:'.editionPreview[data-editionid="Codierung_WoO32"]',state:'tool002'}
        ],
        content: {
            de: (
                <div>
                    <h1>Willkommen in der VideApp</h1>
                    <p>Diese Tour wird Sie mit der Bedienung der VideApp vertraut machen. Um zu beginnen, klicken Sie bitte auf WoO 32 in der unten stehenden Liste.</p>
                </div>
            ),
            en: (
                <div>
                    <h1>Welcome to the VideApp</h1>
                    <p>This tour will introduce you with the functionality of the VideApp. To get started, please click on WoO 32 in the list below.</p>
                </div>
            )
        },
        //attachTo: '.tourStartButton',
        //attachTo: '.editionPreview[data-editionid="Codierung_WoO32"]',
        attachTo: 'header.appHeader',
        attachWhere: 'bottom'
    },
    
    tool002: {
        restrictsAction: true,
        allowedTargets: [
            {selector:'.editionPreview[data-editionid="Codierung_WoO32"]',state:'tool003'},
            {selector:'.editionDetails .openButton',state:'tool003'},
        ],
        content: {
            de: (
                <div>
                    <h1>Vorschau der Fallstudie</h1>
                    <p>Sie sehen nun eine kurze Beschreibung dessen, was die Fallstudie zu WoO 32 auszeichnet. Um sie zu öffnen, klicken Sie bitte entweder
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
        attachTo: '.editionPreview[data-editionid="Codierung_WoO32"]',
        attachWhere: 'left'
    },
    
    tool003: {
        restrictsAction: true,
        allowedTargets: [
            {selector:'.openseadragon-container'},
            {selector:'.facsNav.navigator'},
            {selector:'div.views .menu a.select-target.select-theme-chosen, .select-theme-chosen',
                selectBox:{
                    allowedValues: [{value:'VideFacsimileViewer',state:'tool004'}]
                }
            },
            {selector:'.select.viewSelect',state:'tool004'} 
            //Bin mir unsicher, ob dieser selector den richtigen Schritt im Drop-Down Menü öffnet.
            
        ],
        content: {
            de: (
                <div>
                    <h1>Einführung</h1>
                    <p>Die Einführungs-Ansicht besteht aus einem Text, der Informationen zum Werk und zur Quelle gibt, 
                    außerdem die Variantenstelle, den zugrundeliegenden Schreibprozess und das kompositorische Problem detailliert erläutert. 
                    Entsprechende Stellen sind verlinkt. Wechseln Sie nun in dem Drop-Down-Menü die "Faksimileansicht" aus.</p>
                </div>
            ),
            en: (
                <div>
                    <h1>Introduction</h1>
                    <p>Text in progress...</p>
                </div>
            )
        },
        attachTo: 'div.views .view.VideTextViewer .menu .select-target.select-theme-chosen, .select-theme-chosen',
        attachWhere: 'right-start'
    },
    
    tool004: {
        restrictsAction: true,
        allowedTargets: [
            {selector:'header.appHeader',state: 'tool004'},
            {selector:'.facsNav.navigator',state: 'tool004'},
            {selector:'.facsNavMenu .menuRow',state:'tool005'}
        ],
        content: {
            de: (
                <div>
                    <h1>Faksimile-Ansicht</h1>
                    <p>Die Fallstudie öffnet sich in der Faksimile-Ansicht. In der Navigationsbox haben Sie die Möglichkeit die Taktzahlen auszublenden.
                    Bitte blenden Sie die Taktzahlen aus um fortzufahren.</p>
                </div>
            ),
            en: (
                <div>
                    <h1>Facsimile View</h1>
                    <p>Hide Measure Numbers.</p>
                </div>
            )
        },
        attachTo: '.facsNavMenu',
        attachWhere: 'left'
    },
    
    
    tool005: {
        restrictsAction: true,
        allowedTargets: [
            {selector:'.openseadragon-container',state:'tool005'},
            {selector:'.facsNav.navigator',state:'tool005'},
            {selector:'.facsNavMenu .menuRow',state:'tool006'}
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
    
    tool006: {
        restrictsAction: true,
        allowedTargets: [
            {selector:'.openseadragon-container'},
            {selector:'.facsNav.navigator'},
	        {selector:'.facsNavMenu'},
            {selector:'.facsNavMenu #view1_zoomHome.menuButton',state:'tool007'}
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
    
    tool007: {
        restrictsAction: true,
        allowedTargets: [
            {selector:'.openseadragon-container'},
            {selector:'.facsNav.navigator'},
	        {selector:'.facsNavMenu'},
	        {selector:'.navOverlay.overview'},
            {selector:'.navOverlay .stateNavigation .scarBox .scar',state:'tool008'}
        ],
        content: {
            de: (
                <div>
                    <h1>Werkübersicht</h1>
                    <p>Diese Navigationsbox zeigt eine Übersicht der vorkommenden Textnarben innerhalb der Fallstudie an. 
                    Alle im Werk vorhandenen Textnarben sind mit einem roten Kästchen versehen.
                    Die Taktzahlen sind über der Box in grau hinterlegt. Wird mit der Maus über die Navigationsbox gefahren, 
                    erscheinen die genauen Taktzahlen, die durch einen Klick ausgewählt werden können. 
                    Nächster Schritt: Wählen Sie eine der Textnarben aus.</p>
                </div>
            ),
            en: (
                <div>
                    <h1>Overview of musical text</h1>
                    <p>Here you can view the musical text... Next Step: Click on any text scar.</p>
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
	    {selector:'.navOverlay.overview'},
	    {selector:'.navOverlay .stateNavigation .scarBox .scar',state:'tool008'},
        {selector:'.navOverlay .scarLabel .detailsLink',state:'tool009'}
        
        ],
        content: {
            de: (
                <div>
                    <h1>Detailansicht</h1>
                    <p>Mit den Pfeilen an der Seite dieser Box, haben sie die Möglichkeit die nächste oder vorherige Textnarbe auszuwählen. 
                    Klicken sie als nächstes auf "Detailansicht öffnen" um sich die Übersicht zu den einzelnen Textschichten innerhalb dieser 
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


    tool009: {
        restrictsAction: true,
        allowedTargets: [
        {selector:'.openseadragon-container'},
        {selector:'.facsNav.navigator'},
	    {selector:'.facsNavMenu'},
	    {selector:'.scarFrame.animated'},
	    {selector:'.navOverlay .stateNavigation .statesBox .timelineBox',state:'tool009'},
        {selector:'.navOverlay.scarOpen .closeScarBtn',state:'tool010'}
        ],
        content: {
            de: (
                <div>
                    <h1>Detailansicht</h1>
                    <p>Die horizontale Anordnung innerhalb der Box spiegelt den chronologischen Verlauf der Entwicklung der Textnarbe wider. 
		    Durch das Anwählen der einzelnen Kästchen können Sie nun durch die einzelnen Schichten des Schreibprozesses 
		    navigieren, die aktuell ausgewählte Schicht wird durch einen roten Punkt markiert. Nachdem Sie die diese Funktion getestet haben, schließen 
		    Sie die Detailansicht über das "X" rechts oben.</p>
                </div>
            ),
            en: (
                <div>
                    <h1>Details</h1>
                    <p>Text in progress...</p>
                </div>
            )
        },
        attachTo: '.navOverlay.scarOpen',
        attachWhere: 'top'
    },


 tool010: {
        restrictsAction: true,
        allowedTargets: [
        {selector:'.openseadragon-container'},
        {selector:'.facsNav.navigator'},
	{selector:'.facsNavMenu'},
	{selector:'.facsimile .svgBox svg path',state:'tool011'}
	
        ],
        content: {
            de: (
                <div>
                    <h1>Informationsbox</h1>
                    <p>Als nächstes klicken Sie bitte eine beliebige Note an um zu der Informationsbox zu gelangen.</p>
                </div>
            ),
            en: (
                <div>
                    <h1>Information</h1>
                    <p>...</p>
                </div>
            )
        },
        attachTo: '.facsNavMenu',
        attachWhere: 'bottom'
    },


 tool011: {
        restrictsAction: true,
        allowedTargets: [
            {selector:'.openseadragon-container'},
            {selector:'.facsNav.navigator'},
           	{selector:'.facsNavMenu'},
           	{selector:'div.contextMenu .sliderFrame .contextSliderItem .sliderItemLabel',state:'tool012'}
        ],
        content: {
            de: (
                <div>
                    <h1>Informationsbox</h1>
                    <p>Diese Box enthält eine Beschreibung des angewählten Zeichens, die Transkriptionsansicht sowie die entsprechende Auszeichnung in MEI. 
                    Aus dieser Infobox heraus kann in eine andere Ansicht gewechselt werden, indem Sie auf "Transkription anzeigen" oder " XML anzeigen" klicken.
                    Bitte öffnen Sie im nächsten Schritt die Transkriptionsansicht.</p>
                </div>
            ),
            en: (
                <div>
                    <h1>Information</h1>
                    <p>...</p>
                </div>
            )
        },
        attachTo: 'div.contextMenu',
        attachWhere: 'right'
    },

 tool012: {
        restrictsAction: true,
        allowedTargets: [
            {selector:'.openseadragon-container'},
            {selector:'.facsNav.navigator'},
           	{selector:'.facsNavMenu'},
           	{selector:'.scarFrame.animated'},
           	{selector:'.view.VideTranscriptionViewer .transcriptionNavMenu #view1_zoomHome.menuButton',state:'tool013'}
        ],
        content: {
            de: (
                <div>
                    <h1>Transkription</h1>
                    <p>Die Transkription-Ansicht enthält den transkribierten Notentext der einzelnen Schichten, gerendert mit Verovio. Die Textnarben sind durch die roten
                    Kästchen markiert. Die Navigationsbox ist also dieselbe wie in der Faksimile-Ansicht. Sie haben auch die Möglichkeit, sich das gesamte Stück anzusehen. 
		    Klicken sie hierfür auf das "Maximieren" Symbol.</p>
                </div>
            ),
            en: (
                <div>
                    <h1>Transcription</h1>
                    <p>...</p>
                </div>
            )
        },
        attachTo: '.view.VideTranscriptionViewer .transcriptionNavMenu #view1_zoomHome.menuButton',
        attachWhere: 'bottom-end'
    },

 tool013: {
        restrictsAction: true,
        allowedTargets: [
        {selector:'.openseadragon-container'},
        {selector:'.facsNav.navigator'},
	{selector:'.facsNavMenu'},
	{selector:'.scarFrame.animated'},
	{selector:'.navOverlay .scarLabel .detailsLink',state:'tool014'}
        ],
        content: {
            de: (
                <div>
                    <h1>Transkription</h1>
                    <p>Um eine weitere Besonderheit der Transkriptionsansicht anzusehen, öffnen Sie erneut die "Detailansicht".</p>
                </div>
            ),
            en: (
                <div>
                    <h1>Transcription</h1>
                    <p>...</p>
                </div>
            )
        },
        attachTo: '.navOverlay.overview',
        attachWhere: 'top'
    },




 tool014: {
        restrictsAction: true,
        allowedTargets: [
        {selector:'.openseadragon-container'},
        {selector:'.facsNav.navigator'},
	{selector:'.facsNavMenu'},
	{selector: '.scarFrame.animated'},
	{selector:'header.appHeader .videAppLogo',state:'tool015'}
        ],
        content: {
            de: (
                <div>
                    <h1>Varianten-Detailansicht</h1>
                    <p>Wenn Sie in der Transkriptionsansicht die jeweilige Schreibschichten anwählen, erscheinen diese hier über dem Notentext. 
                    Anhand des Beispiels "Op. 75,2" soll im Folgenden noch auf weitere Funktionen hingewiesen werden. Wechseln Sie hierfür auf die Startseite mit Hilfe des "VideApp-Symbols" oben links.</p>
                </div>
            ),
            en: (
                <div>
                    <h1>Variation-Details</h1>
                    <p>...</p>
                </div>
            )
        },
        attachTo: '.view.VideTranscriptionViewer .verovioBox .stateBox',
        attachWhere: 'left'
    },

    tool015: {
        restrictsAction: true,
        allowedTargets: [
            {selector:'.editionPreview[data-editionid="Codierung_op.75.2"]',state:'tool016'}
        ],
        content: {
            de: (
                <div>
                    <h1>VideApp</h1>
                    <p>Um fortzufahren, klicken Sie bitte auf Op. 75,2 in der unten stehenden Liste.</p>
                </div>
            ),
            en: (
                <div>
                    <h1>VideApp</h1>
                    <p>This tour will introduce you with the functionality of the VideApp. To get started, please click on Op. 75,2 in the list below.</p>
                </div>
            )
        },
        attachTo: '.editionPreview[data-editionid="Codierung_op.75.2"]',
        attachWhere: 'left'
    },
    
    tool016: {
        restrictsAction: true,
        allowedTargets: [
            {selector:'.editionPreview[data-editionid="Codierung_op.75.2"]',state:'tool017'},
            {selector:'.editionDetails .openButton',state:'tool017'},
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
    
 tool017: {
        restrictsAction: true,
        allowedTargets: [
            {selector:'.openseadragon-container',state: 'tool017'},
            {selector:'.facsNav.navigator',state: 'tool017'},//here
            {selector:'div.views .menu a.select-target.select-theme-chosen',
                selectBox:{
                    allowedValues: [{value:'VideFacsimileViewer',state:'tool018'}]
                }
            }
            //{selector:'div.views .view.VideTextViewer .menu .select-target.select-theme-chosen .select-option[data-value = "VideFacsimileViewer"]',state:'tool018'} 
            
        ],
        content: {
            de: (
                <div>
                    <h1>Einführung</h1>
                    <p>Wechseln Sie bitte in die Faksimile-Ansicht über das Drop-Down-Menü.</p>
                </div>
            ),
            en: (
                <div>
                    <h1>Introduction</h1>
                    <p>Text in progress...</p>
                </div>
            )
        },
        attachTo: 'div.views .view.VideTextViewer .menu .select-target.select-theme-chosen',
        attachWhere: 'right-start'
    },
    
	
	tool018: {
        restrictsAction: true,
        allowedTargets: [
        {selector:'.openseadragon-container'},
        {selector:'.facsNav.navigator'},
	{selector:'.facsNavMenu'},
	{selector:'.navOverlay.overview'},
        {selector:'.navOverlay .scarLabel .detailsLink',state:'tool019'}
        ],
        content: {
            de: (
                <div>
                    <h1>Detailansicht</h1>
                    <p>Wählen Sie nun die unten gezeigte Textnarbe aus und öffnen Sie die "Detailansicht" um sich die Übersicht zu den einzelnen Textschichten innerhalb dieser Textnarbe anzeigen zu lassen.</p>
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


    tool019: {
        restrictsAction: true,
        allowedTargets: [
        {selector:'.openseadragon-container'},
        {selector:'.facsNav.navigator'},
	{selector:'.facsNavMenu'},
	{selector:'.scarFrame.animated'},
	{selector:'.navOverlay .stateNavigation .statesBox .timelineBox'},
        {selector:'.navOverlay .stateNavigation .statesBox .timelineBox #view1_qwertz9.state',state:'tool020'}
        ],
        content: {
            de: (
                <div>
                    <h1>Detailansicht</h1>
                    <p>Die horizontale Anordnung innerhalb der Box spiegelt den chronologischen Verlauf des Prozesses wider, 
		    die vertikale Anordnung verdeutlicht das "Nicht-Bestimmen-Können" einer zeitlichen Reihenfolge der Schichten. 
		    Durch das Anwählen der einzelnen Kästchen können Sie nun durch die einzelnen Schichten des Schreibprozesses 
		    navigieren, die durchgestrichene Kästchen deuten eine Streichung an. Zum Fortfahren wählen Sie bitte den Schritt "j" in dem Verlauf aus.</p>
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


 tool020: {
        restrictsAction: true,
        allowedTargets: [
        {selector:'.openseadragon-container'},
        {selector:'.facsNav.navigator'},
	{selector:'.facsNavMenu'},
	{selector:'.scarFrame.animated'},
	{selector:'.perspectivesBar .perspectiveButton .fa ',state:'tool021'}
        ],
        content: {
            de: (
                <div>
                    <h1>Schieberegler</h1>
                    <p>Mit Hilfe des Schieberegles kann zwischen der Faksimile- und der Rekonstruktionsanschicht gewechselt werden. 
                    Klicken Sie auf nun auf die Balken in der Kopfzeile oben rechts, 
		    um eine Parallelansicht nebeneinander oder übereinander zu legen. 
		    Tun Sie dies, um fortzufahren.</p>
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
        attachWhere: 'bottom'
    },

 tool021: {
        restrictsAction: true,
        allowedTargets: [
        {selector:'.openseadragon-container'},
        {selector:'.facsNav.navigator'},
	{selector:'.facsNavMenu'},
	{selector: '.scarFrame.animated'},
	{selector:'.perspectiveButton.syncViews',state:'tool022'}
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
        attachWhere: 'bottom'
    },
	
 tool022: {
        restrictsAction: true,
        allowedTargets: [
        {selector:'.openseadragon-container'},
        {selector:'.facsNav.navigator'},
	{selector:'.facsNavMenu'},
	{selector: '.scarFrame.animated'},
	{selector: 'div.views .view.VideTextViewer .menu .select-target.select-theme-chosen .select-option'},
	{selector:'.fa-square-o:before',state:'tool023'}
        ],
        content: {
            de: (
                <div>
                    <h1>Parallelansicht</h1>
                    <p>Nun sind beide Ansichten synchronisiert. Wenn Sie nun eine bestimmte Textnarbe in einem Beispiel auswählen, wird in der anderen Ansicht der selbe Bereich angezeigt. 
                    Sie können in jedem Fenster beliebig zwischen den verschiedenen Anischten (Faksimile/Transkription/XML) umschalten. In der Trankriptionsansicht haben Sie bei diesem Beispiel 
                    die Möglichkeit, sich die Invarianzeinfärbung anzeigen zu lassen. Wechseln Sie hierzu in einem Fenster in die Trankriptions-Ansicht und wählen Sie dort die "Invarianzeinfärbung" aus.</p>
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
        attachWhere: 'bottom'
    },
	
tool023: {
        restrictsAction: true,
        allowedTargets: [
        {selector:'.openseadragon-container'},
        {selector:'.facsNav.navigator'},
	{selector:'.facsNavMenu'},
	{selector: '.scarFrame.animated'},
	{selector: 'div.views .view.VideTextViewer .menu .select-target.select-theme-chosen .select-option'},
	{selector:'header.appHeader .videAppLogo'}
        ],
        content: {
            de: (
                <div>
                    <p>Sie haben die Tour erfolgreich abgeschlossen. Wir hoffen, dass Ihnen der Umgang unserer Fallstudien mit der VideApp nun vertrauter 
		    geworden sind. Mit einem Klick auf das VideApp-Logo gelangen Sie zurück zum Hauptmenü 
		    und können die verfügbaren Fallstudien öffnen.</p>
                </div>
            ),
            en: (
                <div>
                    <p>...</p>
                </div>
            )
        },
        attachTo: '.perspectiveButton.syncViews',
        attachWhere: 'bottom'
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
