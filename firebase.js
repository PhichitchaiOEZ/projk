import firebase from "firebase/app";
import "firebase/firestore";
const firebaseConfig = {
    apiKey: "AIzaSyD24vFQrO78UAjVIEqSv0HgZGabBWkeiNo",
    authDomain: "faceaccesscontrol.firebaseapp.com",
    databaseURL: "https://faceaccesscontrol.firebaseio.com",
    projectId: "faceaccesscontrol",
    storageBucket: "faceaccesscontrol.appspot.com",
    messagingSenderId: "71621968261",
    appId: "1:71621968261:web:8b795a295226a1fbfac4ec",
    measurementId: "G-GY8K974KSD"
  };
// Initialize Firebase
firebase.initializeApp(firebaseConfig);
const db = firebase.firestore();
export  default db ;