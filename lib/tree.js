const R = require('ramda');

class Tree {
  static _build(traces) {
    const mainRequest = R.head(traces);
    const roots = { data: mainRequest, children: [] };
    const lookup = [];
    lookup[mainRequest.url] = roots;
    for (const t of R.tail(traces)) {
      if (R.isNil(lookup[t.url])) {
        lookup[t.url] = { data: null, children: [] };
      }
      lookup[t.url].data = Tree._formatTrace(t);

      if (!R.isNil(t.initiator)) {
        if (R.isNil(lookup[t.initiator])) {
          lookup[t.initiator] = { data: null, children: [] };
        }
        lookup[t.initiator].children.push(lookup[t.url]);
      } else {
        roots.children.push(lookup[t.url]);
      }
    }
    return roots;
  }

  static create(traces) {
    const root = Tree._build(traces);
    Tree._addSize(root);
    return root;
  }

  static _formatTrace(trace) {
    return {
      url: trace.url,
      transferSize: trace.transferSize,
      duration: trace.duration,
      mimeType: trace.mimeType,
    };
  }

  static _addSize(node) {
    const nodeSize = node.data && node.data.transferSize ? node.data.transferSize : 0;
    if (!R.isEmpty(node.children)) {
      node.size = R.reduce((acc, n) => acc + Tree._addSize(n), nodeSize, node.children);
    } else {
      node.size = nodeSize;
    }
    return node.size;
  }
}

module.exports = Tree;
