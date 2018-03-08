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
                    <h1>Willkommen in der <i>VideApp</i></h1>
                    <p>Mit Hilfe dieser Tour sollen Sie schrittweise mit der Anwendung vertraut gemacht werden. Starten Sie, indem Sie das Beispiel zum Duett WoO 32 per Mausklick anwählen.</p>
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
                    <p>Sie sehen nun eine kurze Beschreibung der Fallstudie. Um dieses Beispiel in der <i>VideApp</i> zu öffnen, klicken Sie 
                        bitte entweder erneut auf die Faksimile-Vorschau oder auf "Öffne Edition" rechts unten.</p>
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
                    <p>Der Einstieg in jedes Beispiel geschieht über einen Einführungstext, in dem Informationen zu Werk, Quelle, Variantenstelle(n), zugrunde liegenden
                    Schreibprozessen und zum kompositorischen Problem gegeben werden. Verlinkungen helfen, einzelne Stellen in Faksimile, 
                    Transkription und XML-Codierung aufzurufen. Diese verschiedenen Ansichten sind neben der Einführung jederzeit auch über das <b>Ansichtsmenü</b> am 
                    oberen linken Bildrand zu erreichen. Wählen Sie jetzt in diesem Menü "Faksimile" aus.</p>
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
            {selector:'.facsNavMenu .menuRow'},
            {selector:'.facsNavMenu #view1_zoomHome.menuButton', state: 'tool006'}
        ],
        content: {
            de: (
                <div>
                    <h1>Faksimile-Ansicht</h1>
                    <p>Die Faksimile-Ansicht ermöglicht, sich mit dem Manuskript vertraut zu machen. Dabei kann man das Faksimile mit Hilfe der <b>Dokumentnavigation</b> oben rechts beliebig
                     vergrößern und verkleinern, drehen und verschieben. Das rote Kästchen in der Miniatur-Anzeige der Partitur verdeutlicht den gerade gewählten Bildausschnitt. 
                     Außerdem können Sie die Taktzählung ein- und ausblenden. Erproben Sie diese Funktionen und wählen Sie
                    die Vollansicht (<i className="fa fa-arrows-alt tourIcon"></i>), um mit der Tour fortzufahren.</p>
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
    
    
    /*tool005: {
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
    },*/
    
    /*tool006: {
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
    },*/
    
    tool006: {
        restrictsAction: true,
        allowedTargets: [
            {selector:'.openseadragon-container'},
            {selector:'.facsNav.navigator'},
	        {selector:'.facsNavMenu'},
	        {selector:'.navOverlay .measuresBox',state:'tool007'}
        ],
        content: {
            de: (
                <div>
                    <h1>Textgenetische Navigation</h1>
                    <p>Um die rekonstruierten Schreibprozesse nachzuvollziehen, bietet die <b>textgenetische Navigation</b> eine schematisch vereinfachte
                    Partituransicht. Wenn Sie den Mauszeiger darüber bewegen, werden am Satzanfang die jeweiligen Stimmen und oben die entsprechende Taktzahl eingeblendet.
                    Klicken Sie auf eine dieser Taktzahlen, um die entsprechende Stelle im Faksimile anzuzeigen.
                    </p>
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
    
    tool007: {
        restrictsAction: true,
        allowedTargets: [
            {selector:'.openseadragon-container'},
            {selector:'.facsNav.navigator'},
	        {selector:'.facsNavMenu'},
	        {selector:'.navOverlay.overview'},
            {selector:'.navOverlay .stateNavigation .scarBox .scar'},
            {selector:'.navOverlay .scarLabel .detailsLink',state:'tool009'}
        ],
        content: {
            de: (
                <div>
                    <h1>Textgenetische Navigation</h1>
                    <p>Die roten Bereiche der <b>textgenetischen Navigation</b> markieren <b><a href="http://beethovens-werkstatt.de/glossary/Textnarbe" target="_blank">Textnarben</a></b>.
                     Klicken Sie nun auf eine beliebige Textnarbe. Sie sehen nun, wieviele Schreibschichten diese enthält. Um die Rekonstruktion der Schreibprozesse anzuschauen, klicken Sie
                     auf "<b>Detailansicht</b> öffnen".</p>
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
    
	
	/*tool008: {
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
    },*/


    tool009: {
        restrictsAction: true,
        allowedTargets: [
        {selector:'.openseadragon-container'},
        {selector:'.facsNav.navigator'},
	    {selector:'.facsNavMenu'},
	    {selector:'.scarFrame.animated'},
	    {selector:'.navOverlay .nextScarBtn'},
	    {selector:'.navOverlay .prevScarBtn'},
	    {selector:'.navOverlay .stateNavigation .statesBox .timelineBox',state:'tool009'},
        {selector:'.navOverlay.scarOpen .closeScarBtn',state:'tool010'}
        ],
        content: {
            de: (
                <div>
                    <h1>Detailansicht</h1>
                    <p>
                    Jedem Buchstaben ist eine <a href="http://beethovens-werkstatt.de/glossary/Schreibschicht" target="_blank">Schreibschicht</a> zugeordnet, die innerhalb
                    des Manuskripts rot hervorgehoben wird. Wählt man den nächsten Buchstaben aus, wird die neue Schreibschicht im Manuskript rot, die vorherigen Schichten in einem dunkleren 
                    Farbton angezeigt. Sie können sich beliebig durch die Textnarben bewegen, indem Sie auf die beiden Pfeile <i className="fa fa-chevron-left tourIcon"></i> <i className="fa fa-chevron-right tourIcon"></i> klicken.
                    Nachdem Sie diese Funktion getestet haben, schließen Sie die Detailansicht (<i className="fa fa-close tourIcon"></i>).</p>
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
                    <h1>Infobox</h1>
                    <p>In der <i>VideApp</i> ist jedes Zeichen des Manuskripts erfasst. Per Mausklick sind so zugehörige Informationen abrufbar. Klicken Sie auf eine beliebige Note,
                    um die Infobox zu öffnen.</p>
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
           	{selector:'div.contextMenu .sliderFrame button.slick-next'},
           	{selector:'div.contextMenu .sliderFrame button.slick-prev'},
           	{selector:'div.contextMenu .sliderFrame .slick-dots button'},
           	{selector:'div.contextMenu .sliderFrame .contextSliderItem .sliderItemLabel',state:'tool012'}
        ],
        content: {
            de: (
                <div>
                    <h1>Infobox</h1>
                    <p>
                        Im unteren Bereich der Infobox finden Sie Informationen zum gewählten Zeichen sowie ggf. Hinweise auf eine unklare Lesart oder Herausgeberzusätze. 
                    </p>
                    <p>
                        Im oberen Bereich erhalten Sie (wo möglich) eine Vorschau in den jeweils anderen Ansichten, hier Transkription und XML, zwischen denen
                        Sie mit den Schaltflächen <i className="fa fa-chevron-left tourIcon"></i> <i className="fa fa-chevron-right tourIcon"></i> wechseln können.   
                        Sie können direkt aus der Infobox in die anderen Ansichten an die entsprechende Stelle springen, indem Sie dem Link unterhalb der Vorschau folgen. 
                        Klicken Sie auf "Transkription anzeigen".
                    </p>
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
           	/*{selector:'.view.VideTranscriptionViewer .transcriptionNavMenu #view1_zoomHome.menuButton',state:'tool013'}*/
           	{selector:'.navOverlay .scarLabel .detailsLink',state:'tool014'}
        ],
        content: {
            de: (
                <div>
                    <h1>Transkription</h1>
                    <p>
                        Diese Ansicht enhält eine <a href="http://beethovens-werkstatt.de/glossary/cleartext-2" target="_blank">Cleartext-Transkription</a> des
                        Notentextes in seinem letztgültigen Zustand. Die rot dargestellten Bereiche sind von Variantenbildung betroffen. Wird dabei nur der Beginn eines
                        Taktes markiert, ohne auch einzelne Noten farblich hervorzuheben, so handelt es sich um getilgte Stellen, die im endgültigen Notentext nicht 
                        mehr vorhanden sind, vgl. etwa Takte 66 und 105. 
                    </p>
                    <p>
                        Das <b>textgenetische Menü</b> funktioniert wie in der Faksimile-Ansicht. Um die Rekonstruktion der Variantenabfolge zu betrachten, öffnen Sie die Detailansicht einer Textnarbe.
                    </p>
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

 /*tool013: {
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
                    <p></p>
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
    },*/




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
                    <h1>Varianten-Abfolge</h1>
                    <p>
                        Wenn Sie den Buchstaben einer Variante anwählen, wird diese an der entsprechenden Stelle über dem letztgültigen Werktext eingeblendet. Die Noten, die im Lauf 
                        der Variantenbildung unverändert bleiben, werden in dieser Darstellung in grau angezeigt, während die aktuelle Variante schwarz dargestellt wird. Wenn Sie
                        einige Varianten ausprobiert haben, klicken Sie auf das <i>VideApp</i>-Logo links oben, um zur Startseite zurückzukehren und anhand eines weiteren Beispiels andere 
                        Funktionen kennenzulernen.
                    </p>
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
                    <p>Um fortzufahren, öffnen Sie das Beispiel Op. 75,2.</p>
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
                    <h1>VideApp</h1>
                    <p>Um fortzufahren, öffnen Sie das Beispiel Op. 75,2.</p>
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
        attachTo: '.editionPreview[data-editionid="Codierung_op.75.2"]',
        attachWhere: 'left'
    },
    
 tool017: {
        restrictsAction: true,
        allowedTargets: [
            {selector:'.openseadragon-container',state: 'tool017'},
            {selector:'.facsNav.navigator',state: 'tool017'},//here
            /*{selector:'div.views .menu a.select-target.select-theme-chosen',
                selectBox:{
                    allowedValues: [{value:'VideFacsimileViewer',state:'tool018'}]
                }
            },
            */{selector:'div.views .menu a.select-target.select-theme-chosen, .select-theme-chosen',
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
                    <p>Wechseln Sie über das Ansichtsmenü in die Faksimile-Ansicht.</p>
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
                    <h1>Textgenetisches Menü</h1>
                    <p>Im textgenetischen Menü sehen Sie eine Übersicht über die hier betrachteten Takte. In diesem Fall wurde nur eine Textnarbe untersucht. Um den Schreibprozess nachzuvollziehen, 
                    klicken Sie auf "Detailansicht öffnen".</p>
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
                    <p>
                        Sie befinden sich nun in der Faksimile-Ansicht, in der die einzelnen Schreibschichten im Manuskript rot markiert sind. Im textgenetischen Menü können
                        Sie die einzelnen Schreibschichten auswählen, die mit Buchstaben bezeichnet sind. Die horizontale Anordnung spiegelt den chronologischen Verlauf wider. Unklare
                        chronologische Verhältnisse von Schreibschichten werden durch vertikale Anordnung angezeigt. 
                    </p>
                    <h2>Legende</h2>
                    <dl>
                        <dt><img src="./resources/pix/timeline_singleVariant.png"/></dt>
                        <dd><a href="http://beethovens-werkstatt.de/glossary/mikrochonologie" target="_blank">mikrochronologisch</a> bestimmbarer, d.h. relativer Zeitpunkt</dd>
                        <dt><img src="./resources/pix/timeline_multipleVariants.png"/></dt>
                        <dd>Zeitspanne mit unklarer Reihenfolge der enthaltenen Schreibschichten</dd>
                        <dt><span className="deletionSample"> </span></dt>
                        <dd>Streichung</dd>
                        <dt><img src="./resources/pix/timeline_deletion.png"/></dt>
                        <dd>frühestmöglicher Zeitpunkt von Streichungen</dd>
                    </dl>
                    <p>
                        Zum Fortfahren wählen Sie Schreibschicht "j" aus.
                    </p>
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
                    <p>
                        Mit dem Schieberegler kann zwischen <b>Schreibschichtenrekonstruktion</b> und Faksimile stufenlos überblendet werden. 
                    </p>
                    <p>
                        Wechseln Sie nun in eine parallelisierte Ansicht, indem Sie auf <i className="fa fa-pause fa-rotate-90 tourIcon"></i> oder <i className="fa fa-pause tourIcon"></i> in 
                        der <b>Kopfzeile</b> rechts oben klicken. 
                    </p>
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
                    <p>
                        Nun sind zwei Ansichten geöffnet, die Sie über die Ansichtsmenü nach Ihren Wünschen einrichten können. Kombinieren Sie hier Faksimile und Transkription. 
                        In der <b>Kopfzeile</b> können Sie diese Ansichten synchronisieren. Aktivieren Sie dazu das Symbol <i className="fa fa-unlink tourIcon"></i>.   
                    </p>
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
            {selector:'div.views .menu a.select-target.select-theme-chosen, .select-theme-chosen',
                selectBox:{
                    allowedValues: [{value:'VideFacsimileViewer',state: 'tool022'},{value:'VideTranscriptionViewer',state: 'tool022'}]
                }
            },
/*            {selector:'.openseadragon-container'},*/
            {selector:'.facsNav.navigator'},
           	{selector:'.facsNavMenu'},
           	{selector: '.scarFrame.animated'},
           	{selector:'.navOverlay .stateNavigation .statesBox .timelineBox'},
           	{selector:'.fa-square-o',state:'tool023'}
        ],
        content: {
            de: (
                <div>
                    <h1>Synchronisierte Ansicht</h1>
                    <p>
                        Jetzt sind Faksimile und Transkription synchronisiert. Wenn Sie einen Buchstaben im <b>textgenetischen Menü</b> auswählen, wird in der jeweils anderen Ansicht der
                        korrespondierende Abschnitt angezeigt. 
                    </p>
                    <p>
                        Aktivieren Sie nun in der Transkriptionsansicht die Invarianzeinfärbung. Diese steht gegenwärtig nur in Op. 75,2 zur Verfügung.  
                    </p>
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
	{selector:'header.appHeader .videAppLogo', tourEnd: true}
        ],
        content: {
            de: (
                <div>
                    <h1>Invarianz</h1>
                    <p>
                        Durch die Invarianzeinfärbung wird sichtbar, welche Teile des Notentextes bei der Variantenbildung unverändert bleiben. Die Farbe der jeweiligen Variante
                        wird in den Auswahlkästchen angezeigt. Invariante Texteelemente sind in der Farbe der Variante markiert, in der sie zuerst aufgetreten sind. 
                    </p>
                    <p>
                        Wir hoffen, dass Ihnen der Umgang mit der <i>VideApp</i> vertraut geworden ist. Bei Rückfragen melden Sie 
                        sich bitte per <a href="mailto:info@beethovens-werkstatt.de">E-Mail</a>. Um die Tour abzuschließen, klicken Sie nun auf das <i>VideApp</i>-Logo oben links. 
                    </p>
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
    
    
    /* 
     * Drop-Down -> Ansichtsmenü -> done
     * Dokumentnavigation
     * Textgenetische Navigation
     * Detailansicht bleibt
     * Kopfzeile bleibt
     * Infobox bleibt
     */

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
