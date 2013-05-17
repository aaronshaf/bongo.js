// Use cache if necessary
function getUser(id,callback) {
  if(!window.navigator.onLine) {
    bongo.users.get(id,function(error,user) {
      if(!error) callback(user);
    });
  } else {
    $.getJSON('/users/' + id,function(user) {
      callback(user);
      bongo.users.save(id,user);
    });
  }
}

// Use remote if necessary
function getUser(id,callback) {
  bongo.users.get(id,function(error,user) {
    if(!error && user) {
      return callback(user);
    }
    $.getJSON('/users/' + id,function(user) {
      callback(user);
      bongo.users.save(id,user);
    });
  });
}

// Local vs remote race
function getUser(id,callback) {
  bongo.users.get(id,function(error,user) {
    if(!error) callback(user);
  });

  $.getJSON('/users/' + id,function(user) {
    callback(user);
    bongo.users.save(id,user);
  });
}

// Sync, then exclusively query IDB
function syncUsers() {
  // ...
}

function getUser(id,callback) {
  bongo.users.get(id,function(error,user) {
    if(!error) callback(user);
  });
}