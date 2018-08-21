xquery version "3.0";

(:
    get_annotations_as_JSON.xql
    
    This xQuery seeks to extract the exact positions of all notes, rests and similar, 
    trying to provide Verovio with all the information it needs to render a 
    diplomatic transcript 
:)

declare namespace xhtml="http://www.w3.org/1999/xhtml";
declare namespace mei="http://www.music-encoding.org/ns/mei";
declare namespace svg="http://www.w3.org/2000/svg";
declare namespace request="http://exist-db.org/xquery/request";
declare namespace util="http://exist-db.org/xquery/util";
declare namespace transform="http://exist-db.org/xquery/transform";
declare namespace vide="http://beethovens-werkstatt.de/ns/vide";
declare namespace functx="http://www.functx.com";
                           
(:import module namespace console="http://exist-db.org/xquery/console";:)
       
declare option exist:serialize "method=xml media-type=text/plain omit-xml-declaration=yes indent=yes";

let $edition.id := request:get-parameter('edition.id','')
let $page.id := request:get-parameter('page.id','')

let $doc := collection('/db/apps/exist-module/content')//mei:mei[@xml:id = $edition.id]
let $svg.file := collection('/db/apps/exist-module/content')//svg:svg[@id = $doc/id($page.id)/mei:graphic[@type = 'shapes']/@target]

let $annotations := 
    for $annot in $doc//mei:annot[@type = 'editorialComment']
    let $id := $annot/@xml:id
    let $title := $annot/mei:title/text()
    let $plist :=
        for $p in $annot/tokenize(replace(@plist,'#',''),' ')
        return $p
    let $plist.strings :=
        for $p in $plist
        return '"' || $p || '"'
    let $elements := 
        for $p in $plist
        return $doc/id($p)
    let $facs :=
        for $facs.ref in $elements//@facs/tokenize(normalize-space(replace(.,'#','')),' ')
        return $facs.ref
    
    let $shapes := 
        for $shape in $facs
        where exists($svg.file//svg:path[@id = $shape])
        return '"' || $shape || '"'
    
    where (some $shape in $facs satisfies exists($svg.file//svg:path[@id = $shape]))
    
    return 
        '{' ||
            '"id":"' || $id || '",' ||
            '"page":"' || $page.id || '",' ||
            '"title":"' || $title || '",' ||
            '"plist":[' || string-join($plist.strings,',') || '],' ||
            '"facs":[' || string-join($shapes,',') || ']' ||
        '}'
    
return
    '[' ||
        string-join($annotations,',') ||
    ']'