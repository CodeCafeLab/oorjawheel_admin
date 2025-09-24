"use client"

import * as React from "react"
import { Button } from "@/components/ui/button"

interface RichTextEditorProps {
  value: string
  onChange: (html: string) => void
  placeholder?: string
  className?: string
  rows?: number
}

export function RichTextEditor({ value, onChange, placeholder, className, rows = 15 }: RichTextEditorProps) {
  const editorRef = React.useRef<HTMLDivElement>(null)
  const [active, setActive] = React.useState({
    bold: false,
    italic: false,
    underline: false,
    ul: false,
    ol: false,
    block: 'P',
  })
  const placeCaretAtEnd = () => {
    const el = editorRef.current
    if (!el) return
    const range = document.createRange()
    range.selectNodeContents(el)
    range.collapse(false)
    const sel = window.getSelection()
    sel?.removeAllRanges()
    sel?.addRange(range)
  }

  React.useEffect(() => {
    if (!editorRef.current) return
    // Only set when external value changes (avoid cursor jumps)
    if (editorRef.current.innerHTML !== value) {
      editorRef.current.innerHTML = value || ""
    }
  }, [value])

  const ensureFocus = () => {
    const el = editorRef.current
    if (!el) return
    if (el.innerHTML.trim() === "") {
      el.innerHTML = "<p><br/></p>"
    }
    el.focus()
  }

  const exec = (command: string, arg?: string) => {
    ensureFocus()
    document.execCommand(command, false, arg)
    // Sync content
    if (editorRef.current) onChange(editorRef.current.innerHTML)
  }

  const applyBlock = (tag: 'H1' | 'H2' | 'P') => {
    // Use <H1> format for better browser compatibility
    exec('formatBlock', `<${tag}>`)
  }

  const startList = (ordered: boolean) => {
    ensureFocus()
    const el = editorRef.current
    if (!el) return
    if (el.innerHTML.trim() === '' || el.innerHTML === '<p><br></p>' || el.innerHTML === '<p><br/></p>') {
      el.innerHTML = '<p> </p>'
    }
    // Select the current block (line) and convert to list
    const sel = window.getSelection()
    if (sel && sel.rangeCount > 0) {
      let node: Node | null = sel.anchorNode
      while (node && node !== el && !(node instanceof HTMLElement && /^(P|DIV|H1|H2|LI)$/.test(node.tagName))) {
        node = node.parentNode
      }
      if (node && node !== el) {
        const range = document.createRange()
        range.selectNodeContents(node as Node)
        sel.removeAllRanges()
        sel.addRange(range)
      }
    }
    if (ordered) exec('insertOrderedList')
    else exec('insertUnorderedList')
    placeCaretAtEnd()
  }

  const handleLink = () => {
    const url = prompt("Enter URL", "https://") || undefined
    if (url) exec("createLink", url)
  }
  // Track selection and update active toolbar states
  React.useEffect(() => {
    const handler = () => {
      const sel = window.getSelection()
      const el = editorRef.current
      if (!sel || !el) return
      if (!el.contains(sel.anchorNode)) return
      const bold = document.queryCommandState('bold')
      const italic = document.queryCommandState('italic')
      const underline = document.queryCommandState('underline')
      const ul = document.queryCommandState('insertUnorderedList')
      const ol = document.queryCommandState('insertOrderedList')
      let block = document.queryCommandValue('formatBlock') || 'P'
      if (typeof block === 'string') block = block.replace(/[<>]/g, '').toUpperCase()
      setActive({ bold, italic, underline, ul, ol, block })
    }
    document.addEventListener('selectionchange', handler)
    return () => document.removeEventListener('selectionchange', handler)
  }, [])

  const handleColor = (e: React.ChangeEvent<HTMLInputElement>) => {
    exec("foreColor", e.target.value)
  }

  const handleBackColor = (e: React.ChangeEvent<HTMLInputElement>) => {
    exec("backColor", e.target.value)
  }

  return (
    <div className={className}>
      <div className="mb-2 flex flex-wrap items-center gap-2 rounded-md border bg-muted/40 p-2">
        <Button type="button" variant={active.bold ? "secondary" : "outline"} size="sm" onMouseDown={(e)=>{e.preventDefault(); exec("bold")}}>
          <span className="font-bold">B</span>
        </Button>
        <Button type="button" variant={active.italic ? "secondary" : "outline"} size="sm" onMouseDown={(e)=>{e.preventDefault(); exec("italic")}}> 
          <span className="italic">I</span>
        </Button>
        <Button type="button" variant={active.underline ? "secondary" : "outline"} size="sm" onMouseDown={(e)=>{e.preventDefault(); exec("underline")}}>
          <span className="underline">U</span>
        </Button>
        <span className="mx-2 h-5 w-px bg-border" />
        <Button type="button" variant={active.block === 'H1' ? "secondary" : "outline"} size="sm" onMouseDown={(e)=>{e.preventDefault(); applyBlock('H1')}}>H1</Button>
        <Button type="button" variant={active.block === 'H2' ? "secondary" : "outline"} size="sm" onMouseDown={(e)=>{e.preventDefault(); applyBlock('H2')}}>H2</Button>
        <Button type="button" variant={active.block === 'P' ? "secondary" : "outline"} size="sm" onMouseDown={(e)=>{e.preventDefault(); applyBlock('P')}}>P</Button>
        <span className="mx-2 h-5 w-px bg-border" />
        <Button type="button" variant={active.ul ? "secondary" : "outline"} size="sm" onMouseDown={(e)=>{e.preventDefault(); startList(false)}}>
          • List
        </Button>
        <Button type="button" variant={active.ol ? "secondary" : "outline"} size="sm" onMouseDown={(e)=>{e.preventDefault(); startList(true)}}>
          1. List
        </Button>
        <Button type="button" variant="outline" size="sm" onMouseDown={(e)=>{e.preventDefault(); handleLink()}}>Link</Button>
        <div className="flex items-center gap-1 pl-2">
          <span className="text-xs text-muted-foreground">Text</span>
          <input aria-label="Text color" type="color" className="h-8 w-8 rounded border bg-background" onMouseDown={(e)=>e.preventDefault()} onChange={handleColor} />
          <span className="ml-2 text-xs text-muted-foreground">Bg</span>
          <input aria-label="Background color" type="color" className="h-8 w-8 rounded border bg-background" onMouseDown={(e)=>e.preventDefault()} onChange={handleBackColor} />
        </div>
      </div>
      <div
        ref={editorRef}
        role="textbox"
        aria-multiline
        contentEditable
        onInput={() => editorRef.current && onChange(editorRef.current.innerHTML)}
        className="min-h-[200px] rounded-md border p-3 bg-background focus:outline-none focus:ring-2 focus:ring-ring prose prose-sm dark:prose-invert"
        style={{ minHeight: rows * 18 }}
        data-placeholder={placeholder}
        suppressContentEditableWarning
      />
    </div>
  )
}


