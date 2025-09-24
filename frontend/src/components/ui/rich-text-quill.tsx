"use client"

import dynamic from 'next/dynamic'
import * as React from 'react'

const ReactQuill = dynamic(() => import('react-quill').then(m => m.default), { ssr: false }) as any

type Props = {
  value: string
  onChange: (html: string) => void
  placeholder?: string
}

export function RichTextQuill({ value, onChange, placeholder }: Props) {
  React.useEffect(() => {
    // Inject Quill snow theme CSS once
    const id = 'quill-snow-theme'
    if (!document.getElementById(id)) {
      const link = document.createElement('link')
      link.id = id
      link.rel = 'stylesheet'
      link.href = 'https://cdn.jsdelivr.net/npm/react-quill@2.0.0/dist/quill.snow.css'
      document.head.appendChild(link)
    }
  }, [])

  const modules = React.useMemo(() => ({
    toolbar: [
      [{ header: [1, 2, 3, false] }],
      ['bold', 'italic', 'underline'],
      [{ list: 'ordered' }, { list: 'bullet' }],
      [{ align: [] }],
      ['link'],
      [{ color: [] }, { background: [] }],
      ['clean']
    ],
    history: { delay: 500, maxStack: 100, userOnly: true },
  }), [])

  const formats = [
    'header', 'bold', 'italic', 'underline', 'list', 'bullet', 'align', 'link', 'color', 'background'
  ]

  return (
    <div className="rounded-md border bg-background">
      <ReactQuill theme="snow" value={value} onChange={onChange} placeholder={placeholder}
        modules={modules} formats={formats} />
    </div>
  )
}


