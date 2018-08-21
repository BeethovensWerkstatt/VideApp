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

let $staves := 
    for $staff in ($doc//mei:scoreDef)[1]//mei:staffDef
    let $n := $staff/@n
    let $label := if($staff/@label) then($staff/@label) else($staff/ancestor::mei:staffGrp[@label][1]/@label)
    return
        '{' ||
            '"n":"' || $n || '",' ||
            '"label":"' || $label || '"' ||
        '}'

let $all.scars := 
    for $scar in $doc//mei:genDesc[@type = 'textualScar']
    let $state.ids := $scar//mei:state/concat('#',@xml:id)
    let $changed.above.measures := $doc//mei:*[@changeState = $state.ids]//mei:measure
    let $measure.xml := 
        for $measure in $changed.above.measures
        let $measure.id := $measure/@xml:id
        return
            <measure scar.id="{$scar/@xml:id}" complete="true" measure.id="{$measure.id}" staves=""/>
    let $changed.inside.measures := $doc//mei:measure[.//mei:*[@changeState = $state.ids]]
    let $staff.xml :=
        for $measure in $changed.inside.measures
        let $measure.id := $measure/@xml:id
        let $aff.staves := $measure/mei:staff[.//mei:*[@changeState = $state.ids]]/@n
        let $complete := 
            if(count($staves) = count($aff.staves))
            then('true')
            else('false')
        return
            <measure scar.id="{$scar/@xml:id}" complete="{$complete}" measure.id="{$measure.id}" staves="{string-join($aff.staves,',')}"/>
    
    let $combined.xml := ($measure.xml | $staff.xml)
    let $distinct.scars := distinct-values($combined.xml/descendant-or-self::measure/@scar.id)
    let $output :=
        for $scar.id in $doc//mei:genDesc[@type = 'textualScar']/@xml:id
        let $ref := $combined.xml/descendant-or-self::measure[@scar.id = $scar.id][1]
        return $ref
        
    return
        $output
    
    
let $measures := 
    for $measure in ($doc//mei:score//mei:measure[count(ancestor::mei:del) le count(ancestor::mei:restore)])
    let $measure.id := $measure/@xml:id
    let $measure.label := $measure/@label
    let $measure.n := $measure/@n
    let $refs.from.scars := $all.scars/descendant-or-self::measure[@measure.id = $measure.id]
    let $distinct.scars := distinct-values($refs.from.scars/descendant-or-self::measure/@scar.id)
    
    let $order.num :=
        if(string-length($measure.n) gt 0)
        then(number(replace($measure.n,'[a-zA-Z ]+','')))
        else(number(replace($measure.label,'[a-zA-Z ]+','')))
    
    let $first.refs := 
        for $ref in $distinct.scars
        let $first.refs := $refs.from.scars/descendant-or-self::measure[@scar.id = $ref]
        return $first.refs[1]
        
    let $refs := 
        for $scar in $first.refs
        let $complete := 
            if($scar/@complete ="true")
            then('true')
            else('false')
        return
            '{' ||
                '"scar":"' || $scar/@scar.id || '",' ||
                '"complete":' || $complete || ',' ||
                '"staves":[' || $scar/@staves || ']' ||
            '}'
    
    order by $order.num
    return 
        '{' ||
            '"id":"' || $measure.id || '",' ||
            '"label":"' || $measure.label || '",' ||
            '"n":"' || $measure.n || '",' ||
            '"scars":[' || string-join($refs,',') || ']' ||
        '}'

let $scars :=
    for $scar in $doc//mei:genDesc[@type = 'textualScar']
    let $scar.id := $scar/@xml:id
    let $categories :=
        for $category in $scar/tokenize(replace(@decls,'#',''),' ')
        return '"' || $category || '"'
    let $state.ids := $scar//mei:state/concat('#',@xml:id)
    let $affected.staves := $doc//mei:staff[.//mei:*[@changeState = $state.ids]]/@n
    let $is.complete := if(count($affected.staves) = 0 or $doc//mei:*[@changeState = $state.ids]//mei:measure) then('true') else('false')
    
    return
        '{' ||
            '"id":"' || $scar.id || '",' ||
            '"complete":' || $is.complete || ',' ||
            '"staves":[' || string-join($affected.staves,',') || '],' ||
            '"categories":[' || string-join($categories,',') || ']' ||
        '}'
return 
    '{' || 
        '"edition":"' || $edition.id || '",' ||
        '"staves":[' || string-join($staves,',') || '],' ||
        '"measures":[' || string-join($measures,',') || '],' ||
        '"scars":[' || string-join($scars,',') || ']' ||
    '}'