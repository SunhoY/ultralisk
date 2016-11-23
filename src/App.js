import React, {Component} from 'react';
import cookie from 'react-cookie';
import * as firebase from 'firebase';
import './App.css';

const firebaseConfig = {
    apiKey: "AIzaSyD1dwdlLGu9rtPE6T7tqqURaK-GCRie7wo",
    authDomain: "ultralisk-c45b9.firebaseapp.com",
    databaseURL: "https://ultralisk-c45b9.firebaseio.com",
    storageBucket: "ultralisk-c45b9.appspot.com",
    messagingSenderId: "327293237250"
};

const firebaseApp = firebase.initializeApp(firebaseConfig);
const firebaseReference = firebaseApp.database().ref();

class App extends Component {
    constructor(props) {
        super(props);

        const attendance = cookie.load('attendance');
        let geolocationAvailable = false;
        let geolocation;

        if("geolocation" in navigator) {
            geolocationAvailable = true;
        }

        this.state = {
            buttonText: attendance === undefined ? "참가" : "참가완료",
            attendanceCount: 0,
            geolocationAvailable: geolocationAvailable,
            latitude: "N/A",
            longitude: "N/A"
        };

        this.onAttendClick = this.onAttendClick.bind(this);
        this.onHackClick = this.onHackClick.bind(this);

        firebaseReference.once("value", (snapshot)=> {
            let count = snapshot.numChildren();

            this.setState(Object.assign({}, this.state, {
                attendanceCount: count
            }));
        });
    }

    componentDidMount() {
        if(this.state.geolocationAvailable) {
            navigator.geolocation.getCurrentPosition((position) => {
                this.setState(Object.assign({}, this.state, {
                    latitude: position.coords.latitude,
                    longitude: position.coords.longitude
                }));
            });
        }
    }

    render() {
        return (
            <div className="App">
                <p className="App-intro">
                    경찰 추산은 정말 옳은가...
                </p>
                <button onClick={this.onAttendClick} disabled={this.state.buttonText === "참가" ? false : true}>{this.state.buttonText}</button>
                <button onClick={this.onHackClick}>핵 클릭</button>
                <div>현재까지 참가 인원: {this.state.attendanceCount}</div>
                <div>위치: {this.state.latitude} : {this.state.longitude}</div>
            </div>
        );
    }

    onHackClick() {
        let newKey = firebaseReference.push().key;
        let updates = {};
        updates[newKey] = 1;

        firebaseReference.update(updates);
        firebaseReference.once("value", (snapshot) => {
            this.setState(Object.assign({}, this.state, {
                attendanceCount: snapshot.numChildren()
            }));
        });
    }

    onAttendClick() {
        let newKey = firebaseReference.push().key;
        cookie.save("attendance", newKey);

        this.setState(Object.assign({}, this.state, {
            buttonText: "참가중"
        }));

        let updates = {};
        updates[newKey] = 1;

        firebaseReference.update(updates);

        firebaseReference.child(newKey).once("value", (snapshot)=>{
            if(snapshot.val() == 1) {
                this.setState(Object.assign({}, this.state, {
                    buttonText: "참가완료",
                    attendanceCount: this.state.attendanceCount + 1
                }));
            }
            else {
                cookie.remove("attendance");
                alert("죄송합니다. 다시 시도해주세요.");
                this.setState(Object.assign({}, this.state, {
                    buttonText: "참가",
                    buttonStyle: styles.activeButton
                }));
            }
        });
    }
}

const styles = {
    activeButton: {
        disabled: false
    }
};

export default App;
