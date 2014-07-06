let logs = [];
let count = 0;

function add(Zst) {
  let z = {
    zest: Zst,
    id: count
  }
  count++;
  logs.push(z);
  return z.id;
}
exports.add = add;

function addToId(id, Zst) {
  try {
    remove(id);
    let z = {
      zest: Zst,
      id: id
    }
    logs.push(z);
    return true;
  }
  catch(e) {
    console.log('Error: ' + e);
    return false;
  }
}
exports.addToId = addToId;

function remove(id) {
  let ele = getLogById(id);
  if (ele) {
    let index = logs.indexOf(ele);
    logs.splice(index, 1);
  }
}
exports.remove = remove;

function clearAll() {
  logs = [];
}
exports.clearAll = clearAll;

function getLogById(id) {
  for (let i of logs) {
    if (i.id == id) {
      return i;
    }
  }
  return false;
}
exports.getLogById = getLogById;
