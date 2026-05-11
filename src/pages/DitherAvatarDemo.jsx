import DemoLayout from "@/components/DemoLayout";
import { DitherAvatar } from "@/components/DitherAvatar";
import sourceCode from "@/components/DitherAvatar.tsx?raw";
import { useState } from "react";

const SEED_PRESETS = ["alice", "bob", "charlie", "diana", "evan", "grace"]

const defaults = {
    seed: "demo",
    size: 120,
}

export default function DitherAvatarDemo() {
    const [props, setProps] = useState(defaults)
    const [variant, setVariant] = useState("img")

    const update = (key, value) =>
        setProps((prev) => ({ ...prev, [key]: value }))

    return (
        <DemoLayout
            title="DitherAvatar"
            description="Generates deterministic dithered avatar SVGs from a seed string. Uses Bayer 4x4 ordered dithering for crisp pixel patterns."
            sourceCode={sourceCode}
            controls={
                <div className="mt-6 space-y-4 px-1">
                    <div className="flex items-center gap-3 text-xs text-muted-foreground">
                        <span className="w-24 shrink-0">Variant</span>
                        <div className="flex flex-wrap gap-1.5">
                            {["img", "svg"].map((v) => (
                                <button
                                    key={v}
                                    onClick={() => setVariant(v)}
                                    className={`rounded-md border px-3 py-1.5 text-xs capitalize transition-colors ${variant === v
                                        ? "border-foreground/40 bg-foreground/10 text-foreground"
                                        : "border-border text-muted-foreground hover:border-foreground/20 hover:text-foreground"
                                        }`}
                                >
                                    {v}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="flex items-center gap-3 text-xs text-muted-foreground">
                        <span className="w-24 shrink-0">Seed</span>
                        <div className="flex flex-wrap gap-1.5">
                            {SEED_PRESETS.map((seed) => (
                                <button
                                    key={seed}
                                    onClick={() => update("seed", seed)}
                                    className={`rounded-md border px-3 py-1.5 text-xs capitalize transition-colors ${props.seed === seed
                                        ? "border-foreground/40 bg-foreground/10 text-foreground"
                                        : "border-border text-muted-foreground hover:border-foreground/20 hover:text-foreground"
                                        }`}
                                >
                                    {seed}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="flex items-center gap-3 text-xs text-muted-foreground">
                        <span className="w-24 shrink-0">Custom</span>
                        <input
                            type="text"
                            value={props.seed}
                            onChange={(e) => update("seed", e.target.value)}
                            className="h-7 flex-1 rounded-md border border-border bg-transparent px-2 text-xs text-foreground outline-none focus:border-foreground/40"
                            placeholder="Enter seed..."
                        />
                    </div>

                    <label className="flex items-center gap-3 text-xs text-muted-foreground">
                        <span className="w-24 shrink-0">Size</span>
                        <input
                            type="range"
                            min={24}
                            max={256}
                            step={8}
                            value={props.size}
                            onChange={(e) => update("size", parseInt(e.target.value))}
                            className="h-1.5 flex-1 cursor-pointer appearance-none rounded-full bg-border accent-foreground"
                        />
                        <span className="w-10 text-right font-mono tabular-nums">
                            {props.size}
                        </span>
                    </label>

                    <button
                        onClick={() => setProps(defaults)}
                        className="rounded-md border border-border px-3 py-1.5 text-xs text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                    >
                        Reset
                    </button>
                </div>
            }
        >
            <div className="flex min-h-48 flex-wrap items-center justify-center gap-8 bg-black p-8">
                <DitherAvatar seed={props.seed} size={props.size} />
            </div>
        </DemoLayout>
    )
}
