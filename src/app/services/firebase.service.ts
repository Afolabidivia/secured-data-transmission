import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import * as firebase from 'firebase/app';

@Injectable({
  providedIn: 'root'
})
export class FirebaseService {
  public firebaseRef: firebase.database.Reference;
  public contactRef: firebase.database.Reference;
  public messageRef: firebase.database.Reference;
  firebaseData = new BehaviorSubject(null);
  userContacts = new BehaviorSubject(null);
  messages = new BehaviorSubject(null);
  userInfo = new BehaviorSubject(null);

  constructor() { }

  addUser(uid: string, userData) {
    firebase.database().ref(`users/${uid}`).set(userData)
      .then((data) => {

      }).catch(error => {
      });
  }

  syncContacts(user: string) {
    this.contactRef = firebase.database().ref(`/contacts/${user}`);
    this.contactRef.on('value', contactSnapShot => {
      this.userContacts.next(contactSnapShot.val());
    });
  }

  getAllUsers() {
    return firebase.database().ref(`/users`).once('value');
  }

  getUser(userId: string) {
    return firebase.database().ref(`/users/${userId}`).once('value');
  }

  addContact(user, userId, payload) {
    firebase.database().ref(`contacts/${user}/${userId}`).set(payload)
      .then((data) => {
      }).catch(error => {
    });
  }

  getContact(userId: string, contactId: string) {
    return firebase.database().ref(`contacts/${userId}/${contactId}`).once('value');
  }

  updateContact(userId: string, contactId: string, privateKey: string) {
    return firebase.database().ref(`contacts/${userId}/${contactId}`).update({pk: privateKey});
  }

  fetchChats() {
    return firebase.database().ref(`/chats/`).once('value');
  }

  startMessage(payload) {
    firebase.database().ref(`/chats/`).once('value')
      .then(chat => {
        const chatsLen = (chat.val()) ? Object.keys(chat.val()).length : 0;
        firebase.database().ref(`/chats/${chatsLen}`).once('value')
          .then(m => {
            const mCount = (m.val()) ? Object.keys(m.val()).length : 0;
            payload.msg_id = mCount;
            firebase.database().ref(`chats/${chatsLen}/${mCount}`).set(payload)
              .then((data) => {
              }).catch(error => {
            });
          });
      });
  }

  addMessage(sender: string, receiver: string, payload) {
    firebase.database().ref(`/contacts/${sender}/${receiver}`).once('value')
      .then(res => {
        const chatId = res.val().chat_id;
        firebase.database().ref(`/chats/${chatId}`).once('value')
          .then(m => {
            const mCount = (m.val()) ? Object.keys(m.val()).length : 0;
            payload.msg_id = mCount;
            firebase.database().ref(`chats/${chatId}/${mCount}`).set(payload)
              .then((data) => {
                const lastMessage = {
                  sender,
                  message: payload.message,
                  msg_id: mCount
                };
                this.updateLastMessage(sender, receiver, {last_message: lastMessage});
                this.updateLastMessage(receiver, sender, {last_message: lastMessage});
              }).catch(error => {
            });
          });
      });
  }

  syncMessages(chatId) {
    this.messageRef = firebase.database().ref(`/chats/${chatId}`);
    this.messageRef.on('value', messageSnapshot => {
      if (messageSnapshot.val()) {
        this.messages.next(messageSnapshot.val());
        return;
      }
      this.messages.next(null);
    });
  }

  deleteMessage(chatId, messageId: number) {
    return firebase.database().ref(`chats/${chatId}/${messageId}`).remove();
  }

  destroyMessages() {
    if (this.messageRef) {
      this.messageRef.off();
    }
  }

  destroyContact() {
    if (this.contactRef) {
      this.contactRef.off();
    }
  }

  updateLastMessage(sender: string, receiver: string, payload) {
    firebase.database().ref(`contacts/${sender}/${receiver}`).update(payload);
  }

}
