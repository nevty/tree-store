import { describe, it, expect, beforeEach } from 'vitest'
import { TreeStore, type TreeItemWithProps } from './TreeStore'

describe('TreeStore', () => {
  let testData: TreeItemWithProps[]
  let store: TreeStore

  beforeEach(() => {
    testData = [
      { id: 1, parent: null, name: 'Root 1' },
      { id: 2, parent: 1, name: 'Child 1.1' },
      { id: 3, parent: 1, name: 'Child 1.2' },
      { id: 4, parent: 2, name: 'Child 1.1.1' },
      { id: 5, parent: 2, name: 'Child 1.1.2' },
      { id: 6, parent: 3, name: 'Child 1.2.1' },
      { id: 7, parent: null, name: 'Root 2' },
      { id: 8, parent: 7, name: 'Child 2.1' },
    ]
    store = new TreeStore(testData)
  })

  describe('constructor', () => {
    it('should initialize with provided data', () => {
      expect(store.getAllItems()).toHaveLength(8)
    })

    it('should handle empty array', () => {
      const emptyStore = new TreeStore([])
      expect(emptyStore.getAllItems()).toHaveLength(0)
    })
  })

  describe('getItem', () => {
    it('should return item by id', () => {
      const item = store.getItem(1)
      expect(item).toEqual({ id: 1, parent: null, name: 'Root 1' })
    })

    it('should return undefined for non-existent id', () => {
      const item = store.getItem(999)
      expect(item).toBeUndefined()
    })

    it('should work with string ids', () => {
      const stringStore = new TreeStore([{ id: 'a', parent: null, name: 'Item A' }])
      expect(stringStore.getItem('a')).toEqual({ id: 'a', parent: null, name: 'Item A' })
    })
  })

  describe('getChildren', () => {
    it('should return direct children of a node', () => {
      const children = store.getChildren(1)
      expect(children).toHaveLength(2)
      expect(children.map((c) => c.id)).toEqual([2, 3])
    })

    it('should return empty array for node without children', () => {
      const children = store.getChildren(4)
      expect(children).toHaveLength(0)
    })

    it('should return empty array for non-existent node', () => {
      const children = store.getChildren(999)
      expect(children).toHaveLength(0)
    })
  })

  describe('getAllChildren', () => {
    it('should return all descendants of a node', () => {
      const allChildren = store.getAllChildren(1)
      expect(allChildren).toHaveLength(5)
      expect(allChildren.map((c) => c.id)).toEqual([2, 4, 5, 3, 6])
    })

    it('should return empty array for leaf node', () => {
      const allChildren = store.getAllChildren(4)
      expect(allChildren).toHaveLength(0)
    })

    it('should handle deep nesting', () => {
      const allChildren = store.getAllChildren(2)
      expect(allChildren).toHaveLength(2)
      expect(allChildren.map((c) => c.id)).toEqual([4, 5])
    })
  })

  describe('getAllParents', () => {
    it('should return all parents including the node itself (child to root order)', () => {
      const parents = store.getAllParents(4)
      expect(parents).toHaveLength(3)
      expect(parents.map((p) => p.id)).toEqual([4, 2, 1])
    })

    it('should return all parents in root to child order when orderRootToChild is true', () => {
      const parents = store.getAllParents(4, true)
      expect(parents).toHaveLength(3)
      expect(parents.map((p) => p.id)).toEqual([1, 2, 4])
    })

    it('should return only the node for root element', () => {
      const parents = store.getAllParents(1)
      expect(parents).toHaveLength(1)
      expect(parents[0]?.id).toBe(1)
    })

    it('should return empty array for non-existent node', () => {
      const parents = store.getAllParents(999)
      expect(parents).toHaveLength(0)
    })
  })

  describe('addItem', () => {
    it('should add new item to the store', () => {
      const newItem: TreeItemWithProps = { id: 9, parent: 1, name: 'New Child' }
      store.addItem(newItem)

      expect(store.getItem(9)).toEqual(newItem)
      expect(store.getAllItems()).toHaveLength(9)
    })

    it('should update children map after adding', () => {
      const newItem: TreeItemWithProps = { id: 9, parent: 1, name: 'New Child' }
      store.addItem(newItem)

      const children = store.getChildren(1)
      expect(children).toHaveLength(3)
      expect(children.map((c) => c.id)).toContain(9)
    })

    it('should add root item', () => {
      const newRoot: TreeItemWithProps = { id: 10, parent: null, name: 'New Root' }
      store.addItem(newRoot)

      expect(store.getItem(10)).toEqual(newRoot)
    })
  })

  describe('removeItem', () => {
    it('should remove item from the store', () => {
      store.removeItem(8)

      expect(store.getItem(8)).toBeUndefined()
      expect(store.getAllItems()).toHaveLength(7)
    })

    it('should update children map after removal', () => {
      store.removeItem(2)

      const children = store.getChildren(1)
      expect(children).toHaveLength(1)
      expect(children[0]?.id).toBe(3)
    })

    it('should handle removing non-existent item', () => {
      const initialLength = store.getAllItems().length
      store.removeItem(999)

      expect(store.getAllItems()).toHaveLength(initialLength)
    })

    it('should correctly remove all children when parent has multiple levels', () => {
      store.addItem({ id: 13, parent: 4, name: 'Deep Child' })
      store.addItem({ id: 14, parent: 13, name: 'Deeper Child' })

      store.removeItem(2)

      expect(store.getItem(2)).toBeUndefined()
      expect(store.getItem(4)).toBeUndefined()
      expect(store.getItem(5)).toBeUndefined()
      expect(store.getItem(13)).toBeUndefined()
      expect(store.getItem(14)).toBeUndefined()
    })
  })

  describe('updateItem', () => {
    it('should update existing item', () => {
      const updatedItem: TreeItemWithProps = { id: 1, parent: null, name: 'Updated Root' }
      store.updateItem(updatedItem)

      expect(store.getItem(1)).toEqual(updatedItem)
    })

    it('should update parent and maintain children map correctly', () => {
      // Move element 4 from under 2 to under 3
      const updatedItem: TreeItemWithProps = { id: 4, parent: 3, name: 'Child 1.1.1' }
      store.updateItem(updatedItem)

      // Check that element 4 is no longer a child of 2
      const childrenOf2 = store.getChildren(2)
      expect(childrenOf2.map((c) => c.id)).not.toContain(4)
      expect(childrenOf2.map((c) => c.id)).toEqual([5])

      // Check that element 4 is now a child of 3
      const childrenOf3 = store.getChildren(3)
      expect(childrenOf3.map((c) => c.id)).toContain(4)
      expect(childrenOf3.map((c) => c.id)).toEqual([6, 4])
    })

    it('should not add new item if it does not exist', () => {
      const initialLength = store.getAllItems().length
      const newItem: TreeItemWithProps = { id: 999, parent: null, name: 'New Item' }
      store.updateItem(newItem)

      expect(store.getAllItems()).toHaveLength(initialLength)
      expect(store.getItem(999)).toBeUndefined()
    })
  })

  describe('getAllItems', () => {
    it('should return array of TreeItem objects', () => {
      const allItems = store.getAllItems()
      allItems.forEach((item) => {
        expect(item).toHaveProperty('id')
        expect(item).toHaveProperty('parent')
      })
    })
  })

  describe('edge cases', () => {
    it('should handle items with additional properties', () => {
      interface CustomProps {
        custom: string
      }
      const customData: TreeItemWithProps<CustomProps>[] = [
        { id: 1, parent: null, name: 'Item 1', value: 'value1', custom: 'data' },
      ]
      const customStore = new TreeStore<CustomProps>(customData)

      const item = customStore.getItem(1)
      expect(item).toHaveProperty('custom', 'data')
      expect(item).toHaveProperty('value', 'value1')
    })

    it('should handle mixed string and number ids', () => {
      const mixedData: TreeItemWithProps[] = [
        { id: 'a', parent: null, name: 'Root' },
        { id: 1, parent: 'a', name: 'Child' },
      ]
      const mixedStore = new TreeStore(mixedData)

      expect(mixedStore.getChildren('a')).toHaveLength(1)
      expect(mixedStore.getAllParents(1).map((p) => p.id)).toEqual([1, 'a'])
    })

    it('should handle circular reference prevention', () => {
      const item = store.getItem(1)
      if (item) {
        const updatedItem: TreeItemWithProps = { ...item, parent: 4 }
        store.updateItem(updatedItem)

        // Should not cause infinite loop
        const parents = store.getAllParents(4)
        expect(parents.length).toBeGreaterThan(0)
      }
    })
  })
})
