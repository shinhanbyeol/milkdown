/* Copyright 2021, Milkdown by Mirone. */
import type { Node } from '@milkdown/prose/model'
import type { PluginView } from '@milkdown/prose/state'
import { Plugin, PluginKey } from '@milkdown/prose/state'
import type { EditorView } from '@milkdown/prose/view'
import { $ctx, $prose } from '@milkdown/utils'

import { BlockService } from './block-service'

/// @internal
export type FilterNodes = (node: Node) => boolean

/// @internal
export const defaultNodeFilter: FilterNodes = (node) => {
  const { name } = node.type
  if (name.startsWith('table') && name !== 'table')
    return false

  return true
}

/// A slice contains the block config.
/// Possible properties:
/// - `filterNodes`: A function to filter nodes that can be dragged.
export const blockConfig = $ctx<{ filterNodes: FilterNodes }, 'blockConfig'>({ filterNodes: defaultNodeFilter }, 'blockConfig')

/// @internal
export const blockService = $ctx(new BlockService(), 'blockService')

/// @internal
export type BlockViewFactory = (view: EditorView) => PluginView

/// A slice contains a factory that will return a plugin view.
/// Users can use this slice to customize the plugin view.
export const blockView = $ctx<BlockViewFactory, 'blockView'>(() => ({}), 'blockView')

/// The block prosemirror plugin.
export const blockPlugin = $prose((ctx) => {
  const milkdownPluginBlockKey = new PluginKey('MILKDOWN_BLOCK')
  const service = ctx.get(blockService.key)
  const view = ctx.get(blockView.key)

  return new Plugin({
    key: milkdownPluginBlockKey,
    props: {
      handleDOMEvents: {
        drop: (view, event) => {
          return service.dropCallback(view, event as DragEvent)
        },
        mousemove: (view, event) => {
          return service.mousemoveCallback(view, event as MouseEvent)
        },
        keydown: () => {
          return service.keydownCallback()
        },
        dragover: (view, event) => {
          return service.dragoverCallback(view, event)
        },
        dragleave: () => {
          return service.dragleaveCallback()
        },
        dragenter: () => {
          return service.dragenterCallback()
        },
      },
    },
    view,
  })
})
