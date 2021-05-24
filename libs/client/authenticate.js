import { collections } from '@utils/constants';
import { Firestore, FirebaseAuth } from './firebase';
import { find } from './users';

export async function register({ username, email, password, role }) {
  const credentials = await FirebaseAuth().createUserWithEmailAndPassword(
    email,
    password
  );

  await setupAccount(credentials.user, username, role);
  return credentials;
}

export async function registerWithProvider({ provider, role }) {
  // sign user in
  const credentials = await FirebaseAuth().signInWithPopup(provider);

  // check if user has been registered before
  const user = await find(credentials.user.uid);
  if (user) {
    await signout();
    return Promise.reject({ code: 'auth/account-already-existed' });
  }

  // setup new account
  const { displayName } = credentials.user;
  await setupAccount(credentials.user, displayName, role);
  return credentials;
}

export async function signinWithProvider({ provider }) {
  return FirebaseAuth().signInWithPopup(provider);
}

export async function signinWithPassword({ email, password }) {
  const credentials = await FirebaseAuth().signInWithEmailAndPassword(
    email,
    password
  );
  const user = find(credentials.user.uid);
  if (user) return user;
  credentials.user.delete();
  return Promise.reject({ code: 'auth/user-not-found' });
}

export async function sendVerifyEmail(user, url) {
  return user.sendEmailVerification({
    url,
  });
}

export async function signout() {
  return FirebaseAuth().signOut();
}

export async function setupAccount(user, username, role) {
  const { email, uid } = user;
  // update profile
  const avatar = 'https://picsum.photos/200';
  await user.updateProfile({
    displayName: username,
    photoURL: avatar,
  });

  // create user document
  const collection =
    role === 'developer' ? collections.developers : collections.companies;
  const ref = Firestore().collection(collection).doc(uid);
  await ref.set({
    id: uid,
    name: username,
    email,
    role,
    avatar,
    createdOn: Firestore.Timestamp.now(),
  });

  // user's private attributes
  await ref
    .collection(collections.attributes)
    .doc(collections.attributes)
    .set({ parent: uid });
}
