import React, { Component } from 'react';
import { Image, Grid, Row, Col, Modal } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { logout } from '../helpers/auth';
import FileUploader from 'react-firebase-file-uploader';
import firebase from 'firebase';
import { ScaleLoader } from 'react-spinner';
import SpotifyWebApi from 'spotify-web-api-js';
const spotifyApi = new SpotifyWebApi();

const appTokenKey = "appToken";
export default class Home extends Component {

    constructor(props) {
        super(props);

        const params = this.getHashParams();
        console.log(params);
        const token = params.access_token;
        if (token) {
          spotifyApi.setAccessToken(token);
        }

        // check if we are on a mobile device
        this.isMobile = () => {
          var check = false;
          (function(a){if(/(android|bb\d+|meego).+mobile|avantgo|bada\/|blackberry|blazer|compal|elaine|fennec|hiptop|iemobile|ip(hone|od)|iris|kindle|lge |maemo|midp|mmp|mobile.+firefox|netfront|opera m(ob|in)i|palm( os)?|phone|p(ixi|re)\/|plucker|pocket|psp|series(4|6)0|symbian|treo|up\.(browser|link)|vodafone|wap|windows ce|xda|xiino|android|ipad|playbook|silk/i.test(a)||/1207|6310|6590|3gso|4thp|50[1-6]i|770s|802s|a wa|abac|ac(er|oo|s\-)|ai(ko|rn)|al(av|ca|co)|amoi|an(ex|ny|yw)|aptu|ar(ch|go)|as(te|us)|attw|au(di|\-m|r |s )|avan|be(ck|ll|nq)|bi(lb|rd)|bl(ac|az)|br(e|v)w|bumb|bw\-(n|u)|c55\/|capi|ccwa|cdm\-|cell|chtm|cldc|cmd\-|co(mp|nd)|craw|da(it|ll|ng)|dbte|dc\-s|devi|dica|dmob|do(c|p)o|ds(12|\-d)|el(49|ai)|em(l2|ul)|er(ic|k0)|esl8|ez([4-7]0|os|wa|ze)|fetc|fly(\-|_)|g1 u|g560|gene|gf\-5|g\-mo|go(\.w|od)|gr(ad|un)|haie|hcit|hd\-(m|p|t)|hei\-|hi(pt|ta)|hp( i|ip)|hs\-c|ht(c(\-| |_|a|g|p|s|t)|tp)|hu(aw|tc)|i\-(20|go|ma)|i230|iac( |\-|\/)|ibro|idea|ig01|ikom|im1k|inno|ipaq|iris|ja(t|v)a|jbro|jemu|jigs|kddi|keji|kgt( |\/)|klon|kpt |kwc\-|kyo(c|k)|le(no|xi)|lg( g|\/(k|l|u)|50|54|\-[a-w])|libw|lynx|m1\-w|m3ga|m50\/|ma(te|ui|xo)|mc(01|21|ca)|m\-cr|me(rc|ri)|mi(o8|oa|ts)|mmef|mo(01|02|bi|de|do|t(\-| |o|v)|zz)|mt(50|p1|v )|mwbp|mywa|n10[0-2]|n20[2-3]|n30(0|2)|n50(0|2|5)|n7(0(0|1)|10)|ne((c|m)\-|on|tf|wf|wg|wt)|nok(6|i)|nzph|o2im|op(ti|wv)|oran|owg1|p800|pan(a|d|t)|pdxg|pg(13|\-([1-8]|c))|phil|pire|pl(ay|uc)|pn\-2|po(ck|rt|se)|prox|psio|pt\-g|qa\-a|qc(07|12|21|32|60|\-[2-7]|i\-)|qtek|r380|r600|raks|rim9|ro(ve|zo)|s55\/|sa(ge|ma|mm|ms|ny|va)|sc(01|h\-|oo|p\-)|sdk\/|se(c(\-|0|1)|47|mc|nd|ri)|sgh\-|shar|sie(\-|m)|sk\-0|sl(45|id)|sm(al|ar|b3|it|t5)|so(ft|ny)|sp(01|h\-|v\-|v )|sy(01|mb)|t2(18|50)|t6(00|10|18)|ta(gt|lk)|tcl\-|tdg\-|tel(i|m)|tim\-|t\-mo|to(pl|sh)|ts(70|m\-|m3|m5)|tx\-9|up(\.b|g1|si)|utst|v400|v750|veri|vi(rg|te)|vk(40|5[0-3]|\-v)|vm40|voda|vulc|vx(52|53|60|61|70|80|81|83|85|98)|w3c(\-| )|webc|whit|wi(g |nc|nw)|wmlb|wonu|x700|yas\-|your|zeto|zte\-/i.test(a.substr(0,4))) check = true;})(navigator.userAgent||navigator.vendor||window.opera);
          return check;
        };

        this.state = {
          allPhotos: [],
          showModal: false,
          currentPhoto: '',
          isMobile: this.isMobile(),
          imageRef: '',
          loggedIn: token ? true : false,
          nowPlaying: { name: 'Not Checked', albumArt: '' }
        }; 

        this.handleLogout = this.handleLogout.bind(this);
        this.getInitial = this.getInitial.bind(this);
        this.handleClose = this.handleClose.bind(this);
        this.handleRemove = this.handleRemove.bind(this);
        this.handleUploadSuccess = this.handleUploadSuccess.bind(this);
    }

    getHashParams() {
      var hashParams = {};
      var e, r = /([^&;=]+)=?([^&;]*)/g,
          q = window.location.hash.substring(1);
      e = r.exec(q)
      while (e) {
         hashParams[e[1]] = decodeURIComponent(e[2]);
         e = r.exec(q);
      }
      return hashParams;
    }

getNowPlaying(){
  spotifyApi.getMyCurrentPlaybackState()
    .then((response) => {
      this.setState({
        nowPlaying: { 
            name: response.item.name, 
            albumArt: response.item.album.images[0].url
          }
      });
    })
}

    handleClose() {
      this.setState({
        showModal: false,
        currentPhoto: ''
      });
    }

    async handleRemove(id) {
      console.log('photo id', id)
      await firebase.firestore().collection('photos').doc(id).delete();
      this.getInitial();
    }    


    componentDidMount() {
        this.getInitial();
    }


    getInitial() {
        firebase.auth().onAuthStateChanged(user => {

            let userId = user.uid;
            let imageRef = `images/${userId}`;

            this.setState({ imageRef });

            if (user) {

                firebase.firestore().collection('photos').where('userId', '==', user.uid).onSnapshot(snapshot => {
                    let allPhotos = [];
                    snapshot.forEach(doc => {
                      var newItem = doc.data();
                      newItem.id = doc.id;
                      allPhotos.push(newItem);
                    });

                    console.log('allPhotos', allPhotos);

                    this.setState({ allPhotos });
                });

            }

        });

    }


    handleLogout() {
        logout()
        .then(() => {
            localStorage.removeItem(appTokenKey);
            this.props.history.push("/login");
            console.log("user signed out from firebase");            
        });
    }

    async handleUploadSuccess(filename) {
        try {
          console.log("file name", filename);
          console.log("this", this);

            let { bucket, fullPath } = await firebase.storage().ref(this.state.imageRef).child(filename).getMetadata();
            console.log('bucket', bucket)
            console.log('fullPath', fullPath)
            let downloadURL = await firebase.storage().ref(this.state.imageRef).child(filename).getDownloadURL();
            console.log('downloadURL', downloadURL)

            let { uid, email, displayName } = await firebase.auth().currentUser;

            let newPhoto = {
                url: downloadURL,
                userName: displayName,
                userId: uid,
                email,
                bucket,
                fullPath
            }
            console.log('newPhoto', newPhoto);

            let photoAdded = await firebase.firestore().collection('photos').add(newPhoto);
            console.log('photoAdded', photoAdded);
        } 

        catch(err) {
            console.error(err);
        }

    }

    playSong(photo) {
      console.log("Play song", photo);
      let query = photo.googleVision.webDetection.webEntities[0].description;
      console.log("Spotify search query", query);
      spotifyApi.search(query, ["album", "artist", "track"], function(err, data) {
        if (err) console.error(err);
        else {
          console.log('Query results', data);
          let contextUri = data.albums.items[0].uri;
          console.log('Playing', contextUri);

          spotifyApi.play({
            "context_uri": contextUri
          })
        };
      });
    }

	render() {

        const allImages = this.state.allPhotos.map(photo => {

          if (photo.googleVision) {

            if (photo.googleVision.faceAnnotations[0]) {
              this.fa = photo.googleVision.faceAnnotations[0];
              this.face = <>
                <li>anger likelihood: {this.fa.angerLikelihood}</li>
                <li>blurred likelihood: {this.fa.blurredLikelihood}</li>
                <li>headwear likelihood: {this.fa.headwearLikelihood}</li>
                <li>joy likelihood: {this.fa.joyLikelihood}</li>
                <li>sorrow likelihood: {this.fa.sorrowLikelihood}</li>
                <li>surprise likelihood: {this.fa.surpriseLikelihood}</li>
                <li>under exposed likelihood: {this.fa.underExposedLikelihood}</li>
                <li>confidence: {this.fa.detectionConfidence}</li>
              </>
            } else {
              this.face = <li>No face found</li>
            }
            if (photo.googleVision.labelAnnotations) {
              this.lbla = photo.googleVision.labelAnnotations;
              this.labels = this.lbla.map(label => {
                return (
                  <li>{label.description} (score: {label.score})</li>
                );
              });
            } else {
              this.labels = <li>No labels</li>
            }
            if (photo.googleVision.landmarkAnnotations) {
              this.lma = photo.googleVision.landmarkAnnotations;
              this.landmarks = this.lma.map(landmark => {
                return (
                  <li>{landmark.description} (score: {landmark.score})</li>
                );
              });
            } else {
              this.landmarks = <li>No labels</li>
            }
            if (photo.googleVision.logoAnnotations) {
              this.loa = photo.googleVision.logoAnnotations;
              this.logos = this.loa.map(logo => {
                return (
                  <li>{logo.description} (score: {logo.score})</li>
                );
              });
            } else {
              this.logos = <li>No labels</li>
            }
            if (photo.googleVision.safeSearchAnnotation) {
              this.safe = photo.googleVision.safeSearchAnnotation;
              this.safeSearch = 
                <>
                  <li>adult likelihood: {this.safe.adult}</li>
                  <li>medical likelihood: {this.safe.medical}</li>
                  <li>racy likelihood: {this.safe.racy}</li>
                  <li>spoof likelihood: {this.safe.spoof}</li>
                  <li>violence likelihood: {this.safe.violence}</li>
                </>
            } else {
              this.safeSearch = <li>No safe search found</li>
            }
            if (photo.googleVision.textAnnotations) {
              this.text = photo.googleVision.textAnnotations.map(text => {
                return (
                  <li>{text.description} (score: {text.score})</li>
                );
              });
            } else {
              this.text = <li>No text found</li>
            }
            if (photo.googleVision.webDetection) {

              if (photo.googleVision.webDetection.bestGuessLabels) {
                this.webLabels = photo.googleVision.webDetection.bestGuessLabels.map(label => {
                  return (
                    <li>{label.label}</li>
                  );
                });
              } else {
                this.webLabels = <li>No web labels</li>
              }

              if (photo.googleVision.webDetection.visuallySimilarImages) {
                this.dopples = photo.googleVision.webDetection.visuallySimilarImages.map(similarPhoto => {
                  const styles = {
                    backgroundImage: "url(" + similarPhoto.url + ")",
                  }
                  return (
                    <div
                      onClick={() => this.setState({ showModal: true, currentPhoto: similarPhoto.url })}
                      style={styles}
                      className="main-photo card-1 card"
                      key={similarPhoto.url}
                      xs={4} > {similarPhoto.score}
                    </div>
                  );
                });
              } else {
                this.dopples = <div></div>
              }

              if (photo.googleVision.webDetection.webEntities) {
                this.entities = photo.googleVision.webDetection.webEntities.map(entity => {
                  return (
                    <li>{entity.description} (score: {entity.score})</li>
                  );
                });
              } else {
                this.entities = <li>No entities</li>
              }
            }

          }

          return (
            <div key={photo.id}>
                <div style={{minHeight: '215px'}}>
                    <i onClick={() => this.handleRemove(photo.id)} className="bottom-icon material-icons main-close">close</i>
                    <Image style={{ width: '100%' }} onClick={() => this.playSong(photo)} src={photo.url} responsive />
                </div>

                <h2>Face detection</h2>
                <ul>{this.face}</ul>

                <h2>Labels</h2>
                <ul>
                  {this.labels}
                </ul>

                <h2>Landmark</h2>
                <ul>{this.landmarks}</ul>

                <h2>Logo</h2>
                <ul>{this.logos}</ul>

                <h2>Safe search</h2>
                <ul>{this.safeSearch}</ul>
                
                <h2>Text</h2>
                <ul>{this.text}</ul>

                <h2>Web labels</h2>
                <ul>{this.webLabels}</ul>

                <h2>Web entities</h2>
                <ul>{this.entities}</ul>

                <h2>Similar images</h2>
                <div className="scrolling-wrapper">
                  {this.dopples}
                </div>

                <Modal show={this.state.showModal} onHide={this.handleClose}>
                    <Modal.Header closeButton>
                      <Modal.Title>Google said you look like...</Modal.Title>
                    </Modal.Header>
                    <Modal.Body>
                      <Image style={{ width: '100%' }} src={this.state.currentPhoto} responsive />

                    </Modal.Body>
                    <Modal.Footer>
                      <div onClick={this.handleClose}>Close</div>
                    </Modal.Footer>
                </Modal>


            </div>
          );
        })

		return (<>
			<div class="content">
        <h1>Retroversion</h1>
        {allImages}
        
        <div className="App">
          <a href='https://accounts.spotify.com/authorize?client_id=c7643b96b1c241e69501596c7bc0ba2a&response_type=token&redirect_uri=http://localhost:3000/app/home&scope=user-modify-playback-state' > Login to Spotify </a>
          <div>
            Now Playing: { this.state.nowPlaying.name }
          </div>
          <div>
            <img src={this.state.nowPlaying.albumArt} style={{ height: 150 }}/>
          </div>
        </div>

 		  </div>
      <Grid className="bottom-nav">
        <Row className="show-grid">
          <Col xs={4} className="col-bottom">
              <Link to="/app/album"><i className="bottom-icon material-icons">collections</i></Link>
          </Col>
          <Col xs={4} className="col-bottom">

                      <label>
                          <i className="bottom-icon material-icons">camera_alt</i>
                          <FileUploader
                            hidden
                            accept="image/*"
                            storageRef={firebase.storage().ref(this.state.imageRef)}
                            onUploadStart={this.handleUploadStart}
                            onUploadError={this.handleUploadError}
                            onUploadSuccess={this.handleUploadSuccess}
                            onProgress={this.handleProgress}
                          />
                        </label>


          </Col>
          <Col onClick={this.handleLogout} xs={4} className="col-bottom">
            <i className="bottom-icon material-icons">assignment_return</i>
          </Col>
        </Row>
      </Grid>
		</>);
	}
}