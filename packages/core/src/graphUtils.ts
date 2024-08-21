// Copyright 2020 Cognite AS

import { Queue } from './queue';

export interface Node<T> {
  parentNode?: Node<T>;
  data: T;
}

/** @hidden */
export function topologicalSort<T>(nodes: Node<T>[]): Node<T>[] {
  const queue = new Queue<Node<T>>();
  const sortedList: Node<T>[] = [];
  const childrenMap = getChildrenMap(nodes);

  // insert root nodes
  for (const node of nodes) {
    if (!node.parentNode) {
      queue.add(node);
    }
  }

  while (queue.size() !== 0) {
    const node = queue.last();
    queue.remove();
    sortedList.push(node);

    const children = childrenMap.get(node);
    if (children) {
      children.forEach(queue.add);
    }
  }

  if (sortedList.length !== nodes.length) {
    throw Error('Impossible to topological sort nodes');
  }

  return sortedList;
}

function getChildrenMap<T>(nodes: Node<T>[]): Map<Node<T>, Node<T>[]> {
  const childrenMap = new Map();
  for (const node of nodes) {
    childrenMap.set(node, []);
  }

  for (const node of nodes) {
    const { parentNode } = node;
    if (parentNode) {
      childrenMap.get(parentNode).push(node);
    }
  }

  return childrenMap;
}
