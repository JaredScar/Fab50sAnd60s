"use client"

import { useEffect, useState } from "react"
import {
  defaultSiteContent,
  mergeSiteContent,
  type SiteContentMap,
} from "@/lib/site-content-defaults"

export function useSiteContent() {
  const [content, setContent] = useState<SiteContentMap>(defaultSiteContent)

  useEffect(() => {
    let mounted = true
    const isPreview = typeof window !== "undefined" && new URLSearchParams(window.location.search).has("cmsPreview")

    function applyPreviewContent(raw: string | null) {
      if (!raw) return false

      try {
        const parsed = JSON.parse(raw) as SiteContentMap
        if (mounted) setContent(mergeSiteContent(parsed))
        return true
      } catch {
        return false
      }
    }

    if (isPreview && applyPreviewContent(window.localStorage.getItem("fab-site-content-preview"))) {
      const onStorage = (event: StorageEvent) => {
        if (event.key === "fab-site-content-preview") applyPreviewContent(event.newValue)
      }
      const onMessage = (event: MessageEvent) => {
        if (event.origin !== window.location.origin) return
        if (event.data?.type === "cms-preview-content") {
          setContent(mergeSiteContent(event.data.content as SiteContentMap))
        }
      }

      window.addEventListener("storage", onStorage)
      window.addEventListener("message", onMessage)

      return () => {
        mounted = false
        window.removeEventListener("storage", onStorage)
        window.removeEventListener("message", onMessage)
      }
    }

    fetch("/api/site-content")
      .then((response) => response.json())
      .then((data: SiteContentMap) => {
        if (mounted) setContent(mergeSiteContent(data))
      })
      .catch(() => {
        if (mounted) setContent(defaultSiteContent)
      })

    return () => {
      mounted = false
    }
  }, [])

  return content
}
