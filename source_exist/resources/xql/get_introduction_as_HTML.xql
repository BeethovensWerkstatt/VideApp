xquery version "3.0";

(:
    get_introduction_as_HTML.xql
    
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

let $doc := collection('/db/apps/exist-module/content')//mei:mei[@xml:id = $edition.id]
let $notes := $doc//mei:fileDesc/mei:notesStmt

let $xslPath := '../xsl/' 

let $text := transform:transform($notes,
               doc(concat($xslPath,'mei2html.xsl')), <parameters><param name="purpose" value="getIntroduction"/></parameters>)


return 
    <div class="meiTextView">
        <h1>{$doc//mei:fileDesc//mei:title[@type = 'editionTitle']//text()}</h1>
        {$text}
    </div>