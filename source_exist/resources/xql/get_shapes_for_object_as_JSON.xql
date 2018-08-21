xquery version "3.0";

(:
    get_shapes_for_object_as_JSON.xql
    
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
let $object.id := request:get-parameter('object.id','')

let $doc := collection('/db/apps/exist-module/content')//mei:mei[@xml:id = $edition.id]
let $object := $doc/id($object.id)
let $hasFacs := (exists($object) and $object/@facs)
let $facsTokens := tokenize(replace($object/@facs,'#',''),' ')
let $zoneIDs := $doc//mei:zone/@xml:id
let $shapes := 
    if($hasFacs)
    then(
        for $shape in $facsTokens
        where not($shape = $zoneIDs)
        return
            '"' || $shape || '"'
    ) else() 
    
let $zones := $doc//mei:zone[@xml:id = $facsTokens]
let $dimensions := 
    if(count($zones) gt 0)
    then(
        let $ulx := min($zones/number(@ulx))
        let $uly := min($zones/number(@uly))
        let $lrx := max($zones/number(@lrx))
        let $lry := max($zones/number(@lry))
        return 
            ',' ||
            '"dimensions":{' ||
                '"ulx":' || $ulx || ',' ||
                '"uly":' || $uly || ',' ||
                '"lrx":' || $lrx || ',' ||
                '"lry":' || $lry || ',' ||
                '"width":' || $lrx - $ulx || ',' ||
                '"height":' || $lry - $uly || 
            '}'
            
    )
    else('')

return
    '{' ||
        '"shapes":[' || string-join($shapes,',') || ']' ||
        $dimensions ||
    '}'    
        