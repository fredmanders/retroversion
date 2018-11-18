import React from "react";

class PhotoEntities extends React.Component {
  constructor() {
    super();

    this.state = {
      musicAlbum: null,
      musicGroup: null
    }
  }

  async sendSpotifyRequest() {
    let album = this.state.musicAlbum
    let group = this.state.musicGroup

    let token = "BQCU7xZ0_uoDnw2E5eJRIKfezABRhJKTgtVOVpi8L_RSuEqJWnr2XWeoJ27Fjn7b0ZAo3AhiaH4q2lyO8dI\n";
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

    console.log("Spotify API result", obj);
  }

  async sendKnowledgeGraphRequest() {
    let ids = this.props.entities.slice(0, 5).map((e) => e.entityId);
    let resp = await fetch("https://kgsearch.googleapis.com/v1/entities:search?key=AIzaSyAqL5fhzoTxshwa79rW0yzYFEylBxqmTGs" + ids.map((id) => {
      return `&ids=${id}`;
    }).join(""));

    let obj = await resp.json();
    console.log("Google Knowledge Graph search result", obj);

    let musicGroup = null;
    let musicAlbum = null;
    let possibleBandNameFromAlbumDescription = null;

    // We can only trust the order of this.props.entities.
    this.props.entities.forEach((entity) => {
      // Search the matching kg search result
      var kgResultForEntity = obj.itemListElement.filter((element, index) => {
        let idWithoutKgColon = element.result["@id"].substring(3)
        return idWithoutKgColon == entity.entityId;
      });

      if (kgResultForEntity.length > 0) {
        kgResultForEntity = kgResultForEntity[0];

        let itemType = kgResultForEntity.result["@type"][0];

        if(itemType === "MusicGroup" && musicGroup === null) {
          musicGroup = kgResultForEntity.result
        }

        if(itemType === "MusicAlbum" && musicAlbum === null) {
          musicAlbum = kgResultForEntity.result;

          let description = kgResultForEntity.result.description;
          if (typeof description === 'string') {
            let splitBy = "album by";
            let indexOf = description.indexOf(splitBy);
            if (indexOf != -1) {
              possibleBandNameFromAlbumDescription = description.substring(indexOf+splitBy.length).trim();
            }
          }
        }
      }
    });

    if (musicGroup !== null) {
      musicGroup = musicGroup.name;
    }

    if (musicAlbum !== null) {
      musicAlbum = musicAlbum.name;
    }

    if (musicGroup === null) {
      musicGroup = possibleBandNameFromAlbumDescription;
    }

    // obj.itemListElement.forEach((item) => {
    //   console.log("an kg search item", item.result.name);

    //   let itemType = item.result["@type"][0];
    //   if(itemType === "MusicGroup" && musicGroup === null) {
    //     musicGroup = item.result
    //   }

    //   if(itemType === "MusicAlbum" && musicAlbum === null) {
    //     musicAlbum = item.result;
    //   }
    // });

    console.log("musicAlbum", musicAlbum);
    console.log("musicGroup", musicGroup);


    this.setState({musicGroup, musicAlbum}, this.sendSpotifyRequest);
  }

  componentDidMount(){
    this.sendKnowledgeGraphRequest();
  }


  render(){
    return <p>
      Group: <a href={this.state.artist_url}>{this.state.musicGroup}</a>
      Album: <a href={this.state.album_url}>{this.state.musicAlbum}</a>
      { this.props.entities.map(function (entity) {
        return (
          <li key={entity.entityId}>{entity.description} (<a href={`https://kgsearch.googleapis.com/v1/entities:search?key=AIzaSyAqL5fhzoTxshwa79rW0yzYFEylBxqmTGs&ids=${entity.entityId}`} target="_blank">{entity.entityId}</a>) (score: {entity.score})</li>
        );
      }) }
    </p>
  }
}

export default PhotoEntities;
