xquery version "3.0";

(:
    get_SVG_file_as_XML.xql
    
    This xQuery …
:)

declare namespace xhtml="http://www.w3.org/1999/xhtml";
declare namespace mei="http://www.music-encoding.org/ns/mei";
declare namespace svg="http://www.w3.org/2000/svg";
declare namespace request="http://exist-db.org/xquery/request";
declare namespace util="http://exist-db.org/xquery/util";
declare namespace transform="http://exist-db.org/xquery/transform";
declare namespace local="no:where";

declare option exist:serialize "method=xml media-type=text/plain omit-xml-declaration=yes indent=yes";

(: return a deep copy of the elements and attributes without ANY namespaces :)
declare function local:remove-namespaces($element as element()) as element() {
     element { local-name($element) } {
         for $att in $element/@*
         return
             attribute {local-name($att)} {$att},
         for $child in $element/node()
         return
             if ($child instance of element())
             then local:remove-namespaces($child)
             else $child
         }
};

let $file.id := request:get-parameter('file.id','')

let $svg := collection('/db/apps/exist-module/content')//svg:svg[@id = replace($file.id,'.svg','')]

return 
    local:remove-namespaces($svg)