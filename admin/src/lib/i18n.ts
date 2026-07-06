const zh: Record<string, string> = {
  add: '新增',
  edit: '编辑',
  view: '查看',
  delete: '删除',
  refresh: '刷新',
  close: '关闭',
  save: '保存',
  search: '查询',
  reset: '重置',
  filterPlaceholder: '筛选',
  selectField: '选择字段',
  noData: '暂无数据',
  loading: '加载中...',
  totalRecords: '共 {total} 条记录',
  rowsPerPage: '每页',
  rows: '条',
  prevPage: '上一页',
  nextPage: '下一页',
  actions: '操作',
  columns: '列',
  confirmDelete: '确认删除 #{id} ?',
  confirmBatchDelete: '确认批量删除 {count} 条记录？',
  createTitle: '新增{title}',
  editTitle: '编辑{title}',
  viewTitle: '{title}详情',
  createDesc: '创建新记录，完成后点击保存。',
  editDesc: '修改记录信息，完成后点击保存。',
  viewDesc: '查看记录详情。',
  required: '请输入{label}',
  inputPlaceholder: '请输入{label}',
  yes: '是',
  no: '否',
  notFound: '未找到',
  batchDelete: '删除 ({count})',
}

const en: Record<string, string> = {
  add: 'Add',
  edit: 'Edit',
  view: 'View',
  delete: 'Delete',
  refresh: 'Refresh',
  close: 'Close',
  save: 'Save',
  search: 'Search',
  reset: 'Reset',
  filterPlaceholder: 'Filter',
  selectField: 'Select field',
  noData: 'No data',
  loading: 'Loading...',
  totalRecords: '{total} records',
  rowsPerPage: 'Rows',
  rows: '',
  prevPage: 'Prev',
  nextPage: 'Next',
  actions: 'Actions',
  columns: 'Columns',
  confirmDelete: 'Delete #{id}?',
  confirmBatchDelete: 'Delete {count} records?',
  createTitle: 'Add {title}',
  editTitle: 'Edit {title}',
  viewTitle: '{title} Detail',
  createDesc: 'Create a new record and click save.',
  editDesc: 'Edit the record and click save.',
  viewDesc: 'View record details.',
  required: '{label} is required',
  inputPlaceholder: 'Enter {label}',
  yes: 'Yes',
  no: 'No',
  notFound: 'Not found',
  batchDelete: 'Delete ({count})',
}

const locales: Record<string, Record<string, string>> = { 'zh-CN': zh, 'en-US': en }

let currentLocale = 'zh-CN'

export function setLocale(locale: string) {
  if (locales[locale]) currentLocale = locale
}

export function t(key: string, params?: Record<string, string | number>): string {
  const map = locales[currentLocale]
  let text = map?.[key] ?? key
  if (params) {
    for (const [k, v] of Object.entries(params)) {
      text = text.replace(`{${k}}`, String(v))
    }
  }
  return text
}
