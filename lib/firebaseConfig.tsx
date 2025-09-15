// Import the functions you need from the SDKs you need

import { initializeApp, getApps, getApp } from "firebase/app";



const firebaseConfig = {
    apiKey: process.env.NEXT_PUBLIC_FBASE_APIKEY,
    authDomain: process.env.NEXT_PUBLIC_FBASE_AUTHDOMAIN,
    projectId: process.env.NEXT_PUBLIC_FBASE_PROJECTID,
    storageBucket: process.env.NEXT_PUBLIC_FBASE_STORAGEBUCKET,
    messagingSenderId: process.env.NEXT_PUBLIC_FBASE_MESSAGINGSENDERID,
    appId: process.env.NEXT_PUBLIC_FBASE_APPID,
    measurementId: process.env.NEXT_PUBLIC_FBASE_MEASUREMENTID,
};

console.log(firebaseConfig);


export const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();


