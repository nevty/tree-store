export interface TreeItem {
    id: string | number
    parent: string | number | null
    name?: string
    value?: string
    [key: string]: string | number | null | undefined
}

export class TreeStore {
    private items: Map<string | number, TreeItem>
    private childrenMap: Map<string | number, (string | number)[]>

    constructor(data: TreeItem[]) {
        this.items = new Map()
        this.childrenMap = new Map()

        data.forEach(item => {
            this.items.set(item.id, item)
        })

        this.buildChildrenMap()
    }

    private buildChildrenMap(): void {
        this.childrenMap.clear()

        this.items.forEach(item => {
            const parentId = item.parent
            if (parentId !== null && parentId !== undefined) {
                if (!this.childrenMap.has(parentId)) {
                    this.childrenMap.set(parentId, [])
                }
                this.childrenMap.get(parentId)!.push(item.id)
            }
        })
    }

    getChildren(id: string | number): TreeItem[] {
        const childIds = this.childrenMap.get(id) || []
        return childIds.map(childId => this.items.get(childId)!).filter(Boolean)
    }

    getAllChildren(id: string | number): TreeItem[] {
        const result: TreeItem[] = []
        const directChildren = this.getChildren(id)

        directChildren.forEach(child => {
            result.push(child)
            const nestedChildren = this.getAllChildren(child.id)
            result.push(...nestedChildren)
        })

        return result
    }

    getAllParents(id: string | number): TreeItem[] {
        const result: TreeItem[] = []
        const item = this.items.get(id)

        if (!item) return result

        result.push(item)

        let currentItem = item
        while (currentItem.parent !== null && currentItem.parent !== undefined) {
            const parentItem = this.items.get(currentItem.parent)
            if (!parentItem) break
            result.push(parentItem)
            currentItem = parentItem
        }

        return result
    }

    addItem(item: TreeItem): void {
        this.items.set(item.id, item)
        this.buildChildrenMap()
    }

    removeItem(id: string | number): void {
        const allChildren = this.getAllChildren(id)

        allChildren.forEach(child => {
            this.items.delete(child.id)
        })

        this.items.delete(id)
        this.buildChildrenMap()
    }

    updateItem(item: TreeItem): void {
        if (this.items.has(item.id)) {
            this.items.set(item.id, item)
            this.buildChildrenMap()
        }
    }

    getAllItems(): TreeItem[] {
        return Array.from(this.items.values())
    }

    getItem(id: string | number): TreeItem | undefined {
        return this.items.get(id)
    }
}
