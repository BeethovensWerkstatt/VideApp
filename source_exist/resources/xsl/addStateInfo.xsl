<?xml version="1.0" encoding="UTF-8"?>
<xsl:stylesheet xmlns:xsl="http://www.w3.org/1999/XSL/Transform" xmlns:mei="http://www.music-encoding.org/ns/mei" xmlns:xs="http://www.w3.org/2001/XMLSchema" xmlns:math="http://www.w3.org/2005/xpath-functions/math" xmlns:xd="http://www.oxygenxml.com/ns/doc/xsl" exclude-result-prefixes="xs math xd mei" version="3.0">
    <xd:doc scope="stylesheet">
        <xd:desc>
            <xd:p>
                <xd:b>Created on:</xd:b> Dec 15, 2017</xd:p>
            <xd:p>
                <xd:b>Author:</xd:b> Johannes Kepper</xd:p>
            <xd:p/>
        </xd:desc>
    </xd:doc>
    <xsl:output method="xml" indent="yes"/>
    
    <xsl:template match="/">
        <xsl:apply-templates/>
    </xsl:template>
    
    <xsl:template match="mei:music">
        <xsl:copy>
            <xsl:apply-templates select="node() | @*" mode="#current">
                <xsl:with-param name="add.count" select="number(0)" as="xs:double" tunnel="yes"/>
                <xsl:with-param name="del.count" select="number(0)" as="xs:double" tunnel="yes"/>
            </xsl:apply-templates>
        </xsl:copy>
    </xsl:template>
    
    <xsl:template match="mei:music//mei:add[@changeState]" priority="1">
        <xsl:param name="add.count" as="xs:double" tunnel="yes"/>
        <xsl:copy>
            <xsl:apply-templates select="node() | @*" mode="#current">
                <xsl:with-param name="add" select="replace(@changeState,'#','')" tunnel="yes" as="xs:string"/>
                <xsl:with-param name="add.count" select="number($add.count) + 1" as="xs:double" tunnel="yes"/>
            </xsl:apply-templates>
        </xsl:copy>
    </xsl:template>
    
    <xsl:template match="mei:music//mei:restore[@changeState]" priority="1">
        <xsl:param name="add.count" tunnel="yes"/>
        <xsl:copy>
            <xsl:apply-templates select="node() | @*" mode="#current">
                <xsl:with-param name="add.count" select="number($add.count) + 1" as="xs:double" tunnel="yes"/>
            </xsl:apply-templates>
        </xsl:copy>
    </xsl:template>
    
    <xsl:template match="mei:music//mei:del[@changeState]" priority="1">
        <xsl:param name="del.count" as="xs:double" tunnel="yes"/>
        <xsl:copy>
            <xsl:apply-templates select="node() | @*" mode="#current">
                <xsl:with-param name="del.count" select="number($del.count) + 1" as="xs:double" tunnel="yes"/>
            </xsl:apply-templates>
        </xsl:copy>
    </xsl:template>
    
    <xsl:template match="mei:music//mei:*">
        <xsl:param name="add" tunnel="yes" required="no" as="xs:string?"/>
        <xsl:param name="add.count" as="xs:double" tunnel="yes" required="yes"/>
        <xsl:param name="del.count" as="xs:double" tunnel="yes" required="yes"/>
        <xsl:copy>
            <xsl:if test="(not($add) and (number($add.count) + number($del.count)) = 0) or (number($add.count) + number($del.count) gt 0)">
                <xsl:attribute name="final" select="'true'"/>
            </xsl:if>
            <xsl:if test="$add">
                <xsl:attribute name="add" select="$add"/>
            </xsl:if>
            <xsl:apply-templates select="node() | @*"/>
        </xsl:copy>
    </xsl:template>
    
    <xd:doc>
        <xd:desc>
            <xd:p>This is a generic copy template which will copy all content in all modes</xd:p>
        </xd:desc>
    </xd:doc>
    <xsl:template match="node() | @*" mode="#all">
        <xsl:copy>
            <xsl:apply-templates select="node() | @*" mode="#current"/>
        </xsl:copy>
    </xsl:template>
    
</xsl:stylesheet>