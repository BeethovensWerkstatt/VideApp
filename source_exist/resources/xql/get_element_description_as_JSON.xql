xquery version "3.0";

(:
    queryElement.xql
    $param 'sourceID' : xml:id of an mei:mei element 
    $param 'pathID' : id of an svg:path element that has been clicked in the SourceViewer app 
    
    This xQuery is used to identify the MEI element corresponding to an SVG shape that has been clicked
    in the SourceViewer app. The information found is then returned as JSON object string. 
:)

declare namespace xhtml="http://www.w3.org/1999/xhtml";
declare namespace mei="http://www.music-encoding.org/ns/mei";
declare namespace request="http://exist-db.org/xquery/request";
declare namespace util="http://exist-db.org/xquery/util";
declare namespace transform="http://exist-db.org/xquery/transform";
declare namespace bw="http://beethovens-werkstatt.de/ns/bw";

declare option exist:serialize "method=xml media-type=text/plain omit-xml-declaration=yes indent=yes";

(:gets ordinal numbers in different languages:)
declare function bw:getOrdinal($input as xs:string, $lang as xs:string?) as xs:string {
    let $number := number($input)
    
    let $output := 
        if($lang != 'en')
        then(concat($input,'.'))
        else if($number mod 100 = 11)
        then(concat($input,'th'))
        else if($number mod 100 = 12)
        then(concat($input,'th'))
        else if($number mod 100 = 13)
        then(concat($input,'th'))
        else if($number mod 10 = 1)
        then(concat($input,'st'))
        else if($number mod 10 = 2)
        then(concat($input,'nd'))
        else if($number mod 10 = 3)
        then(concat($input,'rd'))
        else(concat($input,'th'))

    return $output
};

(:get localized string with no additional parameters:)
declare function bw:getI18n($key as xs:string, $lang as xs:string) as xs:string {
    let $result := bw:getI18n($key,$lang,'','','','')
    return $result
};

(:get localized string with one additional parameter:)
declare function bw:getI18n($key as xs:string, $lang as xs:string,
    $param1 as xs:string?) as xs:string {
    let $result := bw:getI18n($key,$lang,$param1,'','','')
    return $result
};

(:get localized string with two additional parameters:)
declare function bw:getI18n($key as xs:string, $lang as xs:string,
    $param1 as xs:string?,
    $param2 as xs:string?) as xs:string {
    let $result := bw:getI18n($key,$lang,$param1,$param2,'','')
    return $result
};

(:get localized string with three additional parameters:)
declare function bw:getI18n($key as xs:string, $lang as xs:string,
    $param1 as xs:string?,
    $param2 as xs:string?,
    $param3 as xs:string?) as xs:string {
    let $result := bw:getI18n($key,$lang,$param1,$param2,$param3,'')
    return $result
};

(:get localized string with four additional parameters:)
declare function bw:getI18n($key as xs:string, $lang as xs:string, 
    $param1 as xs:string?,  
    $param2 as xs:string?, 
    $param3 as xs:string?, 
    $param4 as xs:string?) as xs:string {
    let $langDoc := doc('/db/apps/exist-module/resources/i18n/i18n.xml')
    let $raw := $langDoc//*:key[@xml:id = $key]/*:value[@xml:lang = $lang]/text()
    
    let $step1 := if(exists($param1) and string-length($param1) gt 0) then(replace($raw,'@@1%%',$param1)) else($raw)
    let $step2 := if(exists($param2) and string-length($param2) gt 0) then(replace($step1,'@@2%%',$param2)) else($step1)
    let $step3 := if(exists($param3) and string-length($param3) gt 0) then(replace($step2,'@@3%%',$param3)) else($step2)
    let $step4 := if(exists($param4) and string-length($param4) gt 0) then(replace($step3,'@@4%%',$param4)) else($step3)
    
    return $step4
};

(: this function generates a string saying in which measure a feature is contained:)
declare function bw:getMeasure($elem as node(), $lang as xs:string, $doc as node()) as xs:string {
    
    let $staff.n := if($elem/@staff) then($elem/@staff) else($elem/ancestor::mei:staff/@n)
    let $staff.ref :=
        if(not($staff.n))
        then()
        else if($doc//mei:staffDef[@n = $staff.n]/@label)
        then(concat(', ',($doc//mei:staffDef[@n = $staff.n and @label])[1]/@label))
        else if($doc//mei:staffDef[@n = $staff.n]/ancestor::mei:staffGrp/@label)
        then(concat(', ',($doc//mei:staffDef[@n = $staff.n and ancestor::mei:staffGrp/@label])[1]/ancestor::mei:staffGrp[@label][1]/@label))
        else()
    let $measure := $elem/ancestor::mei:measure
    let $measure.label := 
        if($measure/@label) 
        then($measure/@label) 
        else if($measure/@n) 
        then($measure/@n) 
        else('')
    let $output :=
        if($measure.label != '')
        then(concat(bw:getI18n('measure', $lang, $measure.label),$staff.ref))
        else('')
    
    return $output
    
    (:<xsl:function name="local:getMeasure" as="xs:string">
        <xsl:param name="elem" as="node()"/>
        <xsl:variable name="staff.n" select="if($elem/@staff) then($elem/@staff) else($elem/ancestor::mei:staff/@n)" as="xs:string?"/>
        <xsl:variable name="staff.ref" as="xs:string?">
            <xsl:choose>
                <xsl:when test="not($staff.n)"/>
                <xsl:when test="$doc//mei:staffDef[@n = $staff.n]/@label">
                    <xsl:value-of select="concat(', ',($doc//mei:staffDef[@n = $staff.n and @label])[1]/@label)"/>
                </xsl:when>
                <xsl:when test="$doc//mei:staffDef[@n = $staff.n]/ancestor::mei:staffGrp/@label">
                    <xsl:value-of select="concat(', ',($doc//mei:staffDef[@n = $staff.n and ancestor::mei:staffGrp/@label])[1]/ancestor::mei:staffGrp[@label][1]/@label)"/>
                </xsl:when>
            </xsl:choose>
        </xsl:variable>
        <xsl:variable name="measure" select="$elem/ancestor::mei:measure" as="node()?"/>
        <xsl:variable name="measure.label" select="if($measure/@label) then($measure/@label) else if($measure/@n) then($measure/@n) else()" as="xs:string?"/>
        <xsl:choose>
            <xsl:when test="$measure.label">
                <xsl:value-of select="concat(local:getLocal('measure',$measure.label),$staff.ref)"/>
            </xsl:when>
            <xsl:otherwise>
                <xsl:value-of select="''"/>
            </xsl:otherwise>
        </xsl:choose>
    </xsl:function>:)
};

(: this function generates a german pitch name :)
declare function bw:getGermanPitch($oct as xs:string, $pname as xs:string, $accid as xs:string?) as xs:string {
    
    let $basePitch := 
        
        let $with.accid := 
            if($accid = 's') then( (:with one "Kreuzvorzeichen":)
                let $with.pname :=
                    if($pname = 'c') then('cis')
                    else if($pname = 'd') then('dis')
                    else if($pname = 'e') then('eis')
                    else if($pname = 'f') then('fis')
                    else if($pname = 'g') then('gis')
                    else if($pname = 'a') then('ais')
                    else if($pname = 'h') then('his')
                    else()
                return $with.pname                    
            ) else if($accid = ('ss','x')) then( (:with two "Kreuzvorzeichen":)
                let $with.pname :=
                    if($pname = 'c') then('cisis')
                    else if($pname = 'd') then('disis')
                    else if($pname = 'e') then('eisis')
                    else if($pname = 'f') then('fisis')
                    else if($pname = 'g') then('gisis')
                    else if($pname = 'a') then('aisis')
                    else if($pname = 'h') then('hisis')
                    else()
                return $with.pname
            ) else if($accid = 'f') then( (:with one "B-Vorzeichen":)
                let $with.pname :=
                    if($pname = 'c') then('ces')
                    else if($pname = 'd') then('des')
                    else if($pname = 'e') then('es')
                    else if($pname = 'f') then('fes')
                    else if($pname = 'g') then('ges')
                    else if($pname = 'a') then('as')
                    else if($pname = 'h') then('b')
                    else()
                return $with.pname
            ) else if($accid = 'ff') then( (:with two "B-Vorzeichen":)
                let $with.pname :=
                    if($pname = 'c') then('ceses')
                    else if($pname = 'd') then('deses')
                    else if($pname = 'e') then('eses')
                    else if($pname = 'f') then('feses')
                    else if($pname = 'g') then('geses')
                    else if($pname = 'a') then('ases')
                    else if($pname = 'h') then('heses')
                    else()
                return $with.pname
            ) else ( (:ohne "Vorzeichen":)
                let $with.pname :=
                    if($pname = 'c') then('c')
                    else if($pname = 'd') then('d')
                    else if($pname = 'e') then('e')
                    else if($pname = 'f') then('f')
                    else if($pname = 'g') then('g')
                    else if($pname = 'a') then('a')
                    else if($pname = 'h') then('h')
                    else()
                return $with.pname
            )            
        
        let $with.oct := 
            if(number($oct) ge 3) 
            then($with.accid)
            else(concat(upper-case(substring($with.accid,1,1)),substring($with.accid,2)))
                
        return $with.oct
    
    let $low.oct := 
        if(     $oct = '0') then(',,')
        else if($oct = '1') then(',,')
        else('')
    
    let $high.oct :=
        if(     $oct = '4') then('’')
        else if($oct = '5') then('’’')
        else if($oct = '6') then('’’’')
        else if($oct = '7') then('’’’’')
        else if($oct = '8') then('’’’’’')
        else('')
    
    return concat($low.oct,$basePitch,$high.oct)  
    
};

declare function bw:getStateDesc($elem as node(), $lang as xs:string) as xs:string {
    
    let $modifications := reverse($elem/ancestor::mei:*[@changeState])
    
    (:<xsl:function name="local:getStateDesc" as="xs:string">
        <xsl:param name="elem" as="node()" required="yes"/>
        
        <!-- get all modifying operations for this element -->
        <xsl:variable name="modifications" select="reverse($elem/ancestor::mei:*[@changeState])" as="node()*"/>
        
        <!-- decide if elem is inside the "Störstelle" -->
        <xsl:variable name="is.contained" select="$elem/ancestor::mei:measure/@xml:id = $elem/ancestor::mei:mei//mei:genDesc[@ordered = 'true' and @plist]/tokenize(replace(@plist,'#',''),' ')" as="xs:boolean"/>
        <xsl:variable name="strings" as="xs:string*">
            <xsl:choose>
                <!-- when element is not contained in the Störstelle, don't include this information at all -->
                <xsl:when test="not($is.contained)">
                    <xsl:value-of select="''"/>
                </xsl:when>
                <!-- element has never been added or deleted -> part of the first layer, never changed -->
                <xsl:when test="count($modifications) = 0">
                    <xsl:value-of select="local:getLocal('element.neverModified')"/>
                </xsl:when>
                
                <!-- element modified -->
                <xsl:otherwise>
                    <xsl:if test="not($modifications[local-name() = 'add'])">
                        <xsl:value-of select="local:getLocal('alreadyInBaseLayer',$doc//mei:genDesc[@ordered = 'true' and @plist]/mei:state[1]/@label)"/>
                    </xsl:if>
                    <xsl:variable name="add.state.id" select="$modifications[local-name() = 'add'][1]/substring(@changeState,2)" as="xs:string?"/>
                    
                    <!-- todo: überprüfen, ob Streichung nochmals gestrichen wird, ohne restituiert zu sein (op.59.3, Viola, Takt 34b…) -->
                    <xsl:variable name="droppable.mod.states" select="if(exists($add.state.id)) then($doc/id($add.state.id)/preceding-sibling::mei:state/@xml:id) else()" as="xs:string*"/>
                    <xsl:variable name="involved.states" select="$doc//mei:state[concat('#',@xml:id) = $modifications/@changeState and not(@xml:id = $droppable.mod.states)]" as="node()*"/>
                    <xsl:for-each select="$involved.states">
                        <xsl:variable name="current.state" select="." as="node()"/>
                        <xsl:variable name="current.modifications" select="$modifications[@changeState = concat('#',$current.state/@xml:id)]" as="node()+"/>
                        <xsl:choose>
                            <xsl:when test="count($current.modifications) = 1">
                                <xsl:value-of select="local:describeModification($current.modifications)"/>
                            </xsl:when>
                            <xsl:when test="exists($current.modifications[local-name() = 'del']) and exists($current.modifications[local-name() = 'restore'])">
                                <xsl:variable name="combined.mod" as="node()">
                                    <restoreDel changeState="#{$current.state/@xml:id}"/>
                                </xsl:variable>
                                <xsl:value-of select="local:describeModification($combined.mod)"/>
                            </xsl:when>
                            <xsl:when test="exists($current.modifications[local-name() = 'add']) and exists($current.modifications[local-name() = 'restore'])">
                                <xsl:value-of select="local:describeModification($current.modifications[local-name() = 'add'])"/>
                            </xsl:when>
                            <xsl:when test="exists($current.modifications[local-name() = 'add']) and exists($current.modifications[local-name() = 'del'])">
                                <xsl:value-of select="local:describeModification($current.modifications[local-name() = 'add'])"/>
                            </xsl:when>
                            <!-- todo: are there other combinations possible for sharing a state? -->
                        </xsl:choose>
                    </xsl:for-each>
                                        
                    <!--<xsl:for-each select="$modifications">
                        <xsl:sort data-type="number" select="count(./preceding::mei:*[concat('#',@xml:id) = $modifications/@xml:id])"/>
                        <xsl:value-of select="local:describeModification(.)"/>
                    </xsl:for-each>-->
                </xsl:otherwise>
            </xsl:choose>
        </xsl:variable>
        <xsl:value-of select="string-join($strings,', ')"/>
    </xsl:function>:)
    (:<xsl:function name="local:describeModification" as="xs:string">
        <xsl:param name="modification" as="node()"/>
        <xsl:variable name="state" select="$doc/id(substring($modification/@changeState,2))" as="node()"/>
        <xsl:choose>
            <xsl:when test="local-name($modification) = 'add'">
                <xsl:value-of select="local:getLocal('addedIn',$state/@label)"/>
            </xsl:when>
            <xsl:when test="local-name($modification) = 'del'">
                <xsl:value-of select="local:getLocal('deletedIn',$state/@label)"/>
            </xsl:when>
            <xsl:when test="local-name($modification) = 'restore'">
                <xsl:value-of select="local:getLocal('restoredIn',$state/@label)"/>
            </xsl:when>
            <xsl:when test="local-name($modification) = 'restoreDel'">
                <xsl:value-of select="local:getLocal('restoredAndDeleted',$state/@label)"/>
            </xsl:when>
            <xsl:otherwise>
                <xsl:value-of select="local:getLocal('modifiedIn',$state/@label,local-name($modification))"/>
            </xsl:otherwise>
        </xsl:choose>
    </xsl:function>
    :)
    
    return string(count($modifications))
};

declare function bw:getBravura($elem as node()) as xs:string {
    let $result :=
        if(local-name($elem) = 'note') then(
            let $dur := 
                if($elem/@dur = '1') then('')
                else if($elem/@dur = '2') then('')
                else if($elem/@dur = '4') then('')
                else if($elem/@dur = '8') then('')
                else if($elem/@dur = '16') then('')
                else if($elem/@dur = '32') then('')
                else if($elem/@dur = '64') then('')
                else('')
            let $dotted :=
                if(not($elem/@dots)) then('')
                else if($elem/@dots = '1') then('') 
                else if($elem/@dots = '2') then('')
                else if($elem/@dots = '3') then('')
                else ('')
            return concat($dur,$dotted)                
        ) else if(local-name($elem) = 'rest') then (
            let $dur := 
                if($elem/@dur = '1') then('')
                else if($elem/@dur = '2') then('')
                else if($elem/@dur = '4') then('')
                else if($elem/@dur = '8') then('')
                else if($elem/@dur = '16') then('')
                else if($elem/@dur = '32') then('')
                else if($elem/@dur = '64') then('')
                else('')
            let $dotted :=
                if(not($elem/@dots)) then('')
                else if($elem/@dots = '1') then('') 
                else if($elem/@dots = '2') then('')
                else if($elem/@dots = '3') then('')
                else ('')
            return concat($dur,$dotted)              
        ) else if(local-name($elem) = 'accid') then (
            let $accid := 
                if($elem/@accid = 's') then('')
                else if($elem/@accid = 'f') then('')
                else if($elem/@accid = 'n') then('')
                else if($elem/@accid = 'ss') then('')
                else if($elem/@accid = 'ff') then('')
                else if($elem/@accid = 'x') then('') else('')
            return $accid
        ) else if(local-name($elem) = 'clef') then (
            let $clef :=
                if($elem/@shape = 'F') then('')
                else if($elem/@shape = 'C') then('')
                else if($elem/@shape = 'G') then('') else('')
            return $clef
        ) else if(local-name($elem) = 'octave') then (
            let $octave :=
                if($elem/@dis = '8' and $elem/@dis.place = 'above') then('')
                else if($elem/@dis = '8' and $elem/@dis.place = 'below') then('')
                else if($elem/@dis = '15' and $elem/@dis.place = 'above') then('')
                else if($elem/@dis = '15' and $elem/@dis.place = 'below') then('') else('')
            return $octave
        ) else ('')
    
    return $result
};

declare function bw:qualifyPosition($elem as node(), $doc as node(), $lang as xs:string) as xs:string {
    
    let $modifications := reverse($elem/ancestor::mei:*[@changeState])
    let $scars := 
        for $mod in $modifications
        let $state := $doc/id(replace($mod/@changeState,'#',''))
        let $scar := $state/ancestor::mei:genDesc[@type = 'textualScar']
        return $scar/@xml:id
        
    let $scar.elem := $doc/id(distinct-values($scars)[1])
    let $result := 
        if(exists($scar.elem) and $scar.elem/@label and string-length($scar.elem/@label) gt 0)
        then(bw:getI18n('part.of.scar',$lang,$scar.elem/@label))
        else(bw:getI18n('outside.scars',$lang))
    return $result
    
};

declare function bw:getAccidString($note as node()) as xs:string {
    let $accid := 
        if($note//@accid = 's') then('#')
        else if($note//@accid = 'f') then('b')
        else if($note//@accid = 'n') then('')
        else if($note//@accid = 'ss') then('##')
        else if($note//@accid = 'ff') then('bb')
        else if($note//@accid = 'x') then('##')
        else('')
    return $accid
};

declare function bw:getDesc($elem as node(), $doc as node(), $clicked.id as xs:string, $lang as xs:string) as xs:string {
    let $result :=
        if(local-name($elem) = 'note') then(bw:getNoteDesc($elem,$doc,$lang))
        else if(local-name($elem) = 'chord') then(bw:getChordDesc($elem,$doc,$lang))
        else if(local-name($elem) = ('beam','beamSpan')) then(bw:getBeamDesc($elem,$doc,$lang))
        else if(local-name($elem) = 'del') then(bw:getDelDesc($elem,$doc,$lang))
        else if(local-name($elem) = 'accid') then(bw:getAccidDesc($elem,$doc,$lang))
        else if(local-name($elem) = 'rest') then(bw:getRestDesc($elem,$doc,$lang))
        else if(local-name($elem) = 'mRest') then(bw:getRestDesc($elem,$doc,$lang))
        else if(local-name($elem) = 'beatRpt') then(bw:getRepeatDesc($elem,$doc,$lang))
        else if(local-name($elem) = 'mRpt') then(bw:getRepeatDesc($elem,$doc,$lang))
        else if(local-name($elem) = 'halfmRpt') then(bw:getRepeatDesc($elem,$doc,$lang))
        else if(local-name($elem) = 'clef') then(bw:getClefDesc($elem,$doc,$lang))
        else if(local-name($elem) = 'dir') then(bw:getDirDesc($elem,$doc,$lang))
        else if(local-name($elem) = 'octave') then(bw:getOctaveDesc($elem,$doc,$lang))
        else if(local-name($elem) = 'slur') then(bw:getSlurDesc($elem,$doc,$lang))
        else if(local-name($elem) = 'tie') then(bw:getTieDesc($elem,$doc,$lang))
        else if(local-name($elem) = 'dynam') then(bw:getDynamDesc($elem,$doc,$lang))
        else if(local-name($elem) = 'hairpin') then(bw:getHairpinDesc($elem,$doc,$lang))
        else if(local-name($elem) = 'artic') then(bw:getArticDesc($elem,$doc,$lang))
        else if(local-name($elem) = 'metaMark') then(bw:getMetaMarkDesc($elem,$doc,$lang))
        else if(local-name($elem) = 'cpMark') then(bw:getCpMarkDesc($elem,$doc,$lang))
        else if(local-name($elem) = ('mRpt','beatRpt')) then(bw:getRptDesc($elem,$doc,$lang))
        else if(local-name($elem) = 'rend') then(
            if(ancestor::mei:metaMark) then(bw:getMetaMarkDesc($elem/ancestor::mei:metaMark[1],$doc,$lang))
            else if(ancestor::mei:cpMark) then(bw:getCpMarkDesc($elem/ancestor::mei:cpMark[1],$doc,$lang))
            else if(ancestor::mei:dir) then(bw:getDirDesc($elem/ancestor::mei:dir[1],$doc,$lang))
            else if(ancestor::mei:dynam) then(bw:getDirDesc($elem/ancestor::mei:dynam[1],$doc,$lang))
            else(''))
        else if(local-name($elem) = ('barline','measure')) then(bw:getBarlineDesc($elem,$doc,$clicked.id,$lang))
        else('')
    return $result
};

declare function bw:getNoteDesc($note as node(), $doc as node(), $lang as xs:string) as xs:string {
    
    let $pname := upper-case($note/@pname)
    let $accid := bw:getAccidString($note)
    let $oct := $note/@oct
    let $germanPitch :=
        if($lang = 'de')
        then(
            concat(' | ',bw:getGermanPitch($note/@oct,$note/@pname,$note//@accid))
        )
        else('')
    
    return concat($pname,$accid,$oct,$germanPitch)
    
};

declare function bw:getChordDesc($chord as node(), $doc as node(), $lang as xs:string) as xs:string {
    
    let $dotted := 
        if(not($chord/@dots) and not($chord//mei:dot)) then('')
        else(
            let $chord.dots := max(((if($chord/@dots) then(number($chord/@dots)) else(0)),count($chord/mei:dot)))
            let $note.dots :=
                for $note in $chord//mei:note
                let $dots := max(((if($note/@dots) then(number($note/@dots)) else(0)),count($note//mei:dot)))
                return $dots
            
            let $dots.count := max(($chord.dots,$note.dots))
            return bw:getI18n(concat('dots.',string($dots.count)),$lang)
        )
    
    let $label := bw:getI18n('chord',$lang)
    let $dur := bw:getI18n(concat('dur.',$chord/@dur),$lang)
    let $individual.pitches := 
        for $note in $chord//mei:note
        let $string := concat(upper-case($note/@pname),bw:getAccidString($note),$note/@oct)
        return $string
    let $pitches.string := string-join($individual.pitches,', ')
    
    return concat($dotted,' ', $label, ' ', $dur, $pitches.string)
    
};

declare function bw:getBeamDesc($beam as node(), $doc as node(), $lang as xs:string) as xs:string {
    let $desc := bw:getI18n('beam',$lang)
    return $desc
};

declare function bw:getRptDesc($beam as node(), $doc as node(), $lang as xs:string) as xs:string {
    let $desc := bw:getI18n('rpt.sign',$lang)
    return $desc
};

declare function bw:getDelDesc($del as node(), $doc as node(), $lang as xs:string) as xs:string {
    let $changeState := replace($del/@changeState,'#','')
    let $stateLabel := $doc/id($changeState)/@label
    
    let $desc := concat(bw:getI18n('deletionIn',$lang),' ', $stateLabel)
    return $desc
};

declare function bw:getAccidDesc($accid as node(), $doc as node(), $lang as xs:string) as xs:string {
    let $desc := bw:getI18n('accidental',$lang)
    return $desc
};

declare function bw:getRestDesc($rest as node(), $doc as node(), $lang as xs:string) as xs:string {
    let $desc := ''
    return $desc
};

declare function bw:getRepeatDesc($repeat as node(), $doc as node(), $lang as xs:string) as xs:string {
    let $desc := bw:getI18n('rpt.sign',$lang)
    return $desc
};

declare function bw:getClefDesc($clef as node(), $doc as node(), $lang as xs:string) as xs:string {
    let $desc := concat($clef/@shape,bw:getI18n('clef.combined',$lang))
    return $desc
};

declare function bw:getDirDesc($dir as node(), $doc as node(), $lang as xs:string) as xs:string {
    let $desc := concat(bw:getI18n('directive',$lang), ' ', string-join($dir//text(),' '))
    return $desc
};

declare function bw:getOctaveDesc($octave as node(), $doc as node(), $lang as xs:string) as xs:string {
    let $desc := bw:getI18n('octave.dir',$lang)
    return $desc
};

declare function bw:getSlurDesc($slur as node(), $doc as node(), $lang as xs:string) as xs:string {

    let $start := bw:getI18n('startingAtTstamp',$lang,$slur/@tstamp)
    let $end :=
        if(starts-with($slur/@tstamp2,'0m'))
        then(concat(' ', bw:getI18n('endingAtTstamp',substring-after($slur/@tstamp2,'0m+'))))
        else if(starts-with($slur/@tstamp2,'1m'))
        then(concat(' ', bw:getI18n('endingAtTstampOfNextMeasure', $lang, substring-after($slur/@tstamp2,'1m+'))))
        else(concat(' ',bw:getI18n('endingAtTstampOfNextMeasure', $lang, bw:getOrdinal(substring-before($slur/@tstamp2,'m+'),$lang),substring-after($slur/@tstamp2,'1m+'))))

    let $desc := concat(bw:getI18n('slur',$lang),' ',$start,' ',$end)
    return $desc
};

declare function bw:getTieDesc($tie as node(), $doc as node(), $lang as xs:string) as xs:string {
    let $start := bw:getI18n('startingAtTstamp',$lang,$tie/@tstamp)
    let $end :=
        if(starts-with($tie/@tstamp2,'0m'))
        then(concat(' ', bw:getI18n('endingAtTstamp',substring-after($tie/@tstamp2,'0m+'))))
        else if(starts-with($tie/@tstamp2,'1m'))
        then(concat(' ', bw:getI18n('endingAtTstampOfNextMeasure', $lang, substring-after($tie/@tstamp2,'1m+'))))
        else(concat(' ',bw:getI18n('endingAtTstampOfNextMeasure', $lang, bw:getOrdinal(substring-before($tie/@tstamp2,'m+'),$lang),substring-after($tie/@tstamp2,'1m+'))))

    let $desc := concat(bw:getI18n('tie',$lang),' ',$start,' ',$end)
    return $desc
};

declare function bw:getDynamDesc($dynam as node(), $doc as node(), $lang as xs:string) as xs:string {
    let $desc := concat(bw:getI18n('dynamic.dir',$lang), ' ', string-join($dynam//text(),' '))
    return $desc
};

declare function bw:getHairpinDesc($hairpin as node(), $doc as node(), $lang as xs:string) as xs:string {
    let $shape := 
        if($hairpin/@form = 'dim')
        then(bw:getI18n('hairpin.dim',$lang))
        else(bw:getI18n('hairpin.cres',$lang))
    let $start := bw:getI18n('startingAtTstamp',$lang,$hairpin/@tstamp)
    let $end :=
        if(starts-with($hairpin/@tstamp2,'0m'))
        then(concat(' ', bw:getI18n('endingAtTstamp',substring-after($hairpin/@tstamp2,'0m+'))))
        else if(starts-with($hairpin/@tstamp2,'1m'))
        then(concat(' ', bw:getI18n('endingAtTstampOfNextMeasure', $lang, substring-after($hairpin/@tstamp2,'1m+'))))
        else(concat(' ',bw:getI18n('endingAtTstampOfNextMeasure', $lang, bw:getOrdinal(substring-before($hairpin/@tstamp2,'m+'),$lang),substring-after($hairpin/@tstamp2,'1m+'))))

    let $desc := concat($shape,' ',$start,' ',$end)
    
    return $desc
};

declare function bw:getArticDesc($artic as node(), $doc as node(), $lang as xs:string) as xs:string {
    let $desc := 
        if($artic/@artic = 'dot')
        then(bw:getI18n('artic.dot',$lang))
        else(bw:getI18n('artic',$lang,string($artic/@artic)))
    return $desc
};

declare function bw:getMetaMarkDesc($metaMark as node(), $doc as node(), $lang as xs:string) as xs:string {
    let $desc :=
        if($metaMark/@function = 'navigation')
        then(
            if($metaMark/@target)
            then(bw:getI18n('link.origin',$lang))
            else(bw:getI18n('link.target',$lang))
            
        ) else if($metaMark/@function = 'confirmation')
        then(
            let $target := $doc/id($metaMark/replace(@target,'#',''))
            let $typeString :=
                if(local-name($target) = 'del')
                then(bw:getI18n('confirmation.deletion',$lang))
                else if(local-name($target) = 'restore')
                then(bw:getI18n('confirmation.restore',$lang))
                else('')
            let $confirmation := concat(bw:getI18n('confirmation',$lang),$typeString)    
            return $confirmation
            
        ) else if($metaMark/@function = 'clarification')
        then(
            if($metaMark//text())
            then(bw:getI18n('clarification',$lang,string-join($metaMark//text(),' ')))
            else if($metaMark/@target)
            then(
                let $target := $doc/id($metaMark/replace(@target,'#',''))
                return bw:getI18n('clarification',$lang,bw:getI18n(local-name($target),$lang))
            )
            else('')
        
        ) else if($metaMark/@function = 'restoration')
        then(
            bw:getI18n('restoration',$lang,string-join($metaMark//text(),' '))
        ) else if($metaMark/@function = 'deletion')
        then(
            bw:getI18n('deletion.text',$lang,string-join($metaMark//text(),' '))
        ) else ('')
    
    
    return $desc
};

declare function bw:getCpMarkDesc($cpMark as node(), $doc as node(), $lang as xs:string) as xs:string {
    let $desc := 
        if($cpMark/@ref.staff)
        then(
            let $other.staff := ($doc//mei:staffDef[@n = $cpMark/@ref.staff])[1]/@label
            let $start := bw:getI18n('startingAtTstamp',$lang,$cpMark/@tstamp)
            let $end :=
                if(starts-with($cpMark/@tstamp2,'0m'))
                then(concat(' ', bw:getI18n('endingAtTstamp',substring-after($cpMark/@tstamp2,'0m+'))))
                else if(starts-with($cpMark/@tstamp2,'1m'))
                then(concat(' ', bw:getI18n('endingAtTstampOfNextMeasure', $lang, substring-after($cpMark/@tstamp2,'1m+'))))
                else(concat(' ',bw:getI18n('endingAtTstampOfNextMeasure', $lang, bw:getOrdinal(substring-before($cpMark/@tstamp2,'m+'),$lang),substring-after($cpMark/@tstamp2,'1m+'))))
            let $oct.dis :=
                if($cpMark/@dis)
                then(bw:getI18n('in8va',$lang))
                else('')
            return bw:getI18n('cpMark.collaParte', $other.staff, $start, $end, $oct.dis)
        ) else (
            bw:getI18n('cpMark',$lang)
        )
    return $desc
};

declare function bw:getBarlineDesc($barline as node(), $doc as node(), $clicked.id as xs:string, $lang as xs:string) as xs:string {
    let $desc := bw:getI18n('beam',$lang)
    
    let $measures := $doc//mei:measure[concat('#',$clicked.id) = tokenize(normalize-space(@facs),' ')]
    let $desc :=
        if(count($measures) = 1)
        then(
            bw:getI18n('barline.atMeasure',$lang,$measures[1]/@label)
        ) else if(count($measures) = 2) 
        then(
            let $sorted.measures := ($doc//mei:measure[@xml:id = $measures/@xml:id])
            return bw:getI18n('barline.betweenMeasures',$lang,$sorted.measures[1]/@label,$sorted.measures[2]/@label)
        ) else ('')
        
    return $desc
};


(:START OF PROCESSING:)

let $edition.id := request:get-parameter('edition.id','')
let $element.id := request:get-parameter('element.id','')
let $lang := request:get-parameter('lang','')


(:
    get the MEI document and the base path for XSLTs (which is relative to the path of this xQuery)
:)
let $doc := collection('/db/apps/exist-module/content')//mei:mei[@xml:id = $edition.id]
let $xslPath := '../xsl/'

(:
    generate a JSON object with information about the element to which the specified path belongs
:)
(:let $result := transform:transform($doc,
               doc(concat($xslPath,'queryElement.xsl')), <parameters><param name="element.id" value="{$element.id}"/><param name="lang" value="{$lang}"/></parameters>)
:)
let $elements := if(exists($doc/id($element.id))) then($doc/id($element.id)) else($doc//mei:*[$element.id = tokenize(normalize-space(replace(@facs,'#','')),' ')])
let $results := 
    for $elem in $elements
    let $id := $elem/@xml:id
    let $elem.name := local-name($elem)     
    let $type := 
        if($elem.name = 'beamSpan')
        then('beam')
        else($elem.name)
    
    let $measure := bw:getMeasure($elem,$lang,$doc)
    let $position := bw:qualifyPosition($elem,$doc,$lang)
    let $bravura := bw:getBravura($elem)
    let $desc := bw:getDesc($elem,$doc,$element.id,$lang)
    let $stateDesc := bw:getStateDesc($elem,$lang)
    
    let $target := 
        if(local-name($elem) = 'metaMark' and $elem/@function = 'navigation')
        then(
            if($elem/@target)
            then(concat('"target":"',replace($elem/@target,'#',''),'",'))
            else(
                let $start := ($doc//mei:metaMark[replace(@target,'#','') = $elem/@xml:id])[1]
                return concat('"target":"',$start/@xml:id,'",')
            )
        )
        else('')
    
    let $supplied := if($elem/ancestor::mei:supplied) then('true') else('false')
    let $unclear := if($elem/ancestor::mei:unclear) then('true') else('false')
    
    let $shapes := 
        for $shape in tokenize($elem/replace(normalize-space(@facs),'#',''),' ')[. != $doc//mei:zone/@xml:id]
        return '"' || $shape || '"'
    
    return
        '{' ||
            '"type":"' || $type || '",' ||
            '"id":"' || $id || '",' ||
            '"measure":"' || $measure || '",' ||
            '"position":"' || $position || '",' ||
            '"bravura":"' || $bravura || '",' ||
            '"desc":"' || $desc || '",' ||
            '"stateDesc":"' || $stateDesc || '",' ||
            '"supplied":' || $supplied || ',' ||
            '"unclear":' || $unclear || ',' ||
            $target ||
            '"svgIDs":[' || string-join($shapes,',') || ']' ||
        '}'
    

return
    '[' ||
        string-join($results,',') || 
    ']'