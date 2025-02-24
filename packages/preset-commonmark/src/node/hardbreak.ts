/* Copyright 2021, Milkdown by Mirone. */
import { commandsCtx } from '@milkdown/core'
import { Selection } from '@milkdown/prose/state'
import { $command, $nodeAttr, $nodeSchema, $useKeymap } from '@milkdown/utils'

/// HTML attributes for the hardbreak node.
///
/// Default value:
/// - `data-is-inline` - Whether the hardbreak is inline.
export const hardbreakAttr = $nodeAttr('hardbreak', (node) => {
  return {
    'data-is-inline': node.attrs.isInline,
  }
})

/// Hardbreak node schema.
export const hardbreakSchema = $nodeSchema('hardbreak', ctx => ({
  inline: true,
  group: 'inline',
  attrs: {
    isInline: {
      default: false,
    },
  },
  selectable: false,
  parseDOM: [{ tag: 'br' }],
  toDOM: node => ['br', ctx.get(hardbreakAttr.key)(node)],
  parseMarkdown: {
    match: ({ type }) => type === 'break',
    runner: (state, node, type) => {
      state.addNode(type, { isInline: Boolean(node.data?.isInline) })
    },
  },
  toMarkdown: {
    match: node => node.type.name === 'hardbreak',
    runner: (state, node) => {
      if (node.attrs.isInline)
        state.addNode('text', undefined, '\n')

      else
        state.addNode('break')
    },
  },
}))

/// Command to insert a hardbreak.
export const insertHardbreakCommand = $command('InsertHardbreak', () => () => (state, dispatch) => {
  const { selection, tr } = state
  if (selection.empty) {
    // Transform two successive hardbreak into a new line
    const node = selection.$from.node()
    if (node.childCount > 0 && node.lastChild?.type.name === 'hardbreak') {
      dispatch?.(
        tr
          .replaceRangeWith(selection.to - 1, selection.to, state.schema.node('paragraph'))
          .setSelection(Selection.near(tr.doc.resolve(selection.to)))
          .scrollIntoView(),
      )
      return true
    }
  }
  dispatch?.(tr.setMeta('hardbreak', true).replaceSelectionWith(hardbreakSchema.type().create()).scrollIntoView())
  return true
})

/// Keymap for the hardbreak node.
/// - `Shift-Enter` - Insert a hardbreak.
export const hardbreakKeymap = $useKeymap('hardbreakKeymap', {
  InsertHardbreak: {
    shortcuts: 'Shift-Enter',
    command: (ctx) => {
      const commands = ctx.get(commandsCtx)
      return () => commands.call(insertHardbreakCommand.key)
    },
  },
})
