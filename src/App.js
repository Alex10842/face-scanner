import React, { Component } from 'react';
import Navigation from './navigation/navigation';
import Signin from './components/SignIn/SignIn';
import Logo from './components/logo/Logo';
import ImageLinkForm from './components/ImageLinkForm/ImageLinkForm';
import FaceRecognition from './components/FaceRecognition/FaceRecognition';
import Rank from './components/Rank/Rank';
import Particles from 'react-particles-js';
import './App.css';
import 'tachyons';
import Clarifai from 'clarifai';
import  Register from './components/Register/Register'

const app = new Clarifai.App({
 apiKey: '58c8de9182554aa6b603d7ad2abfe9b9'
});

const initialState = {
      input: '',
      imageUrl: '',
      box: {},
      route: 'signin',
      isSignedIn: false,
      user: {
        id: '',
        name: '',
        email: '',
        entries: 0,
        joined: ''
      }
    }

const particlesOptions = {

  particles: {
    number: {
      density: {
        enable: true,
        value_area:800
      }
    },

    /*shape: {
      type: "image",
    
      image: {
      src: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTkie2uhfILXiO_uKKUG0lZOQxYVom3Oih96qTvLZOPZp1wixQo",
      width: 50,
      height: 50
    }
    }*/
  },

  interactivity: {
    detect_on: "window",
    events: {
      onhover: {
        enable: true,
        mode: "bubble"
      },
    },

    modes: {
      bubble: {
        distance: 350,
        size: 10
      }
    }
  }

}


class App extends Component {
  constructor(){
    super();
    this.state = initialState;

  }


  loadUser = (data) => {
    this.setState({user: {
      id: data.id,
        name: data.name,
        email: data.email,
        entries: data.entries,
        joined: data.joined

    }})
  }

  calculateFaceLocation = (data) => {
    const clarifaiFace = data.outputs[0].data.regions[0].region_info.bounding_box;
    const image = document.getElementById('inputimage');
    const width = Number(image.width);
    const height = Number(image.height);

    return {
      leftCol: clarifaiFace.left_col * width,
      topRow: clarifaiFace.top_row * height,
      rightCol: width - (clarifaiFace.right_col * width),
      bottomRow: height - (clarifaiFace.bottom_row * height)
    }
  }

  displayFaceBox = (box) => {
    this.setState({box: box});
  }

  onInputChange = (event) => {
    this.setState({input: event.target.value});
  }

   onButtonSubmit = () => {
    this.setState({imageUrl: this.state.input});
    app.models
      .predict(
        Clarifai.FACE_DETECT_MODEL,
        this.state.input)
      .then(response => {
         if (response) {
    //       fetch('https://fast-ravine-70894.herokuapp.com/imageurl', {
    //         method: 'put',
    //         headers: {'Content-Type': 'application/json'},
    //         body: JSON.stringify({
    //           id: this.state.user.id
    //         })
    //       })
    //         .then(response => response.json())
    //         .then(count => {
    //           this.setState(Object.assign(this.state.user, { entries: count}))
    //         })
    //         .catch(console.log);

         }
        this.displayFaceBox(this.calculateFaceLocation(response))
      })
      .catch(err => console.log(err));
  }

  onRouteChange = (route) => {
    if(route === 'signout'){
      this.setState(initialState);
    } else if (route === 'home'){
      this.setState({isSignedIn: true});
    }
    this.setState({route: route});
  }

  render() {
    //destructuring this.state so it doesn't need to be constantly typed
    const {isSignedIn, imageUrl, box} = this.state;
    let route = 'home';

    return (
      <div className="App">
         <Particles className='particles' params={particlesOptions}/>
         
        {route === 'home' 
        ? <div> 
            <Logo />
            <ImageLinkForm 
              onInputChange={this.onInputChange} 
              onButtonSubmit={this.onButtonSubmit}
            />
            <FaceRecognition box={box} imageUrl={imageUrl}/>
          </div>
        : 
        (route === 'signin' 
          ? <Signin  loadUser={this.loadUser} onRouteChange={this.onRouteChange}/>
          : <Register loadUser={this.loadUser} onRouteChange={this.onRouteChange}/>
          )
        
        }
      </div>
    );
  }
}

export default App;
