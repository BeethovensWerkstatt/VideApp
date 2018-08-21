xquery version "3.0";

(:
    get_note_positions_as_JSON.xql
    
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
                           
import module namespace console="http://exist-db.org/xquery/console";
       
declare option exist:serialize "method=xml media-type=text/plain omit-xml-declaration=yes indent=yes";


declare function functx:get-matches-and-non-matches
  ( $string as xs:string? ,
    $regex as xs:string )  as element()* {

   let $iomf := functx:index-of-match-first($string, $regex)
   return
   if (empty($iomf))
   then <non-match>{$string}</non-match>
   else
   if ($iomf > 1)
   then (<non-match>{substring($string,1,$iomf - 1)}</non-match>,
         functx:get-matches-and-non-matches(
            substring($string,$iomf),$regex))
   else
   let $length :=
      string-length($string) -
      string-length(functx:replace-first($string, $regex,''))
   return (<match>{substring($string,1,$length)}</match>,
           if (string-length($string) > $length)
           then functx:get-matches-and-non-matches(
              substring($string,$length + 1),$regex)
           else ())
};

declare function functx:get-matches
  ( $string as xs:string? ,
    $regex as xs:string )  as xs:string* {

   functx:get-matches-and-non-matches($string,$regex)/
     string(self::match)
};

declare function functx:substring-before-match
  ( $arg as xs:string? ,
    $regex as xs:string )  as xs:string {

   tokenize($arg,$regex)[1]
};

declare function functx:replace-first
  ( $arg as xs:string? ,
    $pattern as xs:string ,
    $replacement as xs:string )  as xs:string {

   replace($arg, concat('(^.*?)', $pattern),
             concat('$1',$replacement))
};

declare function functx:index-of-match-first
  ( $arg as xs:string? ,
    $pattern as xs:string )  as xs:integer? {

  if (matches($arg,$pattern))
  then string-length(tokenize($arg, $pattern)[1]) + 1
  else ()
};

declare function vide:parsePath($array as xs:string*, $index as xs:integer, $ulx as xs:double, $uly as xs:double, $lrx as xs:double, $lry as xs:double, $current.x as xs:double, $current.y as xs:double) as node() {
    let $next.index := $index + 1
    return (    
        if($index le count($array))
        (:parse current c-command:)
        then(
            let $command := normalize-space($array[$index])
            let $type := substring($command,1,1)
            
            let $clean.command := replace($command,'-',',-')
            let $tokenized.command := tokenize($clean.command,',')
            
            let $token5 := number($tokenized.command[last() -1])
            let $token6 := number($tokenized.command[last()])
            let $dx := if($type = 'c') then($token5) else(0)
            let $dy := if($type = 'c') then($token6) else(0)
            
            let $now.x := if($type = 'c') then($current.x + $dx) else($token5)
            let $now.y := if($type = 'c') then($current.y + $dy) else($token6)
            
            let $new.ulx := min(($ulx,$now.x))
            let $new.uly := min(($uly,$now.y))
            let $new.lrx := max(($lrx,$now.x))
            let $new.lry := max(($lry,$now.y))
            
            return
                vide:parsePath($array, $next.index, $new.ulx, $new.uly, $new.lrx, $new.lry, $now.x, $now.y)
        )
        (:output everything:)
        else(
            let $result := <dimensions ulx="{$ulx}" uly="{$uly}" lrx="{$lrx}" lry="{$lry}"/>
            
            return $result
        )
    )
};

(:
let $edition.id := request:get-parameter('edition.id','')
let $element.id := request:get-parameter('element.id','')
:)
(:
let $target.w := number(request:get-parameter('w',0))
let $target.h := number(request:get-parameter('h',0))
:)
(:
let $target.ratio := $target.w div $target.h
:)
let $doc := collection('/db/apps/exist-module/playground')//mei:mei[@xml:id = 'Codierung_op.75.2']

(:decide which elements are covered here :)
let $elems := 
    for $elem in $doc//mei:*[@facs and string-length(@facs) gt 0 and local-name() = ('note','rest')]
    
    let $elem.id := $elem/@xml:id
    let $elem.name := local-name($elem)

    let $shape.IDs := $elem/tokenize(normalize-space(replace(@facs,'#','')),' ')
    let $shapes :=
        for $shape.id in $shape.IDs
        let $shape := collection('/db/apps/exist-module/content')//svg:path[@id = $shape.id]
        where not($doc//mei:zone[@xml:id = $shape.id])
        return $shape
    let $svg.ids := distinct-values($shapes/ancestor::svg:svg[last()]/@id)
    
    let $pages := 
        for $svg.id in $svg.ids
        let $surface := $doc//mei:surface[child::mei:graphic[@target = $svg.id and @type = 'shapes']]
        let $page.label := if($surface/@label) then($surface/@label) else($surface/@n)
        let $source.label := 
            if($surface/parent::mei:facsimile/@source)
            then($doc//mei:source[@id = $surface/parent::mei:facsimile/replace(@source,'#','')]//mei:title[@type = 'siglum']/text())
            else(($doc//mei:source)[1]//mei:title[@type = 'siglum']/text())
        let $page.uri := $surface/mei:graphic[@type = 'iiif']/@target
        let $page.width := $surface/mei:graphic[@type = 'iiif']/@width
        let $page.height := $surface/mei:graphic[@type = 'iiif']/@height
        
        let $shapes.on.page := $shapes[ancestor::svg:svg/@id = $svg.id]
        let $ds := $shapes.on.page/normalize-space(@d)
        
        let $svg.w := number(replace($shapes.on.page[1]/ancestor::svg:svg/string(@width),'px',''))
        
        let $svg.scale := $page.width div $svg.w
        
        (:let $log2 := console:log($svg.scale):)
        
        let $dimensions :=
            for $d in $ds 
            let $start := normalize-space(substring-before($d,'c'))
            let $x := number(substring-before(substring($start,2),','))
            let $y := number(substring-after($start,','))
            let $array := functx:get-matches($d,'[cC][-\d\.,\s]+')[.]
            let $dim := vide:parsePath($array,1,$x,$y,$x,$y,$x,$y)
            (:let $log :=
                <div>
                    {
                    for $item in $array
                    return <command string="{$item}"/>
                    }
                </div>
            
            let $log2 := console:log($log)
            :)
            return
                $dim
        
        let $ulx := min($dimensions/descendant-or-self::*/number(@ulx)) * $svg.scale
        let $uly := min($dimensions/descendant-or-self::*/number(@uly)) * $svg.scale
        let $lrx := max($dimensions/descendant-or-self::*/number(@lrx)) * $svg.scale
        let $lry := max($dimensions/descendant-or-self::*/number(@lry)) * $svg.scale
        
        let $snippet.ratio := ($lrx - $ulx) div ($lry - $uly)
        let $limited.by := (:if($snippet.ratio lt $target.ratio) then('h') else('w'):) 'w'
        let $factor := (:max(($target.ratio,$snippet.ratio)) div min(($target.ratio,$snippet.ratio)):) $snippet.ratio
        
        let $raw.w := $lrx - $ulx
        let $raw.h := $lry - $uly
        
        let $overlap := 0
        
        let $snippet.x := ($ulx - $raw.w * $overlap)
        let $snippet.y := ($uly - $raw.h * $overlap)
        let $snippet.x2 := ($lrx + $raw.w * $overlap)
        let $snippet.y2 := ($lry + $raw.h * $overlap)
        let $snippet.w := $snippet.x2 - $snippet.x
        let $snippet.h := $snippet.y2 - $snippet.y
        
        let $correct.w := if($limited.by = 'w') then(round($snippet.w)) else(round($snippet.w * $factor))
        let $correct.h := if($limited.by = 'h') then(round($snippet.h)) else(round($snippet.h * $factor))
        let $correct.x := if($correct.w gt $snippet.w) then(round($snippet.x - ($correct.w - $snippet.w) div 2)) else(round($snippet.x))
        let $correct.y := if($correct.h gt $snippet.h) then(round($snippet.y - ($correct.h - $snippet.h) div 2)) else(round($snippet.y))
        
        let $region := string($correct.x) || ',' || string($correct.y) || ',' || string($correct.w) || ',' || string($correct.h)
        (:let $size := string($target.w * 2) || ',' || string($target.h * 2):)
        let $rotation := '0'
        let $quality := 'default'
        let $format := '.jpg'
        
        return
            '{' ||
                '"id":"' || $surface/@xml:id || '",' ||
                '"x":"' || $snippet.x || '",' ||
                '"y":"' || $snippet.y || '",' ||
                '"w":"' || $snippet.w || '",' ||
                '"h":"' || $snippet.h || '",' ||
                '"x2":"' || $snippet.x2 || '",' ||
                '"y2":"' || $snippet.y2 || '",' ||
                (:'"uri":"' || $page.uri || $region || '/' || $size || '/' || $rotation || '/' || $quality || $format || '",' ||:)
                '"label":"' || (:$source.label || ', ' || $page.label:) $page.uri || '"' ||
            '}'
    
    return 
        '{' ||
            '"id":"' || $elem.id || '",' ||
            '"name":"' || $elem.name || '",' ||
            '"pages":[' || string-join($pages,',') || ']' ||
        '}'
return 
    '[' ||
        string-join($elems,',') ||
    ']'