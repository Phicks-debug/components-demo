import PointerField from "@/components/PointerField"
import DemoLayout from "@/components/DemoLayout"
import sourceCode from "@/components/PointerField.jsx?raw"

export default function PointerFieldDemo() {
  return (
    <DemoLayout
      title="Pointer Field"
      description="Grid of lines that rotate to track the mouse cursor with smooth angular interpolation."
      sourceCode={sourceCode}
      sourceUrl="https://examples.motion.dev/react/magnetic-filings"
    >
      <div className="mx-auto aspect-square max-w-lg bg-black text-white">
        <PointerField />
      </div>
    </DemoLayout>
  )
}
