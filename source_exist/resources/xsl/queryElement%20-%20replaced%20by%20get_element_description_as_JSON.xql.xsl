<?xml version="1.0" encoding="UTF-8"?>
<xsl:stylesheet xmlns:xsl="http://www.w3.org/1999/XSL/Transform" xmlns:mei="http://www.music-encoding.org/ns/mei" xmlns:svg="http://www.w3.org/2000/svg" xmlns:math="http://www.w3.org/2005/xpath-functions/math" xmlns:xs="http://www.w3.org/2001/XMLSchema" xmlns:xd="http://www.oxygenxml.com/ns/doc/xsl" xmlns:local="local" exclude-result-prefixes="xs math xd mei svg" version="3.0">
    <xd:doc scope="stylesheet">
        <xd:desc>
            <xd:p>
                <xd:b>Created on:</xd:b> Nov 21, 2014</xd:p>
            <xd:p>
                <xd:ul>
                    <xd:li>
                        <xd:b>Author:</xd:b> Maja Hartwig</xd:li>
                    <xd:li>
                        <xd:b>Author:</xd:b> Johannes Kepper</xd:li>
                </xd:ul>
            </xd:p>
            <xd:p>
                This stylesheet gets an @id of an SVG path, identifies to which MEI element it belongs, and returns
                a JSON object string with an explanation of it, to be displayed in SourceViewer. 
            </xd:p>
            <xd:p>
                <xd:b>TODO:</xd:b> The functions about pitch ignore preceding accidentals etc., so this needs to become much more sophisticated
            </xd:p>
        </xd:desc>
    </xd:doc>
    
    <!-- gets ordinal numbers in different languages -->
    <xsl:function name="local:getOrdinal" as="xs:string">
        <xsl:param name="input" as="xs:string"/>
        <xsl:variable name="number" select="number($input)"/>
        <xsl:choose>
            <xsl:when test="$lang = 'de'">
                <xsl:value-of select="concat($number, '.')"/>
            </xsl:when>
            <xsl:when test="$lang = 'en'">
                <xsl:choose>
                    <xsl:when test="$number mod 100 = 11">
                        <xsl:value-of select="concat($number, 'th')"/>
                    </xsl:when>
                    <xsl:when test="$number mod 100 = 12">
                        <xsl:value-of select="concat($number, 'th')"/>
                    </xsl:when>
                    <xsl:when test="$number mod 100 = 13">
                        <xsl:value-of select="concat($number, 'th')"/>
                    </xsl:when>
                    <xsl:when test="$number mod 10 = 1">
                        <xsl:value-of select="concat($number, 'st')"/>
                    </xsl:when>
                    <xsl:when test="$number mod 10 = 2">
                        <xsl:value-of select="concat($number, 'nd')"/>
                    </xsl:when>
                    <xsl:when test="$number mod 10 = 3">
                        <xsl:value-of select="concat($number, 'rd')"/>
                    </xsl:when>
                    <xsl:otherwise>
                        <xsl:value-of select="concat($number, 'th')"/>
                    </xsl:otherwise>
                </xsl:choose>
            </xsl:when>
            <xsl:otherwise>
                <xsl:value-of select="concat($number, '.')"/>
            </xsl:otherwise>
        </xsl:choose>
    </xsl:function>
    
    <!-- get localized string with no additional parameters -->
    <xsl:function name="local:getLocal" as="xs:string">
        <xsl:param name="key" as="xs:string" required="yes"/>
        <xsl:value-of select="local:getLocal($key,'','','','')"/>
    </xsl:function>
    
    <!-- get localized string with one additional parameter -->
    <xsl:function name="local:getLocal" as="xs:string">
        <xsl:param name="key" as="xs:string" required="yes"/>
        <xsl:param name="param1" as="xs:string" required="no"/>
        <xsl:value-of select="local:getLocal($key,$param1,'','','')"/>
    </xsl:function>
    
    <!-- get localized string with two additional parameters -->
    <xsl:function name="local:getLocal" as="xs:string">
        <xsl:param name="key" as="xs:string" required="yes"/>
        <xsl:param name="param1" as="xs:string" required="no"/>
        <xsl:param name="param2" as="xs:string" required="no"/>
        <xsl:value-of select="local:getLocal($key,$param1,$param2,'','')"/>
    </xsl:function>
    
    <!-- get localized string with three additional parameters -->
    <xsl:function name="local:getLocal" as="xs:string">
        <xsl:param name="key" as="xs:string" required="yes"/>
        <xsl:param name="param1" as="xs:string" required="no"/>
        <xsl:param name="param2" as="xs:string" required="no"/>
        <xsl:param name="param3" as="xs:string" required="no"/>
        <xsl:value-of select="local:getLocal($key,$param1,$param2,$param3,'')"/>
    </xsl:function>
    
    <!-- get localized string with four additional parameters -->
    <xsl:function name="local:getLocal" as="xs:string">
        <xsl:param name="key" as="xs:string" required="yes"/>
        <xsl:param name="param1" as="xs:string" required="no"/>
        <xsl:param name="param2" as="xs:string" required="no"/>
        <xsl:param name="param3" as="xs:string" required="no"/>
        <xsl:param name="param4" as="xs:string" required="no"/>
        <xsl:variable name="raw" select="$langDoc//key[@xml:id = $key]/value[@xml:lang = $lang]/text()"/>
        <xsl:variable name="step1" as="xs:string">
            <xsl:choose>
                <xsl:when test="exists($param1) and string-length($param1) gt 0">
                    <xsl:value-of select="replace($raw,'@@1%%',$param1)"/>
                </xsl:when>
                <xsl:otherwise>
                    <xsl:value-of select="$raw"/>
                </xsl:otherwise>
            </xsl:choose>
        </xsl:variable>
        <xsl:variable name="step2" as="xs:string">
            <xsl:choose>
                <xsl:when test="exists($param2) and string-length($param2) gt 0">
                    <xsl:value-of select="replace($step1,'@@2%%',$param2)"/>
                </xsl:when>
                <xsl:otherwise>
                    <xsl:value-of select="$step1"/>
                </xsl:otherwise>
            </xsl:choose>
        </xsl:variable>
        <xsl:variable name="step3" as="xs:string">
            <xsl:choose>
                <xsl:when test="exists($param3) and string-length($param3) gt 0">
                    <xsl:value-of select="replace($step2,'@@3%%',$param3)"/>
                </xsl:when>
                <xsl:otherwise>
                    <xsl:value-of select="$step2"/>
                </xsl:otherwise>
            </xsl:choose>
        </xsl:variable>
        <xsl:variable name="step4" as="xs:string">
            <xsl:choose>
                <xsl:when test="exists($param4) and string-length($param4) gt 0">
                    <xsl:value-of select="replace($step3,'@@4%%',$param4)"/>
                </xsl:when>
                <xsl:otherwise>
                    <xsl:value-of select="$step3"/>
                </xsl:otherwise>
            </xsl:choose>
        </xsl:variable>
        <xsl:value-of select="$step4"/>
    </xsl:function>
    
    <!-- get a string which tells in which state a shape was added or removed -->
    <xsl:function name="local:getStateDesc" as="xs:string">
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
    </xsl:function>
    <xsl:function name="local:describeModification" as="xs:string">
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
    
    <!-- this function generates a german pitch name -->
    <xsl:function name="local:getGermanPitch" as="xs:string">
        <!-- basic parameters of the note -->
        <xsl:param name="oct" as="xs:string"/>
        <xsl:param name="pname" as="xs:string"/>
        <xsl:param name="accid" as="xs:string?"/>
        
        <!-- get main pitch string -->
        <xsl:variable name="basePitch" as="xs:string">
            <xsl:choose>
                <!-- for octaves 3 ("kleine Oktave") and above -->
                <xsl:when test="number($oct) ge 3">
                    <xsl:choose>
                        <!-- with one "Kreuzvorzeichen" -->
                        <xsl:when test="$accid = ('s')">
                            <xsl:choose>
                                <xsl:when test="$pname = 'c'">cis</xsl:when>
                                <xsl:when test="$pname = 'd'">dis</xsl:when>
                                <xsl:when test="$pname = 'e'">eis</xsl:when>
                                <xsl:when test="$pname = 'f'">fis</xsl:when>
                                <xsl:when test="$pname = 'g'">gis</xsl:when>
                                <xsl:when test="$pname = 'a'">ais</xsl:when>
                                <xsl:when test="$pname = 'b'">his</xsl:when>
                            </xsl:choose>
                        </xsl:when>
                        <!-- with "Doppelkreuz" -->
                        <xsl:when test="$accid = ('ss','x')">
                            <xsl:choose>
                                <xsl:when test="$pname = 'c'">cisis</xsl:when>
                                <xsl:when test="$pname = 'd'">disis</xsl:when>
                                <xsl:when test="$pname = 'e'">eisis</xsl:when>
                                <xsl:when test="$pname = 'f'">fisis</xsl:when>
                                <xsl:when test="$pname = 'g'">gisis</xsl:when>
                                <xsl:when test="$pname = 'a'">aisis</xsl:when>
                                <xsl:when test="$pname = 'b'">hisis</xsl:when>
                            </xsl:choose>
                        </xsl:when>
                        <!-- with one "B-Vorzeichen" -->
                        <xsl:when test="$accid = ('f')">
                            <xsl:choose>
                                <xsl:when test="$pname = 'c'">ces</xsl:when>
                                <xsl:when test="$pname = 'd'">des</xsl:when>
                                <xsl:when test="$pname = 'e'">es</xsl:when>
                                <xsl:when test="$pname = 'f'">fes</xsl:when>
                                <xsl:when test="$pname = 'g'">ges</xsl:when>
                                <xsl:when test="$pname = 'a'">as</xsl:when>
                                <xsl:when test="$pname = 'b'">b</xsl:when>
                            </xsl:choose>
                        </xsl:when>
                        <!-- with "zwei Bs" -->
                        <xsl:when test="$accid = ('ff')">
                            <xsl:choose>
                                <xsl:when test="$pname = 'c'">ceses</xsl:when>
                                <xsl:when test="$pname = 'd'">deses</xsl:when>
                                <xsl:when test="$pname = 'e'">eses</xsl:when>
                                <xsl:when test="$pname = 'f'">feses</xsl:when>
                                <xsl:when test="$pname = 'g'">geses</xsl:when>
                                <xsl:when test="$pname = 'a'">ases</xsl:when>
                                <xsl:when test="$pname = 'b'">heses</xsl:when>
                            </xsl:choose>
                        </xsl:when>
                        <!-- without accidentals -->
                        <xsl:otherwise>
                            <xsl:choose>
                                <xsl:when test="$pname = 'c'">c</xsl:when>
                                <xsl:when test="$pname = 'd'">d</xsl:when>
                                <xsl:when test="$pname = 'e'">e</xsl:when>
                                <xsl:when test="$pname = 'f'">f</xsl:when>
                                <xsl:when test="$pname = 'g'">g</xsl:when>
                                <xsl:when test="$pname = 'a'">a</xsl:when>
                                <xsl:when test="$pname = 'b'">h</xsl:when>
                            </xsl:choose>
                        </xsl:otherwise>
                    </xsl:choose>
                </xsl:when>
                <!-- for octaves 2 ("Große Oktave") or below -->
                <xsl:otherwise>
                    <xsl:choose>
                        <!-- with one "Kreuzvorzeichen" -->
                        <xsl:when test="$accid = ('s')">
                            <xsl:choose>
                                <xsl:when test="$pname = 'c'">Cis</xsl:when>
                                <xsl:when test="$pname = 'd'">Dis</xsl:when>
                                <xsl:when test="$pname = 'e'">Eis</xsl:when>
                                <xsl:when test="$pname = 'f'">Fis</xsl:when>
                                <xsl:when test="$pname = 'g'">Gis</xsl:when>
                                <xsl:when test="$pname = 'a'">Ais</xsl:when>
                                <xsl:when test="$pname = 'b'">His</xsl:when>
                            </xsl:choose>
                        </xsl:when>
                        <!-- with "Doppelkreuz" -->
                        <xsl:when test="$accid = ('ss','x')">
                            <xsl:choose>
                                <xsl:when test="$pname = 'c'">Cisis</xsl:when>
                                <xsl:when test="$pname = 'd'">Disis</xsl:when>
                                <xsl:when test="$pname = 'e'">Eisis</xsl:when>
                                <xsl:when test="$pname = 'f'">Fisis</xsl:when>
                                <xsl:when test="$pname = 'g'">Gisis</xsl:when>
                                <xsl:when test="$pname = 'a'">Aisis</xsl:when>
                                <xsl:when test="$pname = 'b'">Hisis</xsl:when>
                            </xsl:choose>
                        </xsl:when>
                        <!-- with one "B-Vorzeichen" -->
                        <xsl:when test="$accid = ('f')">
                            <xsl:choose>
                                <xsl:when test="$pname = 'c'">Ces</xsl:when>
                                <xsl:when test="$pname = 'd'">Des</xsl:when>
                                <xsl:when test="$pname = 'e'">Es</xsl:when>
                                <xsl:when test="$pname = 'f'">Fes</xsl:when>
                                <xsl:when test="$pname = 'g'">Ges</xsl:when>
                                <xsl:when test="$pname = 'a'">As</xsl:when>
                                <xsl:when test="$pname = 'b'">B</xsl:when>
                            </xsl:choose>
                        </xsl:when>
                        <!-- with two "Bs" -->
                        <xsl:when test="$accid = ('ff')">
                            <xsl:choose>
                                <xsl:when test="$pname = 'c'">Ceses</xsl:when>
                                <xsl:when test="$pname = 'd'">Deses</xsl:when>
                                <xsl:when test="$pname = 'e'">Eses</xsl:when>
                                <xsl:when test="$pname = 'f'">Feses</xsl:when>
                                <xsl:when test="$pname = 'g'">Geses</xsl:when>
                                <xsl:when test="$pname = 'a'">Ases</xsl:when>
                                <xsl:when test="$pname = 'b'">Heses</xsl:when>
                            </xsl:choose>
                        </xsl:when>
                        <!-- without accidentals -->
                        <xsl:otherwise>
                            <xsl:choose>
                                <xsl:when test="$pname = 'c'">C</xsl:when>
                                <xsl:when test="$pname = 'd'">D</xsl:when>
                                <xsl:when test="$pname = 'e'">E</xsl:when>
                                <xsl:when test="$pname = 'f'">F</xsl:when>
                                <xsl:when test="$pname = 'g'">G</xsl:when>
                                <xsl:when test="$pname = 'a'">A</xsl:when>
                                <xsl:when test="$pname = 'b'">H</xsl:when>
                            </xsl:choose>
                        </xsl:otherwise>
                    </xsl:choose>
                </xsl:otherwise>
            </xsl:choose>
        </xsl:variable>
        <!-- get additional commata for lower octaves -->
        <xsl:variable name="lowOct" as="xs:string">
            <xsl:choose>
                <xsl:when test="$oct = '0'">,,</xsl:when>
                <xsl:when test="$oct = '1'">,</xsl:when>
                <xsl:otherwise>
                    <xsl:value-of select="''"/>
                </xsl:otherwise>
            </xsl:choose>
        </xsl:variable>
        <!-- get additional "Striche" for higher octaves -->
        <xsl:variable name="highOct" as="xs:string">
            <xsl:choose>
                <xsl:when test="$oct = '4'">’</xsl:when>
                <xsl:when test="$oct = '5'">’’</xsl:when>
                <xsl:when test="$oct = '6'">’’’</xsl:when>
                <xsl:when test="$oct = '7'">’’’’</xsl:when>
                <xsl:when test="$oct = '8'">’’’’’</xsl:when>
                <xsl:otherwise>
                    <xsl:value-of select="''"/>
                </xsl:otherwise>
            </xsl:choose>
        </xsl:variable>
        <!-- join basePitch with additional octave information and return everything -->
        <xsl:value-of select="concat($lowOct,$basePitch,$highOct)"/>
    </xsl:function>
    
    <!-- this function generates a string saying in which measure a feature is contained. -->
    <xsl:function name="local:getMeasure" as="xs:string">
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
    </xsl:function>
    
    <!-- this function gives a string that relates the element to the "Störstelle" -->
    <!-- todo: this only works as long as there is only one "Störstelle"!! -->
    <xsl:function name="local:qualifyPosition" as="xs:string">
        <xsl:param name="elem" as="node()"/>
        <xsl:choose>
            <xsl:when test="not($elem/ancestor::mei:measure)">
                <xsl:value-of select="''"/>
            </xsl:when>
            <xsl:otherwise>
                <xsl:variable name="measure" select="$elem/ancestor::mei:measure" as="node()"/>
                <xsl:variable name="affected.measures" select="$doc//mei:section[@xml:id = $doc//mei:genDesc[@ordered = 'true' and @plist]/tokenize(replace(@plist,'#',''),' ')]//mei:measure/@xml:id" as="xs:string*"/>
                <xsl:choose>
                    <!-- elem is within the "Störstelle" -->
                    <xsl:when test="$measure/@xml:id = $affected.measures">
                        <xsl:value-of select="''"/>
                    </xsl:when>
                    <!-- elem precedes the "Störstelle" -->
                    <xsl:when test="every $id in $affected.measures satisfies exists($doc//mei:measure[@xml:id = $id and preceding::mei:measure/@xml:id = $measure/@xml:id])">
                        <xsl:value-of select="local:getLocal('precedes.störstelle')"/>
                    </xsl:when>
                    <!-- elem follows on the "Störstelle" -->
                    <xsl:when test="every $id in $affected.measures satisfies exists($doc//mei:measure[@xml:id = $id and following::mei:measure/@xml:id = $measure/@xml:id])">
                        <xsl:value-of select="local:getLocal('follows.störstelle')"/>
                    </xsl:when>
                    <!-- something seems wrong – this should be covered by case 1 -->
                    <xsl:otherwise>
                        <xsl:value-of select="''"/>
                    </xsl:otherwise>
                </xsl:choose>
            </xsl:otherwise>
        </xsl:choose>
    </xsl:function>
    
    <!-- this function processes notes. It uses SMuFL code points for musical symbols,
        which may not show up here in a meaningful way. Refer to http://www.smufl.org/version/latest/
        for additional information.
    -->
    <xsl:function name="local:processNote" as="xs:string">
        <xsl:param name="note" required="yes" as="node()"/>
        <xsl:variable name="dotted" as="xs:string?">
            <xsl:choose>
                <xsl:when test="not($note/@dots)"/>
                <xsl:when test="$note/@dots = '1'"></xsl:when>
                <xsl:when test="$note/@dots = '2'"></xsl:when>
                <xsl:when test="$note/@dots = '3'"></xsl:when>
            </xsl:choose>
        </xsl:variable>
        <xsl:variable name="accid" as="xs:string">
            <xsl:choose>
                <xsl:when test="$note//@accid = 's'">#</xsl:when>
                <xsl:when test="$note//@accid = 'f'">b</xsl:when>
                <xsl:when test="$note//@accid = 'n'">
                    <xsl:value-of select="''"/>
                </xsl:when>
                <xsl:when test="$note//@accid = 'ss'">##</xsl:when>
                <xsl:when test="$note//@accid = 'ff'">bb</xsl:when>
                <xsl:when test="$note//@accid = 'x'">##</xsl:when>
                <xsl:otherwise>
                    <xsl:value-of select="''"/>
                </xsl:otherwise>
            </xsl:choose>
        </xsl:variable>
        <xsl:variable name="dur" as="xs:string">
            <xsl:choose>
                <xsl:when test="$note/@dur = 1"></xsl:when>
                <xsl:when test="$note/@dur = 2"></xsl:when>
                <xsl:when test="$note/@dur = 4"></xsl:when>
                <xsl:when test="$note/@dur = 8"></xsl:when>
                <xsl:when test="$note/@dur = 16"></xsl:when>
                <xsl:when test="$note/@dur = 32"></xsl:when>
                <xsl:when test="$note/@dur = 64"></xsl:when>
            </xsl:choose>
        </xsl:variable>
        <xsl:variable name="pitch" select="concat(upper-case($note/@pname),$accid,$note/@oct, if($lang = 'de') then(concat(' | ',local:getGermanPitch($note/@oct,$note/@pname,$note//@accid))) else())" as="xs:string"/>
        <xsl:variable name="stateDesc" select="local:getStateDesc($note)" as="xs:string"/>
        <xsl:variable name="is.supplied" select="exists($note/ancestor::mei:supplied)" as="xs:boolean"/>
        <xsl:variable name="is.nclear" select="exists($note/ancestor::mei:unclear)" as="xs:boolean"/>
        <xsl:value-of select="concat('{&#34;type&#34;:&#34;note&#34;,',             '&#34;id&#34;:&#34;',$note/@xml:id,'&#34;,',             '&#34;stateDesc&#34;:&#34;',$stateDesc,'&#34;,',             '&#34;measure&#34;:&#34;',local:getMeasure($note),'&#34;,',             '&#34;position&#34;:&#34;',local:qualifyPosition($note),'&#34;,',             '&#34;bravura&#34;:&#34;',$dur,$dotted,'&#34;,',             '&#34;desc&#34;:&#34;',$pitch,'&#34;}')"/>
    </xsl:function>
    
    <!-- this function processes chords. For pitches, it calls local:processNote -->
    <xsl:function name="local:processChord" as="xs:string">
        <xsl:param name="chord" required="yes" as="node()"/>
        <xsl:variable name="dotted" as="xs:string*">
            <xsl:choose>
                <xsl:when test="not($chord/@dots)"/>
                <xsl:when test="$chord/@dots = '1'">
                    <xsl:value-of select="local:getLocal('dots.1')"/>
                </xsl:when>
                <xsl:when test="$chord/@dots = '2'">
                    <xsl:value-of select="local:getLocal('dots.2')"/>
                </xsl:when>
                <xsl:when test="$chord/@dots = '3'">
                    <xsl:value-of select="local:getLocal('dots.3')"/>
                </xsl:when>
            </xsl:choose>
        </xsl:variable>
        <xsl:variable name="dur" as="xs:string">
            <xsl:choose>
                <xsl:when test="$chord/@dur = 1">
                    <xsl:value-of select="local:getLocal('dur.1')"/>
                </xsl:when>
                <xsl:when test="$chord/@dur = 2">
                    <xsl:value-of select="local:getLocal('dur.2')"/>
                </xsl:when>
                <xsl:when test="$chord/@dur = 4">
                    <xsl:value-of select="local:getLocal('dur.4')"/>
                </xsl:when>
                <xsl:when test="$chord/@dur = 8">
                    <xsl:value-of select="local:getLocal('dur.8')"/>
                </xsl:when>
                <xsl:when test="$chord/@dur = 16">
                    <xsl:value-of select="local:getLocal('dur.16')"/>
                </xsl:when>
                <xsl:when test="$chord/@dur = 32">
                    <xsl:value-of select="local:getLocal('dur.32')"/>
                </xsl:when>
                <xsl:when test="$chord/@dur = 64">
                    <xsl:value-of select="local:getLocal('dur.64')"/>
                </xsl:when>
            </xsl:choose>
        </xsl:variable>
        <xsl:variable name="pitches" as="xs:string*">
            <xsl:for-each select="$chord/mei:note">
                <xsl:value-of select="concat(upper-case(@pname),@oct)"/>
            </xsl:for-each>
        </xsl:variable>
        <xsl:variable name="stateDesc" select="local:getStateDesc($chord)" as="xs:string"/>
        <xsl:variable name="is.supplied" select="exists($chord/ancestor::mei:supplied)" as="xs:boolean"/>
        <xsl:variable name="is.nclear" select="exists($chord/ancestor::mei:unclear)" as="xs:boolean"/>
        <xsl:value-of select="concat('{&#34;type&#34;:&#34;chord&#34;,',             '&#34;id&#34;:&#34;',$chord/@xml:id,'&#34;,',             '&#34;stateDesc&#34;:&#34;',$stateDesc,'&#34;,',             '&#34;bravura&#34;:&#34;&#34;,',             '&#34;measure&#34;:&#34;',local:getMeasure($chord),'&#34;,',             '&#34;position&#34;:&#34;',local:qualifyPosition($chord),'&#34;,',             '&#34;desc&#34;:&#34;',$dotted,' ',local:getLocal('chord'),' ',$dur,' ',string-join($pitches,', '),'&#34;}')"/>
    </xsl:function>
    
    <!-- this function more or less only says it's a beam… -->
    <xsl:function name="local:processBeam" as="xs:string">
        <xsl:param name="beam" required="yes" as="node()"/>
        <xsl:variable name="stateDesc" select="local:getStateDesc($beam)" as="xs:string"/>
        <xsl:variable name="is.supplied" select="exists($beam/ancestor::mei:supplied)" as="xs:boolean"/>
        <xsl:variable name="is.nclear" select="exists($beam/ancestor::mei:unclear)" as="xs:boolean"/>
        <xsl:value-of select="concat('{&#34;type&#34;:&#34;beam&#34;,',             '&#34;id&#34;:&#34;',$beam/@xml:id,'&#34;,',             '&#34;stateDesc&#34;:&#34;',$stateDesc,'&#34;,',             '&#34;bravura&#34;:&#34;&#34;,',             '&#34;measure&#34;:&#34;',local:getMeasure($beam),'&#34;,',             '&#34;position&#34;:&#34;',local:qualifyPosition($beam),'&#34;,',             '&#34;desc&#34;:&#34;',local:getLocal('beam'),'&#34;}')"/>
    </xsl:function>
    
    <!-- this function more or less only says it's a deletion… -->
    <xsl:function name="local:processDel" as="xs:string">
        <xsl:param name="del" required="yes" as="node()"/>
        <xsl:variable name="changeState" select="if($del/@changeState) then($del/@changeState) else($del/parent::mei:subst/@changeState)" as="xs:string"/>
        <xsl:variable name="stateLabel" select="$del/root()/id(replace($changeState,'#',''))/@label" as="xs:string"/>
        <xsl:value-of select="concat('{&#34;type&#34;:&#34;del&#34;,',             '&#34;id&#34;:&#34;',$del/@xml:id,'&#34;,',             '&#34;stateDesc&#34;:&#34;&#34;,',             '&#34;bravura&#34;:&#34;&#34;,',             '&#34;measure&#34;:&#34;',local:getMeasure($del),'&#34;,',             '&#34;position&#34;:&#34;',local:qualifyPosition($del),'&#34;,',             '&#34;desc&#34;:&#34;',local:getLocal('deletionIn'),' ',$stateLabel,'&#34;}')"/>
    </xsl:function>
    
    <!-- this function processes accidentals. It uses SMuFL code points for musical symbols,
        which may not show up here in a meaningful way. Refer to http://www.smufl.org/version/latest/
        for additional information. -->
    <xsl:function name="local:processAccid" as="xs:string">
        <xsl:param name="accid" required="yes" as="node()"/>
        <xsl:variable name="bravura" as="xs:string">
            <xsl:choose>
                <xsl:when test="$accid/@accid = 's'"></xsl:when>
                <xsl:when test="$accid/@accid = 'f'"></xsl:when>
                <xsl:when test="$accid/@accid = 'n'"></xsl:when>
                <xsl:when test="$accid/@accid = 'ss'"></xsl:when>
                <xsl:when test="$accid/@accid = 'ff'"></xsl:when>
                <xsl:when test="$accid/@accid = 'x'"></xsl:when>
            </xsl:choose>
        </xsl:variable>
        <xsl:variable name="stateDesc" select="local:getStateDesc($accid)" as="xs:string"/>
        <xsl:variable name="is.supplied" select="exists($accid/ancestor::mei:supplied)" as="xs:boolean"/>
        <xsl:variable name="is.nclear" select="exists($accid/ancestor::mei:unclear)" as="xs:boolean"/>
        <xsl:value-of select="concat('{&#34;type&#34;:&#34;accid&#34;,',             '&#34;id&#34;:&#34;',$accid/@xml:id,'&#34;,',             '&#34;stateDesc&#34;:&#34;',$stateDesc,'&#34;,',             '&#34;bravura&#34;:&#34;',$bravura,'&#34;,',             '&#34;measure&#34;:&#34;',local:getMeasure($accid),'&#34;,',             '&#34;position&#34;:&#34;',local:qualifyPosition($accid),'&#34;,',             '&#34;desc&#34;:&#34;',local:getLocal('accidental'),'&#34;}')"/>
    </xsl:function>
    
    <!-- this function processes rests. It uses SMuFL code points for musical symbols,
        which may not show up here in a meaningful way. Refer to http://www.smufl.org/version/latest/
        for additional information. -->
    <xsl:function name="local:processRest" as="xs:string">
        <xsl:param name="rest" required="yes" as="node()"/>
        <xsl:variable name="dotted" as="xs:string?">
            <xsl:choose>
                <xsl:when test="not($rest/@dots)"/>
                <xsl:when test="$rest/@dots = '1'"></xsl:when>
                <xsl:when test="$rest/@dots = '2'"></xsl:when>
                <xsl:when test="$rest/@dots = '3'"></xsl:when>
            </xsl:choose>
        </xsl:variable>
        <xsl:variable name="dur" as="xs:string">
            <xsl:choose>
                <xsl:when test="$rest/@dur = 1"></xsl:when>
                <xsl:when test="$rest/@dur = 2"></xsl:when>
                <xsl:when test="$rest/@dur = 4"></xsl:when>
                <xsl:when test="$rest/@dur = 8"></xsl:when>
                <xsl:when test="$rest/@dur = 16"></xsl:when>
                <xsl:when test="$rest/@dur = 32"></xsl:when>
                <xsl:when test="$rest/@dur = 64"></xsl:when>
            </xsl:choose>
        </xsl:variable>
        <xsl:variable name="stateDesc" select="local:getStateDesc($rest)" as="xs:string"/>
        <xsl:variable name="is.supplied" select="exists($rest/ancestor::mei:supplied)" as="xs:boolean"/>
        <xsl:variable name="is.nclear" select="exists($rest/ancestor::mei:unclear)" as="xs:boolean"/>
        <xsl:value-of select="concat('{&#34;type&#34;:&#34;rest&#34;,',             '&#34;id&#34;:&#34;',$rest/@xml:id,'&#34;,',             '&#34;stateDesc&#34;:&#34;',$stateDesc,'&#34;,',             '&#34;bravura&#34;:&#34;',$dur,$dotted,'&#34;,',             '&#34;measure&#34;:&#34;',local:getMeasure($rest),'&#34;,',             '&#34;position&#34;:&#34;',local:qualifyPosition($rest),'&#34;,',             '&#34;desc&#34;:&#34;&#34;}')"/>
    </xsl:function>
    
    <!-- this function processes clefs. It uses SMuFL code points for musical symbols,
        which may not show up here in a meaningful way. Refer to http://www.smufl.org/version/latest/
        for additional information. -->
    <xsl:function name="local:processClef" as="xs:string">
        <xsl:param name="clef" required="yes" as="node()"/>
        <xsl:variable name="bravura" as="xs:string">
            <xsl:choose>
                <xsl:when test="$clef/@shape = 'F'"></xsl:when>
                <xsl:when test="$clef/@shape = 'C'"></xsl:when>
                <xsl:when test="$clef/@shape = 'G'"></xsl:when>
            </xsl:choose>
        </xsl:variable>
        <xsl:variable name="stateDesc" select="local:getStateDesc($clef)" as="xs:string"/>
        <xsl:variable name="is.supplied" select="exists($clef/ancestor::mei:supplied)" as="xs:boolean"/>
        <xsl:variable name="is.nclear" select="exists($clef/ancestor::mei:unclear)" as="xs:boolean"/>
        <xsl:value-of select="concat('{&#34;type&#34;:&#34;clef&#34;,',             '&#34;id&#34;:&#34;',$clef/@xml:id,'&#34;,',             '&#34;stateDesc&#34;:&#34;',$stateDesc,'&#34;,',             '&#34;bravura&#34;:&#34;',$bravura,'&#34;,',             '&#34;measure&#34;:&#34;',local:getMeasure($clef),'&#34;,',             '&#34;position&#34;:&#34;',local:qualifyPosition($clef),'&#34;,',             '&#34;desc&#34;:&#34;',$clef/@shape,local:getLocal('clef.combined'),'&#34;}')"/>
    </xsl:function>
    
    <!-- this function more or less only gets the text content of a directive… -->
    <xsl:function name="local:processDir" as="xs:string">
        <xsl:param name="dir" required="yes" as="node()"/>
        <xsl:variable name="stateDesc" select="local:getStateDesc($dir)" as="xs:string"/>
        <xsl:variable name="is.supplied" select="exists($dir/ancestor::mei:supplied)" as="xs:boolean"/>
        <xsl:variable name="is.nclear" select="exists($dir/ancestor::mei:unclear)" as="xs:boolean"/>
        <xsl:value-of select="concat('{&#34;type&#34;:&#34;dir&#34;,',             '&#34;id&#34;:&#34;',$dir/@xml:id,'&#34;,',             '&#34;stateDesc&#34;:&#34;',$stateDesc,'&#34;,',              '&#34;bravura&#34;:&#34;&#34;,',               '&#34;measure&#34;:&#34;',local:getMeasure($dir),'&#34;,',              '&#34;position&#34;:&#34;',local:qualifyPosition($dir),'&#34;,',             '&#34;desc&#34;:&#34;',local:getLocal('directive'),' ',string-join($dir//text(),' '),'&#34;}')"/>
    </xsl:function>
    
    <!-- this function processes octave statements. It uses SMuFL code points for musical symbols,
        which may not show up here in a meaningful way. Refer to http://www.smufl.org/version/latest/
        for additional information. -->
    <xsl:function name="local:processOctave" as="xs:string">
        <xsl:param name="octave" required="yes" as="node()"/>
        <xsl:variable name="bravura" as="xs:string">
            <xsl:choose>
                <xsl:when test="$octave/@dis = '8' and $octave/@dis.place = 'above'"></xsl:when>
                <xsl:when test="$octave/@dis = '8' and $octave/@dis.place = 'below'"></xsl:when>
                <xsl:when test="$octave/@dis = '15' and $octave/@dis.place = 'above'"></xsl:when>
                <xsl:when test="$octave/@dis = '15' and $octave/@dis.place = 'below'"></xsl:when>
                <xsl:otherwise>
                    <xsl:value-of select="''"/>
                </xsl:otherwise>
            </xsl:choose>
        </xsl:variable>
        <xsl:variable name="stateDesc" select="local:getStateDesc($octave)" as="xs:string"/>
        <xsl:variable name="is.supplied" select="exists($octave/ancestor::mei:supplied)" as="xs:boolean"/>
        <xsl:variable name="is.nclear" select="exists($octave/ancestor::mei:unclear)" as="xs:boolean"/>
        <xsl:value-of select="concat('{&#34;type&#34;:&#34;octave&#34;,',             '&#34;id&#34;:&#34;',$octave/@xml:id,'&#34;,',             '&#34;stateDesc&#34;:&#34;',$stateDesc,'&#34;,',             '&#34;bravura&#34;:&#34;',$bravura,'&#34;,',             '&#34;measure&#34;:&#34;',local:getMeasure($octave),'&#34;,',             '&#34;position&#34;:&#34;',local:qualifyPosition($octave),'&#34;,',             '&#34;desc&#34;:&#34;',local:getLocal('octave.dir'),'&#34;}')"/>
    </xsl:function>
    
    <!-- this function describes the range of a slur… -->
    <xsl:function name="local:processSlur" as="xs:string">
        <xsl:param name="slur" required="yes" as="node()"/>
        <xsl:variable name="stateDesc" select="local:getStateDesc($slur)" as="xs:string"/>
        <xsl:variable name="endLabel" as="xs:string">
            <xsl:choose>
                <xsl:when test="starts-with($slur/@tstamp2,'0m')">
                    <xsl:value-of select="concat(' ', local:getLocal('endingAtTstamp',substring-after($slur/@tstamp2,'0m+')))"/>
                </xsl:when>
                <xsl:when test="starts-with($slur/@tstamp2,'1m')">
                    <xsl:value-of select="concat(' ', local:getLocal('endingAtTstampOfNextMeasure',substring-after($slur/@tstamp2,'1m+')))"/>
                </xsl:when>
                <xsl:otherwise>
                    <xsl:value-of select="concat(' ',local:getLocal('endingAtTstampOfNextMeasure',local:getOrdinal(substring-before($slur/@tstamp2,'m+')),substring-after($slur/@tstamp2,'1m+')))"/>
                </xsl:otherwise>
            </xsl:choose>
        </xsl:variable>
        <xsl:variable name="is.supplied" select="exists($slur/ancestor::mei:supplied)" as="xs:boolean"/>
        <xsl:variable name="is.nclear" select="exists($slur/ancestor::mei:unclear)" as="xs:boolean"/>
        <xsl:value-of select="concat('{&#34;type&#34;:&#34;slur&#34;,',             '&#34;id&#34;:&#34;',$slur/@xml:id,'&#34;,',             '&#34;stateDesc&#34;:&#34;',$stateDesc,'&#34;,',             '&#34;bravura&#34;:&#34;&#34;,',             '&#34;measure&#34;:&#34;',local:getMeasure($slur),'&#34;,',             '&#34;position&#34;:&#34;',local:qualifyPosition($slur),'&#34;,',             '&#34;desc&#34;:&#34;',local:getLocal('slur'),' ',local:getLocal('startingAtTstamp',$slur/@tstamp),' ',$endLabel,'&#34;}')"/>
    </xsl:function>
    
    <!-- this function describes the range of a tie… -->
    <xsl:function name="local:processTie" as="xs:string">
        <xsl:param name="tie" required="yes" as="node()"/>
        <xsl:variable name="stateDesc" select="local:getStateDesc($tie)" as="xs:string"/>
        <xsl:variable name="endLabel" as="xs:string">
            <xsl:choose>
                <xsl:when test="starts-with($tie/@tstamp2,'0m')">
                    <xsl:value-of select="concat(' ', local:getLocal('endingAtTstamp',substring-after($tie/@tstamp2,'0m+')))"/>
                </xsl:when>
                <xsl:when test="starts-with($tie/@tstamp2,'1m')">
                    <xsl:value-of select="concat(' ', local:getLocal('endingAtTstampOfNextMeasure',substring-after($tie/@tstamp2,'1m+')))"/>
                </xsl:when>
                <xsl:otherwise>
                    <xsl:value-of select="concat(' ',local:getLocal('endingAtTstampOfNextMeasure',local:getOrdinal(substring-before($tie/@tstamp2,'m+')),substring-after($tie/@tstamp2,'1m+')))"/>
                </xsl:otherwise>
            </xsl:choose>
        </xsl:variable>
        <xsl:variable name="is.supplied" select="exists($tie/ancestor::mei:supplied)" as="xs:boolean"/>
        <xsl:variable name="is.nclear" select="exists($tie/ancestor::mei:unclear)" as="xs:boolean"/>
        <xsl:value-of select="concat('{&#34;type&#34;:&#34;tie&#34;,',             '&#34;id&#34;:&#34;',$tie/@xml:id,'&#34;,',             '&#34;stateDesc&#34;:&#34;',$stateDesc,'&#34;,',             '&#34;bravura&#34;:&#34;&#34;,',             '&#34;measure&#34;:&#34;',local:getMeasure($tie),'&#34;,',             '&#34;position&#34;:&#34;',local:qualifyPosition($tie),'&#34;,',             '&#34;desc&#34;:&#34;',local:getLocal('tie'),' ',local:getLocal('startingAtTstamp',$tie/@tstamp),' ',$endLabel,'&#34;}')"/>
    </xsl:function>
    
    <!-- this function more or less only gets the text content of the dynam… -->
    <xsl:function name="local:processDynam" as="xs:string">
        <xsl:param name="dynam" required="yes" as="node()"/>
        <xsl:variable name="stateDesc" select="local:getStateDesc($dynam)" as="xs:string"/>
        <xsl:variable name="is.supplied" select="exists($dynam/ancestor::mei:supplied)" as="xs:boolean"/>
        <xsl:variable name="is.nclear" select="exists($dynam/ancestor::mei:unclear)" as="xs:boolean"/>
        <xsl:value-of select="concat('{&#34;type&#34;:&#34;dynam&#34;,',             '&#34;id&#34;:&#34;',$dynam/@xml:id,'&#34;,',             '&#34;stateDesc&#34;:&#34;',$stateDesc,'&#34;,',              '&#34;bravura&#34;:&#34;&#34;,',             '&#34;measure&#34;:&#34;',local:getMeasure($dynam),'&#34;,',             '&#34;position&#34;:&#34;',local:qualifyPosition($dynam),'&#34;,',             '&#34;desc&#34;:&#34;',local:getLocal('dynamic.dir'),' ',string-join($dynam//text(),' '),'&#34;}')"/>
    </xsl:function>
    
    <!-- this function describes a hairpin -->
    <xsl:function name="local:processHairpin" as="xs:string">
        <xsl:param name="hairpin" required="yes" as="node()"/>
        <xsl:variable name="stateDesc" select="local:getStateDesc($hairpin)" as="xs:string"/>
        <xsl:variable name="desc" as="xs:string">
            <xsl:choose>
                <xsl:when test="$hairpin/@form = 'dim'">
                    <xsl:value-of select="local:getLocal('hairpin.dim')"/>
                </xsl:when>
                <xsl:otherwise>
                    <xsl:value-of select="local:getLocal('hairpin.cres')"/>
                </xsl:otherwise>
            </xsl:choose>
        </xsl:variable>
        <xsl:variable name="endLabel" as="xs:string">
            <xsl:choose>
                <xsl:when test="starts-with($hairpin/@tstamp2,'0m')">
                    <xsl:value-of select="concat(' ', local:getLocal('endingAtTstamp',substring-after($hairpin/@tstamp2,'0m+')))"/>
                </xsl:when>
                <xsl:when test="starts-with($hairpin/@tstamp2,'1m')">
                    <xsl:value-of select="concat(' ', local:getLocal('endingAtTstampOfNextMeasure',substring-after($hairpin/@tstamp2,'1m+')))"/>
                </xsl:when>
                <xsl:otherwise>
                    <xsl:value-of select="concat(' ',local:getLocal('endingAtTstampOfNextMeasure',local:getOrdinal(substring-before($hairpin/@tstamp2,'m+')),substring-after($hairpin/@tstamp2,'1m+')))"/>
                </xsl:otherwise>
            </xsl:choose>
        </xsl:variable>
        <xsl:variable name="is.supplied" select="exists($hairpin/ancestor::mei:supplied)" as="xs:boolean"/>
        <xsl:variable name="is.nclear" select="exists($hairpin/ancestor::mei:unclear)" as="xs:boolean"/>
        <xsl:value-of select="concat('{&#34;type&#34;:&#34;hairpin&#34;,',             '&#34;id&#34;:&#34;',$hairpin/@xml:id,'&#34;,',             '&#34;stateDesc&#34;:&#34;',$stateDesc,'&#34;,',             '&#34;bravura&#34;:&#34;&#34;,',             '&#34;measure&#34;:&#34;',local:getMeasure($hairpin),'&#34;,',             '&#34;position&#34;:&#34;',local:qualifyPosition($hairpin),'&#34;,',             '&#34;desc&#34;:&#34;',$desc,' ',local:getLocal('startingAtTstamp',$hairpin/@tstamp),' ',$endLabel,'&#34;}')"/>
    </xsl:function>
    
    <!-- this function more or less only gets the text content of the artic… -->
    <xsl:function name="local:processArtic" as="xs:string">
        <xsl:param name="artic" required="yes" as="node()"/>
        <xsl:variable name="stateDesc" select="local:getStateDesc($artic)" as="xs:string"/>
        <xsl:variable name="desc" as="xs:string">
            <xsl:choose>
                <xsl:when test="$artic/@artic = 'dot'">
                    <xsl:value-of select="local:getLocal('artic.dot')"/>
                </xsl:when>
                <xsl:otherwise>
                    <xsl:value-of select="local:getLocal('artic',string($artic/@artic))"/>
                </xsl:otherwise>
            </xsl:choose>
        </xsl:variable>
        <xsl:variable name="is.supplied" select="exists($artic/ancestor::mei:supplied)" as="xs:boolean"/>
        <xsl:variable name="is.nclear" select="exists($artic/ancestor::mei:unclear)" as="xs:boolean"/>
        <xsl:value-of select="concat('{&#34;type&#34;:&#34;artic&#34;,',             '&#34;id&#34;:&#34;',$artic/@xml:id,'&#34;,',             '&#34;stateDesc&#34;:&#34;',$stateDesc,'&#34;,',             '&#34;bravura&#34;:&#34;&#34;,',             '&#34;measure&#34;:&#34;',local:getMeasure($artic),'&#34;,',             '&#34;position&#34;:&#34;',local:qualifyPosition($artic),'&#34;,',             '&#34;desc&#34;:&#34;',$desc,'&#34;}')"/>
    </xsl:function>
    
    <!-- this function deals with various metamarks -->
    <xsl:function name="local:processMetaMark" as="xs:string">
        <xsl:param name="metaMark" required="yes" as="node()"/>
        <xsl:variable name="function">
            <xsl:choose>
                <xsl:when test="$metaMark/@function = 'navigation'">
                    <xsl:choose>
                        <xsl:when test="$metaMark/@target">
                            <xsl:value-of select="local:getLocal('link.origin')"/>
                        </xsl:when>
                        <xsl:otherwise>
                            <xsl:value-of select="local:getLocal('link.target')"/>
                        </xsl:otherwise>
                    </xsl:choose>
                </xsl:when>
                <xsl:when test="$metaMark/@function = 'confirmation'">
                    <xsl:variable name="target" select="$metaMark/root()/id($metaMark/replace(@target,'#',''))" as="node()"/>
                    <xsl:variable name="typeString" as="xs:string">
                        <xsl:choose>
                            <xsl:when test="local-name($target) = 'del'">
                                <xsl:value-of select="local:getLocal('confirmation.deletion')"/>
                            </xsl:when>
                            <xsl:when test="local-name($target) = 'restore'">
                                <xsl:value-of select="local:getLocal('confirmation.restore')"/>
                            </xsl:when>
                            <xsl:otherwise>
                                <xsl:value-of select="''"/>
                            </xsl:otherwise>
                        </xsl:choose>
                    </xsl:variable>
                    <xsl:value-of select="concat(local:getLocal('confirmation'),$typeString)"/>
                </xsl:when>
                <xsl:when test="$metaMark/@function = 'clarification'">
                    <xsl:choose>
                        <xsl:when test="$metaMark//text()">
                            <xsl:value-of select="local:getLocal('clarification',string-join($metaMark//text(),' '))"/>
                        </xsl:when>
                        <xsl:when test="$metaMark/@target">
                            <xsl:variable name="target" select="$doc/id(substring-after($metaMark/@target,'#'))" as="node()"/>
                            <xsl:value-of select="local:getLocal('clarification',local:getLocal(local-name($target)))"/>
                        </xsl:when>
                    </xsl:choose>
                </xsl:when>
                <xsl:when test="$metaMark/@function = 'restoration'">
                    <xsl:value-of select="local:getLocal('restoration',string-join($metaMark//text(),' '))"/>
                </xsl:when>
                <xsl:when test="$metaMark/@function = 'deletion'">
                    <xsl:value-of select="local:getLocal('deletion.text',string-join($metaMark//text(),' '))"/>
                </xsl:when>
            </xsl:choose>
        </xsl:variable>
        <xsl:variable name="stateDesc" select="local:getStateDesc($metaMark)" as="xs:string"/>
        <xsl:variable name="target" as="xs:string">
            <xsl:choose>
                <xsl:when test="$metaMark/@function = 'navigation' and $metaMark/@target">
                    <xsl:value-of select="replace($metaMark/@target,'#','')"/>
                </xsl:when>
                <xsl:when test="$metaMark/@function = 'navigation' and not($metaMark/@target)">
                    <xsl:variable name="start" select="$metaMark/root()//mei:metaMark[replace(@target,'#','') = $metaMark/@xml:id][1]"/>
                    <xsl:value-of select="$start/@xml:id"/>
                </xsl:when>
                <xsl:otherwise>
                    <xsl:value-of select="''"/>
                </xsl:otherwise>
            </xsl:choose>
        </xsl:variable>
        <xsl:variable name="is.supplied" select="exists($metaMark/ancestor::mei:supplied)" as="xs:boolean"/>
        <xsl:variable name="is.nclear" select="exists($metaMark/ancestor::mei:unclear)" as="xs:boolean"/>
        <xsl:value-of select="concat('{&#34;type&#34;:&#34;metaMark&#34;,',             '&#34;id&#34;:&#34;',$metaMark/@xml:id,'&#34;,',             '&#34;stateDesc&#34;:&#34;',$stateDesc,'&#34;,',             '&#34;bravura&#34;:&#34;&#34;,',             '&#34;measure&#34;:&#34;',local:getMeasure($metaMark),'&#34;,',             '&#34;position&#34;:&#34;',local:qualifyPosition($metaMark),'&#34;,',             '&#34;target&#34;:&#34;',$target,'&#34;,',             '&#34;desc&#34;:&#34;',$function,'&#34;}')"/>
    </xsl:function>
    
    <!-- this function more or less only gets the text content of the cpMark… -->
    <xsl:function name="local:processCpMark" as="xs:string">
        <xsl:param name="cpMark" required="yes" as="node()"/>
        <xsl:variable name="stateDesc" select="local:getStateDesc($cpMark)" as="xs:string"/>
        <xsl:variable name="desc" as="xs:string">
            <xsl:choose>
                <xsl:when test="$cpMark/@ref.staff">
                    <xsl:variable name="other.staff" select="($doc//mei:staffDef[@n = $cpMark/@ref.staff])[1]/@label" as="xs:string"/>
                    <xsl:variable name="startLabel" select="local:getLocal('startingAtTstamp',$cpMark/@tstamp)" as="xs:string"/>
                    <xsl:variable name="endLabel" as="xs:string">
                        <xsl:choose>
                            <xsl:when test="starts-with($cpMark/@tstamp2,'0m')">
                                <xsl:value-of select="concat(' ', local:getLocal('endingAtTstamp',substring-after($cpMark/@tstamp2,'0m+')))"/>
                            </xsl:when>
                            <xsl:when test="starts-with($cpMark/@tstamp2,'1m')">
                                <xsl:value-of select="concat(' ', local:getLocal('endingAtTstampOfNextMeasure',substring-after($cpMark/@tstamp2,'1m+')))"/>
                            </xsl:when>
                            <xsl:otherwise>
                                <xsl:value-of select="concat(' ',local:getLocal('endingAtTstampOfNextMeasure',local:getOrdinal(substring-before($cpMark/@tstamp2,'m+')),substring-after($cpMark/@tstamp2,'1m+')))"/>
                            </xsl:otherwise>
                        </xsl:choose>
                    </xsl:variable>
                    <xsl:value-of select="local:getLocal('cpMark.collaParte',$other.staff,$startLabel,$endLabel,if($cpMark/@dis) then(local:getLocal('in8va')) else(''))"/>
                </xsl:when>
                <xsl:otherwise>
                    <xsl:value-of select="local:getLocal('cpMark')"/>
                </xsl:otherwise>
            </xsl:choose>
        </xsl:variable>
        <xsl:variable name="is.supplied" select="exists($cpMark/ancestor::mei:supplied)" as="xs:boolean"/>
        <xsl:variable name="is.nclear" select="exists($cpMark/ancestor::mei:unclear)" as="xs:boolean"/>
        <xsl:value-of select="concat('{&#34;type&#34;:&#34;cpMark&#34;,',             '&#34;id&#34;:&#34;',$cpMark/@xml:id,'&#34;,',             '&#34;stateDesc&#34;:&#34;',$stateDesc,'&#34;,',             '&#34;bravura&#34;:&#34;&#34;,',             '&#34;measure&#34;:&#34;',local:getMeasure($cpMark),'&#34;,',             '&#34;position&#34;:&#34;',local:qualifyPosition($cpMark),'&#34;,',             '&#34;desc&#34;:&#34;',$desc,'&#34;}')"/>
    </xsl:function>
    
    <!-- this function addresses barlines -->
    <xsl:function name="local:processBarline" as="xs:string">
        <xsl:param name="first.measure" required="yes" as="node()"/>
        <xsl:param name="all.measures" required="yes" as="node()+"/>
        <xsl:param name="clicked.svg.id" required="yes" as="xs:string"/>
        <xsl:variable name="stateDesc" select="''" as="xs:string"/>
        <xsl:variable name="desc" as="xs:string">
            <xsl:choose>
                <xsl:when test="count($all.measures) = 1">
                    <xsl:value-of select="local:getLocal('barline.atMeasure',$first.measure/@label)"/>
                </xsl:when>
                <xsl:when test="count($all.measures) = 2">
                    <xsl:variable name="measures.sorted" select="($doc//mei:measure[@xml:id = $all.measures/@xml:id])" as="node()+"/>
                    <xsl:value-of select="local:getLocal('barline.betweenMeasures',$measures.sorted[1]/@label,$measures.sorted[2]/@label)"/>
                </xsl:when>
                <xsl:otherwise>
                    <xsl:value-of select="''"/>
                </xsl:otherwise>
            </xsl:choose>
        </xsl:variable>
        <xsl:variable name="all.svgs" select="tokenize(replace($first.measure/@facs,'#',''),' ')[. != $doc//mei:zone/@xml:id]" as="xs:string+"/>
        <xsl:variable name="svgIDs" as="xs:string+">
            <xsl:choose>
                <xsl:when test="count($all.measures) = 1">
                    <xsl:sequence select="$all.svgs"/>
                </xsl:when>
                <xsl:when test="count($all.measures) = 2">
                    <xsl:sequence select="$all.svgs[. = tokenize(replace($all.measures[2]/@facs,'#',''),' ')]"/>
                </xsl:when>
            </xsl:choose>
        </xsl:variable>
        <xsl:value-of select="concat('{&#34;type&#34;:&#34;barline&#34;,',             '&#34;id&#34;:&#34;',$first.measure/@xml:id,'&#34;,',             '&#34;svgIDs&#34;:[&#34;',string-join($svgIDs,'&#34;,&#34;'),'&#34;],',             '&#34;stateDesc&#34;:&#34;',$stateDesc,'&#34;,',             '&#34;bravura&#34;:&#34;&#34;,',             '&#34;measure&#34;:&#34;','&#34;,',             '&#34;position&#34;:&#34;','&#34;,',             '&#34;desc&#34;:&#34;',$desc,'&#34;}')"/>
    </xsl:function>
    
    <!-- @id of the element in question -->
    <xsl:param name="element.id" required="yes"/>
    <xsl:param name="lang" required="yes" as="xs:string"/>
    <xsl:variable name="elem.id" select="$element.id"/>
    <xsl:variable name="langDoc" select="doc('/db/apps/exist-module/resources/i18n/i18n.xml')" as="node()"/>
    <xsl:variable name="doc" select="/" as="node()"/>
    
    <!-- start processing -->
    <xsl:template match="/">
        <xsl:variable name="elems" as="node()*">
            <xsl:choose>
                <xsl:when test="//svg:path[@id = $elem.id]">
                    <!-- gets all MEI elements that reference this particular svg path -->
                    <xsl:sequence select="//mei:*[concat('#',$elem.id) = tokenize(@facs,' ')]"/>
                </xsl:when>
                <xsl:when test="//mei:*[@xml:id = $elem.id]">
                    <!-- get the MEI element itself -->
                    <xsl:sequence select="//mei:*[@xml:id = $elem.id]"/>
                </xsl:when>
            </xsl:choose>
        </xsl:variable>
        
        <!-- based on the local-name() of the MEI element, decide how to process it -->
        <xsl:variable name="strings" as="xs:string*">
            <xsl:for-each select="$elems">
                <xsl:choose>
                    <xsl:when test="local-name(.) = 'metaMark'">
                        <xsl:value-of select="local:processMetaMark(.)"/>
                    </xsl:when>
                    <xsl:when test="local-name(.) = 'rend' and ancestor::mei:metaMark">
                        <xsl:value-of select="local:processMetaMark(ancestor::mei:metaMark[1])"/>
                    </xsl:when>
                    <xsl:when test="local-name(.) = 'del'">
                        <xsl:value-of select="local:processDel(.)"/>
                    </xsl:when>
                    <xsl:when test="local-name(.) = 'beam'">
                        <xsl:value-of select="local:processBeam(.)"/>
                    </xsl:when>
                    <xsl:when test="local-name(.) = 'note'">
                        <xsl:value-of select="local:processNote(.)"/>
                    </xsl:when>
                    <xsl:when test="local-name(.) = 'accid'">
                        <xsl:value-of select="local:processAccid(.)"/>
                    </xsl:when>
                    <xsl:when test="local-name(.) = 'dir'">
                        <xsl:value-of select="local:processDir(.)"/>
                    </xsl:when>
                    <xsl:when test="local-name(.) = 'octave'">
                        <xsl:value-of select="local:processOctave(.)"/>
                    </xsl:when>
                    <xsl:when test="local-name(.) = 'chord'">
                        <xsl:value-of select="local:processChord(.)"/>
                    </xsl:when>
                    <xsl:when test="local-name(.) = 'rest'">
                        <xsl:value-of select="local:processRest(.)"/>
                    </xsl:when>
                    <xsl:when test="local-name(.) = 'clef'">
                        <xsl:value-of select="local:processClef(.)"/>
                    </xsl:when>
                    <xsl:when test="local-name(.) = 'slur'">
                        <xsl:value-of select="local:processSlur(.)"/>
                    </xsl:when>
                    <xsl:when test="local-name(.) = 'tie'">
                        <xsl:value-of select="local:processTie(.)"/>
                    </xsl:when>
                    <xsl:when test="local-name(.) = 'beamSpan'">
                        <xsl:value-of select="local:processBeam(.)"/>
                    </xsl:when>
                    <xsl:when test="local-name(.) = 'dynam'">
                        <xsl:value-of select="local:processDynam(.)"/>
                    </xsl:when>
                    <xsl:when test="local-name(.) = 'hairpin'">
                        <xsl:value-of select="local:processHairpin(.)"/>
                    </xsl:when>
                    <xsl:when test="local-name(.) = 'artic'">
                        <xsl:value-of select="local:processArtic(.)"/>
                    </xsl:when>
                    <xsl:when test="local-name(.) = 'cpMark'">
                        <xsl:value-of select="local:processCpMark(.)"/>
                    </xsl:when>
                    <xsl:when test="local-name(.) = 'measure'">
                        <xsl:value-of select="local:processBarline(.,$elems,$elem.id)"/>
                    </xsl:when>
                    <xsl:otherwise>
                        <xsl:value-of select="''"/>
                    </xsl:otherwise>
                </xsl:choose>
            </xsl:for-each>
        </xsl:variable>
        
        <!-- wrap everything in a JSON array and return it -->
        <xsl:value-of select="concat('[',string-join($strings,','),']')"/>
    </xsl:template>
</xsl:stylesheet>