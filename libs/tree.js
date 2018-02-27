const R = require("ramda");

function build(traces) {
  const roots = { data: null, children: [] };
  const lookup = [];
  for (const t of traces) {
    if (!lookup[t.url]) {
      lookup[t.url] = { data: null, children: [] };
    }
    lookup[t.url].data = t;

    if (t.initiator) {
      if (!lookup[t.initiator]) {
        lookup[t.initiator] = { data: null, children: [] };
      }
      lookup[t.initiator].children.push(lookup[t.url]);
    } else {
      roots.children.push(lookup[t.url]);
    }
  }
  return roots;
}

function createTree(traces) {
  const root = build(traces);
  addSize(root);
  return root;
}

function addSize(node) {
  const nodeSize = !R.isNil(node.data) && !R.isNil(node.data.transferSize) ? node.data.transferSize : 0;
  if (!R.isEmpty(node.children)) {
    node.size = R.reduce((acc, n) => acc + addSize(n), nodeSize, node.children);
  } else {
    node.size = nodeSize;
  }
  return node.size;
}

module.exports = {
  createTree: createTree,
};
