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
