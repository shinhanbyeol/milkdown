/* Copyright 2021, Milkdown by Mirone. */
import { $node } from '@milkdown/utils'

/// The top-level document node.
export const docSchema = $node('doc', () => ({
  content: 'block+',
  parseMarkdown: {
    match: ({ type }) => type === 'root',
    runner: (state, node, type) => {
      state.injectRoot(node, type)
    },
  },
  toMarkdown: {
    match: node => node.type.name === 'doc',
    runner: (state, node) => {
      state.openNode('root')
      state.next(node.content)
    },
  },
}))
