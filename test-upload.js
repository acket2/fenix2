import { initializeApp } from 'firebase/app';
import { getStorage, ref, uploadString, getDownloadURL } from 'firebase/storage';

const firebaseConfig = {
  projectId: "studied-turbine-25jvd",
  appId: "1:81977064894:web:e7b4be1b96c080be784def",
  apiKey: "AIzaSyDRgkkTgrN9g_kss4EsGzQeInfujnExkms",
  authDomain: "studied-turbine-25jvd.firebaseapp.com",
  storageBucket: "studied-turbine-25jvd.firebasestorage.app",
  messagingSenderId: "81977064894"
};

const app = initializeApp(firebaseConfig);
const storage = getStorage(app);
const testRef = ref(storage, 'test-file.txt');

async function test() {
  try {
    await uploadString(testRef, 'hello world');
    const url = await getDownloadURL(testRef);
    console.log("Success! URL:", url);
    process.exit(0);
  } catch (e) {
    console.error("Error:", e);
    process.exit(1);
  }
}
test();
