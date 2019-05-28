self.addEventListener('install', event => {
    self.skipWaiting();
    console.log('Service worker installing...');
    // Add a call to skipWaiting here
  });
  
  self.addEventListener('activate', event => {
    console.log('Service worker activating...');
  });
  self.addEventListener('fetch', event => {
    console.log('Fetching:', event.request.url);
  });
  // I'm a new service worker