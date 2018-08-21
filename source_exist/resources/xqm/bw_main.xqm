xquery version "3.0";

module namespace bw = "http://www.beethovens-werkstatt.de/ns/xqm";

declare namespace xhtml = "http://www.w3.org/1999/xhtml";
declare namespace mei = "http://www.music-encoding.org/ns/mei";
declare namespace svg = "http://www.w3.org/2000/svg";
declare namespace request = "http://exist-db.org/xquery/request";
declare namespace util = "http://exist-db.org/xquery/util";
declare namespace transform = "http://exist-db.org/xquery/transform";

declare function bw:getPosition($states as node()+, $follows as xs:string*, $prev as xs:string*, $position as xs:integer, $scar.ordered as xs:boolean) as xs:integer {
    let $preceding.states := $states[concat('"', @xml:id, '"') = ($follows, $prev)]
    let $positions :=
        for $state in $preceding.states
        let $state.follows :=
            for $otherState in $states[@xml:id != $state/@xml:id]
            where ($otherState/@xml:id = tokenize($state/replace(@follows, '#', ''), ' ')
                or $state/@xml:id = tokenize($otherState/replace(@precedes, '#', ''), ' '))
            return
                '"' || $otherState/@xml:id || '"'
        
        let $state.prev :=
            for $otherState in $states[@xml:id != $state/@xml:id]
            where ($otherState/@xml:id = tokenize($state/replace(@prev, '#', ''), ' ')
                or $state/@xml:id = tokenize($otherState/replace(@next, '#', ''), ' ')
                or $scar.ordered = true() and $otherState/following-sibling::mei:state[1]/@xml:id = $state/@xml:id)
            return
                '"' || $otherState/@xml:id || '"'
        
        let $state.position := bw:getPosition($states, $state.follows, $state.prev, $position + 1, $scar.ordered)
        return $state.position
        
    let $result :=
        if(count($positions) gt 0)
        then(max($positions))
        else($position)
        
    return
        $result
};

declare function bw:getStatesJson($scar as node(), $enriched.doc as node()) as xs:string* {
    
    let $scar.ordered := 
        if ($scar/@ordered) 
        then($scar/@ordered)
        else(false())
    
    for $state in $scar/mei:state
    let $state.id := $state/@xml:id
    let $state.label := $state/@label
    let $open := 
        if('#bwTerm_openVariant' = tokenize($state/@decls, ' ')) 
        then('true')
        else('false')
        
    let $isDeletionOnly := 
        if('#bwTerm_deletion' = tokenize($state/@decls, ' ')) 
        then('true')
        else('false')
        
    let $index := count($state/preceding-sibling::mei:state) + 1

    let $precedes :=
        for $otherState in $scar/mei:state[@xml:id != $state.id]
        where ($otherState/@xml:id = tokenize($state/replace(@precedes, '#', ''), ' ')
            or $state.id = tokenize($otherState/replace(@follows, '#', ''), ' '))
        return
            '"' || $otherState/@xml:id || '"'

    let $follows :=
        for $otherState in $scar/mei:state[@xml:id != $state.id]
        where ($otherState/@xml:id = tokenize($state/replace(@follows, '#', ''), ' ')
            or $state.id = tokenize($otherState/replace(@precedes, '#', ''), ' '))
        return
            '"' || $otherState/@xml:id || '"'

    let $next :=
        for $otherState in $scar/mei:state[@xml:id != $state.id]
        where ($otherState/@xml:id = tokenize($state/replace(@next, '#', ''), ' ')
            or $state.id = tokenize($otherState/replace(@prev, '#', ''), ' ')
            or $scar.ordered = true() and $otherState/preceding-sibling::mei:state[1]/@xml:id = $state.id)
        return
            '"' || $otherState/@xml:id || '"'

    let $prev :=
        for $otherState in $scar/mei:state[@xml:id != $state.id]
        where ($otherState/@xml:id = tokenize($state/replace(@prev, '#', ''), ' ')
            or $state.id = tokenize($otherState/replace(@next, '#', ''), ' ')
            or $scar.ordered = true() and $otherState/following-sibling::mei:state[1]/@xml:id = $state.id)
        return
            '"' || $otherState/@xml:id || '"'

    (:let $adds := $doc//mei:add[@changeState = concat('#',$state.id)]
    let $elements := $all.elements.in.scar[ancestor::mei:*[@changeState and local-name() = ('add','restore')][1]/@changeState = concat('#',$state.id)]
    let $element.shapes := distinct-values($elements/tokenize(normalize-space(replace(@facs,'#','')),' '))
    let $dels := $doc//mei:del[@changeState = concat('#',$state.id)]
    let $del.shapes := distinct-values($dels/tokenize(normalize-space(replace(@facs,'#','')),' '))
    
    let $all.shapes := distinct-values(($element.shapes,$del.shapes))
    
    let $shapes := '" elements/shapes:' || count($elements) || '/' || count($element.shapes) || ', dels/shapes:' || count($dels) || '/' || count($del.shapes) || ', all.shapes:' || count($all.shapes) || ', all elements:' || count($all.elements.in.scar) || '"'
    
    :)
    

    (:for $shape in $all.shapes
        return '"' || $shape || '"':)
    
    let $elements := $enriched.doc//mei:*[@add = $state.id]
    let $element.shapes := distinct-values($elements/tokenize(normalize-space(replace(@facs,'#','')),' '))
    
    let $dels := $enriched.doc//mei:del[@changeState = concat('#',$state.id)]
    let $del.shapes := distinct-values($dels/tokenize(normalize-space(replace(@facs,'#','')),' '))
    
    let $all.shapes := distinct-values(($element.shapes,$del.shapes))
    
    let $shapes := 
        for $shape in $all.shapes
        return '"' || $shape || '"'
    
    
    (:let $shapes := '" elements/shapes:' || count($elements) || '/' || count($element.shapes) || ', dels/shapes:' || count($dels) || '/' || count($del.shapes) || ', all.shapes:' || count($all.shapes) || '"':)
    
    let $transfers.add := 
        for $add in $enriched.doc//mei:foliumSetup//mei:add[@changeState = '#' || $state.id]
        let $target.source.id := $add/ancestor::mei:source/@xml:id
        let $del := if($add//@sameas) then($enriched.doc//mei:*[@xml:id = replace(($add//@sameas)[1],'#','')]) else()
        let $origin.source.id := if($del) then($del/ancestor::mei:source/@xml:id) else()
        let $transfered.surfaces := 
            for $surface in $add//@*[local-name() =('recto','verso','inner.recto','inner.verso','outer.recto','outer.verso')]
            return
                '"' || replace($surface,'#','') || '"'
        return
            '{' ||
                '"surfaces":[' || string-join($transfered.surfaces,',') || '],' ||
                '"targetSource":"' || $target.source.id || '",' || 
                '"originSource":' || (if($origin.source.id) then(('"' || $origin.source.id || '"')) else('null')) || 
            '}'
        
    
    let $position := bw:getPosition($scar/mei:state, $follows, $prev, 1, $scar.ordered)
    
    order by $position ascending

    return
        '{' ||
            '"id":"' || $state.id || '",' ||
            '"label":"' || $state.label || '",' ||
            '"open":' || $open || ',' ||
            '"deletion":' || $isDeletionOnly || ',' ||
            '"index":' || $index || ',' ||
            '"position":' || $position || ',' ||
            '"next":[' || string-join(distinct-values($next), ',') || '],' ||
            '"prev":[' || string-join(distinct-values($prev), ',') || '],' ||
            '"follows":[' || string-join(distinct-values($follows), ',') || '],' ||
            '"precedes":[' || string-join(distinct-values($precedes), ',') || '],' ||
            '"shapes":[' || string-join(distinct-values($shapes), ',') || '],' ||
            '"transfers":[' || string-join(distinct-values($transfers.add),',') || ']' ||
        '}'
};

declare function bw:getElementsWithinScar($doc as node(), $scar.id as xs:string) as node()* {
    
    let $scar := $doc/id($scar.id)
    let $state.ids := $scar//mei:state/concat('#',@xml:id)
    
    let $adds := $doc//mei:add[@changeState = $state.ids]
    
    let $elements :=
        for $add in $adds 
        let $add.id := $add/@xml:id
        let $added.elements := $add//mei:*[@facs and ancestor::mei:*[@changeState][1]/@xml:id = $add.id and not(@changeState)]
        
        return
            $added.elements
    
    return $elements
};

declare function bw:getEnrichedFile($doc as node()) as node() {
    let $xslPath := '../xsl/' 

    let $xml := transform:transform($doc,
                   doc(concat($xslPath,'addStateInfo.xsl')), <parameters/>)
    return $xml
};