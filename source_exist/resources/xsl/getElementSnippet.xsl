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
    <xsl:param name="element.id" as="xs:string"/>
    <xsl:variable name="element" select="//mei:*[@xml:id = $element.id]" as="node()"/>
    <xsl:variable name="staff.n" as="xs:string+">
        <xsl:choose>
            <xsl:when test="$element/@staff">
                <xsl:sequence select="$element/tokenize(@staff,' ')"/>
            </xsl:when>
            <xsl:when test="$element/ancestor::mei:staff">
                <xsl:sequence select="$element/ancestor::mei:staff/@n"/>
            </xsl:when>
            <xsl:when test="$element//mei:staff">
                <xsl:sequence select="distinct-values($element//mei:staff/@n)"/>
            </xsl:when>
            <xsl:otherwise>
                <xsl:sequence select="distinct-values(//mei:staffDef/@n)"/>
            </xsl:otherwise>
        </xsl:choose>
    </xsl:variable>
    <xsl:variable name="measure.id" as="xs:string+">
        <xsl:choose>
            <xsl:when test="$element/ancestor::mei:measure">
                <xsl:value-of select="$element/ancestor::mei:measure/@xml:id"/>
            </xsl:when>
            <xsl:when test="local-name($element) = 'measure'">
                <xsl:value-of select="$element.id"/>
            </xsl:when>
        </xsl:choose>
    </xsl:variable>
    <xsl:variable name="state.added" select="$element/ancestor::mei:add[1]/replace(@changeState,'#','')"/>
    
    <!-- start the transformation -->
    <xsl:template match="/">
        <xsl:variable name="first.round">
            <xsl:apply-templates/>    
        </xsl:variable>
        <xsl:apply-templates select="$first.round" mode="include.controlEvents"/>
    </xsl:template>
    <xsl:template match="comment()" priority="1"/>
    <xsl:template match="@facs" priority="1"/>
    <xsl:template match="mei:measure">
        <xsl:choose>
            <xsl:when test="@xml:id and @xml:id = $measure.id">
                <xsl:next-match/>
            </xsl:when>
            <xsl:otherwise>
                <xsl:if test=".//mei:clef">
                    <xsl:for-each select=".//mei:clef">
                        <xsl:variable name="staff.n" select="./ancestor::mei:staff/@n"/>
                        <staffDef xmlns="http://www.music-encoding.org/ns/mei" n="{$staff.n}" clef.shape="{@shape}" clef.line="{@line}" type="includable"/>
                    </xsl:for-each>
                </xsl:if>
                <xsl:if test=".//mei:octave and following::mei:measure[@xml:id = $measure.id]">
                    <xsl:for-each select=".//mei:octave">
                        <xsl:variable name="octave.elem" select="." as="node()"/>
                        <xsl:variable name="end.measure" select="id(replace($octave.elem/@endid,'#',''))/ancestor::mei:measure" as="node()"/>
                        <!-- this octave will always start before the current measure -->
                        <xsl:choose>
                            <!-- octave also ends before requested measure - no need to do anything -->
                            <xsl:when test="$end.measure/following::mei:measure[@xml:id = $measure.id]"/>
                            <!-- octave ends within requested measure - adjust start only -->
                            <xsl:when test="$end.measure/@xml:id = $measure.id">
                                <xsl:variable name="notes" select="id($measure.id)/mei:staff[@n = $octave.elem/@staff]//mei:*[local-name() = ('note','chord')][@tstamp]" as="node()*"/>
                                <xsl:variable name="new.start">
                                    <xsl:for-each select="$notes">
                                        <xsl:sort select="@tstamp" data-type="number"/>
                                        <xsl:if test="position() = 1">
                                            <xsl:value-of select="concat('#',@xml:id)"/>
                                        </xsl:if>
                                    </xsl:for-each>    
                                </xsl:variable>
                                <octave xmlns="http://www.music-encoding.org/ns/mei" dis="{$octave.elem/@dis}" dis.place="{$octave.elem/@dis.place}" startid="{$new.start}" endid="{$octave.elem/@endid}" staff="{$octave.elem/@staff}" type="includable"/>
                            </xsl:when>
                            <!-- octave ends after requested measure – adjust both start and end -->
                            <xsl:when test="$end.measure/preceding::mei:measure[@xml:id = $measure.id]">
                                <xsl:variable name="notes" select="id($measure.id)/mei:staff[@n = $octave.elem/@staff]//mei:*[local-name() = ('note','chord')][@tstamp]" as="node()*"/>
                                <xsl:variable name="new.start">
                                    <xsl:for-each select="$notes">
                                        <xsl:sort select="@tstamp" data-type="number"/>
                                        <xsl:if test="position() = 1">
                                            <xsl:value-of select="concat('#',@xml:id)"/>
                                        </xsl:if>
                                    </xsl:for-each>    
                                </xsl:variable>
                                <xsl:variable name="new.end">
                                    <xsl:for-each select="$notes">
                                        <xsl:sort select="@tstamp" data-type="number"/>
                                        <xsl:if test="position() = last()">
                                            <xsl:value-of select="concat('#',@xml:id)"/>
                                        </xsl:if>
                                    </xsl:for-each>    
                                </xsl:variable>
                                <octave xmlns="http://www.music-encoding.org/ns/mei" dis="{$octave.elem/@dis}" dis.place="{$octave.elem/@dis.place}" startid="{$new.start}" endid="{$new.end}" staff="{$octave.elem/@staff}" type="includable"/>
                            </xsl:when>
                        </xsl:choose>
                    </xsl:for-each>
                </xsl:if>
            </xsl:otherwise>
        </xsl:choose>
    </xsl:template>
    <xsl:template match="mei:staff">
        <xsl:if test="string(@n) = $staff.n">
            <xsl:next-match/>
        </xsl:if>
    </xsl:template>
    <xsl:template match="mei:staffDef">
        <xsl:if test="@n = $staff.n">
            <xsl:copy>
                <xsl:if test="not(@label)">
                    <xsl:apply-templates select="ancestor::mei:staffDef/@label"/>
                </xsl:if>
                <xsl:apply-templates select="node() | @*" mode="#current"/>
            </xsl:copy>
        </xsl:if>
    </xsl:template>
    <xsl:template match="mei:staffGrp">
        <xsl:if test=".//mei:staffDef[@n = $staff.n]">
            <xsl:copy>
                <xsl:apply-templates select="@*" mode="#current"/>
                <xsl:attribute name="symbol" select="'line'"/>
                <xsl:apply-templates select="node()" mode="#current"/>
            </xsl:copy>
        </xsl:if>
    </xsl:template>
    
    <xsl:template match="mei:note | mei:chord | mei:rest">
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
    
    <xsl:template match="mei:scoreDef//mei:staffDef" mode="include.controlEvents">
        <xsl:variable name="staff.n" select="@n"/>
        <xsl:variable name="includable.clef" select="ancestor::mei:score//mei:measure[@xml:id = $measure.id]/preceding::mei:staffDef[@type = 'includable' and @n = $staff.n][1]" as="node()?"/>
        
        <xsl:copy>
            <xsl:apply-templates select="@*" mode="#current"/>
            <xsl:if test="exists($includable.clef)">
                <xsl:apply-templates select="$includable.clef/@clef.shape" mode="#current"/>
                <xsl:apply-templates select="$includable.clef/@clef.line" mode="#current"/>
            </xsl:if>
            <xsl:apply-templates select="node()" mode="#current"/>
        </xsl:copy>
        
    </xsl:template>
    
    <xsl:template match="mei:staffDef[@type = 'includable']" mode="include.controlEvents"/>
    
    <xsl:template match="mei:measure" mode="include.controlEvents">
        <xsl:copy>
            <xsl:apply-templates select="node() | @*" mode="#current"/>
            <xsl:copy-of select="preceding::mei:octave[@type = 'includable']"/>
        </xsl:copy>
    </xsl:template>
    
    <xsl:template match="mei:octave[@type='includable']" mode="include.controlEvents"/>

    <!-- generic copy template -->
    <xsl:template match="node() | @*" mode="#all">
        <xsl:copy>
            <xsl:apply-templates select="node() | @*" mode="#current"/>
        </xsl:copy>
    </xsl:template>
</xsl:stylesheet>