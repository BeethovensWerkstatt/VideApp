import React from 'react';
import PropTypes from 'prop-types';
import EditionListController, { EditionListMode } from './../containers/EditionListController.react';
import TourStartButtonController from './../containers/TourStartButtonController.react';

const Introduction = ({language }) => {
    if(language === 'de') {
        return (
            <div className="introduction">
                <h1>Beethovens Werkstatt</h1>
                <p>
                    Das Projekt Beethovens Werkstatt kombiniert zwei Forschungsansätze – Genetische Textkritik und Digitale Musikedition – um kompositorische Prozesse im Œuvre Beethovens zu untersuchen. 
                    In den einzelnen Modulen werden, begleitet von einer kontinuierlichen Erarbeitung terminologischer Verständigungsgrundlagen, die in unserem <a href="http://beethovens-werkstatt.de/philologisches-glossar/" target="_blank">Glossar</a> dokumentiert sind, ausgewählte Werke 
                    Beethovens mit dem Ziel untersucht, kompositorische Prozesse nachvollziehen zu können. Unsere Erkenntnisse modellieren wir in einer <a href="https://github.com/BeethovensWerkstatt/Data-Model" target="_blank">angepassten</a> Version der Codierungssprache <a href="http://music-encoding.org" target="_blank">MEI</a>. 
                    Die beobachteten kompositorischen Prozesse sollen auf der Basis dieser Codierungen mit der <a href="https://github.com/BeethovensWerkstatt/VideApp" target="_blank">neu entwickelten</a> VideApp leichter zugänglich
                    und nachvollziehbar gemacht werden. Diese Anwendung greift bestehend Konzepte digitaler Editionen auf, darunter insbesondere <a href="http://edirom.de" target="_blank">Edirom</a>. Der Schwerpunkt der VideApp liegt darauf, 
                    eine möglichst flexible und modulare Basis für die sehr unterschiedlichen Anforderungen unseres bis 2029 laufenden Projekts bereitzustellen.
                </p>
                {/* <h3>Was Sie hier finden</h3>*/}
                <p>
                    Nachfolgend finden Sie die bislang von uns bearbeiteten Fallstudien (die beiden noch separat zugänglichen Fallstudien zur <a href="http://beethovens-werkstatt.de/demo" target="_blank">Klaviersonate Op.111</a> 
                    und zum <a href="http://beethovens-werkstatt.de/demo2" target="_blank">Streichquartett Op.59,3</a> werden zu einem späteren Zeitpunkt integriert). Erste Ergebnisse aus unserem zweiten Modul werden ebenfalls an dieser 
                    Stelle präsentiert. Dabei konzentriert sich jede Fallstudie auf andere Aspekte unserer Forschung, und nicht jedes Beispiel unterstützt alle Features der Anwendung. Nach einem Klick auf die untenstehenden Werke erhalten 
                    Sie eine kurze Erläuterung, wo unser Hauptaugenmerk für die jeweilige Fallstudie liegt. Alternativ können Sie mit einer <TourStartButtonController firstStep='nav1'/> die wichtigsten Funktionen der Software kennenlernen. 
                </p>
                <EditionListController mode={EditionListMode.ROW}/>   
                {/*<h3>What this is not</h3>*/}
                <p>
                    Im Umgang mit diesen Fallstudien ist es wichtig, deren Charakter als Grundlagenforschung zu bedenken. Wir sind uns bewusst, dass diese Fallstudien in vielerlei Hinsicht unvollständig, vereinfachend und 
                    teilweise auch noch schlicht fehlerhaft sind. Gerade weil wir uns bemühen möchten, diese Einschränkungen im Laufe der Arbeiten zu beheben, ist es für uns wichtig, frühzeitig mit Ihnen als Nutzerin oder Nutzer 
                    in einen offenen Austausch zu treten. Bitte betrachten Sie daher sowohl sämtliche Inhalte als auch die gezeigte Anwendung als <b>öffentliche Beta-Version</b>. 
                </p>
                <p>
                    In einigen Fällen ist unsere inhaltliche Auseinandersetzung mit den gewählten Fallstudien noch nicht abgeschlossen oder sind unsere Codierungsmodelle noch nicht hinreichend ausgereift, um unsere Erkenntnisse 
                    angemessen wiederzugeben, und in vielen Fällen ist die Software noch nicht stabil genug, um alles wie gewünscht zu vermitteln. Unser Ziel ist es nicht, wissenschaftliche Editionen von Beethoven-Werken im
                    traditionellen Sinn zu erarbeiten, sondern vielmehr eine Methodik für textgenetische Editionen von Musik zu entwickeln und in digitaler Form umzusetzen. Die exemplarische Erstellung einer vollständigen Edition
                    ist ein Fernziel unseres Projekts. In Zwischenschritten versuchen wir  anhand einzelner Fallstudie, ausgewählte fachliche Aspekte in einer konkreten technischen Umsetzung zu erproben.
                </p>
                <p>
                    In einer der nächsten Revisionen der VideApp soll diese so erweitert werden, dass jeder Zustand der Anwendung über einen eindeutigen Link identifiziert und damit auch in Publikationen o.ä. referenziert werden
                    kann. Diese Funktion ist teilweise bereits in der aktuell vorliegenden Version integriert. Allerdings bitten wir Sie ausdrücklich, Sich vorläufig nicht auf die nachhaltige Verfügbarkeit der aktuell generierten 
                    Links zu verlassen. Falls Sie einen Eindruck von der Komplexität einer Anwendung wie der VideApp bekommen möchten, empfehlen wir Ihnen die Lektüre unseres Berichts
                    zur <a href="http://beethovens-werkstatt.de/softwareentwicklung-2017/" target="_blank">Softwareentwicklung</a> innerhalb 
                    des Projekts.
                </p>
                <h3>Feedback</h3>
                <p>
                    Selbstverständlich sind wir sehr an Ihren Rückmeldungen interessiert, sowohl hinsichtlich unserer Fallstudien, der Codierungsmodelle und der VideApp. Bitte senden Sie uns 
                    einfach eine <a href="mailto:info@beethovens-werkstatt.de">Email</a> mit ihren Beobachtungen, Vorschlägen oder Fragen.
                </p>
                <h3>Zum Datenschutz</h3>
                <p>
                    Jede Nutzung der VideApp wird serverseitig gespeichert. Dies ist eine leider unumgängliche Voraussetzung, um die Anwendung vollständig referenzierbar zu machen. Dabei werden jedoch keinerlei Informationen gespeichert, 
                    die eine Identifizierung des Benutzers erlauben! An personenbezogenen Daten werden lediglich Informationen zum genutzten 
                    Browser (der sogenannte "userAgent", der z.B. wie folgt aussehen kann: "<span className='sample'>Mozilla/5.0 (Macintosh; Intel Mac OS X 10.12; rv:54.0) Gecko/20100101 Firefox/54.0</span>"), 
                    sowie die im Browser hinterlegte bevorzugte Sprache (z.B. "<span className='sample'>de</span>") gespeichert. Darüber hinaus werden keine weiteren personenbezogenen Daten erhoben.
                </p>
            </div>
        );
    }
    
    return (
        <div className="introduction">
            <h1>Beethovens Werkstatt</h1>
            <p>
                The project combines two research approaches – genetic textual criticism and digital music editions – in order to examine compositional processes in the works of 
                Ludwig van Beethoven. The outcomes are manifold: First and foremost, we seek to establish a terminology of genetic textual criticism of music. This ongoing process
                is documented in our <a href="http://beethovens-werkstatt.de/philologisches-glossar/" target="_blank">Glossary</a> (an english translation will be provided
                when the terminology stabilizes). With this terminology, we approach various works by Beethoven, based on criteria provided in our <a href="http://beethovens-werkstatt.de/projekt/" target="_blank">work plan</a>, in order to trace compositional processes. Those findings are then modelled 
                in <a href="https://github.com/BeethovensWerkstatt/Data-Model" target="_blank">custom version</a> of <a href="http://music-encoding.org" target="_blank">MEI</a>.
                Ultimately, we try to make those processes more accessible and comprehensible with our <a href="https://github.com/BeethovensWerkstatt/VideApp" target="_blank">custom-built</a> web application, the VideApp. This application draws heavily on other tools, most
                notably the <a href="http://edirom.de" target="_blank">Edirom</a>, but tries to be a more flexible, modular platform that better fits the different needs of our 
                16-year project.
            </p>
            <h3>What you will find here</h3>
            <p>
                In the box below, you will find all the case studies we've been working on so far (the <a href="http://beethovens-werkstatt.de/demo" target="_blank">piano sonata Op.111</a> and <a href="http://beethovens-werkstatt.de/demo2" target="_blank">string
                quartet Op.59,3</a> examples will be integrated here at a later stage). As soon as there
                is something to show, we will include works from our second module here as well. Each example will showcase different aspects of our research, and not every feature
                will be available in each case study. If you click on one of the images, you will get a brief explanation of what our focus was in that case. 
                Alternatively, you may take a <TourStartButtonController firstStep='nav1'/> explaining the functionality of the VideApp.
            </p>
            <EditionListController mode={EditionListMode.ROW}/>
            <h3>What this is not</h3>
            <p>
                When working with those case studies, it's important to keep in mind that we're doing basic research here. We are fully aware about a whole number of limitations, shortcomings, and 
                even plain errors in our case studies. Of course we will try to address all of them at some point, but we prefer to open up a discussion with various involved communities 
                rather sooner than later. Please consider everything we provide here as <b>public beta</b> version.
            </p>
            <p>
                Sometimes, our musicological examination of a work is still ongoing, sometimes our encodings are not (yet) able to describe everything we'd like to say, and it's quite
                likely that the VideApp you see here is not yet able to surface all of our findings properly. We are not trying to provide proper scholarly editions of Beethoven's works 
                here, even though we do try to consider the current state of Beethoven research as much as possible. But we do have a different focus – we seek to establish a methodology 
                for genetic editions of music, implemented in digital media. Ultimately, we plan to come up with an example of a complete digital genetic edition, but there are many
                preliminary steps before we can get there. Until then, all we do are case studies that cover certain aspects of genetic textual criticism and explore specific
                digital solutions. 
            </p>
            <p>
                With one of our next releases, we plan to make each state of the VideApp addressable,
                so that you can link to any given state of the application and include that in publications. While this feature is partly included already, we explicitly don't guarantee
                that the links generated by the current VideApp will sustain – please don't rely on those links yet. If you are interested in the complexities of developing a software
                like this VideApp, please read our <a href="http://beethovens-werkstatt.de/softwareentwicklung-2017/" target="_blank">introductory report</a>.
            </p>
            <h3>Feedback</h3>
            <p>
                Of course we are very interested in getting feedback – about our case studies, our encoding models, and also about the VideApp. Please
                send an <a href="mailto:info@beethovens-werkstatt.de">email</a> to us with all your suggestions, questions and observations.
            </p>
            <h3>One note about privacy</h3>
            <p>
                The VideApp tracks every user session. This is a side effect of the intended ability to reference every state of the application – if you want others to see the same thing
                that you see right now, we need to store that information somehow on a server. In order to improve our application, we also store some personal information. 
                This includes two things: the browser used (the so-called "userAgent", which may look like "<span className='sample'>Mozilla/5.0 (Macintosh; Intel Mac OS X 10.12; rv:54.0) Gecko/20100101 Firefox/54.0</span>"), 
                and the preferred browser language (for instance "<span className='sample'>de</span>"). This information does not allow us to identify individual users, and we're not interested in getting that information.
                {/*In the future, we may use a so-called <a href="https://en.wikipedia.org/wiki/Magic_cookie" target="_blank">cookie</a> to recognize users across sessions, given their 
                explicit consent, in order to analyze if users utilize our application differently when they know it already. But to be honest, we have more important things to work on, so this 
                has an extremely low priority and may actually never happen. If it will be implemented, it will definitely be optional, with an explicit opt-in.*/}
            </p>
        </div>
    );
};

Introduction.propTypes = {
    language: PropTypes.string.isRequired
};

export default Introduction;