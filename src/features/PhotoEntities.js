import React from "react";

class PhotoEntities extends React.Component {
  constructor() {
    super();
    
    this.state = {
    }
  }
  
  async sendSpotifyRequest() {
    let album = this.state.musicAlbum && this.state.musicAlbum.name;
    let group = this.state.musicGroup && this.state.musicGroup.name;
    
    let token = "BQD7eGIRAiF_Wlj3CgE_BaBeOO1IAQW7lO68RH-Y7-xIZe39FWVB2ApQj2dWoiaHAKJNQ7sfyl0m9LzNO_o\n";
    let resp = await fetch(`https://api.spotify.com/v1/search?q=album:${album} artist:${group}&type=album`, {
      method: "GET",
      headers: {
        "Authorization": `Bearer ${token}`
      }
      
    });
    
    let obj = await resp.json();
    
    if(obj.albums && obj.albums.items.length > 0){
      let album = obj.albums.items[0];
      let album_url = album.external_urls.spotify;
      let artist_url = album.artists[0].external_urls.spotify;
      this.setState({album_url, artist_url});
    }
    
    console.log(obj);
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
    
    this.setState({musicGroup, musicAlbum}, this.sendSpotifyRequest);
  }
  
  componentDidMount(){
    this.sendKnowledgeGraphRequest();
  }
  
  
  render(){
    return <p>
      Group: <a href={this.state.artist_url}>{this.state.musicGroup && this.state.musicGroup.name}</a>
      album: <a href={this.state.album_url}>{this.state.musicAlbum && this.state.musicAlbum.name}</a>
    </p>
  }
}

export default PhotoEntities;