<?xml version="1.0" encoding="UTF-8"?>
<xsl:stylesheet xmlns:xsl="http://www.w3.org/1999/XSL/Transform" xmlns:mei="http://www.music-encoding.org/ns/mei" xmlns:math="http://www.w3.org/2005/xpath-functions/math" xmlns:xs="http://www.w3.org/2001/XMLSchema" xmlns:xd="http://www.oxygenxml.com/ns/doc/xsl" exclude-result-prefixes="xs xd math mei" version="3.0">
    <xd:doc scope="stylesheet">
        <xd:desc>
            <xd:p>
                <xd:b>Created on:</xd:b> Nov 10, 2015</xd:p>
            <xd:p>
                <xd:ul>
                    <xd:li>
                        <xd:b>Author:</xd:b> Maja Hartwig</xd:li>
                    <xd:li>
                        <xd:b>Author:</xd:b> Johannes Kepper</xd:li>
                </xd:ul>
            </xd:p>
            <xd:p>
                This stylesheet transforms an MEI file so that it reflects exactly only one genetical state contained in the file,
                that is, it recreates "Textschicht C".
            </xd:p>
        </xd:desc>
    </xd:doc>
    <xsl:output method="xml" indent="yes"/>
    <xsl:param name="active.states.string" as="xs:string" select="'state137r_2'"/>
    <xsl:param name="main.state.id" as="xs:string" select="'state137r_2'"/>
    <xsl:variable name="active.states.ids" select="distinct-values(($main.state.id,tokenize($active.states.string,'___')))" as="xs:string+"/>
    <xsl:variable name="all.states" select="//mei:state" as="node()*"/>
    <xsl:variable name="current.state" select="//mei:state[@xml:id = $main.state.id]" as="node()"/>
    <xsl:variable name="current.scar.states" select="$current.state/ancestor::mei:genDesc[@type = 'textualScar']//mei:state/@xml:id" as="xs:string+"/>
    <xsl:variable name="active.states" select="//mei:state[@xml:id = $active.states.ids]" as="node()*"/>
    <xsl:variable name="is.draft" select="exists(//mei:draft[concat('#',$main.state.id) = tokenize(@decls,' ')])" as="xs:boolean"/>
    <xsl:variable name="rawDoc" select="/" as="node()"/>
        
    <!-- start the transformation -->
    <xsl:template match="/">
        <xsl:message select="$active.states.ids"/>
        <xsl:message select="$main.state.id"/>
        
        <!-- first, the file is stripped to only the snippet containing the state -->
        <xsl:variable name="stripped.file">
            <xsl:apply-templates select="/mei:mei" mode="first.pass"/>
        </xsl:variable>
        
        <!-- then, logically united measures which live in different locations are merged into a single measure element -->
        <xsl:variable name="merged.measures" as="node()">
            <xsl:variable name="merging.relations" select="//mei:state[@xml:id = $main.state.id]//mei:relation[@rel = 'hasComplement']" as="node()*"/>
            <xsl:apply-templates select="$stripped.file" mode="merge.measures">
                <xsl:with-param name="merging.relations" select="$merging.relations" tunnel="yes" as="node()*"/>
            </xsl:apply-templates>
        </xsl:variable>
        
        <!-- filling up measures with spaces where necessary -->
        <xsl:variable name="filled.measures" as="node()">
            <xsl:variable name="used.staves" select="distinct-values($merged.measures//mei:staff/@n)" as="xs:string*"/>
            <xsl:apply-templates select="$merged.measures" mode="fill.measures">
                <xsl:with-param name="used.staves" select="$used.staves" tunnel="yes" as="xs:string*"/>
            </xsl:apply-templates>
        </xsl:variable>
        
        <!-- @tstamps are added to all events -->
        <xsl:variable name="added.tstamps">
            <xsl:apply-templates select="$filled.measures" mode="add.tstamps"/>
        </xsl:variable>
        
        <!-- controlEvents (like slurs) are attached with
            @startid and @endid (as opposed to @tstamp and @tstamp2 -->
        <xsl:variable name="bound.controlEvents">
            <xsl:apply-templates select="$added.tstamps" mode="bind.controlEvents"/>
        </xsl:variable>
        <xsl:apply-templates select="$bound.controlEvents" mode="prepare.rendering"/>
        
        <!--<xsl:copy-of select="$filled.measures"/>-->
    </xsl:template>
    
    <!--<xsl:template match="mei:scoreDef" mode="first.pass">
        <xsl:choose>
            <xsl:when test="parent::mei:supplied[position() = 1 and ./parent::mei:section[@type = 'textualScar']]"/>
            <xsl:when test="parent::mei:section[@type = 'textualScar'] and count(preceding-sibling::mei:*) = 0"/>
            <xsl:otherwise>
                <xsl:next-match/>
            </xsl:otherwise>
        </xsl:choose>
    </xsl:template>-->
    <xsl:template match="mei:staffDef" mode="swapScoreDef">
        <xsl:copy>
            <xsl:if test="not(@lines)">
                <xsl:attribute name="lines" select="'5'"/>
            </xsl:if>
            <xsl:apply-templates select="node() | @*" mode="#current"/>
        </xsl:copy>
    </xsl:template>
    <xsl:template match="comment()" mode="#all" priority="5"/>
    
    <!-- decide how to deal with modifications to the source in order to re-establish the sought state -->
    <xsl:template match="mei:*[@changeState]" mode="first.pass filter.content">
        <xsl:variable name="name" select="local-name()" as="xs:string"/>
        <xsl:variable name="state.id" select="replace(@changeState,'#','')" as="xs:string"/>
        
        <xsl:choose>
            <xsl:when test="$name = 'add' and $state.id = $active.states.ids">
                <xsl:apply-templates select="child::node()" mode="#current"/>
            </xsl:when>
            <!-- todo: check if this is sufficient to deal with nested scars  -->
            <xsl:when test="$name = 'add' and not($state.id = $current.scar.states)">
                <xsl:apply-templates select="child::node()" mode="#current"/>
            </xsl:when>
            <xsl:when test="$name = 'add' and not($state.id = $active.states.ids)"/>
            <xsl:when test="$name = 'del' and $state.id = $active.states.ids">
                <xsl:apply-templates select=".//mei:restore[replace(@changeState,'#','') = $active.states.ids]/child::node()" mode="#current"/>
            </xsl:when>
            <xsl:when test="$name = 'del' and not($state.id = $active.states.ids)">
                <xsl:apply-templates select="child::node()" mode="#current"/>
            </xsl:when>
            <xsl:when test="$name = 'restore' and $state.id = $active.states.ids">
                <xsl:comment>******Restore starts*******</xsl:comment>
                <xsl:apply-templates select="child::node()" mode="#current"/>
                <xsl:comment>******Restore ends******</xsl:comment>
            </xsl:when>
            <!--<xsl:when test="$name = 'restore' and not($state.id = $active.states.ids)"/>-->
            <xsl:otherwise>
                <xsl:apply-templates select="child::node()" mode="#current"/>
            </xsl:otherwise>
        </xsl:choose>
    </xsl:template>
    
    <!-- strip the supplied element and continue processing with its children -->
    <!--<xsl:template match="mei:supplied" mode="first.pass">
        <xsl:apply-templates select="node()" mode="#current"/>
    </xsl:template>-->
    
    <!-- ignore bTrem and unclear elements and continue transformation with their respective children -->
    <!--<xsl:template match="mei:unclear" mode="first.pass">
        <xsl:apply-templates select="node()" mode="#current"/>
    </xsl:template>-->
    
    <!-- connect with following measure when incomplete -->
    <xsl:template match="mei:measure" mode="first.pass filter.content">
        <xsl:variable name="measure.id" select="@xml:id"/>
        
        <xsl:copy>
            <!-- set middle barline of joined measures invisible -->
            <xsl:if test="//mei:state[@xml:id = $main.state.id]//mei:relation[@rel = 'hasComplement' and @origin = concat('#',$measure.id)]">
                <!--<xsl:attribute name="right" select="'invis'"/>-->
                <!-- INFO: this would have to be removed in the next step anyway -->
            </xsl:if>
            <xsl:apply-templates select="node() | @*" mode="#current"/>
        </xsl:copy>
    </xsl:template>
    
    <!-- MODE merge.measures -->
    <xsl:template match="mei:measure" mode="merge.measures">
        <xsl:param name="merging.relations" as="node()*" tunnel="yes"/>
        <xsl:variable name="this.measure" select="." as="node()"/>
        <xsl:choose>
            <!-- the measure isn't affected by this phenomenon -->
            <xsl:when test="not(concat('#',$this.measure/@xml:id) = $merging.relations//@origin) and not(concat('#',$this.measure/@xml:id) = $merging.relations//@target)">
                <xsl:next-match/>
            </xsl:when>
            <!-- this measure has a second half, which needs to be merged in here -->
            <xsl:when test="concat('#',$this.measure/@xml:id) = $merging.relations//@origin">
                <xsl:variable name="relation" select="$merging.relations[@origin = concat('#',$this.measure/@xml:id)][1]" as="node()"/>
                <xsl:choose>
                    <xsl:when test="$relation/@target = ''">
                        <xsl:message select="concat('DATA ERROR: Relation ', $relation/@xml:id,' specifies no @target. Merging impossible.')"/>
                        <xsl:next-match/>
                    </xsl:when>
                    <xsl:otherwise>
                        <xsl:variable name="complementing.measure" select="//mei:measure[@xml:id = replace($relation/@target,'#','')]" as="node()?"/>
                        <xsl:choose>
                            <xsl:when test="not($complementing.measure)">
                                <xsl:message select="concat('DATA ERROR: Relation ', $relation/@xml:id,' specifies no @target. Merging impossible.')"/>
                                <xsl:next-match/>
                            </xsl:when>
                            <!-- the intended measure exists and can be used for merging -->
                            <xsl:otherwise>
                                <xsl:copy>
                                    <xsl:apply-templates select="node() | @*" mode="merge.layer">
                                        <xsl:with-param name="complementing.measure" select="$complementing.measure" tunnel="yes"/>
                                    </xsl:apply-templates>
                                    <xsl:apply-templates select="$complementing.measure/mei:*[not(local-name() = 'staff')]" mode="#current"/>
                                </xsl:copy>
                            </xsl:otherwise>
                        </xsl:choose>
                    </xsl:otherwise>
                </xsl:choose>
            </xsl:when>
            <!-- this measure has a first half and has been merged into that elsewhere -->
            <xsl:when test="concat('#',$this.measure/@xml:id) = $merging.relations//@target">
                <xsl:message select="concat('[INFO] merged measure ',$this.measure/@label,' with preceding measure')"/>
            </xsl:when>
        </xsl:choose>
    </xsl:template>
    <xsl:template match="mei:layer" mode="merge.layer">
        <xsl:param name="complementing.measure" tunnel="yes" as="node()"/>
        <xsl:variable name="staff.n" select="parent::mei:staff/@n" as="xs:string"/>
        <xsl:variable name="layer.n" select="@n" as="xs:string"/>
        <xsl:variable name="complementing.layer" select="$complementing.measure/mei:staff[@n = $staff.n]/mei:layer[@n = $layer.n]" as="node()?"/>
        <xsl:copy>
            <xsl:apply-templates select="node() | @*" mode="#current"/>
            <xsl:apply-templates select="$complementing.layer/node()" mode="#current"/>
        </xsl:copy>
    </xsl:template>
       
    <!-- since Verovio doesn't understand <mei:accid> elements, take the @accid of all non-supplied <mei:accid> and attach them to the note -->
    <xsl:template match="mei:note[.//mei:accid[not(ancestor::mei:supplied)]]" mode="first.pass">
        <xsl:copy>
            <xsl:apply-templates select=".//@accid" mode="#current"/>
            <xsl:apply-templates select="node() | @*" mode="#current"/>
        </xsl:copy>
    </xsl:template>
    
    <!-- throw away the header and facsimiles -->
    <xsl:template match="mei:meiHead | mei:facsimile" mode="first.pass"/>
    <xsl:template match="mei:score" mode="first.pass">
        <xsl:variable name="current.score" select="." as="node()"/>
        <xsl:copy>
            <xsl:choose>
                <xsl:when test="$is.draft">
                    <xsl:variable name="draft" select="$rawDoc//mei:draft[concat('#',$main.state.id) = tokenize(@decls,' ')]" as="node()"/>
                    <xsl:variable name="prep1" select="$draft//mei:*[(@changeState and replace(@changeState,'#','') = $active.states.ids and not(ancestor::mei:*[@changeState and replace(@changeState,'#','') = $active.states.ids]))]" as="node()*"/>
                    <xsl:variable name="prep2" as="node()*">
                        <xsl:apply-templates select="$prep1" mode="#current"/>
                    </xsl:variable>
                    <xsl:variable name="to.keep" select="$prep2//@xml:id" as="xs:string*"/>
                    <xsl:apply-templates select="$draft/child::node()" mode="filter.content">
                        <xsl:with-param name="to.keep" select="$to.keep" tunnel="yes" as="xs:string*"/>
                    </xsl:apply-templates>
                </xsl:when>
                <xsl:otherwise>
                    <xsl:variable name="prep1" select="$current.score//mei:*[@changeState and replace(@changeState,'#','') = $active.states.ids and not(ancestor::mei:*[@changeState and replace(@changeState,'#','') = $active.states.ids])]" as="node()*"/>
                    <xsl:variable name="prep2" as="node()*">
                        <xsl:apply-templates select="$prep1" mode="#current"/>
                    </xsl:variable>
                    <xsl:variable name="to.keep" select="$prep2//@xml:id" as="xs:string*"/>
                    <!--<xsl:message select="'prep2:'"/>
                    <xsl:message select="$prep2"/>
                    <xsl:message select="' '"/>-->
                    <xsl:variable name="prep3">
                        <xsl:apply-templates select="$current.score/node()" mode="filter.content">
                            <xsl:with-param name="to.keep" select="$to.keep" tunnel="yes" as="xs:string*"/>
                        </xsl:apply-templates>
                    </xsl:variable>
                    <!--<xsl:message select="'prep3:'"/>
                    <xsl:message select="$prep3"/>
                    <xsl:message select="' '"/>-->
                    <xsl:copy-of select="$prep3"/>
                </xsl:otherwise>
            </xsl:choose>
        </xsl:copy>
    </xsl:template>
    <xsl:template match="mei:score" mode="fill.measures">
        <xsl:copy>
            <xsl:apply-templates select="@* | mei:scoreDef" mode="#current"/>
            <xsl:choose>
                <xsl:when test="not(child::mei:section)">
                    <section xmlns="http://www.music-encoding.org/ns/mei">
                        <xsl:apply-templates select="node() except mei:scoreDef" mode="#current"/>
                    </section>
                </xsl:when>
                <xsl:otherwise>
                    <xsl:apply-templates select="node() except mei:scoreDef" mode="#current"/>
                </xsl:otherwise>
            </xsl:choose>
        </xsl:copy>
    </xsl:template>
    
    <!-- todo: improve this? -->
    <xsl:template match="mei:choice" mode="first.pass">
        <xsl:choose>
            <xsl:when test="child::mei:orig">
                <xsl:apply-templates select="mei:orig[1]/child::node()" mode="#current"/>
            </xsl:when>
            <xsl:when test="child::mei:abbr">
                <xsl:apply-templates select="mei:abbr[1]/*" mode="#current"/>
            </xsl:when>
        </xsl:choose>
    </xsl:template>
    <xsl:template match="mei:drafts" mode="first.pass"/>
    
<!-- mode filter.content -->
    <xsl:template match="mei:*" mode="filter.content" priority="1">
        <xsl:param name="to.keep" tunnel="yes" as="xs:string*"/>
        
        <xsl:choose>
            <!-- element itself shall be preserved -->
            <xsl:when test="@xml:id = $to.keep">
                <xsl:next-match/>
            </xsl:when>
            <!-- element contains preservable elements -->
            <xsl:when test=".//mei:*/@xml:id = $to.keep">
                <xsl:next-match/>
            </xsl:when>
            <xsl:when test=".//mei:del[replace(@changeState,'#','') = $active.states.ids]">
                <xsl:next-match/>
            </xsl:when>
            <!-- scoreDefs need to be preserved -->
            <xsl:when test="local-name() = 'scoreDef'">
                <xsl:next-match/>
            </xsl:when>
            <xsl:when test="ancestor::mei:scoreDef">
                <xsl:next-match/>
            </xsl:when>
            <xsl:when test="ancestor::mei:layer and not(local-name() = ('del','add'))">
                <xsl:apply-templates select="." mode="setAsContext"/>
            </xsl:when>
            
            <!-- fix for WoO32, scar79-83, stateD, restored tie '#b1c2d6028-98f1-4f41-aa86-3afc10b13d17' -->
            <xsl:when test="local-name() = 'del' and ancestor::mei:restore[replace(@changeState,'#','') = $active.states.ids]">
                <xsl:variable name="dels" select="ancestor-or-self::mei:del[replace(@changeState,'#','') = $active.states.ids]" as="node()+"/>
                <xsl:variable name="restores" select="ancestor-or-self::mei:restore[replace(@changeState,'#','') = $active.states.ids]" as="node()+"/>
                <xsl:choose>
                    <xsl:when test="count($restores) ge count($dels)">
                        <xsl:copy-of select="child::node()"/>
                    </xsl:when>
                    <xsl:otherwise/>
                </xsl:choose>
                
                
            </xsl:when>
            <!-- todo: this doesn't consider restorations-->
            <xsl:when test="local-name() = 'del' and not(replace(@changeState,'#','') = $current.scar.states)"/>
            <xsl:when test="local-name() = 'del' and not(some $id in .//mei:*/@xml:id satisfies($id = $to.keep))"/>
            
            <xsl:otherwise/>
            
        </xsl:choose>
    </xsl:template>
    
    <!-- mode setAsContext -->
    <xsl:template match="mei:*" mode="setAsContext">
        <supplied xmlns="http://www.music-encoding.org/ns/mei" type="context">
            <xsl:next-match/>
        </supplied>
    </xsl:template>
    
    
<!-- mode fill.measures (adds empty staves where necessary) -->
    <xsl:template match="mei:measure" mode="fill.measures">
        <xsl:param name="used.staves" tunnel="yes" as="xs:string*"/>
        <xsl:variable name="measure" select="." as="node()"/>
        <xsl:copy>
            <xsl:apply-templates select="@*" mode="#current"/>
            <xsl:for-each select="$used.staves">
                <xsl:sort select="." data-type="number"/>
                <xsl:variable name="staff.n" select="." as="xs:string"/>
                <xsl:choose>
                    <xsl:when test="$measure/mei:staff[@n = $staff.n]">
                        <xsl:copy-of select="$measure/mei:staff[@n = $staff.n]"/>
                    </xsl:when>
                    <xsl:otherwise>
                        <staff xmlns="http://www.music-encoding.org/ns/mei" n="{$staff.n}">
                            <layer n="1">
                                <mSpace/>
                            </layer>
                        </staff>
                    </xsl:otherwise>
                </xsl:choose>
            </xsl:for-each>
            <xsl:apply-templates select="node() except mei:staff" mode="#current"/>
        </xsl:copy>
    </xsl:template>
    <xsl:template match="mei:staffDef" mode="fill.measures">
        <xsl:param name="used.staves" tunnel="yes" as="xs:string*"/>
        <xsl:if test="@n = $used.staves">
            <xsl:next-match/>
        </xsl:if>
    </xsl:template>
    <xsl:template match="mei:staffGrp" mode="fill.measures">
        <xsl:param name="used.staves" tunnel="yes" as="xs:string*"/>
        <xsl:if test=".//mei:staffDef[@n = $used.staves]">
            <xsl:next-match/>
        </xsl:if>
    </xsl:template>
    
<!-- mode add.tstamps -->
    
    <!-- this template adds temporary attributes @meter.count and @meter.unit to the measure -->
    <xsl:template match="mei:measure" mode="add.tstamps">
        <!--<xsl:message select="preceding::mei:scoreDef[@meter.count][1]"/>-->
        <xsl:variable name="meter.count" select="preceding::mei:scoreDef[@meter.count][1]/@meter.count cast as xs:integer" as="xs:integer"/>
        <xsl:variable name="meter.unit" select="preceding::mei:scoreDef[@meter.unit][1]/@meter.unit cast as xs:integer" as="xs:integer"/>
        <xsl:copy>
            <xsl:apply-templates select="node() | @*" mode="#current">
                <xsl:with-param name="meter.count" select="$meter.count" tunnel="yes"/>
                <xsl:with-param name="meter.unit" select="$meter.unit" tunnel="yes"/>
            </xsl:apply-templates>
        </xsl:copy>
    </xsl:template>
    
    <!-- this template creates a variable with all tstamps, which are then copied to all timed events in the layer -->
    <xsl:template match="mei:layer" mode="add.tstamps">
        <xsl:param name="meter.count" tunnel="yes"/>
        <xsl:param name="meter.unit" tunnel="yes"/>
        <xsl:variable name="events" select=".//mei:*[(@dur and not((ancestor::mei:*[@dur] or ancestor::mei:bTrem or ancestor::mei:fTrem)) and not(@grace)) or (local-name() = ('bTrem','fTrem','beatRpt','halfmRpt'))]"/>
        <xsl:variable name="durations" as="xs:double*">
            <xsl:for-each select="$events">
                <xsl:variable name="dur" as="xs:double">
                    <xsl:choose>
                        <xsl:when test="@dur">
                            <xsl:value-of select="1 div number(@dur)"/>
                        </xsl:when>
                        <xsl:when test="local-name() = 'bTrem'">
                            <xsl:value-of select="1 div (child::mei:*)[1]/number(@dur)"/>
                        </xsl:when>
                        <xsl:when test="local-name() = 'fTrem'">
                            <xsl:value-of select="1 div ((child::mei:*)[1]/number(@dur) * 2)"/>
                        </xsl:when>
                        <xsl:when test="local-name() = 'beatRpt'">
                            <xsl:value-of select="1 div $meter.unit"/>
                        </xsl:when>
                        <xsl:when test="local-name() = 'halfmRpt'">
                            <xsl:value-of select="($meter.count div 2) div $meter.unit"/>
                        </xsl:when>
                    </xsl:choose>
                </xsl:variable>
                <xsl:variable name="tupletFactor" as="xs:double">
                    <xsl:choose>
                        <xsl:when test="ancestor::mei:tuplet">
                            <xsl:value-of select="(ancestor::mei:tuplet)[1]/number(@numbase) div (ancestor::mei:tuplet)[1]/number(@num)"/>
                        </xsl:when>
                        <xsl:otherwise>
                            <xsl:value-of select="1"/>
                        </xsl:otherwise>
                    </xsl:choose>
                </xsl:variable>
                <xsl:variable name="dots" as="xs:double">
                    <xsl:choose>
                        <xsl:when test="@dots">
                            <xsl:value-of select="number(@dots)"/>
                        </xsl:when>
                        <xsl:when test="local-name() = 'bTrem' and child::mei:*/@dots">
                            <xsl:value-of select="child::mei:*[@dots]/number(@dots)"/>
                        </xsl:when>
                        <xsl:when test="local-name() = 'fTrem' and child::mei:*/@dots">
                            <xsl:value-of select="child::mei:*[@dots][1]/number(@dots)"/>
                        </xsl:when>
                        <xsl:when test="child::mei:dot">
                            <xsl:value-of select="count(child::mei:dot)"/>
                        </xsl:when>
                        <xsl:when test="child::mei:*/descendant::mei:dot">
                            <xsl:value-of select="max(child::mei:*/count(.//mei:dot))"/>
                        </xsl:when>
                        <xsl:otherwise>
                            <xsl:value-of select="0"/>
                        </xsl:otherwise>
                    </xsl:choose>
                </xsl:variable>
                <xsl:value-of select="(2 * $dur - ($dur div math:pow(2,$dots))) * $tupletFactor"/>
            </xsl:for-each>
        </xsl:variable>
        <xsl:variable name="tstamps">
            <xsl:for-each select="$events">
                <xsl:variable name="pos" select="position()"/>
                <event id="{@xml:id}" onset="{sum($durations[position() lt $pos])}"/>
            </xsl:for-each>
        </xsl:variable>
        <xsl:copy>
            <xsl:apply-templates select="node() | @*" mode="#current">
                <xsl:with-param name="tstamps" select="$tstamps" tunnel="yes"/>
            </xsl:apply-templates>
        </xsl:copy>
    </xsl:template>
    
    <!-- this template adds a @tstamp to each event -->
    <xsl:template match="mei:layer//mei:*[(@dur and not((ancestor::mei:*[@dur] or ancestor::mei:bTrem or ancestor::mei:fTrem)) and not(@grace)) or (local-name() = ('bTrem','fTrem','beatRpt','halfmRpt'))]" mode="add.tstamps">
        <xsl:param name="tstamps" tunnel="yes"/>
        <xsl:param name="meter.count" tunnel="yes"/>
        <xsl:param name="meter.unit" tunnel="yes"/>
        <xsl:variable name="id" select="@xml:id" as="xs:string"/>
        <xsl:variable name="onset" select="$tstamps//*[@id=$id][1]/@onset"/>
        <xsl:copy>
            <xsl:apply-templates select="@*" mode="#current"/>
            <xsl:choose>
                <xsl:when test="local-name() = 'bTrem'">
                    <xsl:copy-of select="child::mei:*/@dur | child::mei:*/@dots"/>
                </xsl:when>
                <xsl:when test="local-name() = 'fTrem'">
                    <xsl:copy-of select="(child::mei:*)[1]/@dur | (child::mei:*)[1]/@dots"/>
                </xsl:when>
                <xsl:when test="local-name() = 'beatRpt'">
                    <xsl:attribute name="dur" select="$meter.unit"/>
                </xsl:when>
                <xsl:when test="local-name() = 'halfmRpt'">
                    <xsl:choose>
                        <xsl:when test="$meter.count = 4 and $meter.unit = 4">
                            <xsl:attribute name="dur" select="2"/>
                        </xsl:when>
                        <xsl:when test="$meter.count = 6 and $meter.unit = 8">
                            <xsl:attribute name="dur" select="4"/>
                            <xsl:attribute name="dots" select="1"/>
                        </xsl:when>
                        <xsl:when test="$meter.count = 2 and $meter.unit = 2">
                            <xsl:attribute name="dur" select="2"/>
                        </xsl:when>
                        <xsl:when test="$meter.count = 2 and $meter.unit = 4">
                            <xsl:attribute name="dur" select="4"/>
                        </xsl:when>
                        <xsl:otherwise>
                            <xsl:attribute name="dur"/>
                            <xsl:message>Could not identify the correct duration for halfmRpt</xsl:message>
                        </xsl:otherwise>
                    </xsl:choose>
                </xsl:when>
            </xsl:choose>
            <xsl:variable name="tstamp" select="($onset * number($meter.unit)) + 1" as="xs:double"/>
            <xsl:attribute name="tstamp" select="$tstamp"/>
            
            <!-- TODO: from here on, it seems a bit "cheesy" -->
            <!-- check for beamSpans starting at this element -->
            <xsl:variable name="staff.n" select="ancestor::mei:staff/@n" as="xs:string?"/>
            <!-- todo: improve on situations with multiple layers! -->
            <xsl:variable name="beamSpans" select="if($staff.n) then(ancestor::mei:measure//mei:beamSpan[@staff = $staff.n]) else()" as="node()*"/>
            
            <xsl:message select="'beamSpans:'"/>
            <xsl:message select="$beamSpans"/>
            
            <!--todo: is it robust enough?-->
            <xsl:variable name="matching.beamSpan" select="$beamSpans[@tstamp = string($tstamp) or (contains(@tstamp2,'m+') and substring-after(@tstamp2,'m+') = string($tstamp)) or @tstamp2 = string($tstamp)][1]" as="node()?"/>
            <xsl:choose>
                <xsl:when test="$matching.beamSpan/@tstamp = string($tstamp)">
                    <xsl:attribute name="beam" select="'i'"/>
                    <xsl:attribute name="beamSpan.id" select="$matching.beamSpan/@xml:id"/>
                </xsl:when>
                <xsl:when test="contains($matching.beamSpan/@tstamp2,'m+') and substring-after($matching.beamSpan/@tstamp2,'m+') = string($tstamp)">
                    <xsl:attribute name="beam" select="'t'"/>
                    <xsl:attribute name="beamSpan.id" select="$matching.beamSpan/@xml:id"/>
                </xsl:when>
                <xsl:when test="$matching.beamSpan/@tstamp2 = string($tstamp)">
                    <xsl:attribute name="beam" select="'t'"/>
                    <xsl:attribute name="beamSpan.id" select="$matching.beamSpan/@xml:id"/>
                </xsl:when>
                <xsl:when test="some $beamSpan in $beamSpans satisfies ($tstamp gt $beamSpan/number(@tstamp) and (if(contains($beamSpan/@tstamp2,'m+')) then($tstamp lt number($beamSpan/substring-after(@tstamp2,'m+'))) else($tstamp lt number($beamSpan/@tstamp2))))">
                    <xsl:variable name="relevant.beamSpan" select="$beamSpans[$tstamp gt number(@tstamp) and (if(contains(@tstamp2,'m+')) then($tstamp lt number(substring-after(@tstamp2,'m+'))) else($tstamp lt number(@tstamp2)))][1]" as="node()"/>
                    <xsl:attribute name="beam" select="'m'"/>
                    <xsl:attribute name="beamSpan.id" select="$relevant.beamSpan/@xml:id"/>
                </xsl:when>
                <xsl:when test="some $beamSpan in $rawDoc//mei:beamSpan satisfies($id = replace($beamSpan/@startid,'#',''))">
                    <xsl:variable name="relevant.beamSpan" select="$rawDoc//mei:beamSpan[replace(@startid,'#','') = $id]" as="node()"/>
                    <xsl:attribute name="beam" select="'i'"/>
                    <xsl:attribute name="beamSpan.id" select="$relevant.beamSpan/@xml:id"/>
                    <!--<xsl:message select="'Found its start at: ' || $id || ' (' || $relevant.beamSpan/@xml:id || ')'"/>-->
                </xsl:when>
                <xsl:when test="some $beamSpan in $rawDoc//mei:beamSpan satisfies($id = replace($beamSpan/@endid,'#',''))">
                    <xsl:variable name="relevant.beamSpan" select="$rawDoc//mei:beamSpan[replace(@endid,'#','') = $id]" as="node()"/>
                    <xsl:attribute name="beam" select="'t'"/>
                    <xsl:attribute name="beamSpan.id" select="$relevant.beamSpan/@xml:id"/>
                    <!--<xsl:message select="'Found its end at: ' || $id || ' (' || $relevant.beamSpan/@xml:id || ')'"/>-->
                </xsl:when>
            </xsl:choose>
            <xsl:apply-templates select="node()" mode="#current"/>
        </xsl:copy>
    </xsl:template>
    <xsl:template match="mei:mRest" mode="add.tstamps">
        <xsl:copy>
            <xsl:apply-templates select="@*" mode="#current"/>
            <xsl:attribute name="tstamp" select="'1'"/>
            <xsl:apply-templates select="node()" mode="#current"/>
        </xsl:copy>
    </xsl:template>
    <xsl:template match="mei:mSpace" mode="add.tstamps">
        <xsl:copy>
            <xsl:apply-templates select="@*" mode="#current"/>
            <xsl:attribute name="tstamp" select="'1'"/>
            <xsl:apply-templates select="node()" mode="#current"/>
        </xsl:copy>
    </xsl:template>
    <xsl:template match="mei:mRpt" mode="add.tstamps">
        <xsl:copy>
            <xsl:apply-templates select="@*" mode="#current"/>
            <xsl:attribute name="tstamp" select="'1'"/>
            <xsl:apply-templates select="node()" mode="#current"/>
        </xsl:copy>
    </xsl:template>
    
    <!-- mode bind.controlEvents -->
    
    <!-- add a beam element -->
    <xsl:template match="mei:*[@beam = 'i']" mode="bind.controlEvents">
        <xsl:variable name="beam.id" select="@beamSpan.id" as="xs:string"/>
        <beam xmlns="http://www.music-encoding.org/ns/mei" type="beamSpan">
            <xsl:attribute name="xml:id" select="$beam.id"/>
            <xsl:copy>
                <xsl:apply-templates select="node() | @*" mode="#current"/>
            </xsl:copy>
            <xsl:apply-templates select="following::mei:*[@beamSpan.id = $beam.id]" mode="#current">
                <xsl:with-param name="keep" select="true()"/>
            </xsl:apply-templates>
        </beam>
    </xsl:template>
    
    <!-- these elements are dealt by the template above -->
    <xsl:template match="mei:*[@beam = ('m','t')]" mode="bind.controlEvents">
        <xsl:param name="keep" as="xs:boolean?"/>
        <xsl:if test="$keep and $keep = true()">
            <xsl:next-match/>
        </xsl:if>
    </xsl:template>
    <xsl:template match="@beam" mode="bind.controlEvents"/>
    <xsl:template match="@beamSpan.id" mode="bind.controlEvents"/>
    
    <!-- this template adds @startid and @endid to slurs (and ties) -->
    <xsl:template match="mei:slur | mei:tie" mode="bind.controlEvents">
        <xsl:variable name="slur" select="." as="node()"/>
        <xsl:variable name="staff.n" select="@staff" as="xs:string"/>
        <xsl:choose>
            <xsl:when test="ancestor::mei:measure/mei:staff[@n = $staff.n]">
                <xsl:variable name="start.staff" select="ancestor::mei:measure/mei:staff[@n = $staff.n]" as="node()"/>
                <xsl:variable name="start.elem" as="node()?">
                    <xsl:choose>
                        <!-- exactly one layer -->
                        <xsl:when test="count($start.staff/mei:layer) = 1 and not(@layer)">
                            <xsl:sequence select="($start.staff//mei:*[@tstamp = $slur/@tstamp and local-name() = ('note','chord','rest')])[1]"/>
                        </xsl:when>
                        <!-- layer specified, and layer available -->
                        <xsl:when test="exists(@layer) and @layer = $start.staff/mei:layer/@n">
                            <xsl:sequence select="($start.staff/mei:layer[@n = $slur/@layer]/mei:*[@tstamp = $slur/@tstamp and local-name() = ('note','chord','rest')])[1]"/>
                        </xsl:when>
                        <!-- more than one layer available, but not clearly specified -->
                        <xsl:when test="count($start.staff/mei:layer) gt 1 and not(@layer)">
                            <xsl:sequence select="($start.staff//mei:*[@tstamp = $slur/@tstamp and local-name() = ('note','chord','rest')])[1]"/>
                        </xsl:when>
                    </xsl:choose>
                </xsl:variable>
                <xsl:variable name="measure.dist" as="xs:integer">
                    <!-- calculate how many measure the slur stretches -->
                    <xsl:choose>
                        <xsl:when test="contains(@tstamp2,'m+')">
                            <xsl:value-of select="number(substring-before(@tstamp2,'m+')) cast as xs:integer"/>
                        </xsl:when>
                        <xsl:otherwise>
                            <xsl:value-of select="0"/>
                        </xsl:otherwise>
                    </xsl:choose>
                </xsl:variable>
                <xsl:variable name="end.staff" as="node()">
                    <xsl:choose>
                        <xsl:when test="$measure.dist = 0">
                            <xsl:sequence select="$start.staff"/>
                        </xsl:when>
                        <xsl:otherwise>
                            <xsl:sequence select="ancestor::mei:measure/following::mei:measure[$measure.dist]/mei:staff[@n = $staff.n]"/>
                        </xsl:otherwise>
                    </xsl:choose>
                </xsl:variable>
                <xsl:variable name="end.tstamp" as="xs:string">
                    <xsl:choose>
                        <xsl:when test="contains($slur/@tstamp2,'m+')">
                            <xsl:value-of select="substring-after($slur/@tstamp2,'m+')"/>
                        </xsl:when>
                        <xsl:otherwise>
                            <xsl:value-of select="$slur/@tstamp2"/>
                        </xsl:otherwise>
                    </xsl:choose>
                </xsl:variable>
                <xsl:variable name="end.elem" as="node()?">
                    <xsl:choose>
                        <!-- exactly one layer -->
                        <xsl:when test="count($end.staff/mei:layer) = 1 and not(@layer)">
                            <xsl:sequence select="($end.staff//mei:*[@tstamp = $end.tstamp])[1]"/>
                        </xsl:when>
                        <!-- layer specified, and layer available -->
                        <xsl:when test="exists(@layer) and @layer = $end.staff/mei:layer/@n">
                            <xsl:sequence select="($end.staff/mei:layer[@n = $slur/@layer]/mei:*[@tstamp = $end.tstamp])[1]"/>
                        </xsl:when>
                        <!-- more than one layer available, but not clearly specified -->
                        <xsl:when test="count($end.staff/mei:layer) gt 1 and not(@layer)">
                            <xsl:sequence select="($end.staff//mei:*[@tstamp = $end.tstamp])[1]"/>
                        </xsl:when>
                    </xsl:choose>
                </xsl:variable>
                <!--<xsl:if test="not($start.elem)">
            <xsl:message select="concat('there seems to be no matching element for slur/@xml:id=',$slur/@xml:id,' at tstamp=',$slur/@tstamp,' in state ',$state.id)"/>
        </xsl:if>
        <xsl:if test="not($end.elem)">
            <xsl:message select="concat('there seems to be no matching element for slur/@xml:id=',$slur/@xml:id,' at tstamp2=',$slur/@tstamp2,' in state ',$state.id)"/>
        </xsl:if>-->
                <xsl:copy>
                    <xsl:attribute name="startid" select="concat('#',$start.elem/@xml:id)"/>
                    <xsl:attribute name="endid" select="concat('#',$end.elem/@xml:id)"/>
                    <xsl:apply-templates select="node() | @*" mode="#current"/>
                </xsl:copy>
            </xsl:when>
            <xsl:otherwise>
                <dir xmlns="http://www.music-encoding.org/ns/mei" type="{@xml:id}">broken <xsl:value-of select="local-name()"/>
                </dir>
            </xsl:otherwise>
        </xsl:choose>
    </xsl:template>
    
    <!-- mode prepare.rendering -->
    <xsl:template match="mei:note | mei:chord | mei:rest" mode="prepare.rendering">
        <xsl:copy>
            <xsl:variable name="count" select="if(.//mei:dot) then(max(.//mei:dot/(count(preceding-sibling::mei:dot) + 1))) else(0)" as="xs:integer"/>
            <xsl:if test="$count gt 0 and not(parent::mei:chord)">
                <xsl:attribute name="dots" select="$count"/>
            </xsl:if>
            <xsl:choose>
                <xsl:when test="not(@dur) and ancestor::mei:unclear and ancestor::mei:beam">
                    <xsl:attribute name="dur" select="8"/>
                </xsl:when>
                <xsl:when test="not(@dur) and ancestor::mei:unclear and not(ancestor::mei:beam)">
                    <xsl:attribute name="dur" select="4"/>
                </xsl:when>
            </xsl:choose>
            <xsl:apply-templates select="node() | @*" mode="#current"/>
        </xsl:copy>
    </xsl:template>
    <xsl:template match="mei:beam" mode="prepare.rendering">
        <xsl:choose>
            <xsl:when test="count(descendant::mei:*[@dur]) ge 2">
                <xsl:next-match/>
            </xsl:when>
            <xsl:otherwise>
                <xsl:apply-templates select="child::mei:*" mode="#current"/>
            </xsl:otherwise>
        </xsl:choose>
    </xsl:template>
    <xsl:template match="mei:fTrem[count(child::mei:*[@dur]) lt 2]" mode="prepare.rendering">
        <bTrem xmlns="http://www.music-encoding.org/ns/mei">
            <xsl:apply-templates select="node() | @*" mode="#current"/>
        </bTrem>
    </xsl:template>
    
    <!-- check if clefs, key signature and meter need to be adjusted for the snippet -->
    <xsl:template match="mei:staffDef[not(@n = preceding::mei:staffDef/@n)]" mode="prepare.rendering">
        <xsl:variable name="staff.n" select="@n" as="xs:string"/>
        <xsl:variable name="first.measure" select="following::mei:measure[1]" as="node()"/>
        <xsl:variable name="preceding.clef" select="$rawDoc//mei:measure[@xml:id = $first.measure/@xml:id]/preceding::mei:*[(local-name() = 'staffDef' and @n = $staff.n and @clef.shape and @clef.line) or (local-name() = 'clef' and ancestor::mei:staff/@n = $staff.n and (count(ancestor::mei:del) le (count(ancestor::mei:add) + count(ancestor::mei:restore))))][1]" as="node()?"/>
        
        <xsl:copy>
            <xsl:apply-templates select="@*" mode="#current"/>
            <xsl:choose>
                <xsl:when test="$preceding.clef and local-name($preceding.clef) = 'staffDef'">
                    <xsl:attribute name="clef.shape" select="$preceding.clef/@clef.shape"/>
                    <xsl:attribute name="clef.line" select="$preceding.clef/@clef.line"/>
                    <xsl:copy-of select="$preceding.clef/@clef.dis"/>
                    <xsl:copy-of select="$preceding.clef/@clef.dis.place"/>
                </xsl:when>
                <xsl:when test="$preceding.clef and local-name($preceding.clef) = 'clef'">
                    <xsl:attribute name="clef.shape" select="$preceding.clef/@shape"/>
                    <xsl:attribute name="clef.line" select="$preceding.clef/@line"/>
                    <xsl:if test="$preceding.clef/@dis">
                        <xsl:attribute name="clef.dis" select="$preceding.clef/@dis"/>
                    </xsl:if>
                    <xsl:if test="$preceding.clef/@dis.place">
                        <xsl:attribute name="clef.dis.place" select="$preceding.clef/@dis.place"/>
                    </xsl:if>
                </xsl:when>
            </xsl:choose>
            <xsl:apply-templates select="node()" mode="#current"/>
        </xsl:copy>
        
    </xsl:template>
    
    <!-- when rendering variants, usually there is no connection to the facsimile required for this -->
    <xsl:template match="mei:staffDef/mei:clef" mode="prepare.rendering"/>
    <xsl:template match="mei:staffDef/mei:keySig" mode="prepare.rendering"/>
    
    <xsl:template match="mei:staffGrp" mode="prepare.rendering">
        <xsl:choose>
            <xsl:when test="count(.//mei:staffDef) gt 1 and @symbol">
                <xsl:next-match/>
            </xsl:when>
            <xsl:otherwise>
                <xsl:copy>
                        <xsl:attribute name="symbol" select="'none'"/>
                    <xsl:apply-templates select="node() | @*" mode="#current"/>
                </xsl:copy>
            </xsl:otherwise>
        </xsl:choose>
    </xsl:template>
    
    <!-- required only as exist-db doesn't support the regular math:pow function: bug! -->
    <xsl:function name="math:pow">
        <xsl:param name="base"/>
        <xsl:param name="power"/>
        <xsl:choose>
            <xsl:when test="number($base) != $base or number($power) != $power">
                <xsl:value-of select="'NaN'"/>
            </xsl:when>
            <xsl:when test="$power = 0">
                <xsl:value-of select="1"/>
            </xsl:when>
            <xsl:otherwise>
                <xsl:value-of select="$base * math:pow($base,$power - 1)"/>
            </xsl:otherwise>
        </xsl:choose>
    </xsl:function>
    
    <!-- generic copy template -->
    <xsl:template match="node() | @*" mode="#all">
        <xsl:copy>
            <xsl:apply-templates select="node() | @*" mode="#current"/>
        </xsl:copy>
    </xsl:template>
</xsl:stylesheet>