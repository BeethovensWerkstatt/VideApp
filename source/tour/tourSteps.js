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
                    <p>Mit Hilfe dieser Tour sollen Sie schrittweise mit der Anwendung vertraut gemacht werden.</p>
                    <p>→ Starten Sie, indem Sie das Beispiel zum Duett WoO 32 per Mausklick anwählen.</p>
                </div>
            ),
            en: (
                <div>
                    <h1>Welcome to the VideApp</h1>
                    <p>This tour will introduce you with the functionality of the VideApp.</p>
                    <p>→ To get started, please click on WoO 32 in the list below.</p>
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
                    <p>Sie sehen nun eine kurze Beschreibung der Fallstudie.</p><p>→ Um dieses Beispiel in der <i>VideApp</i> zu öffnen, klicken Sie 
                        entweder erneut auf die Quellen-Vorschau oder auf "Öffne Edition" rechts unten.</p>
                </div>
            ),
            en: (
                <div>
                    <h1>Preview of the Case Study</h1>
                    <p>You now see a brief description of the specifics of this case study. For the time being, all contents are available in german only. 
                        In order to open this case study in the VideApp, either click on the source image again or on the button "Open Edition" in the lower right.</p>
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
                    Schreibprozessen und zum kompositorischen Problem gegeben werden. Verlinkungen helfen, einzelne Stellen in der Quellen-Ansicht, 
                    Transkription und XML-Codierung aufzurufen. Diese verschiedenen Ansichten sind neben der Einführung jederzeit auch über das Ansichtsmenü am 
                    oberen linken Bildrand zu erreichen.</p>
                    <p>→ Wählen Sie jetzt in diesem Menü "Quellen-Ansicht" aus.</p>
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
            {selector:'.facsNavMenu #view1_zoomIn.menuButton'},
            {selector:'.facsNavMenu #view1_zoomOut.menuButton'},
            {selector:'.facsNavMenu #view1_rotateLeft.menuButton'},
            {selector:'.facsNavMenu #view1_rotateRight.menuButton'},
            {selector:'.facsNavMenu #view1_zoomHome.menuButton', state: 'tool006'}
        ],
        content: {
            de: (
                <div>
                    <h1>Quellen-Ansicht</h1>
                    <p>Die Quellen-Ansicht ermöglicht, sich mit dem Manuskript vertraut zu machen. Dabei kann man die Quelle mit Hilfe der Quellen-Navigation oben rechts beliebig
                     vergrößern und verkleinern, drehen und verschieben. Das rote Kästchen in der Miniatur-Anzeige der Partitur verdeutlicht den gerade gewählten Bildausschnitt. 
                     Außerdem können Sie die Taktzählung ein- und ausblenden.</p>
                     <p>→ Erproben Sie diese Funktionen und wählen Sie
                    die Vollansicht (<i className="fa fa-arrows-alt tourIcon"></i>), um mit der Tour fortzufahren.</p>
                </div>
            ),
            en: (
                <div>
                    <h1>Source View</h1>
                    <p>Hide Measure Numbers.</p>
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
	        {selector:'.navOverlay .measuresBox',state:'tool007'}
        ],
        content: {
            de: (
                <div>
                    <h1>Textgenetische Navigation</h1>
                    <p>Um die rekonstruierten Schreibprozesse nachzuvollziehen, bietet die textgenetische Navigation eine schematisch vereinfachte
                    Partituransicht. Wenn Sie den Mauszeiger darüber bewegen, werden am Satzanfang die jeweiligen Stimmen und oben die entsprechende Taktzahl eingeblendet.</p>
                    <p>→ Klicken Sie auf eine dieser Taktzahlen, um die entsprechende Stelle in der Quelle anzuzeigen.
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
                    <p>Die roten Bereiche der textgenetischen Navigation markieren <b><a href="http://beethovens-werkstatt.de/glossary/Textnarbe" target="_blank">Textnarben</a></b>.
                     Klicken Sie auf eine beliebige Textnarbe. Sie sehen nun, wieviele Schreibschichten diese enthält.</p>
                     <p>→ Um die Rekonstruktion der Schreibprozesse anzuschauen, klicken Sie
                     auf "Detailansicht öffnen".</p>
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
                    Jedem Buchstaben ist eine <b><a href="http://beethovens-werkstatt.de/glossary/Schreibschicht" target="_blank">Schreibschicht</a></b> zugeordnet, die innerhalb
                    des Manuskripts rot hervorgehoben wird. Wählt man den nächsten Buchstaben aus, wird die neue Schreibschicht im Manuskript rot, die vorherigen Schichten in einem dunkleren 
                    Farbton angezeigt. Sie können sich beliebig durch die Textnarben bewegen, indem Sie auf die beiden Pfeile <i className="fa fa-chevron-left tourIcon"></i> <i className="fa fa-chevron-right tourIcon"></i> klicken.
                    </p>
                    <p>→ Nachdem Sie diese Funktion getestet haben, schließen Sie die Detailansicht (<i className="fa fa-close tourIcon"></i>).</p>
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
                    <p>In der <i>VideApp</i> ist jedes Zeichen des Manuskripts erfasst. Per Mausklick sind so zugehörige Informationen abrufbar.</p>
                    <p>→ Klicken Sie auf eine beliebige Note,
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
                    </p> 
                    <p>→ Klicken Sie auf "Transkriptions-Ansicht öffnen".</p>
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
           	{selector:'.navOverlay .measuresBox'},
           	{selector:'.navOverlay .stateNavigation .scarBox .scar'},
           	{selector:'.navOverlay .nextScarBtn'},
           	{selector:'.navOverlay .prevScarBtn'},
            /*{selector:'.view.VideTranscriptionViewer .transcriptionNavMenu #view1_zoomHome.menuButton',state:'tool013'}*/
           	{selector:'.navOverlay .scarLabel .detailsLink',state:'tool014'}
        ],
        content: {
            de: (
                <div>
                    <h1>Transkription</h1>
                    <p>
                        Diese Ansicht enhält eine <b><a href="http://beethovens-werkstatt.de/glossary/cleartext-2" target="_blank">Cleartext-Transkription</a></b> des
                        Notentextes in seinem letztgültigen Zustand. Die rot dargestellten Bereiche sind von Variantenbildung betroffen. Wird dabei nur der Beginn eines
                        Taktes markiert, ohne auch einzelne Noten farblich hervorzuheben, so handelt es sich um getilgte Stellen, die im endgültigen Notentext nicht 
                        mehr vorhanden sind, vgl. etwa Takte 66 und 105. 
                    </p>
                    <p>
                        Die textgenetische Navigation funktioniert wie in der Quellen-Ansicht. → Um die Rekonstruktion der Variantenabfolge zu betrachten, öffnen Sie die Detailansicht einer Textnarbe.
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


 tool014: {
        restrictsAction: true,
        allowedTargets: [
            {selector:'.openseadragon-container'},
            {selector:'.facsNav.navigator'},
           	{selector:'.facsNavMenu'},
           	{selector: '.scarFrame.animated'},
           	{selector:'.navOverlay .state'},
           	{selector:'.navOverlay .nextScarBtn'},
           	{selector:'.navOverlay .prevScarBtn'},
           	{selector:'.navOverlay .closeScarBtn'},
           	{selector:'.navOverlay .scarLabel .detailsLink'},
           	{selector:'header.appHeader .videAppLogo',state:'tool015'}
        ],
        content: {
            de: (
                <div>
                    <h1>Varianten-Abfolge</h1>
                    <p>
                        Wenn Sie den Buchstaben einer Variante anwählen, wird diese an der entsprechenden Stelle über dem letztgültigen Werktext eingeblendet. Die Noten, die im Lauf 
                        der Variantenbildung unverändert bleiben, werden in dieser Darstellung in grau angezeigt, während die aktuelle Variante schwarz dargestellt wird.
                    </p>
                    <p>→ Wenn Sie
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
                    <p>→ Um fortzufahren, öffnen Sie das Beispiel Op. 75,2.</p>
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
                    <p>→ Um fortzufahren, öffnen Sie das Beispiel Op. 75,2.</p>
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
                    <p>→ Wechseln Sie über das Ansichtsmenü in die Quellen-Ansicht.</p>
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
                    <p>Im textgenetischen Menü sehen Sie eine Übersicht über die hier betrachteten Takte. In diesem Fall wurde nur eine Textnarbe untersucht.</p>
                    <p>→ Um den Schreibprozess nachzuvollziehen, 
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
                        Sie befinden sich nun in der Quellen-Ansicht, in der die einzelnen Schreibschichten im Manuskript rot markiert sind. Im textgenetischen Menü können
                        Sie die einzelnen Schreibschichten auswählen, die mit Buchstaben bezeichnet sind. Die horizontale Anordnung spiegelt den chronologischen Verlauf wider. Unklare
                        chronologische Verhältnisse von Schreibschichten werden durch vertikale Anordnung angezeigt. 
                    </p>
                    <h2>Legende</h2>
                    <dl>
                        <dt><img src="./resources/pix/timeline_singleVariant.png"/></dt>
                        <dd><b><a href="http://beethovens-werkstatt.de/glossary/mikrochronologie" target="_blank">mikrochronologisch</a></b> bestimmbarer, relativer Zeitpunkt</dd>
                        <dt><img src="./resources/pix/timeline_multipleVariants.png"/></dt>
                        <dd>Zeitspanne mit unklarer Reihenfolge der enthaltenen Schreibschichten</dd>
                        <dt><span className="deletionSample"> </span></dt>
                        <dd>Streichung</dd>
                        <dt><img src="./resources/pix/timeline_deletion.png"/></dt>
                        <dd>frühestmöglicher Zeitpunkt von Streichungen</dd>
                    </dl>
                    <p>
                        → Zum Fortfahren wählen Sie Schreibschicht "j" aus.
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
	{selector:'.perspectivesBar .perspectiveButton .fa.fa-rotate-90 ',state:'tool021'}
        ],
        content: {
            de: (
                <div>
                    <h1>Schieberegler</h1>
                    <p>
                        Mit dem Schieberegler kann zwischen Faksimile und Schreibschichtenrekonstruktion stufenlos überblendet werden. 
                    </p>
                    <p>
                        → Wechseln Sie nun die vertikale Parallel-Ansicht, indem Sie auf <i className="fa fa-pause fa-rotate-90 tourIcon"></i> in 
                        der Kopfleiste rechts oben klicken. 
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
        attachTo: '.facsNavMenu .visSlider',
        attachWhere: 'bottom-end'
    },

 tool021: {
        restrictsAction: true,
        allowedTargets: [
            {selector:'div.views .menu a.select-target.select-theme-chosen, .select-theme-chosen',
                selectBox:{
                    allowedValues: [{value:'VideFacsimileViewer',state: 'tool021'},{value:'VideTranscriptionViewer',state: 'tool021'}]
                }
            },
            {selector:'.openseadragon-container'},
            {selector:'.facsNav.navigator'},
           	{selector:'.facsNavMenu'},
           	{selector: '.scarFrame.animated'},
           	{selector:'.perspectiveButton.syncViews',state:'tool022'}
        ],
        content: {
            de: (
                <div>
                    <h1>Parallel-Ansicht</h1>
                    <p>
                        Nun sind zwei Ansichten geöffnet, die Sie in den jeweiligen Ansichtsmenüs umschalten können. Wählen Sie in einer Ansicht die Quellenansicht, in der anderen die Transkription aus. 
                    </p>
                    <p>
                        → In der Kopfleiste können Sie diese Ansichten synchronisieren. Aktivieren Sie dazu das Symbol <i className="fa fa-unlink tourIcon"></i>.
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
                        Jetzt sind Faksimile und Transkription synchronisiert. Wenn Sie einen Buchstaben im textgenetischen Menü auswählen, werden beide Ansichten
                        synoptisch aufeinander bezogen.
                    </p>
                    <p>
                        → Aktivieren Sie nun in der Transkriptions-Ansicht die Invarianzeinfärbung. Diese steht gegenwärtig nur in Op. 75,2 zur Verfügung.  
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
	{selector:'header.appHeader .videAppLogo',state:'tool024'}
        ],
        content: {
            de: (
                <div>
                    <h1>Invarianz</h1>
                    <p>
                        Durch die <b><a href="http://beethovens-werkstatt.de/glossary/invarianz" target="_blank">Invarianz</a></b>einfärbung wird sichtbar, welche Teile des Notentextes bei der Variantenbildung unverändert bleiben. Die jeweilige Farbe 
                        wird in den Auswahlkästchen angezeigt. Invariante Textelemente sind in der Farbe des Textzustands markiert, in dem sie zuerst aufgetreten sind. 
                    </p>
                    <p>
                        → Um die Tour abzuschließen, klicken Sie nun auf das <i>VideApp</i>-Logo oben links. 
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
    },
    
    tool024: {
        restrictsAction: true,
        allowedTargets: [
        	{selector:'#closeThisTour', tourEnd: true}
        ],
        content: {
            de: (
                <div>
                    <h1>Ende der Tour</h1>
                    <p>
                        Wir hoffen, dass Ihnen der Umgang mit der <i>VideApp</i> vertraut geworden ist. Bei Rückfragen melden Sie 
                        sich bitte per <a href="mailto:info@beethovens-werkstatt.de">E-Mail</a>. 
                    </p>
                    <div id="closeThisTour">Tour schließen</div>
                </div>
            ),
            en: (
                <div>
                    <p>...</p>
                </div>
            )
        },
        attachTo: 'header.appHeader',
        attachWhere: 'bottom'
    }
    
    
    /* 
     * Drop-Down -> Ansichtsmenü -> done  | View Menu
     * Dokumentnavigation -> Quellennavigation  | Source Navigation
     * Textgenetische Navigation  | Genetic Navigation
     * Detailansicht bleibt  | Detail View
     * Kopfleiste statt Kopfzeile  | Header
     * Infobox bleibt  | Infobox
     * 
     * Parallelansicht  | Parallelized View
     * Schreibschichtenrekonstruktion  | Writing Layer Reconstruction
     * 
     * Quellen-Ansicht | Source View
     * Transkriptions-Ansicht | Transcription View
     * XML-Ansicht | XML View
     * Kommentar-Ansicht | Commentary View
     * 
     * 
     */

};

export default TourSteps;
