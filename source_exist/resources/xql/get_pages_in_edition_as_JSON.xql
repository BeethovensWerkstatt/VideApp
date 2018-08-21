xquery version "3.0";

(:
    get_geneticStatesList_as_JSON.xql
    
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

let $sources :=
    for $facsimile in $doc//mei:facsimile
    let $source.id := replace($facsimile/@source,'#','')
    let $source.label := $doc/id($source.id)//mei:title[@type = 'siglum']/normalize-space(text())
    let $pages := 
        for $surface in $facsimile/mei:surface
        let $surface.id := $surface/@xml:id
        let $label := $surface/@label
        let $n := $surface/@n
        let $width := $surface/mei:graphic[@type = 'iiif']/@width
        let $height := $surface/mei:graphic[@type = 'iiif']/@height
        let $folium := ($doc/id($source.id)//mei:folium[(@recto = '#' || $surface.id) or (@verso = '#' || $surface.id)])[1]
        let $mmWidth := $folium/@width
        let $mmHeight := $folium/@height
        let $position := if($folium/@verso = '#' || $surface.id) then('v') else('r')
        let $uri := $surface/mei:graphic[@type = 'iiif']/@target
        let $type := 'iiif'
        let $shapes.id := if(contains($surface/mei:graphic[@type = 'shapes']/@target,'#')) then(substring-after($surface/mei:graphic[@type = 'shapes']/@target,'#')) else($surface/mei:graphic[@type = 'shapes']/@target)
        let $page.id := if(contains($surface/mei:graphic[@type = 'page']/@target,'#')) then(substring-after($surface/mei:graphic[@type = 'page']/@target,'#')) else($surface/mei:graphic[@type = 'page']/@target)
        let $measures := 
            for $measure.zone in $surface/mei:zone[@type = 'measure']
            let $zone.id := $measure.zone/@xml:id
            let $x := $measure.zone/@ulx
            let $y := $measure.zone/@uly
            let $width := number($measure.zone/@lrx) - number($measure.zone/@ulx)
            let $height := number($measure.zone/@lry) - number($measure.zone/@uly)
            let $measure := $doc//mei:measure[$zone.id = tokenize(replace(@facs,'#',''),' ')]
            let $measure.id := $measure/@xml:id
            let $measure.label := $measure/@label
            let $measure.n := $measure/@n
            return
                '{' ||
                    '"id":"' || $measure.id || '",' ||
                    '"label":"' || $measure.label || '",' ||
                    '"n":"' || $measure.n || '",' ||
                    '"x":"' || $x || '",' ||
                    '"y":"' || $y || '",' ||
                    '"width":"' || $width || '",' ||
                    '"height":"' || $height || '",' ||
                    '"zone":"' || $zone.id || '"' ||
                '}'
        return 
            '{' ||
                '"id":"' || $surface.id || '",' ||
                '"label":"' || $label || '",' ||
                '"n":"' || $n || '",' ||
                '"width":' || $width || ',' ||
                '"height":' || $height || ',' ||
                '"mmWidth":' || $mmWidth || ',' ||
                '"mmHeight":' || $mmHeight || ',' ||
                '"pos":"' || $position || '",' ||
                '"uri":"' || $uri || '",' ||
                '"type":"' || $type || '",' ||
                '"shapes":"' || $shapes.id || '",' ||
                '"page":"' || $page.id || '",' ||
                '"measures":[' || string-join($measures,',') || ']' ||
            '}'
    return 
        '{' ||
            '"id":"' || $source.id || '",' ||
            '"label":"' || $source.label || '",' ||
            '"pages":[' || string-join($pages,',') || ']' ||
        '}'

let $maxMmWidth := max($doc//mei:folium/number(@width))
let $maxMmHeight := max($doc//mei:folium/number(@height))

return 
    '{' || 
        '"edition":"' || $edition.id || '",' ||
        '"maxDimensions":{"width":' || $maxMmWidth || ', "height":' || $maxMmHeight || '},' ||
        '"sources":[' || string-join($sources,',') || ']' ||
    '}'