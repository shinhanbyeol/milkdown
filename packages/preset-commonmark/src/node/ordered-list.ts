/* Copyright 2021, Milkdown by Mirone. */
import { commandsCtx } from '@milkdown/core'
import { expectDomTypeError } from '@milkdown/exception'
import { wrapIn } from '@milkdown/prose/commands'
import { wrappingInputRule } from '@milkdown/prose/inputrules'
import { $command, $inputRule, $nodeAttr, $nodeSchema, $useKeymap } from '@milkdown/utils'

/// HTML attributes for ordered list node.
export const orderedListAttr = $nodeAttr('orderedList')

/// Schema for ordered list node.
export const orderedListSchema = $nodeSchema('ordered_list', ctx => ({
  content: 'listItem+',
  group: 'block',
  attrs: {
    order: {
      default: 1,
    },
    spread: {
      default: false,
    },
  },
  parseDOM: [
    {
      tag: 'ol',
      getAttrs: (dom) => {
        if (!(dom instanceof HTMLElement))
          throw expectDomTypeError(dom)

        return {
          spread: dom.dataset.spread,
          order: dom.hasAttribute('start') ? Number(dom.getAttribute('start')) : 1,
        }
      },
    },
  ],
  toDOM: node => [
    'ol',
    {
      ...ctx.get(orderedListAttr.key)(node),
      ...(node.attrs.order === 1 ? {} : node.attrs.order),
      'data-spread': node.attrs.spread,
    },
    0,
  ],
  parseMarkdown: {
    match: ({ type, ordered }) => type === 'list' && !!ordered,
    runner: (state, node, type) => {
      const spread = node.spread != null ? `${node.spread}` : 'true'
      state.openNode(type, { spread }).next(node.children).closeNode()
    },
  },
  toMarkdown: {
    match: node => node.type.name === 'ordered_list',
    runner: (state, node) => {
      state.openNode('list', undefined, { ordered: true, start: 1, spread: node.attrs.spread === 'true' })
      state.next(node.content)
      state.closeNode()
    },
  },
}))

/// Input rule for wrapping a block in ordered list node.
export const wrapInOrderedListInputRule = $inputRule(() => wrappingInputRule(
  /^\s*(\d+)\.\s$/,
  orderedListSchema.type(),
  match => ({ order: Number(match[1]) }),
  (match, node) => node.childCount + node.attrs.order === Number(match[1]),
))

/// Command for wrapping a block in ordered list node.
export const wrapInOrderedListCommand = $command('WrapInOrderedList', () => () => wrapIn(orderedListSchema.type()))

/// Keymap for ordered list node.
/// - `Mod-Alt-7`: Wrap a block in ordered list.
export const orderedListKeymap = $useKeymap('orderedListKeymap', {
  WrapInOrderedList: {
    shortcuts: 'Mod-Alt-7',
    command: (ctx) => {
      const commands = ctx.get(commandsCtx)
      return () => commands.call(wrapInOrderedListCommand.key)
    },
  },
})
