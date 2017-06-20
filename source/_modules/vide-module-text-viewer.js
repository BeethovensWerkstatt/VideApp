import 'babel-polyfill';
import VIDE_PROTOCOL from './vide-protocol';
import {EoModule, Request} from './vide-module-blueprint';


const VideTextViewer = class VideTextViewer extends EoModule {

    /*Constructor method*/
    constructor() {
        super();
        this._supportedPerspective = VIDE_PROTOCOL.PERSPECTIVE.TEXT;
        this._supportedRequests = [];
        
        let textReq = {object: VIDE_PROTOCOL.OBJECT.TEXT, 
            contexts:[], 
            perspective: this._supportedPerspective, 
            operation: VIDE_PROTOCOL.OPERATION.VIEW};
        this._supportedRequests.push(textReq);
        
        this._meiTextStore = new Map();
        this._meiTextStoreVideos = new Map();
        
        this._key = 'VideTextViewer';
        return this;
    }
    
    unmount(containerID) {
        //containerID = containerID.replace(/videMEITextViewer/, 'VIEWTYPE_TEXTVIEW_MEI');    
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
    
    _getIntroText(editionID) {
        let req = {id: editionID,type:'getIntroText'}
        return this.requestData(req,true);
    }
    
    _setupHtml(containerID) {
        
        //create html for menu
        let menuElem = document.createElement('div');
        menuElem.id = containerID + '_menu';
        menuElem.classList.add('menu');
        document.getElementById(containerID).appendChild(menuElem);
        
        //create html for content
        let containerElem = document.createElement('div');
        containerElem.id = containerID + '_content';
        containerElem.classList.add('contentBox');
        document.getElementById(containerID).appendChild(containerElem);
        
        this._setupViewSelect(containerID + '_menu', containerID);
        
        return Promise.resolve(containerElem);
        
    }
    
    getDefaultView(containerID) {
        
        let edition = this._eohub.getEdition();
        
        let req = {
            id: edition,
            object: VIDE_PROTOCOL.OBJECT.TEXT,
            contexts: [],
            perspective: this._supportedPerspective,
            operation: VIDE_PROTOCOL.OPERATION.VIEW
        }
        
        this.handleRequest(containerID,req,{});  
        
        /*if(this._meiTextStore.has(edition) && typeof this._meiTextStore.get(edition).introduction !== 'undefined') {
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
        }*/
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
    
    handleRequest(containerID,request,state = {}) {
        
        let editionID = this._eohub.getEdition();
        
        this._getIntroText(editionID).then((html) => {
            this._setupHtml(containerID).then((container) => {
                console.log('-------75')
                container.innerHTML = html;
                this._activateVideos(containerID);
            });
            
        });
        
    }
    
};

export default VideTextViewer;
