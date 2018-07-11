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
                    <p>Mit Hilfe dieser Tour werden Sie schrittweise mit der <i>VideApp</i> vertraut gemacht. Eine Unterbrechung 
                    der Tour oder das Zurückgehen zu einem vorherigen Schritt ist derzeit nicht möglich. Daher bitten wir Sie,
                    den vorgeschlagenen Anweisungen zu folgen, um einen Überblick über die einzelnen Funktionen der <i>VideApp</i>
                    zu erhalten.</p>
                    <p>→ Starten Sie, indem Sie das Beispiel zum Duett WoO 32 per Mausklick anwählen.</p>
                </div>
            ),
            en: (
                <div>
                    <h1>Welcome to the <i>VideApp</i></h1>
                    <p>This tour will introduce you with the functionality of the <i>VideApp</i>. Currently it is neither possible to
                    interrupt the tour nor to go back to a previous step. Therefore we ask you to follow the instructions in order to 
                    get an overview of the functionality of the <i>VideApp</i>.</p>
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
                    <h1>Preview of the case study</h1>
                    <p>You see a brief description of the specifics of this case study. For the time being, all contents are available in german only.</p> 
                    <p>→ In order to open this case study in the <i>VideApp</i>, either click on the source image again or on the button "Open Edition" in the lower right.</p>
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
                    <h1>Kommentar-Ansicht</h1>
                    <p>Der Einstieg in jedes Beispiel geschieht über einen Einführungstext, in dem Informationen zu Werk, Quelle, Variantenstelle(n), zugrunde liegenden
                    Schreibprozessen und zum kompositorischen Problem gegeben werden. Verlinkungen helfen, einzelne Stellen in der Quellen-Ansicht, 
                    Transkription und XML-Codierung aufzurufen. Diese Ansichten sind neben der Kommentar-Ansicht jederzeit auch über das Ansichtsmenü am 
                    oberen linken Bildrand zu erreichen.</p>
                    <p>→ Wählen Sie jetzt in diesem Menü "Quellen-Ansicht" aus.</p>
                </div>
            ),
            en: (
                <div>
                    <h1>Commentary View</h1>
                    <p>Every case study starts with an introductory text containing information about the work, the source, section(s) with variants, writing processes 
                    and about the compositional problem. Links help to preview and open particular areas in Source View, Transcription and XML encoding. Just as the Commentary View, 
                    these different views can also be reached at any time using the View Menu in the upper left.</p>
                    <p>→ Now select "Source View" in this menu.</p>
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
                    <p>Die Quellen-Ansicht ermöglicht es, sich mit dem Manuskript vertraut zu machen. Dabei kann man die Quelle mit Hilfe der Quellen-Navigation oben rechts beliebig
                     vergrößern und verkleinern, drehen und verschieben. Das rote Kästchen in der Miniatur-Anzeige der Partitur verdeutlicht den gerade gewählten Bildausschnitt. 
                     Außerdem können Sie die Taktzählung ein- und ausblenden.</p>
                     <p>→ Erproben Sie diese Funktionen und wählen Sie
                    die Vollansicht (<i className="fa fa-arrows-alt tourIcon"></i>), um mit der Tour fortzufahren.</p>
                </div>
            ),
            en: (
                <div>
                    <h1>Source View</h1>
                    <p> The Source View allows you to familiarize yourself with the manuscript. With the help of the 
                    Source Navigation in the upper right you are able to zoom in and out, as well as turn and move the source. 
                    The red box in the mini-view of the score shows the image section currently displayed. Apart from that you can show measure numbers or remove them.</p>
                     <p>→ Test those functions and press the full view button
                    (<i className="fa fa-arrows-alt tourIcon"></i>) to go on with the tour.</p>
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
                    Partituransicht. Wenn Sie den Mauszeiger darüber bewegen, werden am Satzanfang die jeweiligen Stimmen und oben die entsprechende Taktzahl eingeblendet. 
                    Unterhalb des Cursors erscheint innerhalb der Partitur eine Markierungslinie.</p>
                    <p>→ Um einen beliebigen Takt in der Quelle anzuzeigen, bewegen Sie nun den Mauszeiger über die vereinfachte Partitur 
                    und klicken Sie dann oberhalb der Partitur auf die gewünschte Stelle. Rechts von der Markierungslinie erscheint die entsprechende Taktzahl.
                    </p>
                </div>
            ),
            en: (
                <div>
                    <h1>Genetic Navigation</h1>
                    <p>Here you see a schematically simplified view of the score. If you move across it with the cursor the respective instrumental parts are shown on the left side 
                    and the appropriate measure numbers appear above the score. A marking line appears below the cursor.</p>
                    <p>→ Now move the cursor across the simplified view of the score and then click on one of the measure numbers above the score
                    to view the corresponding measure in the source.
                    </p>
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
                    <p>Die roten Bereiche in der textgenetischen Navigation markieren <b><a href="http://beethovens-werkstatt.de/glossary/Textnarbe" target="_blank">Textnarben</a></b>.
                     Klicken Sie auf eine beliebige Textnarbe. Unterhalb der schematischen Darstellung wird nun angezeigt, wie viele Schreibschichten diese enthält.</p>
                     <p>→ Um zur Rekonstruktion der Schreibprozesse zu gelangen, klicken Sie
                     auf "Detailansicht öffnen".</p>
                </div>
            ),
            en: (
                <div>
                    <h1>Genetic Navigation</h1>
                    <p>Within the Genetic Navigation, the areas highlighted in red mark <b><a href="http://beethovens-werkstatt.de/glossary/Textnarbe" target="_blank">textual scars</a></b>.
                     Click on any of these textual scars in order to see the number of writing layers it contains.</p>
                     <p>→ Click on "Open details" to look at the reconstruction of the writing processes.</p>
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
                    des Manuskripts rot hervorgehoben wird. Wählt man den nächsten Buchstaben aus, werden die neue Schreibschicht im Manuskript rot und die vorherigen Schichten in einem dunkleren 
                    Farbton angezeigt. Sie können sich beliebig durch die Textnarben bewegen, indem Sie auf die beiden Pfeile <i className="fa fa-chevron-left tourIcon"></i> <i className="fa fa-chevron-right tourIcon"></i> klicken.
                    </p>
                    <p>→ Nachdem Sie diese Funktion getestet haben, schließen Sie die Detailansicht (<i className="fa fa-close tourIcon"></i>).</p>
                </div>
            ),
            en: (
                <div>
                    <h1>Detail View</h1>
                    <p>
                    Every character corresponds to a <b><a href="http://beethovens-werkstatt.de/glossary/Schreibschicht" target="_blank">writing layer</a></b> which is 
                    colored in red whithin the manuscript. If you select the next letter, this new writing layer in the manuscript is displayed in red, while the previous layers get a darker hue. 
                    You can move freely from one textual scar to the other by using the two arrows <i className="fa fa-chevron-left tourIcon"></i> <i className="fa fa-chevron-right tourIcon"></i>.
                    </p>
                    <p>→ After you have tested these functions, close the Detail View (<i className="fa fa-close tourIcon"></i>).</p>
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
                    <p>→ Klicken Sie auf eine beliebige Note innerhalb der Quelle,
                    um die Infobox zu öffnen.</p>
                </div>
            ),
            en: (
                <div>
                    <h1>Infobox</h1>
                    <p> Every shape of the manuscript is recorded in the <i>VideApp</i>. 
                    By clicking on them, information on these shapes can be called up.</p>
                    <p>→ To open the Infobox, click on any of the notes within the source.</p>
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
                    <p>→ Klicken Sie nun im unteren Bereich der Infobox auf "Transkriptions-Ansicht öffnen".</p>
                </div>
            ),
            en: (
                <div>
                    <h1>Infobox</h1>
                    <p>
                        In the lower section of the Infobox, you get information about the selected shape as well as indications of an unclear reading or editorial addition, if applicable. 
                    </p>
                    <p>
                        In the upper section you get (where possible) a preview of the current shape from the other views, here Transcription and XML. You can switch between them using the buttons 
                        <i className="fa fa-chevron-left tourIcon"></i> <i className="fa fa-chevron-right tourIcon"></i>.   
                        By following the link below the preview, you can open the corresponding area in one of the other views.
                    </p> 
                    <p>→ Click on "Open Transcription View" in the lower section of the Infobox.</p>
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
                        Diese Ansicht enthält eine <b><a href="http://beethovens-werkstatt.de/glossary/cleartext-2" target="_blank">Cleartext-Transkription</a></b> des
                        Notentextes in seinem letztgültigen Zustand. Für die rot dargestellten Bereiche lassen sich mehrere <b><a href="http://beethovens-werkstatt.de/glossary/textzustand" target="_blank">Textzustände</a></b> (etwa im Zuge von Variantenbildung) nachweisen. Wird dabei nur der Beginn eines
                        Taktes markiert, ohne auch einzelne Noten farblich hervorzuheben, so handelt es sich um getilgte Stellen, die im endgültigen Notentext nicht 
                        mehr vorhanden sind, vgl. etwa Takte 66 und 105. 
                    </p>
                    <p>
                        Die textgenetische Navigation funktioniert wie in der Quellen-Ansicht. → Um die Rekonstruktion der Textzustände zu betrachten, öffnen Sie die Detailansicht einer Textnarbe.
                    </p>
                </div>
            ),
            en: (
                <div>
                    <h1>Transcription</h1>
                    <p>
                        This view contains a <b><a href="http://beethovens-werkstatt.de/glossary/cleartext-2" target="_blank">Cleartext Transcription</a></b> of the
                        musical text in its last state. For the areas makred in red, multiple <b><a href="http://beethovens-werkstatt.de/glossary/textzustand" target="_blank">textual states</a></b> (e.g. due to variants) can be reconstructed. If only the beginning of a measure is marked, without coloring any individual notes, this indicates
                        deleted areas, which have no replacement in the final text (e.g. measures 66 and 105).
                    </p>
                    <p>
                        The Genetic Navigation works in the same way as in the Source View. → Open the Detail View of a textual scar to view the reconstruction of the sequence of textual states.
                    </p>
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
                    <h1>Abfolge der Textzustände</h1>
                    <p>
                        Wenn Sie den Buchstaben eines Textzustands anwählen, wird dieser an der entsprechenden Stelle über dem letztgültigen Werktext eingeblendet. Die Noten, die im Lauf 
                        der Variantenbildung unverändert bleiben, werden in dieser Darstellung in grau angezeigt, während der aktuelle Textzustand schwarz dargestellt wird.
                    </p>
                    <p>→ Wenn Sie
                        einige Textzustände angezeigt haben, klicken Sie auf das <i>VideApp</i>-Logo links oben, um zur Startseite zurückzukehren und anhand des Beispiels 
                        zum Lied op. 75/2 weitere Funktionen kennenzulernen. Über das <i>VideApp</i>-Logo können Sie jederzeit zur Startseite zurückkehren.
                    </p>
                </div>
            ),
            en: (
                <div>
                    <h1>Sequence of Textual States</h1>
                    <p>
                        If you select one of the boxes, the corresponding textual state is shown above the transcription of the final text. 
                        Notes which do not change in the different variants are marked in grey in this representation, whereas the current variant is black.
                    </p>
                    <p>→ After having tested some of the textual states, click on the <i>VideApp</i> sign in the upper left to return to the start screen and learn more
                        functions using the case study about the Lied op. 75/2. You can return to the start screen at any time by clicking on the <i>VideApp</i> sign.
                    </p>
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
                    <p>→ Um fortzufahren, öffnen Sie das Beispiel Op. 75/2.</p>
                </div>
            ),
            en: (
                <div>
                    <h1>VideApp</h1>
                    <p>→ Open the case study of op. 75/2 to continue the tour.</p>
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
                    <p>→ Um fortzufahren, öffnen Sie das Beispiel Op. 75/2.</p>
                </div>
            ),
            en: (
                <div>
                    <h1>VideApp</h1>
                    <p>→ Open the case study of op. 75/2 to continue the tour.</p>
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
                    <h1>Kommentar-Ansicht</h1>
                    <p>→ Wechseln Sie über das Ansichtsmenü in die Quellen-Ansicht.</p>
                </div>
            ),
            en: (
                <div>
                    <h1>Commentary View</h1>
                    <p>→ Go to the Source View by using the View Menu.</p>
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
                    <h1>Textgenetische Navigation</h1>
                    <p>In der textgenetischen Navigation sehen Sie eine Übersicht über die hier betrachteten Takte. In diesem Fall wurde nur eine Textnarbe untersucht.</p>
                    <p>→ Um den Schreibprozess nachzuvollziehen, 
                    klicken Sie auf "Detailansicht öffnen".</p>
                </div>
            ),
            en: (
                <div>
                    <h1>Genetic Navigation</h1>
                    <p>In the Genetic Navigation you see an overview of the measures considered here. In this case study, only one textual scar was examined.</p>
                    <p>→ Click on "Open details" to retrace the writing process.</p>
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
                        Sie befinden sich nun in der Quellen-Ansicht, in der die einzelnen Schreibschichten im Manuskript rot markiert sind. In der textgenetischen Navigation können
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
                    <h1>Detail View</h1>
                    <p>
                        In the Source View, the individual writing layers of the manuscript are marked in red. In the Genetic Navigation you can select writing layers,
                        which are labelled with letters. The horizontal arrangement reflects their chronological order. Unclear chronological relationships of writing layers 
                        are indicated by vertical arrangement. 
                    </p>
                    <h2>Legend</h2>
                    <dl>
                        <dt><img src="./resources/pix/timeline_singleVariant.png"/></dt>
                        <dd><b><a href="http://beethovens-werkstatt.de/glossary/mikrochronologie" target="_blank">micro chronologically</a></b> determinable relative moment</dd>
                        <dt><img src="./resources/pix/timeline_multipleVariants.png"/></dt>
                        <dd>span of time with unclear sequence of the contained writing layers</dd>
                        <dt><span className="deletionSample"> </span></dt>
                        <dd>cancellation</dd>
                        <dt><img src="./resources/pix/timeline_deletion.png"/></dt>
                        <dd>earliest point in time of a cancellation</dd>
                    </dl>
                    <p>
                        → Select writing layer "j" to continue.
                    </p>
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
                        Im Fallbeispiel zum Lied und in dem zur Symphonie op. 93 wurde die Abfolge der Schreibschichten rekonstruiert. Mit einem 
                        Schieberegler kann die Schreibschichtenrekonstruktion in der Quelle stufenlos eingeblendet werden.
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
                    <p>
                        In the case studies about the Lied and about the symphony op. 93 the sequence of writing layers has been reconstructed. 
                        With the help of a slider you can crossfade continuously between the source and the Writing Layer Reconstruction. 
                    </p>
                    <p>
                        → Now change into the vertical Parallel View by cklicking on <i className="fa fa-pause fa-rotate-90 tourIcon"></i> in the Header in the upper right. 
                    </p>
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
                        Nun sind zwei Ansichten geöffnet, die Sie in den jeweiligen Ansichtsmenüs umschalten können. Im zweiten Fenster öffnet sich automatisch die XML-Ansicht. 
                    </p>
                    <p>
                        → Wählen Sie nun in einem Fenster die Quellen-Ansicht, im anderen die Transkription aus. In der Kopfleiste können Sie die beiden Ansichten synchronisieren. 
                        → Aktivieren Sie dazu das Symbol <i className="fa fa-unlink tourIcon"></i>.
                    </p>
                </div>
            ),
            en: (
                <div>
                    <h1>Parallel View</h1>
                    <p>
                        Now two views are open, which you can switch in their respective View Menus. The XML View opens automatically in the second window. 
                    </p>
                    <p>
                        → Now select the Source View in one view and Transcription View in the other. 
                        You can synchronize these views in the Header. → To do this, activate the symbol <i className="fa fa-unlink tourIcon"></i>.
                    </p>
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
                        Jetzt sind Quellen-Ansicht und Transkription synchronisiert. Wenn Sie einen Buchstaben in der textgenetischen Navigation auswählen, werden beide Ansichten
                        synoptisch aufeinander bezogen.
                    </p>
                    <p>
                        → Aktivieren Sie nun in der Transkriptions-Ansicht die Invarianzeinfärbung, indem Sie oben rechts ein Häkchen vor "Invarianzeinfärbung" setzen. 
                        Diese Option steht gegenwärtig nur in Op. 75/2 zur Verfügung.  
                    </p>
                </div>
            ),
            en: (
                <div>
                    <h1>Synchronized View</h1>
                    <p>
                        Now Source View and Transcription View are synchronized. If you select a letter in the Genetic Navigation, both views are synoptically related.
                    </p>
                    <p>
                        → Now activate the Invariance coloring in the Transcription View by setting a checkmark in front of "Invariance" in the upper right. 
                        This option is currently only available in op. 75/2.  
                    </p>
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
                        Durch die <b><a href="http://beethovens-werkstatt.de/glossary/invarianz" target="_blank">Invarianz</a></b>einfärbung wird sichtbar, 
                        welche Teile des Notentextes bei der Variantenbildung unverändert bleiben. Die jeweilige Farbe 
                        wird in den Auswahlkästchen angezeigt. Invariante Textelemente sind in der Farbe des Textzustands markiert, in dem sie zuerst aufgetreten sind. 
                    </p>
                    <p>
                        → Um die Tour abzuschließen, klicken Sie nun auf das <i>VideApp</i>-Logo oben links. 
                    </p>
                </div>
            ),
            en: (
                <div>
                    <h1>Invariance</h1>
                    <p>
                        The <b><a href="http://beethovens-werkstatt.de/glossary/invarianz" target="_blank">Invariance</a></b> coloring shows which parts of the musical 
                        text remain unchanged when variants are created. The respective color is displayed in the selection boxes. Invariant text elements are marked 
                        in the color of the textual state in which they first appeared. 
                    </p>
                    <p>
                        → To complete the tour, click on the <i>VideApp</i>-Logo at the top left. 
                    </p>
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
                        Wir hoffen, dass Ihnen der Umgang mit der <i>VideApp</i> vertraut geworden ist. Bei Rückfragen wenden Sie 
                        sich gerne per <a href="mailto:info@beethovens-werkstatt.de">E-Mail</a> an uns. Sie können die Tour erneut starten, wenn Sie die Anwendung neu laden.
                    </p>
                    <div id="closeThisTour">Tour schließen</div>
                </div>
            ),
            en: (
                <div>
                    <p>
                        We hope that you are now familiar with the <i>VideApp</i>. If you have any questions, please contact us 
                        by <a href="mailto:info@beethovens-werkstatt.de">e-Mail</a>. To start this tour again reload the website.
                    </p>
                    <div id="closeThisTour">Close Tour</div>
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
