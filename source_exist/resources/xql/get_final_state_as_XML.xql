xquery version "3.0";

(:
    get_final_state_as_XML.xql
    
    This xQuery …
:)

declare namespace xhtml="http://www.w3.org/1999/xhtml";
declare namespace mei="http://www.music-encoding.org/ns/mei";
declare namespace svg="http://www.w3.org/2000/svg";
declare namespace request="http://exist-db.org/xquery/request";
declare namespace util="http://exist-db.org/xquery/util";
declare namespace transform="http://exist-db.org/xquery/transform";

declare option exist:serialize "method=xml media-type=text/plain omit-xml-declaration=yes indent=yes";

let $edition.id := request:get-parameter('edition.id','')

let $xslPath := '../xsl/' 

let $doc := collection('/db/apps/exist-module/content')//mei:mei[@xml:id = $edition.id]

let $xml := transform:transform($doc,
               doc(concat($xslPath,'getFinalState.xsl')), <parameters/>)

return 
    $xml