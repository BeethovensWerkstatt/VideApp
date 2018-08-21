xquery version "3.0";

(:
    get_geneticStatesList_as_JSON.xql
    
    This xQuery …
:)

import module namespace bw="http://www.beethovens-werkstatt.de/ns/xqm" at "../xqm/bw_main.xqm";

declare namespace xhtml = "http://www.w3.org/1999/xhtml";
declare namespace mei = "http://www.music-encoding.org/ns/mei";
declare namespace svg = "http://www.w3.org/2000/svg";
declare namespace request = "http://exist-db.org/xquery/request";
declare namespace util = "http://exist-db.org/xquery/util";
declare namespace transform = "http://exist-db.org/xquery/transform";

declare option exist:serialize "method=xml media-type=text/plain omit-xml-declaration=yes indent=yes";

let $edition.id := request:get-parameter('edition.id', '')

(:PROCESSING STARTS HERE:)

let $doc := collection('/db/apps/exist-module/content')//mei:mei[@xml:id = $edition.id]
let $final.measures := $doc//mei:score//mei:measure[not(ancestor::mei:del) or (count(ancestor::mei:restore) ge count(ancestor::mei:del))]

let $scars :=
    for $scar in $doc//mei:genDesc[@type = 'textualScar']
    let $scar.id := $scar/@xml:id
    
    let $affected.measures :=
        for $state in $scar/mei:state
        let $state.ref := '#' || $state/@xml:id
        let $mods := $doc//mei:*[@changeState = $state.ref]
        let $measure.ids := ($mods/ancestor::mei:measure/@xml:id | $mods/descendant::mei:measure/@xml:id)
        let $measures :=
            for $measure.id in distinct-values($measure.ids)
            return
                $doc/id($measure.id)
        return
            $measures
    
    
    let $scar.label := 
        if(count($affected.measures/descendant-or-self::mei:measure) gt 1)
        then(concat(($affected.measures)[1]/@label,' – ',($affected.measures)[last()]/@label))
        else(($affected.measures)[1]/@label)
    let $scar.ordered := 
        if ($scar/@ordered) 
        then($scar/@ordered)
        else(false())
    
    let $state.ids := $scar//mei:state/concat('#',@xml:id)
        
    let $affected.staves := $doc//mei:staff[.//mei:*[@changeState = $state.ids]]/@n
    let $is.complete := if(count($affected.staves) = 0 or $doc//mei:*[@changeState = $state.ids]//mei:measure) then('true') else('false')
    
    let $first.measure :=
        if (some $measure in $affected.measures satisfies ($measure/@xml:id = $final.measures/@xml:id))
        then (($affected.measures[@xml:id = $final.measures/@xml:id])[1]/@xml:id)
        else ($final.measures[replace(@n,'[a-zA-Z]+','') = $affected.measures/replace(@n,'[a-zA-Z]+','')][1]/@xml:id)
        
    let $order.index := number($doc/id($first.measure)/replace(@n,'[a-zA-Z]+','')) 
    
    let $categories :=
        for $category in tokenize(replace($scar/@decls, '#', ''), ' ')
        return
        '"' || $category || '"'
    
    let $enriched.doc := bw:getEnrichedFile($doc)
    
    let $all.elements.in.scar := $enriched.doc//mei:*[@facs][@add = $scar//mei:state/@xml:id]
    
    let $affected.elems := 
        for $elem in $all.elements.in.scar[@xml:id][not(local-name() = 'measure')](:[not(ancestor::mei:*[@xml:id = $all.elements.in.scar/@xml:id])]:)
        let $note := 
            if ($elem/ancestor::mei:note)
            then
                ($elem/ancestor::mei:note)
            else
                ($elem)
        return
            '"' || $note/@xml:id || '"'
    
    (:let $affected.elems := 
        
        let $adds := $doc//mei:add[@changeState = $state.ids]
        let $shapes :=
            for $add in $adds 
            let $add.id := $add/@xml:id
            let $refs := $add//mei:*[@facs and ancestor::mei:*[@changeState][1]/@xml:id = $add.id and not(@changeState)]/tokenize(normalize-space(@facs),' ')
            let $results := 
                for $shape in distinct-values($refs)
                return $shape
            
            return
                $results
        
        
        let $elems := $doc//mei:*[some $fac in tokenize(@facs, ' ') satisfies $fac = $shapes][not(@changeState)][not((local-name() = 'measure') and not(some $facs in distinct-values(.//mei:*[@facs]/tokenize(@facs,' ')) satisfies $facs = $shapes))] (\:[count(ancestor::mei:del) le count(ancestor::mei:restore)]:\)
        let $cleanedElems :=
            for $elem in $elems
            let $rightOne :=
                if ($elem/ancestor::mei:note)
                then
                    ($elem/ancestor::mei:note)
                else
                    ($elem)
            return
                $rightOne
    
        for $elem in $cleanedElems[@xml:id]
        return
            '"' || $elem/@xml:id || '"':)
    
    
    let $states := bw:getStatesJson($scar, $enriched.doc)
        
        
        (:for $state in $scar/mei:state
        let $state.id := $state/@xml:id
        let $state.label := $state/@label
        let $open := if ('#bwTerm_openVariant' = tokenize($state/@decls, ' ')) then
            ('true')
            else
            ('false')
        let $isDeletionOnly := if ('#bwTerm_deletion' = tokenize($state/@decls, ' ')) then
            ('true')
            else
            ('false')
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
    
        let $adds := $doc//mei:add[@changeState = concat('#',$state.id)]
        let $shapes :=
        
            for $shape in distinct-values($doc//mei:add[@changeState = concat('#',$state.id)]//mei:*[@facs and ancestor::mei:*[@changeState][1]/@changeState = concat('#',$state.id) and local-name(ancestor::mei:*[@changeState][1]) = 'add' and not(@changeState)]/tokenize(normalize-space(@facs),' '))
            return '"' || replace($shape,'#','') || '"'
            
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
            '"shapes":[' || string-join(distinct-values($shapes), ',') || ']' ||
            '}':)
        
    order by number($order.index)
        
    return
        '{' ||
            '"id":"' || $scar.id || '",' ||
            '"label":"' || $scar.label || '",' ||
            '"ordered":' || $scar.ordered || ',' ||
            (:'"measures":[' || string-join($affected.measures,',') || '],' ||:)
            '"firstMeasure":"' || $first.measure || '",' ||
            '"complete":' || $is.complete || ',' ||
            '"staves":[' || string-join($affected.staves,',') || '],' ||
            '"affectedMeasures":[' || string-join(distinct-values($affected.measures/concat('"',@xml:id,'"')), ',') || '],' ||
            '"affectedNotes":[' || string-join($affected.elems, ',') || '],' ||
            '"states":[' || string-join($states, ',') || '],' ||
            '"categories":[' || string-join($categories, ',') || ']' ||
        '}'

return
    '[' || string-join($scars, ',') || ']'
    