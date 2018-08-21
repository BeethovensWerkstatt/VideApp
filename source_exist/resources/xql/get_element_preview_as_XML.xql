xquery version "3.0";

(:
    get_MEI_file_as_XML.xql
    
    This xQuery …
:)

declare namespace xhtml="http://www.w3.org/1999/xhtml";
declare namespace mei="http://www.music-encoding.org/ns/mei";
declare namespace svg="http://www.w3.org/2000/svg";
declare namespace request="http://exist-db.org/xquery/request";
declare namespace util="http://exist-db.org/xquery/util";
declare namespace transform="http://exist-db.org/xquery/transform";
declare namespace vide="http://beethovens-werkstatt.de/ns/vide";

(:import module namespace console="http://exist-db.org/xquery/console";:)

declare option exist:serialize "method=xml media-type=text/plain omit-xml-declaration=yes indent=yes";

declare function vide:getPredecessors($node as node(), $all.nodes as node()+) as node()+ {
    let $follows := $all.nodes[@xml:id = tokenize(normalize-space(replace($node/@follows,'#','')),' ')]
    let $prev := $all.nodes[@xml:id = tokenize(normalize-space(replace($node/@prev,'#','')),' ')]
    let $next := $all.nodes[@next][some $id in tokenize(normalize-space(replace(./@next,'#','')),' ') satisfies $id = $node/@xml:id]
    let $precedes := $all.nodes[@precedes][some $id in tokenize(replace(normalize-space(@precedes),'#',''),' ') satisfies $id = $node/@xml:id]
    
    let $nodes.to.check := $all.nodes[@xml:id = ($follows/@xml:id,$prev/@xml:id,$next/@xml:id,$precedes/@xml:id)]
    
    (:let $log2 := console:log(count($precedes)):)
    
    let $checked := 
        for $prev.node in $nodes.to.check 
        return vide:getPredecessors($prev.node,$all.nodes) 
        
    return
        ($node,$checked)
};

let $edition.id := request:get-parameter('edition.id','')
let $element.id := request:get-parameter('element.id','')
let $states.raw := request:get-parameter('states','_')

let $state.ids := 
    if(string-length($states.raw) gt 1) 
    then() 
    else()

let $xslPath := '../xsl/' 

let $doc := collection('/db/apps/exist-module/content')//mei:mei[@xml:id = $edition.id]

let $element := $doc/id($element.id)

let $snippet :=
    if($element/ancestor::mei:add)
    then( (:element is part of a state:)
        let $state.added.id := $element/ancestor::mei:add[1]/replace(@changeState,'#','')
        let $state.added := $doc/id($state.added.id)
        
        let $all.states := $state.added/ancestor-or-self::mei:genDesc[@type = 'textualScar']//mei:*[local-name() = ('state','change')]
        let $minimum.states := vide:getPredecessors($state.added,$all.states)
        
        let $state.id := $state.added/@xml:id 
        (:
            if($state.ids)
            then($state.ids[1])
            else if($state.added)
            then($state.added)
            else(($doc//mei:state[1])/string(@xml:id)):)
        
        let $active.states.ids :=
            distinct-values($minimum.states/@xml:id)
        
            (:if($state.ids) 
            then($state.ids) 
            else($state.id):)
        
        let $state.snippet := transform:transform($doc,
                       doc(concat($xslPath,'getState.xsl')), <parameters><param name="active.states.string" value="{string-join($active.states.ids,'___')}"/><param name="main.state.id" value="{$state.added/@xml:id}"/></parameters>)
        let $element.snippet := transform:transform($state.snippet,
                       doc(concat($xslPath,'getElementSnippet.xsl')), <parameters><param name="element.id" value="{$element.id}"/></parameters>)
        return $element.snippet

    )
    else( (:element is not part of a state:)
        let $element.snippet := transform:transform($doc,
               doc(concat($xslPath,'getElementSnippet.xsl')), <parameters><param name="element.id" value="{$element.id}"/></parameters>)
        return $element.snippet
    )

return 
    $snippet