function storeAccountData(accountData) {
    var encryptedData = btoa(accountData);
    localStorage.setItem('accountData', encryptedData);
}

function retrieveAccountData() {
    var encryptedData = localStorage.getItem('accountData');
    if (encryptedData) {
        return atob(encryptedData);
    }
    return null;
}

// Source - https://stackoverflow.com/a
// Posted by Joe Freeman, modified by community. See post 'Timeline' for change history
// Retrieved 2026-01-10, License - CC BY-SA 4.0

const stringToColour = (str) => {
  let hash = 0;
  str.split('').forEach(char => {
    hash = char.charCodeAt(0) + ((hash << 5) - hash)
  })
  let colour = '#'
  for (let i = 0; i < 3; i++) {
    const value = (hash >> (i * 8)) & 0xff
    colour += value.toString(16).padStart(2, '0')
  }
  return colour
}
