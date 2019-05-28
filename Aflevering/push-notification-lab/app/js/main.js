/*
Copyright 2018 Google Inc.

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

    http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.
*/
const app = (() => {
  'use strict';

  let isSubscribed = false;
  let swRegistration = null;

  const notifyButton = document.querySelector('.js-notify-btn');
  const pushButton = document.querySelector('.js-push-btn');

  if (!('Notification' in window)) {
    console.log('This browser does not support notifications!');
    return;
  }

  Notification.requestPermission(status => {
    console.log('Notification permission status:', status);
  });

  function displayNotification() {

    if (Notification.permission == 'granted') {
      navigator.serviceWorker.getRegistration().then(reg => {
    
        const options = {
          body: 'First notification!',
          // tag: 'id1',
          icon: 'images/notification-flat.png',
          vibrate: [100, 50, 100],
          data: {
            dateOfArrival: Date.now(),
            primaryKey: 1
          },
        
          actions: [
            {action: 'explore', title: 'Go to the site',
              icon: 'images/checkmark.png'},
            {action: 'close', title: 'Close the notification',
              icon: 'images/xmark.png'},
          ]
        
          // TODO 5.1 - add a tag to the notification
        
        };
    
        reg.showNotification('Hello world!');
      });
    }

  }

  function initializeUI() {

    pushButton.addEventListener('click', () => {
      pushButton.disabled = true;
      if (isSubscribed) {
        unsubscribeUser();
      } else {
        subscribeUser();
      }
    });
    
    swRegistration.pushManager.getSubscription()
    .then(subscription => {
      isSubscribed = (subscription !== null);
      updateSubscriptionOnServer(subscription);
      if (isSubscribed) {
        console.log('User IS subscribed.');
      } else {
        console.log('User is NOT subscribed.');
      }
      updateBtn();
    });

  }

  const applicationServerPublicKey = 'BFdGe1y3w43TMWXzENTYKJy7XxT3IcGeWgzSjIVG-K636h1HxMYdUIZvXfa4bE8MpTDwYUqn9HGfdz4Q94JrYHA';

  function subscribeUser() {
    const applicationServerKey = urlB64ToUint8Array(applicationServerPublicKey);
    swRegistration.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: applicationServerKey
    })
    .then(subscription => {
      console.log('User is subscribed:', subscription);
      updateSubscriptionOnServer(subscription);
      isSubscribed = true;
      updateBtn();
    })
    .catch(err => {
      if (Notification.permission === 'denied') {
        console.warn('Permission for notifications was denied');
      } else {
        console.error('Failed to subscribe the user: ', err);
      }
      updateBtn();
    });
  }

  function unsubscribeUser() {

    swRegistration.pushManager.getSubscription()
.then(subscription => {
  if (subscription) {
    return subscription.unsubscribe();
  }
})
.catch(err => {
  console.log('Error unsubscribing', err);
})
.then(() => {
  updateSubscriptionOnServer(null);
  console.log('User is unsubscribed');
  isSubscribed = false;
  updateBtn();
});

  }

  function updateSubscriptionOnServer(subscription) {
    // Here's where you would send the subscription to the application server

    const subscriptionJson = document.querySelector('.js-subscription-json');
    const endpointURL = document.querySelector('.js-endpoint-url');
    const subAndEndpoint = document.querySelector('.js-sub-endpoint');

    if (subscription) {
      subscriptionJson.textContent = JSON.stringify(subscription);
      endpointURL.textContent = subscription.endpoint;
      subAndEndpoint.style.display = 'block';
    } else {
      subAndEndpoint.style.display = 'none';
    }
  }

  function updateBtn() {
    if (Notification.permission === 'denied') {
      pushButton.textContent = 'Push Messaging Blocked';
      pushButton.disabled = true;
      updateSubscriptionOnServer(null);
      return;
    }

    if (isSubscribed) {
      pushButton.textContent = 'Disable Push Messaging';
    } else {
      pushButton.textContent = 'Enable Push Messaging';
    }

    pushButton.disabled = false;
  }

  function urlB64ToUint8Array(base64String) {
    const padding = '='.repeat((4 - base64String.length % 4) % 4);
    const base64 = (base64String + padding)
      .replace(/\-/g, '+')
      .replace(/_/g, '/');

    const rawData = window.atob(base64);
    const outputArray = new Uint8Array(rawData.length);

    for (let i = 0; i < rawData.length; ++i) {
      outputArray[i] = rawData.charCodeAt(i);
    }
    return outputArray;
  }

  notifyButton.addEventListener('click', () => {
    displayNotification();
  });

  if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
      console.log('Service Worker and Push is supported');

      navigator.serviceWorker.register('sw.js')
      .then(swReg => {
        console.log('Service Worker is registered', swReg);

        swRegistration = swReg;

        initializeUI();
      })
      .catch(err => {
        console.error('Service Worker Error', err);
      });
    });
  } else {
    console.warn('Push messaging is not supported');
    pushButton.textContent = 'Push Not Supported';
  }

})();

const webPush = require('web-push');

const pushSubscription = {"endpoint":"https://fcm.googleapis.com/fcm/send/d9Z0o2KcFVQ:APA91bGx0s2ZoBYtTYf6Kv_TpCrIpAt9oPTQ0IwXiPb3jlv1n2pzJpzFcadXHOzzNkxHHYBWSZaOYN1zhK44Tt129d0gXUQ_KF7b6LxIg5mS6c4P-Er_2ErEPELYzqFjnJsDO0DnEgqL","expirationTime":null,"keys":{"p256dh":"BKgrooUyypg5l1PTdyyJLwcuot9uVKPMjnC2G-8y8xLl4nYpsv69NrYbGvzgLwS-nAnJfVmJD3f8CncFkyHn9Oo","auth":"hSjZP5yFtNJOgzYTDhh0cg"}}
const vapidPublicKey = 'BFdGe1y3w43TMWXzENTYKJy7XxT3IcGeWgzSjIVG-K636h1HxMYdUIZvXfa4bE8MpTDwYUqn9HGfdz4Q94JrYHA';
const vapidPrivateKey = '1deiroWAdP_BsyHDfByaZB5Hz3MVMXrDRkGbzjBIXq4';

const payload = 'Here is a payload!';

const options = {
 // gcmAPIKey: 'AAAAM8GB2ro:APA91bGWg61CqJ-CQMaZ7fv6ztLx2n8Lm8F9qU6UtP1B2Zk79BZ1BPzKMyr5b6TDgTVR0jNeLt5qkz4m4WKJ-ZIwECYCTImjzbggcBbCDlTXr0v4lS4wQFYkudH0pL4b3MNo-4VvkD5i',
  TTL: 60,

  vapidDetails: {
    subject: 'mailto: joklin@live.dk',
    publicKey: vapidPublicKey,
    privateKey: vapidPrivateKey
  }

};

webPush.sendNotification(
  pushSubscription,
  payload,
  options
);