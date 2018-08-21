xquery version "3.0";

import module namespace bw="http://www.beethovens-werkstatt.de/ns/xqm" at "../xqm/bw_main.xqm";

declare namespace xhtml="http://www.w3.org/1999/xhtml";
declare namespace mei="http://www.music-encoding.org/ns/mei";
declare namespace svg="http://www.w3.org/2000/svg";
declare namespace request="http://exist-db.org/xquery/request";
declare namespace util="http://exist-db.org/xquery/util";
declare namespace transform="http://exist-db.org/xquery/transform";

declare option exist:serialize "method=xml media-type=text/plain omit-xml-declaration=yes indent=yes";

declare function mei:getPages($pageRef as attribute(), $doc as node()) as xs:string {
    let $folium := $pageRef/parent::mei:*
    let $enterState := $folium/parent::mei:add/replace(@changeState,'#','')
    let $exitState := $folium/parent::mei:del/replace(@changeState,'#','')
    let $page.added := if(exists($enterState)) then($enterState) else('')
    let $page.removed := if(exists($exitState)) then($exitState) else('')
    let $page.visible := if($pageRef/ancestor::mei:add) then('false') else('true')
    let $surface := $doc/id(replace($pageRef,'#','')) 
    let $facs.elem := $surface//mei:graphic[@type = 'iiif']
    
    let $page.id := $surface/@xml:id
    let $page.label := $surface/@label
    let $page.n := $surface/@n
    let $page.type := if(contains(local-name($pageRef),'recto')) then('recto') else('verso')
    let $page.width.px := $facs.elem/@width
    let $page.height.px := $facs.elem/@height
    
    let $page.width.mm := $folium/@width
    let $page.height.mm := $folium/@height
    
    let $dpm := number($page.width.px) div number($page.width.mm) 
    
    let $page.facsRef := $facs.elem/@target
    let $page.pageRef := $surface/mei:graphic[@type = 'page']/@target
    let $page.shapesRef := $surface/mei:graphic[@type = 'shapes']/@target
    
    let $measures := 
        for $zone in $surface//mei:zone[@type = 'measure' and @data and string-length(@data) gt 1]
        let $measure := $doc/id($zone/replace(@data,'#',''))
        return 
            '{' ||
                '"id":"' || $measure/@xml:id || '",' ||
                '"zone":"' || $zone/@xml:id || '",' ||
                '"n":"' || $measure/@n || '",' ||
                '"label":"' || $measure/@label || '",' ||
                '"ulx":' || $zone/@ulx || ',' ||
                '"uly":' || $zone/@uly || ',' ||
                '"lrx":' || $zone/@lrx || ',' ||
                '"lry":' || $zone/@lry || ',' ||
                '"width":' || ($zone/number(@lrx) - $zone/number(@ulx)) || ',' ||
                '"height":' || ($zone/number(@lry) - $zone/number(@uly)) ||
            '}'
    
    let $patches :=
        for $patch in $folium//mei:patch
        let $patch.id := $patch/@xml:id
        let $attached.to := $patch/@attached.to
        let $attached.by := $patch/@attached.by
        let $enterState := $patch/parent::mei:add/replace(@changeState,'#','')
        let $isAdded := exists($enterState)
        let $offX := $patch/@x
        let $offY := $patch/@y
        let $child.pages := 
            for $subPage in $patch//@*[local-name() = ('recto','verso','inner.recto','inner.verso','outer.recto','outer.verso')(: and ancestor::mei:patch[1]/@xml:id = $patch.id:)]
            return mei:getPages($subPage, $doc)(: '"' || string($subPage) || '"':)
        
        return
            '{' ||
                '"id":"' || $patch.id || '",' ||
                '"attachedTo":"' || $attached.to || '",' ||
                '"attachedBy":"' || $attached.by || '",' ||
                '"isAdded":' || $isAdded || ',' ||
                '"enterState":"' || $enterState || '",' ||
                '"offsetX":' || $offX || ',' ||
                '"offsetY":' || $offY || ',' ||
                '"pages":[' || string-join($child.pages,',') || ']' ||
            '}'
    
    return
        '{' ||
            '"id":"' || $page.id || '",' ||
            '"dpm":"' || $dpm || '",' ||
            '"label":"' || $page.label || '",' ||
            '"visible":' || $page.visible || ',' ||
            '"added":"' || $page.added || '",' ||
            '"removed":"' || $page.removed || '",' ||
            '"type":"' || $page.type || '",' ||
            '"width_px":' || $page.width.px || ',' ||
            '"height_px":' || $page.height.px || ',' ||
            '"width_mm":' || $page.width.mm || ',' ||
            '"height_mm":' || $page.height.mm || ',' ||
            '"facsRef":"' || $page.facsRef || '",' ||
            '"pageRef":"' || $page.pageRef || '",' ||
            '"shapesRef":"' || $page.shapesRef || '",' ||
            '"measures":[' || string-join($measures,',') || '],' ||
            '"patches":[' || string-join($patches,',') || ']' ||
        '}'
};

(:START OF PROCESSING:)

let $edition.id := request:get-parameter('edition.id','')
let $doc := collection('/db/apps/exist-module/content')//mei:mei[@xml:id = $edition.id]

let $scars := 
    for $scar in $doc//mei:genDesc[@type = 'textualScar']
    let $scar.id := $scar/@xml:id
    let $scar.label := $scar/@label
    let $scar.ordered := if($scar/@ordered) then($scar/@ordered) else(false())
    let $state.ids := $scar//mei:state/concat('#',@xml:id)
    
    let $affected.staves := $doc//mei:staff[.//mei:*[@changeState = $state.ids]]/@n
    let $is.complete := if(count($affected.staves) = 0 or $doc//mei:*[@changeState = $state.ids]//mei:measure) then('true') else('false')
    
    let $all.elements.in.scar := bw:getElementsWithinScar($doc,$scar.id)
    
    let $enriched.doc := bw:getEnrichedFile($doc)
    
    let $states := bw:getStatesJson($scar, $enriched.doc)
        
    return 
        '{' ||
            '"id":"' || $scar.id || '",' ||
            '"label":"' || $scar.label || '",' ||
            '"ordered":' || $scar.ordered || ',' ||
            '"complete":' || $is.complete || ',' ||
            '"staves":[' || string-join($affected.staves,',') || '],' ||
            '"states":[' || string-join($states,',') || ']' ||
        '}'


let $sources := 
    for $source in $doc//mei:source
    let $source.id := $source/@xml:id
    let $source.label := $source/mei:titleStmt/mei:title[@type = 'siglum']
    let $source.desc := normalize-space($source/mei:titleStmt/mei:title[2])
    let $pages := 
        for $pageRef in $source//mei:foliumSetup//@*[local-name() = ('recto','verso','inner.recto','inner.verso','outer.recto','outer.verso') and not(ancestor::mei:patch)]
        return mei:getPages($pageRef, $doc)
        
    return
        '{' ||
            '"id":"' || $source.id || '",' ||
            '"label":"' || $source.label || '",' ||
            '"desc":"' || $source.desc || '",' ||
            '"pages":[' || string-join($pages,',') || ']' ||
        '}'

let $maxMmWidth := max($doc//mei:folium/number(@width))
let $maxMmHeight := max($doc//mei:folium/number(@height))

return
'{' || 
    '"id":"' || $edition.id || '",' ||
    '"scars":[' || string-join($scars,',') || '],' ||
    '"sources":[' || string-join($sources,',') || '],' ||
    '"maxDimensions":{"width":' || $maxMmWidth || ', "height":' || $maxMmHeight || '}' ||
'}'