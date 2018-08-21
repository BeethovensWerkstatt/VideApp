xquery version "3.0";

declare variable $exist:path external;
declare variable $exist:resource external;
declare variable $exist:controller external;
declare variable $exist:prefix external;
declare variable $exist:root external;
(:
if ($exist:path eq '') then
    <dispatch xmlns="http://exist.sourceforge.net/NS/exist">
        <redirect url="{request:get-uri()}/"/>
    </dispatch>
    
else:) 
if (contains(lower-case($exist:path),'listall.json')) then
    (: forward to xql :)
    (
    response:set-header("Access-Control-Allow-Origin", "*"),
    
    <dispatch xmlns="http://exist.sourceforge.net/NS/exist">
        <forward url="{$exist:controller}/resources/xql/get_all_MEI_files_from_DB_as_JSON.xql"/>
    </dispatch>
    )
    
else if (matches(lower-case($exist:path),'/file/[\da-zA-Z-_\.]+.xml$')) then
    (: request a complete edition as one XML file :)
    (
    response:set-header("Access-Control-Allow-Origin", "*"),
    
    <dispatch xmlns="http://exist.sourceforge.net/NS/exist">
        <forward url="{$exist:controller}/resources/xql/get_MEI_file_as_XML.xql">
            <add-parameter name="file.id" value="{replace(tokenize($exist:path,'/')[last()],'.xml','')}"/>
        </forward>
    </dispatch>
    )
    
else if (matches(lower-case($exist:path),'/edition/[\da-zA-Z-_\.]+/finalstate.xml$')) then
    (: request a complete edition as one XML file :)
    (
    response:set-header("Access-Control-Allow-Origin", "*"),
    
    <dispatch xmlns="http://exist.sourceforge.net/NS/exist">
        <forward url="{$exist:controller}/resources/xql/get_final_state_as_XML.xql">
            <add-parameter name="edition.id" value="{replace(tokenize($exist:path,'/')[last() - 1],'.xml','')}"/>
        </forward>
    </dispatch>
    )    

else if (matches(lower-case($exist:path),'/edition/[\da-zA-Z-_\.]+/element/[\da-zA-Z-_\.]+.xml$')) then
    (: request an element as XML snippet :)
    (
    response:set-header("Access-Control-Allow-Origin", "*"),
    
    <dispatch xmlns="http://exist.sourceforge.net/NS/exist">
        <forward url="{$exist:controller}/resources/xql/get_MEI_snippet_as_XML.xql">
            <add-parameter name="edition.id" value="{tokenize($exist:path,'/')[last() - 2]}"/>
            <add-parameter name="element.id" value="{replace(tokenize($exist:path,'/')[last()],'.xml','')}"/>
        </forward>
    </dispatch>
    )

else if (matches(lower-case($exist:path),'/edition/[\da-zA-Z-_\.]+/element/[\da-zA-Z-_\.]+/[\d\.]+,[\d\.]+/facsimileinfo.json$')) then
    (: get information about an element for displaying it as facsimile :)
    (
    response:set-header("Access-Control-Allow-Origin", "*"),
    
    <dispatch xmlns="http://exist.sourceforge.net/NS/exist">
        <forward url="{$exist:controller}/resources/xql/get_facsimile_info_for_element_as_JSON.xql">
            <add-parameter name="edition.id" value="{tokenize($exist:path,'/')[last() - 4]}"/>
            <add-parameter name="element.id" value="{replace(tokenize($exist:path,'/')[last() - 2],'.xml','')}"/>
            <add-parameter name="w" value="{substring-before(tokenize($exist:path,'/')[last() - 1],',')}"/>
            <add-parameter name="h" value="{substring-after(tokenize($exist:path,'/')[last() - 1],',')}"/>
        </forward>
    </dispatch>
    )

else if (matches(lower-case($exist:path),'/file/[\da-zA-Z-_\.]+.svg$')) then
    (: request a complete edition as one XML file :)
    (
    response:set-header("Access-Control-Allow-Origin", "*"),
    
    <dispatch xmlns="http://exist.sourceforge.net/NS/exist">
        <forward url="{$exist:controller}/resources/xql/get_SVG_file_as_XML.xql">
            <add-parameter name="file.id" value="{replace(tokenize($exist:path,'/')[last()],'.xml','')}"/>
        </forward>
    </dispatch>
    )
    
else if (matches($exist:path,'/edition/[\da-zA-Z-_\.]+/states/overview.json$')) then
    (: request a list of states for navigation :)
    (
    response:set-header("Access-Control-Allow-Origin", "*"),
    
    <dispatch xmlns="http://exist.sourceforge.net/NS/exist">
        <forward url="{$exist:controller}/resources/xql/get_geneticStatesList_as_JSON.xql">
            <add-parameter name="edition.id" value="{tokenize($exist:path,'/')[last() - 2]}"/>
        </forward>
    </dispatch>
    )
    
else if (matches($exist:path,'/edition/[\da-zA-Z-_\.]+/annotations.json$')) then
    (: request a list of annotations with their metadata, excluding their content :)
    (
    response:set-header("Access-Control-Allow-Origin", "*"),
    
    <dispatch xmlns="http://exist.sourceforge.net/NS/exist">
        <forward url="{$exist:controller}/resources/xql/get_annotations_as_json.xql">
            <add-parameter name="edition.id" value="{tokenize($exist:path,'/')[last() - 1]}"/>
        </forward>
    </dispatch>
    )
    
else if (matches($exist:path,'/edition/[\da-zA-Z-_\.]+/page/[\da-zA-Z-_\.]+/annotations.json$')) then
    (: request a list of annotations on a page :)
    (
    response:set-header("Access-Control-Allow-Origin", "*"),
    
    <dispatch xmlns="http://exist.sourceforge.net/NS/exist">
        <forward url="{$exist:controller}/resources/xql/get_annotations_on_page_as_json.xql">
            <add-parameter name="edition.id" value="{tokenize($exist:path,'/')[last() - 3]}"/>
            <add-parameter name="page.id" value="{tokenize($exist:path,'/')[last() - 1]}"/>
        </forward>
    </dispatch>
    )    
    
else if (matches($exist:path,'/edition/[\da-zA-Z-_\.]+/scars/categories.json$')) then
    (: request a list of scar categories :)
    (
    response:set-header("Access-Control-Allow-Origin", "*"),
    
    <dispatch xmlns="http://exist.sourceforge.net/NS/exist">
        <forward url="{$exist:controller}/resources/xql/get_scar_categories_as_JSON.xql">
            <add-parameter name="edition.id" value="{tokenize($exist:path,'/')[last() - 2]}"/>
        </forward>
    </dispatch>
    )    

else if (matches($exist:path,'/edition/[\da-zA-Z-_\.]+/state/[\da-zA-Z-_\.]+/otherStates/[\da-zA-Z-_\.]+/meiSnippet.xml$')) then
    (: forward to xql :)
    (
    response:set-header("Access-Control-Allow-Origin", "*"),
    
    <dispatch xmlns="http://exist.sourceforge.net/NS/exist">
        <forward url="{$exist:controller}/resources/xql/get_geneticState_as_XML.xql">
            <add-parameter name="edition.id" value="{tokenize($exist:path,'/')[last() - 5]}"/>
            <add-parameter name="state.id" value="{tokenize($exist:path,'/')[last() - 3]}"/>
            <add-parameter name="other.states" value="{tokenize($exist:path,'/')[last() - 1]}"/>
        </forward>
    </dispatch>
    )
    
else if (matches($exist:path,'/edition/[\da-zA-Z-_\.]+/element/[\da-zA-Z-_\.]+/states/[\da-zA-Z-_\.]+/preview.xml$')) then
    (: request preview rendering of an item within a staff, relative to a given set of states :)
    (
    response:set-header("Access-Control-Allow-Origin", "*"),
    
    <dispatch xmlns="http://exist.sourceforge.net/NS/exist">
        <forward url="{$exist:controller}/resources/xql/get_element_preview_as_XML.xql">
            <add-parameter name="edition.id" value="{tokenize($exist:path,'/')[last() - 5]}"/>
            <add-parameter name="element.id" value="{tokenize($exist:path,'/')[last() - 3]}"/>
            <add-parameter name="states" value="{tokenize($exist:path,'/')[last() - 1]}"/>
        </forward>
    </dispatch>
    
    )
    
else if (matches($exist:path,'/edition/[\da-zA-Z-_\.]+/element/[\da-zA-Z-_\.]+/(en|de)/description.json$')) then
    (: request a summary of any given element :)
    (
    response:set-header("Access-Control-Allow-Origin", "*"),
    
    <dispatch xmlns="http://exist.sourceforge.net/NS/exist">
        <forward url="{$exist:controller}/resources/xql/get_element_description_as_JSON.xql">
            <add-parameter name="edition.id" value="{tokenize($exist:path,'/')[last() - 4]}"/>
            <add-parameter name="element.id" value="{tokenize($exist:path,'/')[last() - 2]}"/>
            <add-parameter name="lang" value="{tokenize($exist:path,'/')[last() - 1]}"/>
        </forward>
    </dispatch>
    
    )

else if (matches($exist:path,'/edition/[\da-zA-Z-_\.]+/firstState/meiSnippet.xml$')) then
    (: request the first state of an edition as MEI snippet (which can be rendered with Verovio) :)
    (
    response:set-header("Access-Control-Allow-Origin", "*"),
    
    <dispatch xmlns="http://exist.sourceforge.net/NS/exist">
        <forward url="{$exist:controller}/resources/xql/get_geneticState_as_XML.xql">
            <add-parameter name="edition.id" value="{tokenize($exist:path,'/')[last() - 2]}"/>
            <add-parameter name="state.id" value="''"/>
        </forward>
    </dispatch>
    )

else if (matches($exist:path,'/edition/[\da-zA-Z-_\.]+/reconstructionSetup.json$')) then
    (: request a list of states for navigation :)
    (
    response:set-header("Access-Control-Allow-Origin", "*"),
    
    <dispatch xmlns="http://exist.sourceforge.net/NS/exist">
        <forward url="{$exist:controller}/resources/xql/get_reconstruction_setup_as_JSON.xql">
            <add-parameter name="edition.id" value="{tokenize($exist:path,'/')[last() - 1]}"/>
        </forward>
    </dispatch>
    )

else if (matches($exist:path,'/edition/[\da-zA-Z-_\.]+/invarianceRelations.json$')) then
    (: request a list of states for navigation :)
    (
    response:set-header("Access-Control-Allow-Origin", "*"),
    
    <dispatch xmlns="http://exist.sourceforge.net/NS/exist">
        <forward url="{$exist:controller}/resources/xql/get_invariance_relations_as_JSON.xql">
            <add-parameter name="edition.id" value="{tokenize($exist:path,'/')[last() - 1]}"/>
        </forward>
    </dispatch>
    )

else if (matches($exist:path,'/edition/[\da-zA-Z-_\.]+/shape/[\da-zA-Z-_\.]+/info.json$')) then
    (: request the MEI information related to a specified shape :)
    (
    response:set-header("Access-Control-Allow-Origin", "*"),
    
    <dispatch xmlns="http://exist.sourceforge.net/NS/exist">
        <forward url="{$exist:controller}/resources/xql/get_shape_info_as_JSON.xql">
            <add-parameter name="edition.id" value="{tokenize($exist:path,'/')[last() - 3]}"/>
            <add-parameter name="shape.id" value="{tokenize($exist:path,'/')[last() - 1]}"/>
        </forward>
    </dispatch>
    )

else if (matches($exist:path,'/edition/[\da-zA-Z-_\.]+/object/[\da-zA-Z-_\.]+/shapes.json$')) then
    (: request the shapes belonging to a given object :)
    (
    response:set-header("Access-Control-Allow-Origin", "*"),
    
    <dispatch xmlns="http://exist.sourceforge.net/NS/exist">
        <forward url="{$exist:controller}/resources/xql/get_shapes_for_object_as_JSON.xql">
            <add-parameter name="edition.id" value="{tokenize($exist:path,'/')[last() - 3]}"/>
            <add-parameter name="object.id" value="{tokenize($exist:path,'/')[last() - 1]}"/>
        </forward>
    </dispatch>
    )
    
else if (matches($exist:path,'/edition/[\da-zA-Z-_\.]+/introduction.html$')) then
    (: request the introductory text of an edition :)
    (
    response:set-header("Access-Control-Allow-Origin", "*"),
    
    <dispatch xmlns="http://exist.sourceforge.net/NS/exist">
        <forward url="{$exist:controller}/resources/xql/get_introduction_as_HTML.xql">
            <add-parameter name="edition.id" value="{tokenize($exist:path,'/')[last() - 1]}"/>
        </forward>
    </dispatch>
    )
    
else if (matches($exist:path,'/edition/[\da-zA-Z-_\.]+/pages.json$')) then
    (: request a list of all pages in an edition :)
    (
    response:set-header("Access-Control-Allow-Origin", "*"),
    
    <dispatch xmlns="http://exist.sourceforge.net/NS/exist">
        <forward url="{$exist:controller}/resources/xql/get_pages_in_edition_as_JSON.xql">
            <add-parameter name="edition.id" value="{tokenize($exist:path,'/')[last() - 1]}"/>
        </forward>
    </dispatch>
    )
    
else if (matches($exist:path,'/edition/[\da-zA-Z-_\.]+/measures.json$')) then
    (: request a list of all pages in an edition :)
    (
    response:set-header("Access-Control-Allow-Origin", "*"),
    
    <dispatch xmlns="http://exist.sourceforge.net/NS/exist">
        <forward url="{$exist:controller}/resources/xql/get_measure_overview_as_JSON.xql">
            <add-parameter name="edition.id" value="{tokenize($exist:path,'/')[last() - 1]}"/>
        </forward>
    </dispatch>
    )
    
(: <temp> :)
else if (matches($exist:path,'/notePositions.json$')) then
    (: request a list of all pages in an edition :)
    (
    response:set-header("Access-Control-Allow-Origin", "*"),
    
    <dispatch xmlns="http://exist.sourceforge.net/NS/exist">
        <forward url="{$exist:controller}/resources/xql/get_note_positions_as_JSON.xql"/>
    </dispatch>
    )
(: </temp> :)
    
else if ($exist:path eq "/") then
    (: forward root path to index.xql :)
    <dispatch xmlns="http://exist.sourceforge.net/NS/exist">
        <redirect url="index.html"/>
    </dispatch>
    
else if (ends-with($exist:resource, ".html")) then
    (: the html page is run through view.xql to expand templates :)
    <dispatch xmlns="http://exist.sourceforge.net/NS/exist">
        <view>
            <forward url="{$exist:controller}/modules/view.xql"/>
        </view>
		<error-handler>
			<forward url="{$exist:controller}/error-page.html" method="get"/>
			<forward url="{$exist:controller}/modules/view.xql"/>
		</error-handler>
    </dispatch>
(: Resource paths starting with $shared are loaded from the shared-resources app :)
else if (contains($exist:path, "/$shared/")) then
    <dispatch xmlns="http://exist.sourceforge.net/NS/exist">
        <forward url="/shared-resources/{substring-after($exist:path, '/$shared/')}">
            <set-header name="Cache-Control" value="max-age=3600, must-revalidate"/>
        </forward>
    </dispatch>
else
    (: everything else is passed through :)
    (:<dispatch xmlns="http://exist.sourceforge.net/NS/exist">
        <cache-control cache="yes"/>
    </dispatch>:)
    <div><h1>404</h1><p>Unable to resolve request for {$exist:path}</p></div>
