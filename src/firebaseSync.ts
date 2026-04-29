import { doc, getDoc, setDoc, query, collection, getDocs, writeBatch } from 'firebase/firestore';
import { db } from './firebase';
import { AppState, Post } from './types';

// Fetch the state from Firestore
export const loadStateFromFirebase = async (uid: string): Promise<AppState | null> => {
  try {
    const docRef = doc(db, 'users', uid);
    const docSnap = await getDoc(docRef);
    let appState: Partial<AppState> = {};
    if (docSnap.exists()) {
      appState = docSnap.data();
    }

    const postsQuery = query(collection(db, 'users', uid, 'posts'));
    const postsSnap = await getDocs(postsQuery);
    const posts: Post[] = [];
    postsSnap.forEach((doc) => {
      posts.push(doc.data() as Post);
    });

    if (docSnap.exists() || posts.length > 0) {
      return {
        posts: posts.sort((a, b) => a.id - b.id),
        chain: appState.chain || '',
        stars: appState.stars || [],
        revisits: appState.revisits || {},
      };
    }
  } catch (error) {
    console.error('Error loading state from Firebase:', error);
  }
  return null;
};

// Save the entire state to Firestore
export const saveStateToFirebase = async (uid: string, appState: AppState): Promise<void> => {
  try {
    const { posts, ...restState } = appState;
    const docRef = doc(db, 'users', uid);
    await setDoc(docRef, restState, { merge: true });

    let batch = writeBatch(db);
    let operationCount = 0;

    // Determine which posts to delete
    const postsQuery = query(collection(db, 'users', uid, 'posts'));
    const postsSnap = await getDocs(postsQuery);
    const existingIds = postsSnap.docs.map(d => parseInt(d.id));
    const newIds = posts.map(p => p.id);
    const toDelete = existingIds.filter(id => !newIds.includes(id));

    for (const dId of toDelete) {
      batch.delete(doc(db, 'users', uid, 'posts', dId.toString()));
      operationCount++;
      if (operationCount >= 400) {
        await batch.commit();
        batch = writeBatch(db);
        operationCount = 0;
      }
    }

    for (const post of posts) {
      const postRef = doc(db, 'users', uid, 'posts', post.id.toString());
      batch.set(postRef, post, { merge: true });
      operationCount++;

      if (operationCount >= 400) {
        await batch.commit();
        batch = writeBatch(db);
        operationCount = 0;
      }
    }

    if (operationCount > 0) {
      await batch.commit();
    }
  } catch (error) {
    console.error('Error saving state to Firebase:', error);
  }
};
