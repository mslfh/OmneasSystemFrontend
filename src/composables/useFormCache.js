import { ref, watch, nextTick } from 'vue'
import { debounce } from '../utils/helpers.js'

/**
 * 表单缓存 composable
 * 用于自动保存和恢复表单数据到 localStorage
 */
export function useFormCache(cacheKey, initialData = {}) {
  const CACHE_PREFIX = 'form_cache_'
  const fullCacheKey = CACHE_PREFIX + cacheKey

  // 从缓存中恢复数据
  function loadFromCache() {
    try {
      const cached = localStorage.getItem(fullCacheKey)
      if (cached) {
        const parsedData = JSON.parse(cached)
        // 验证缓存数据的有效性
        if (parsedData && typeof parsedData === 'object') {
          return {
            ...initialData,
            ...parsedData,
            // 确保某些字段的正确类型
            categories: Array.isArray(parsedData.categories) ? parsedData.categories : [],
            ingredients: Array.isArray(parsedData.ingredients) ? parsedData.ingredients : [],
            customizations: Array.isArray(parsedData.customizations) ? parsedData.customizations : [],
            image_list: Array.isArray(parsedData.image_list) ? parsedData.image_list : []
          }
        }
      }
    } catch (error) {
      console.warn('Failed to load cache:', error)
    }
    return { ...initialData }
  }

  // 保存数据到缓存
  function saveToCache(data) {
    try {
      // 创建深拷贝以避免修改原数据
      const dataToSave = JSON.parse(JSON.stringify(data))

      // 清理不需要缓存的字段
      const cleanedData = {
        ...dataToSave,
        // 移除空值或默认值
        second_title: dataToSave.second_title || '',
        acronym: dataToSave.acronym || '',
        description: dataToSave.description || '',
        tip: dataToSave.tip || '',
        tag: dataToSave.tag || '',
        image: dataToSave.image || ''
      }

      localStorage.setItem(fullCacheKey, JSON.stringify(cleanedData))
      return true
    } catch (error) {
      console.warn('Failed to save to cache:', error)
      return false
    }
  }

  // 清除缓存
  function clearCache() {
    try {
      localStorage.removeItem(fullCacheKey)
      return true
    } catch (error) {
      console.warn('Failed to clear cache:', error)
      return false
    }
  }

  // 检查是否有缓存数据
  function hasCache() {
    try {
      const cached = localStorage.getItem(fullCacheKey)
      return !!cached
    } catch (error) {
      return false
    }
  }

  // 获取缓存的时间戳
  function getCacheTimestamp() {
    try {
      const cached = localStorage.getItem(fullCacheKey + '_timestamp')
      return cached ? parseInt(cached) : null
    } catch (error) {
      return null
    }
  }

  // 保存时间戳
  function saveCacheTimestamp() {
    try {
      localStorage.setItem(fullCacheKey + '_timestamp', Date.now().toString())
    } catch (error) {
      console.warn('Failed to save cache timestamp:', error)
    }
  }

  // 创建自动保存的响应式数据
  function createCachedRef(data) {
    const cachedData = ref(data)

    // 创建防抖的保存函数
    const debouncedSave = debounce((value) => {
      saveToCache(value)
      saveCacheTimestamp()
    }, 1000) // 1秒防抖

    // 监听数据变化并自动保存
    const stopWatcher = watch(
      cachedData,
      (newValue) => {
        debouncedSave(newValue)
      },
      {
        deep: true,
        flush: 'post'
      }
    )

    return {
      data: cachedData,
      stopWatcher
    }
  }

  return {
    loadFromCache,
    saveToCache,
    clearCache,
    hasCache,
    getCacheTimestamp,
    saveCacheTimestamp,
    createCachedRef
  }
}

/**
 * 页面离开时的确认提示 composable
 */
export function useFormLeaveConfirm(hasUnsavedChanges) {
  function setupLeaveConfirm() {
    // 浏览器刷新/关闭确认
    const handleBeforeUnload = (event) => {
      if (hasUnsavedChanges.value) {
        event.preventDefault()
        event.returnValue = 'You have unsaved changes, are you sure you want to leave?'
        return 'You have unsaved changes, are you sure you want to leave?'
      }
    }

    window.addEventListener('beforeunload', handleBeforeUnload)

    // 清理函数
    const cleanup = () => {
      window.removeEventListener('beforeunload', handleBeforeUnload)
    }

    return cleanup
  }

  return {
    setupLeaveConfirm
  }
}
