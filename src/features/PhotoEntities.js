import React from "react";

class PhotoEntities extends React.Component {
  constructor() {
    super();
    
    this.state = {
    }
  }
  
  async sendKnowledgeGraphRequest() {
    let ids = this.props.entities.slice(0, 5).map((e) => e.entityId);
    let resp = await fetch("https://kgsearch.googleapis.com/v1/entities:search?key=AIzaSyAqL5fhzoTxshwa79rW0yzYFEylBxqmTGs" + ids.map((id) => {
      return `&ids=${id}`;
    }).join(""));
    
    let obj = await resp.json();
    console.log(obj);
    
    let musicGroup = null;
    let musicAlbum = null;
    
    obj.itemListElement.forEach((item) => {
      let itemType = item.result["@type"][0];
      if(itemType === "MusicGroup" && musicGroup === null) {
        musicGroup = item.result
      }
      
      if(itemType === "MusicAlbum" && musicAlbum === null) {
        musicAlbum = item.result;
      }
    });
    
    this.setState({musicGroup, musicAlbum});
  }
  
  componentDidMount(){
    this.sendKnowledgeGraphRequest();
  }
  
  
  render(){
    return <p>Group: {this.state.musicGroup && this.state.musicGroup.name} album: {this.state.musicAlbum && this.state.musicAlbum.name}</p>
  }
}

export default PhotoEntities;