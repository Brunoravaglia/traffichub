import { useMemo, useState } from "react";
import { Copy, Check, Loader2, Heart, Zap, Upload } from "lucide-react";

type DemoType = "CSS" | "React";

interface DemoItem {
  id: string;
  type: DemoType;
  title: string;
  description: string;
  code: string;
  preview: React.ReactNode;
}

function AsyncButtonDemo() {
  const [loading, setLoading] = useState(false);
  return (
    <button
      onClick={async () => {
        setLoading(true);
        await new Promise((r) => setTimeout(r, 1200));
        setLoading(false);
      }}
      disabled={loading}
      className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-white disabled:opacity-70"
    >
      {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Zap className="h-4 w-4" />}
      {loading ? "Processando..." : "Salvar alteração"}
    </button>
  );
}

function LikeButtonDemo() {
  const [count, setCount] = useState(42);
  const [liked, setLiked] = useState(false);
  return (
    <button
      onClick={() => {
        setLiked((v) => !v);
        setCount((c) => c + (liked ? -1 : 1));
      }}
      className={`inline-flex items-center gap-2 rounded-lg border px-4 py-2 transition-all ${liked ? "border-pink-500 bg-pink-500/10 text-pink-300" : "border-border text-foreground"}`}
    >
      <Heart className={`h-4 w-4 ${liked ? "fill-pink-400" : ""}`} />
      Curtir ({count})
    </button>
  );
}

function ConfirmCountdownDemo() {
  const [seconds, setSeconds] = useState(0);
  return (
    <button
      onClick={() => {
        if (seconds > 0) return;
        setSeconds(3);
        const timer = setInterval(() => {
          setSeconds((s) => {
            if (s <= 1) {
              clearInterval(timer);
              return 0;
            }
            return s - 1;
          });
        }, 1000);
      }}
      className="rounded-lg bg-amber-500 px-4 py-2 font-semibold text-black disabled:opacity-80"
      disabled={seconds > 0}
    >
      {seconds > 0 ? `Confirma em ${seconds}s` : "Remover campanha"}
    </button>
  );
}

function RippleButtonDemo() {
  const [rippling, setRippling] = useState(false);
  return (
    <button
      onClick={() => {
        setRippling(true);
        setTimeout(() => setRippling(false), 450);
      }}
      className="relative overflow-hidden rounded-lg border border-emerald-500 px-4 py-2 text-emerald-300"
    >
      <span className="relative z-10">Atualizar relatório</span>
      {rippling && <span className="absolute inset-0 animate-ping rounded-lg bg-emerald-500/25" />}
    </button>
  );
}

function UploadProgressDemo() {
  const [progress, setProgress] = useState(0);
  const [uploading, setUploading] = useState(false);

  const startUpload = () => {
    if (uploading) return;
    setUploading(true);
    setProgress(0);
    const timer = setInterval(() => {
      setProgress((p) => {
        if (p >= 100) {
          clearInterval(timer);
          setUploading(false);
          return 100;
        }
        return p + 20;
      });
    }, 250);
  };

  return (
    <button
      onClick={startUpload}
      className="relative overflow-hidden rounded-lg bg-violet-600 px-4 py-2 text-white"
    >
      <span className="relative z-10 inline-flex items-center gap-2">
        <Upload className="h-4 w-4" />
        {uploading ? `Enviando ${progress}%` : "Upload criativo"}
      </span>
      <span className="absolute bottom-0 left-0 h-1 bg-violet-300 transition-all" style={{ width: `${progress}%` }} />
    </button>
  );
}

const cssBase = String.raw`<style>
.bs-btn {
  border: none;
  padding: 12px 18px;
  border-radius: 12px;
  font-weight: 700;
  cursor: pointer;
}
</style>`;

export default function ButtonShowcaseSection() {
  const [copied, setCopied] = useState<string | null>(null);

  const demos = useMemo<DemoItem[]>(() => {
    const cssItems: DemoItem[] = [
      {
        id: "css-neon",
        type: "CSS",
        title: "Neon Pulse",
        description: "Botão com glow e pulso contínuo para CTA principal.",
        code: `${cssBase}\n<button class="bs-btn bs-neon">Teste grátis</button>\n\n<style>\n.bs-neon { background:#0f172a; color:#67e8f9; box-shadow:0 0 0 rgba(103,232,249,.0); animation:bsPulse 1.4s infinite; }\n@keyframes bsPulse { 0%{box-shadow:0 0 0 0 rgba(103,232,249,.5)} 100%{box-shadow:0 0 0 14px rgba(103,232,249,0)} }\n</style>`,
        preview: <button className="bs-btn bs-neon">Teste grátis</button>,
      },
      {
        id: "css-slide",
        type: "CSS",
        title: "Slide Fill",
        description: "Hover com preenchimento lateral e transição suave.",
        code: `<button class="bs-btn bs-slide">Ver planos</button>\n\n<style>\n.bs-slide { background:transparent; color:#e2e8f0; border:1px solid #334155; position:relative; overflow:hidden; }\n.bs-slide::before { content:""; position:absolute; inset:0; transform:translateX(-100%); background:#1d4ed8; transition:transform .3s ease; }\n.bs-slide:hover::before { transform:translateX(0); }\n.bs-slide span{position:relative;z-index:1}\n</style>`,
        preview: (
          <button className="bs-btn bs-slide">
            <span>Ver planos</span>
          </button>
        ),
      },
      {
        id: "css-gradient",
        type: "CSS",
        title: "Gradient Shift",
        description: "Gradiente animado para botões de destaque premium.",
        code: `<button class="bs-btn bs-gradient">Começar agora</button>\n\n<style>\n.bs-gradient { color:#fff; background:linear-gradient(120deg,#2563eb,#7c3aed,#db2777); background-size:200% 200%; animation:bsGradient 3s ease infinite; }\n@keyframes bsGradient { 0%{background-position:0% 50%} 50%{background-position:100% 50%} 100%{background-position:0% 50%} }\n</style>`,
        preview: <button className="bs-btn bs-gradient">Começar agora</button>,
      },
      {
        id: "css-shadow-lift",
        type: "CSS",
        title: "Shadow Lift",
        description: "Efeito de elevação com sombra dinâmica no hover.",
        code: `<button class="bs-btn bs-lift">Gerar relatório</button>\n\n<style>\n.bs-lift { background:#f8fafc; color:#0f172a; transition:transform .2s ease, box-shadow .2s ease; }\n.bs-lift:hover { transform:translateY(-3px); box-shadow:0 14px 28px rgba(15,23,42,.25); }\n</style>`,
        preview: <button className="bs-btn bs-lift">Gerar relatório</button>,
      },
      {
        id: "css-outline",
        type: "CSS",
        title: "Outline Draw",
        description: "Animação de contorno para ações secundárias.",
        code: `<button class="bs-btn bs-outline">Saiba mais</button>\n\n<style>\n.bs-outline { background:transparent; color:#e2e8f0; border:1px solid #475569; box-shadow:inset 0 0 0 0 #22d3ee; transition:box-shadow .25s ease,color .25s ease; }\n.bs-outline:hover { color:#0f172a; box-shadow:inset 220px 0 0 0 #22d3ee; }\n</style>`,
        preview: <button className="bs-btn bs-outline">Saiba mais</button>,
      },
    ];

    const reactItems: DemoItem[] = [
      {
        id: "react-async",
        type: "React",
        title: "Async Loading Button",
        description: "Mostra estado de carregamento durante ação assíncrona.",
        code: `function AsyncButton() {\n  const [loading, setLoading] = useState(false);\n  const save = async () => {\n    setLoading(true);\n    await api.save();\n    setLoading(false);\n  };\n\n  return (\n    <button onClick={save} disabled={loading}>\n      {loading ? \"Processando...\" : \"Salvar alteração\"}\n    </button>\n  );\n}`,
        preview: <AsyncButtonDemo />,
      },
      {
        id: "react-like",
        type: "React",
        title: "Like com Contador",
        description: "Atualiza UI instantaneamente com feedback visual.",
        code: `function LikeButton() {\n  const [liked, setLiked] = useState(false);\n  const [count, setCount] = useState(42);\n\n  const toggle = () => {\n    setLiked(!liked);\n    setCount((c) => c + (liked ? -1 : 1));\n  };\n\n  return <button onClick={toggle}>Curtir ({count})</button>;\n}`,
        preview: <LikeButtonDemo />,
      },
      {
        id: "react-confirm",
        type: "React",
        title: "Confirmação com Countdown",
        description: "Evita clique acidental em ações destrutivas.",
        code: `function ConfirmButton() {\n  const [seconds, setSeconds] = useState(0);\n\n  const start = () => {\n    setSeconds(3);\n    const t = setInterval(() => setSeconds((s) => s - 1), 1000);\n  };\n\n  return (\n    <button onClick={start} disabled={seconds > 0}>\n      {seconds > 0 ? \`Confirma em \${seconds}s\` : \"Remover campanha\"}\n    </button>\n  );\n}`,
        preview: <ConfirmCountdownDemo />,
      },
      {
        id: "react-ripple",
        type: "React",
        title: "Ripple Feedback",
        description: "Mostra feedback tátil sem bloquear a ação.",
        code: `function RippleButton() {\n  const [rippling, setRippling] = useState(false);\n\n  return (\n    <button onClick={() => setRippling(true)} className=\"relative overflow-hidden\">\n      Atualizar relatório\n      {rippling && <span className=\"absolute inset-0 animate-ping\" />}\n    </button>\n  );\n}`,
        preview: <RippleButtonDemo />,
      },
      {
        id: "react-upload",
        type: "React",
        title: "Progress Upload",
        description: "Barra de progresso embutida no botão em tempo real.",
        code: `function UploadButton() {\n  const [progress, setProgress] = useState(0);\n\n  const upload = async () => {\n    for (let i = 0; i <= 100; i += 20) {\n      await wait(250);\n      setProgress(i);\n    }\n  };\n\n  return (\n    <button onClick={upload}>\n      Enviando {progress}%\n      <span style={{ width: \`\${progress}%\` }} />\n    </button>\n  );\n}`,
        preview: <UploadProgressDemo />,
      },
    ];

    return [...cssItems, ...reactItems];
  }, []);

  const copyCode = async (id: string, code: string) => {
    await navigator.clipboard.writeText(code);
    setCopied(id);
    setTimeout(() => setCopied(null), 1500);
  };

  return (
    <section className="my-10 rounded-2xl border border-border bg-card p-5 sm:p-7">
      <style>{`
        .bs-btn { border:none; padding:12px 18px; border-radius:12px; font-weight:700; cursor:pointer; }
        .bs-neon { background:#0f172a; color:#67e8f9; box-shadow:0 0 0 rgba(103,232,249,.0); animation:bsPulse 1.4s infinite; }
        @keyframes bsPulse { 0%{box-shadow:0 0 0 0 rgba(103,232,249,.5)} 100%{box-shadow:0 0 0 14px rgba(103,232,249,0)} }
        .bs-slide { background:transparent; color:#e2e8f0; border:1px solid #334155; position:relative; overflow:hidden; }
        .bs-slide::before { content:""; position:absolute; inset:0; transform:translateX(-100%); background:#1d4ed8; transition:transform .3s ease; }
        .bs-slide:hover::before { transform:translateX(0); }
        .bs-slide span{position:relative;z-index:1}
        .bs-gradient { color:#fff; background:linear-gradient(120deg,#2563eb,#7c3aed,#db2777); background-size:200% 200%; animation:bsGradient 3s ease infinite; }
        @keyframes bsGradient { 0%{background-position:0% 50%} 50%{background-position:100% 50%} 100%{background-position:0% 50%} }
        .bs-lift { background:#f8fafc; color:#0f172a; transition:transform .2s ease, box-shadow .2s ease; }
        .bs-lift:hover { transform:translateY(-3px); box-shadow:0 14px 28px rgba(15,23,42,.25); }
        .bs-outline { background:transparent; color:#e2e8f0; border:1px solid #475569; box-shadow:inset 0 0 0 0 #22d3ee; transition:box-shadow .25s ease,color .25s ease; }
        .bs-outline:hover { color:#0f172a; box-shadow:inset 220px 0 0 0 #22d3ee; }
      `}</style>

      <div className="mb-6">
        <h2 className="text-xl font-bold text-foreground">Demos ao vivo: 5 botões CSS + 5 botões React</h2>
        <p className="text-sm text-muted-foreground">Cada exemplo abaixo já está renderizado e você pode copiar o código com 1 clique.</p>
      </div>

      <div className="grid gap-4">
        {demos.map((demo) => (
          <article key={demo.id} className="rounded-xl border border-border bg-background/60 p-4">
            <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-primary">{demo.type}</p>
                <h3 className="text-base font-semibold text-foreground">{demo.title}</h3>
                <p className="text-sm text-muted-foreground">{demo.description}</p>
              </div>
              <button
                onClick={() => copyCode(demo.id, demo.code)}
                className="inline-flex items-center gap-2 rounded-lg border border-border px-3 py-2 text-xs font-semibold text-foreground hover:border-primary/40"
              >
                {copied === demo.id ? <Check className="h-4 w-4 text-emerald-400" /> : <Copy className="h-4 w-4" />}
                {copied === demo.id ? "Copiado" : "Copiar botão"}
              </button>
            </div>

            <div className="mb-3 rounded-lg border border-border bg-card p-4">{demo.preview}</div>

            <pre className="overflow-x-auto rounded-lg border border-border bg-muted/40 p-3 text-xs text-foreground">
              <code>{demo.code}</code>
            </pre>
          </article>
        ))}
      </div>
    </section>
  );
}
