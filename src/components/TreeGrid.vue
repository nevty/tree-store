<template>
  <div class="w-full h-screen p-4">
    <div class="mb-4 flex gap-2">
      <button @click="expandAll" class="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600">
        Развернуть все
      </button>
      <button
        @click="collapseAll"
        class="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600"
      >
        Свернуть все
      </button>
    </div>

    <div class="ag-theme-quartz" style="width: 100%; height: calc(100vh - 120px)">
      <ag-grid-vue
        style="width: 100%; height: 100%"
        :rowData="rowData"
        :columnDefs="columnDefs"
        :defaultColDef="defaultColDef"
        :autoGroupColumnDef="autoGroupColumnDef"
        :treeData="true"
        :getDataPath="getDataPath"
        :groupDefaultExpanded="groupDefaultExpanded"
        @grid-ready="onGridReady"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { AgGridVue } from 'ag-grid-vue3'
import {
  ModuleRegistry,
  AllCommunityModule,
  type GridApi,
  type ColDef,
  type GridReadyEvent,
} from 'ag-grid-community'
import { AllEnterpriseModule } from 'ag-grid-enterprise'
import { TreeStore, type TreeItem } from '../TreeStore'

ModuleRegistry.registerModules([AllCommunityModule, AllEnterpriseModule])

let gridApi: GridApi

const rowData = ref<TreeItem[]>([])
const groupDefaultExpanded = ref(0)

const columnDefs = ref<ColDef[]>([
  {
    field: 'rowNumber',
    headerName: '№ п/п',
    width: 100,
    valueGetter: (params) => {
      if (params.node && params.node.rowIndex !== null) {
        return params.node.rowIndex + 1
      }
      return ''
    },
  },
  {
    field: 'category',
    headerName: 'Категория',
    width: 150,
    valueGetter: (params) => {
      const item = params.data
      if (!item) return ''

      const store = new TreeStore(rowData.value)
      const children = store.getChildren(item.id)
      return children.length > 0 ? 'Группа' : 'Элемент'
    },
  },
  {
    field: 'name',
    headerName: 'Название',
    flex: 1,
    editable: true,
  },
  {
    field: 'value',
    headerName: 'Значение',
    flex: 1,
    editable: true,
  },
])

const defaultColDef = ref<ColDef>({
  sortable: true,
  filter: true,
  resizable: true,
})

const autoGroupColumnDef = ref<ColDef>({
  headerName: 'Иерархия',
  minWidth: 300,
  cellRendererParams: {
    suppressCount: true,
  },
})

const getDataPath = (data: TreeItem) => {
  const path: (string | number)[] = []
  const store = new TreeStore(rowData.value)
  const parents = store.getAllParents(data.id).reverse()

  parents.forEach((parent) => {
    path.push(parent.name || parent.id)
  })

  return path
}

const onGridReady = (params: GridReadyEvent) => {
  gridApi = params.api
}

const expandAll = () => {
  if (gridApi) {
    gridApi.expandAll()
  }
}

const collapseAll = () => {
  if (gridApi) {
    gridApi.collapseAll()
  }
}

onMounted(() => {
  const sampleData: TreeItem[] = [
    { id: 1, parent: null, name: 'Проект 1', value: 'Основной проект' },
    { id: 2, parent: 1, name: 'Модуль A', value: 'Модуль разработки' },
    { id: 3, parent: 1, name: 'Модуль B', value: 'Модуль тестирования' },
    { id: 4, parent: 2, name: 'Компонент A1', value: 'UI компонент' },
    { id: 5, parent: 2, name: 'Компонент A2', value: 'Логика' },
    { id: 6, parent: 3, name: 'Тест B1', value: 'Unit тест' },
    { id: 7, parent: null, name: 'Проект 2', value: 'Дополнительный проект' },
    { id: 8, parent: 7, name: 'Модуль C', value: 'Модуль интеграции' },
    { id: 9, parent: 8, name: 'Компонент C1', value: 'API интеграция' },
    { id: 10, parent: 8, name: 'Компонент C2', value: 'База данных' },
    { id: 11, parent: 10, name: 'Таблица 1', value: 'Пользователи' },
    { id: 12, parent: 10, name: 'Таблица 2', value: 'Заказы' },
  ]

  const store = new TreeStore(sampleData)
  rowData.value = store.getAllItems()
})
</script>
