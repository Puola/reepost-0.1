import { getStorage, ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { app, db } from './firebase';
import { doc, updateDoc } from 'firebase/firestore';

const storage = getStorage(app);

export async function uploadProfilePicture(userId: string, file: File): Promise<string> {
  try {
    // Create a reference with a timestamp to avoid caching issues
    const timestamp = Date.now();
    const storageRef = ref(storage, `profile-pictures/${userId}_${timestamp}`);
    
    // Upload the file
    await uploadBytes(storageRef, file);
    
    // Get the download URL
    const downloadURL = await getDownloadURL(storageRef);
    
    // Update the user's profile in Firestore
    const userRef = doc(db, 'users', userId);
    await updateDoc(userRef, {
      profilePicture: downloadURL
    });
    
    return downloadURL;
  } catch (error) {
    console.error('Error uploading profile picture:', error);
    throw error;
  }
}