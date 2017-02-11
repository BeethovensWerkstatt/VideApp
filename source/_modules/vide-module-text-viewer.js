import 'babel-polyfill';
import VIDE_PROTOCOL from './vide-protocol';
import {EoModule, Request} from './vide-module-blueprint';


const VideTextViewer = class VideMEITextViewer extends EoModule {

    /*Constructor method*/
    constructor() {
        super();
        this._supportedPerspective = EO_Protocol.Perspective.PERSPECTIVE_TEXT;
        this._supportedRequests = [];
        let _this = this;
        
        this._meiTextStore = new Map();
        this._meiTextStoreVideos = new Map();
        
        this._key = 'videMEITextViewer';
        this._serverConfig = {host: 'http://localhost', port: ':32107', basepath:'/'};
        return this;
    }
    
    unmount(containerID) {
        containerID = containerID.replace(/videMEITextViewer/, 'VIEWTYPE_TEXTVIEW_MEI');    
        if(this._meiTextStoreVideos.has(containerID)) {
            let array = this._meiTextStoreVideos.get(containerID);
            try {
                for (let video of array) {
                    video.destroy();
                }    
            } catch(err) {
                console.log('[ERROR] unable to destroy clappr video(s) in videMEITextViewer.js');   
            }            
        }
        
        //document.getElementById(containerID).innerHTML = '';
    }
    
    getDefaultView(containerID) {
        containerID = containerID.replace(/videMEITextViewer/, 'VIEWTYPE_TEXTVIEW_MEI');
        let edition = this._eohub.getEdition();
        
        if(this._meiTextStore.has(edition) && typeof this._meiTextStore.get(edition).introduction !== 'undefined') {
            document.getElementById(containerID).innerHTML = this._meiTextStore.get(edition).introduction;
            this._activateVideos(containerID);
            
            return Promise.resolve(this);
        } else {
            let responseType = 'text';
            let url = this._getBaseURI() + 'edition/' + edition + '/introduction.html';
            let _this = this;
            
            let dataRequest = new DataRequest(responseType, url);
            return Promise.resolve(
                this._eohub.requestData(dataRequest)
                    .then((html) => {
                        document.getElementById(containerID).innerHTML = html;
                        _this._activateVideos(containerID);
                        
                        if(typeof callback === 'function') {
                            callback();
                        }
                    })
            );
        }
    }
    
    _activateVideos(containerID) {
        this._meiTextStoreVideos.set(containerID, []);
        
        let videos = document.getElementsByClassName('video');
        
        for(let video of videos) {
            if(video.getAttribute('id') === '') {
                console.log('[ERROR] video file lacks @xml:id');
            } else {     
                let player = new Clappr.Player({
                    source: video.getAttribute('data-videourl'),
                    poster: video.getAttribute('data-videourl').replace(/mp4/, 'png'),
                    parentId: '#' + video.getAttribute('id'),
                    width: 504,
                    height: 300,
                    mute: true
                });
                this._meiTextStoreVideos.get(containerID).push(player);
            }
        }
    }
    
    handleRequest(request) {
        console.log('[DEBUG] At this point, its not possible to handle the following request in videMEITextViewer.js:');
        console.log(request);
        
        /*let fullContainer = (request.getContainer() + '_' + this._key).replace(/videXMLviewer/,'VIEWTYPE_XMLVIEW');
        
        let edition = this._eohub.getEdition();
        let targetObject = request.getObjectID();
        
        let htmlElem = document.getElementById(fullContainer + '_editor');
        
        let func = (editor) => {
            
            editor.resize(true);
            editor.find('id="' + targetObject + '"',{},true);
            
        };
        
        if(typeof window.aceStore === 'undefined' || typeof window.aceStore[this._eohub.getEdition()] === 'undefined')
            this.getDefaultView(fullContainer, func);
        else if(htmlElem === null) {
            //console.log('[DEBUG] need to set up HTML first');
            let editor = this._setupHtml(fullContainer);
            editor.setValue(window.aceStore[this._eohub.getEdition()].xml);
            editor.clearSelection();
            
            func(editor);
        }
            
        else
            func(window.aceStore[this._eohub.getEdition()].editor);
        */
    }
    
};

export default VideTextViewer;
