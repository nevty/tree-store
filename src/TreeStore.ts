export type IdType = string | number

export interface TreeItem {
  id: IdType
  parent: IdType | null
  name?: string
  value?: string
}

export type TreeItemWithProps<T extends object = {}> = TreeItem & T

export class TreeStore<T extends object = {}> {
  private items: Map<IdType, TreeItemWithProps<T>>
  private childrenMap: Map<IdType, IdType[]>

  constructor(data: TreeItemWithProps<T>[]) {
    this.items = new Map()
    this.childrenMap = new Map()

    for (const item of data) {
      this.items.set(item.id, item)
      this._linkToParent(item)
    }
  }

  private _linkToParent(item: TreeItemWithProps<T>): void {
    if (item.parent != null) {
      if (!this.childrenMap.has(item.parent)) {
        this.childrenMap.set(item.parent, [])
      }
      this.childrenMap.get(item.parent)!.push(item.id)
    }
  }

  private _unlinkFromParent(item: TreeItemWithProps<T>): void {
    if (item.parent != null) {
      const siblings = this.childrenMap.get(item.parent)
      if (siblings) {
        const index = siblings.indexOf(item.id)
        if (index > -1) {
          siblings.splice(index, 1)
        }
      }
    }
  }

  getChildren(id: IdType): TreeItemWithProps<T>[] {
    return (this.childrenMap.get(id) || [])
      .map((childId) => this.items.get(childId))
      .filter((item): item is TreeItemWithProps<T> => item !== undefined)
  }

  getAllChildren(id: IdType): TreeItemWithProps<T>[] {
    const result: TreeItemWithProps<T>[] = []
    const childIds = this.childrenMap.get(id)
    if (!childIds) return result

    for (const childId of childIds) {
      const child = this.items.get(childId)
      if (child) {
        result.push(child)
        result.push(...this.getAllChildren(child.id))
      }
    }

    return result
  }

  getAllParents(id: IdType, orderRootToChild: boolean = false): TreeItemWithProps<T>[] {
    const result: TreeItemWithProps<T>[] = []
    const visited = new Set<IdType>()
    let currentItem = this.items.get(id)

    if (!currentItem) return result

    result.push(currentItem)
    visited.add(currentItem.id)

    while (currentItem?.parent != null) {
      if (visited.has(currentItem.parent)) break
      
      const parentItem = this.items.get(currentItem.parent)
      if (!parentItem) break
      
      result.push(parentItem)
      visited.add(parentItem.id)
      currentItem = parentItem
    }

    return orderRootToChild ? result.reverse() : result
  }

  addItem(item: TreeItemWithProps<T>): void {
    this.items.set(item.id, item)
    this._linkToParent(item)
  }

  removeItem(id: IdType): void {
    const item = this.items.get(id)
    if (!item) return

    const childIds = this.childrenMap.get(id)
    if (childIds) {
      for (const childId of [...childIds]) {
        this.removeItem(childId)
      }
      this.childrenMap.delete(id)
    }

    this._unlinkFromParent(item)

    this.items.delete(id)
  }

  updateItem(item: TreeItemWithProps<T>): void {
    const oldItem = this.items.get(item.id)
    if (!oldItem) return

    if (oldItem.parent !== item.parent) {
      this._unlinkFromParent(oldItem)
      this._linkToParent(item)
    }

    this.items.set(item.id, item)
  }

  getAllItems(): TreeItemWithProps<T>[] {
    return Array.from(this.items.values())
  }

  getItem(id: IdType): TreeItemWithProps<T> | undefined {
    return this.items.get(id)
  }
}
