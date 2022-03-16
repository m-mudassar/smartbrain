import React from 'react';
import * as faceapi from 'face-api.js';
import Navigation from './components/Navigation/Navigation';
import Signin from './components/Signin/Signin';
import Register from './components/Register/Register';
import Logo from './components/Logo/Logo';
import ImageLinkForm from './components/ImageLinkForm/ImageLinkForm';
import Rank from './components/Rank/Rank';
import FaceRecognition from './components/FaceRecognition/FaceRecognition';
import Particles from "react-tsparticles";
import './App.css';



const particleOptions ={
  particles: {
    links: {
      color: "#ffffff",
      distance: 150,
      enable: true,
      opacity: 0.5,
      width: 1,
    },
    collisions: {
      enable: true,
    },
    move: {
      direction: "none",
      enable: true,
      outMode: "bounce",
      random: false,
      speed: 2,
      straight: false,
    },
    number: {
      density: {
        enable: true,
        area: 800,
      },
      value: 50,
    }
  }
  
}

class App extends React.Component {
  constructor() {
    super();
    this.state = {
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
        joined: 'new Date()'
      }
    }
  }

  loadUser = (data) => {
    this.setState({
      user: {
      id: data.id,
      name: data.name,
      email: data.email,
      entries: data.entries,
      joined: data.joined
    }
    })
  }

  calculateFaceLocation = (data) => {
   const face = data[0].detection.box  
   return {
      leftCol: face.left + 20,
      topRow: face.top,
      rightCol: face.right,
      bottomRow: face.bottom,
      height: face.height + 50
    }
  }
  
  displayFaceBox = (box) => {
    this.setState({box: box})
  }

  onInputChange = (event) => {
    this.setState({input: event.target.value})
    this.displayFaceBox(
      {
        leftCol: 0,
      topRow: 0,
      rightCol: 0,
      bottomRow: 0,
      height: 0
      }
    )
  }
  
  onButtonSubmit = () => {
    this.setState({imageUrl: this.state.input})

    const image = document.createElement('img')
    image.setAttribute('crossorigin', 'anonymous')
    image.setAttribute('src', this.state.input)
    
    Promise.all ([
      faceapi.nets.faceRecognitionNet.loadFromUri('/models'),
      faceapi.nets.tinyFaceDetector.loadFromUri('/models')
    ])
    .then(()=>{
      const detections = faceapi.detectAllFaces(image, new faceapi.TinyFaceDetectorOptions())
      .withFaceLandmarks()
      return detections.parentTask
    })
    .then((value)=>{
      this.displayFaceBox(this.calculateFaceLocation(value))
      fetch('http://localhost:3001/image', {
        method: 'put',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({
          id: this.state.user.id
        })
      }).then(response => response.json())
      .then(count => {
        this.setState(Object.assign(this.state.user, {entries: count}))
      })
    })
    .catch(err => console.log(err));
  }

  onRouteChange = (route) => {
    if (route === 'signin') {
      this.setState({isSignedIn: false})
    } else if (route === 'home') {
      this.setState({isSignedIn: true})
    } else if(route === 'register') {
      this.setState({isSignedIn: false})
    }

    this.setState({route: route})
  }

  render(){
    const { isSignedIn, box, input} = this.state
    return (
      <div className="App">
        <Particles      
        className='particles'
        options={particleOptions}
        />
        <Navigation onRouteChange={this.onRouteChange} isSignedIn={isSignedIn} />
        {
        this.state.route === 'home' 
          ? <div>
              <Logo />
              <Rank name={this.state.user.name} entries={this.state.user.entries} />
              <ImageLinkForm onInputChange={this.onInputChange} onButtonSubmit={this.onButtonSubmit} />
              <FaceRecognition box={box} id="image" imageUrl={input} />
            </div>
        : (
          this.state.route === 'signin' 
          ? <Signin onRouteChange={this.onRouteChange} loadUser={this.loadUser} /> 
          : <Register onRouteChange={this.onRouteChange} loadUser={this.loadUser} />
         )
        } 
      </div>
    );
  }
}

export default App;
